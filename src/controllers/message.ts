import { JSONbn } from '_core/jsonBn';
import {
  base58Decode,
  base58Encode,
  base64Decode,
  blake2b,
  createAddress,
  utf8Encode,
} from '@keeper-wallet/waves-crypto';
import { captureException } from '@sentry/browser';
import { BigNumber } from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import { binary } from '@waves/marshall';
import { waves } from '@waves/protobuf-serialization';
import {
  type LeaseTransactionFromNode,
  TRANSACTION_TYPE,
} from '@waves/ts-types';
import type { AssetsRecord } from 'assets/types';
import EventEmitter from 'events';
import Long from 'long';
import {
  computeHash,
  computeTxHash,
  makeAuthBytes,
  makeCancelOrderBytes,
  makeCustomDataBytes,
  makeOrderBytes,
  makeRequestBytes,
  makeTxBytes,
  makeWavesAuthBytes,
  processAliasOrAddress,
  stringifyOrder,
  stringifyTransaction,
} from 'messages/utils';
import { nanoid } from 'nanoid';
import ObservableStore from 'obs-store';
import invariant from 'tiny-invariant';
import Browser from 'webextension-polyfill';

import {
  getExtraFee,
  getFeeOptions,
  getSpendingAmountsForSponsorableTx,
  isEnoughBalanceForFeeAndSpendingAmounts,
} from '../fee/utils';
import { ERRORS, KeeperError } from '../lib/keeperError';
import {
  type Message,
  type MessageInput,
  type MessageInputOfType,
  type MessageInputTx,
  type MessageOfType,
  MessageStatus,
  type MessageTx,
  type MessageTxInvokeScript,
  type MessageTxTransfer,
  type MoneyLike,
} from '../messages/types';
import { PERMISSIONS } from '../permissions/constants';
import type { PreferencesAccount } from '../preferences/types';
import type { ExtensionStorage } from '../storage/storage';
import { getTxVersions } from '../wallets/getTxVersions';
import type { AssetInfoController } from './assetInfo';
import type { CurrentAccountController } from './currentAccount';
import type { NetworkController } from './network';
import type { PermissionsController } from './permissions';
import type { RemoteConfigController } from './remoteConfig';
import type { WalletController } from './wallet';

function moneyLikeToMoney(amount: MoneyLike, assets: AssetsRecord) {
  const asset = new Asset(assets[amount.assetId ?? 'WAVES'] ?? assets.WAVES);

  if (amount.tokens != null || amount.coins != null) {
    let result = new Money(0, asset);

    if ('tokens' in amount) {
      result = result.cloneWithTokens(amount.tokens || 0);
    }

    if ('coins' in amount) {
      result = result.add(result.cloneWithCoins(amount.coins || 0));
    }

    return result;
  }

  return new Money(amount.amount || 0, asset);
}

export class MessageController extends EventEmitter {
  private store;
  private networkController;
  private assetInfoController;
  setPermission;
  private getAccountBalance;
  private remoteConfigController;
  private walletController;

  constructor({
    extensionStorage,
    assetInfoController,
    networkController,
    setPermission,
    getAccountBalance,
    remoteConfigController,
    walletController,
  }: {
    extensionStorage: ExtensionStorage;
    assetInfoController: AssetInfoController;
    networkController: NetworkController;
    setPermission: PermissionsController['setPermission'];
    getAccountBalance: CurrentAccountController['getAccountBalance'];
    remoteConfigController: RemoteConfigController;
    walletController: WalletController;
  }) {
    super();

    this.store = new ObservableStore(
      extensionStorage.getInitState({ messages: [] }),
    );
    extensionStorage.subscribe(this.store);

    this.assetInfoController = assetInfoController;
    this.networkController = networkController;
    this.remoteConfigController = remoteConfigController;
    this.walletController = walletController;

    // permissions
    this.setPermission = setPermission;
    this.getAccountBalance = getAccountBalance;
    this.#rejectAllByTime();

    Browser.alarms.onAlarm.addListener(({ name }) => {
      if (name === 'rejectMessages') {
        this.#rejectAllByTime();
      }
    });

    this.#updateBadge();
  }

  async newMessage<T extends MessageInput['type']>(
    messageInput: MessageInputOfType<T>,
  ) {
    try {
      const message = await this.#generateMessage(messageInput);
      const { messages } = this.store.getState();
      this.#updateStore(messages.concat(message));
      return message as MessageOfType<T>;
    } catch (err) {
      if (err instanceof KeeperError) {
        throw err;
      }

      if (err instanceof Response) {
        throw new Error(await err.text());
      }

      // eslint-disable-next-line no-console
      console.error(err);
      captureException(err);
      throw ERRORS.UNKNOWN(String(err));
    }
  }

  async getMessageResult(id: string) {
    const message = this.getMessageById(id);

    switch (message.status) {
      case MessageStatus.Signed:
      case MessageStatus.Published:
        return message.result;
      case MessageStatus.Rejected:
      case MessageStatus.RejectedForever:
        throw ERRORS.USER_DENIED(undefined, message.status);
      case MessageStatus.Failed:
        throw ERRORS.FAILED_MSG(undefined, message.err);
    }

    const finishedMessage = await new Promise<Message>(resolve => {
      this.once(`${id}:finished`, resolve);
    });

    switch (finishedMessage.status) {
      case MessageStatus.Signed:
      case MessageStatus.Published:
        return finishedMessage.result;
      case MessageStatus.Rejected:
      case MessageStatus.RejectedForever:
        throw ERRORS.USER_DENIED(undefined, message.status);
      case MessageStatus.Failed:
        throw ERRORS.FAILED_MSG(undefined, finishedMessage.err);
      default:
        throw ERRORS.UNKNOWN();
    }
  }

  getMessageById(id: string) {
    const result = this.store
      .getState()
      .messages.find(message => message.id === id);

    if (!result) throw new Error(`Failed to get message with id ${id}`);

    return result;
  }

  deleteMessage(id: string) {
    const { messages } = this.store.getState();
    const index = messages.findIndex(message => message.id === id);

    if (index > -1) {
      messages.splice(index, 1);
      this.#updateStore(messages);
    }
  }

  async approve(id: string) {
    const message = this.getMessageById(id);

    try {
      const { address, network, publicKey } = message.account;
      const wallet = this.walletController.getWallet(address, network);

      switch (message.type) {
        case 'auth': {
          const { data, host, name, prefix, version } = message.data.data;

          const signature = await wallet.signAuth(
            makeAuthBytes({ data, host }),
          );

          message.result = {
            address,
            host,
            name,
            prefix,
            publicKey,
            signature: base58Encode(signature),
            version,
          };

          message.status = MessageStatus.Signed;

          if (message.successPath) {
            const url = new URL(message.successPath);
            url.searchParams.append('p', message.result.publicKey);
            url.searchParams.append('s', message.result.signature);
            url.searchParams.append('a', message.result.address);
            this.emit('Open new tab', url.toString());
          }
          break;
        }
        case 'authOrigin':
          this.setPermission(message.origin, PERMISSIONS.APPROVED);
          message.result = { approved: 'OK' };
          message.status = MessageStatus.Signed;
          break;
        case 'cancelOrder': {
          const cancelOrder = {
            orderId: message.data.data.id,
            sender: message.data.data.senderPublicKey,
          };

          const signature = await wallet.signCancelOrder(
            makeCancelOrderBytes(cancelOrder),
          );

          const signedCancelOrder = {
            ...cancelOrder,
            signature: base58Encode(signature),
          };

          if (message.broadcast) {
            message.result = JSONbn.stringify(
              await this.networkController.broadcastCancelOrder(
                signedCancelOrder,
                message,
              ),
            );

            message.status = MessageStatus.Published;
          } else {
            message.result = JSONbn.stringify(signedCancelOrder);
            message.status = MessageStatus.Signed;
          }
          break;
        }
        case 'customData': {
          const { data } = message;

          const signature = await wallet.signCustomData(
            makeCustomDataBytes(data),
          );

          message.result = {
            ...data,
            signature: base58Encode(signature),
          };

          message.status = MessageStatus.Signed;
          break;
        }
        case 'order': {
          const signature = await wallet.signOrder(
            makeOrderBytes(message.data),
            message.data.version,
          );

          const signedOrder =
            message.data.version === 1
              ? { ...message.data, signature }
              : {
                  ...message.data,
                  proofs: message.data.proofs.concat([base58Encode(signature)]),
                };

          if (message.broadcast) {
            message.result = JSONbn.stringify(
              await this.networkController.broadcastOrder(signedOrder),
            );

            message.status = MessageStatus.Published;
          } else {
            message.result = stringifyOrder(signedOrder);
            message.status = MessageStatus.Signed;
          }
          break;
        }
        case 'request': {
          const signature = await wallet.signRequest(
            makeRequestBytes({
              senderPublicKey: message.data.data.senderPublicKey,
              timestamp: message.data.data.timestamp,
            }),
          );

          message.result = base58Encode(signature);

          message.status = MessageStatus.Signed;
          break;
        }
        case 'transaction': {
          const signature = await wallet.signTx(
            makeTxBytes(message.data),
            message.data,
          );

          const signedTx = {
            ...message.data,
            proofs: message.data.proofs.concat([base58Encode(signature)]),
          };

          if (message.broadcast) {
            message.result = JSONbn.stringify(
              await this.networkController.broadcastTransaction(signedTx),
            );

            message.status = MessageStatus.Published;
          } else {
            message.result = stringifyTransaction(signedTx);
            message.status = MessageStatus.Signed;
          }

          if (message.successPath) {
            const url = new URL(message.successPath);
            url.searchParams.append('txId', message.data.id);
            this.emit('Open new tab', url.href);
          }
          break;
        }
        case 'transactionPackage': {
          message.result = await Promise.all(
            message.data.map(async data => {
              const signature = await wallet.signTx(makeTxBytes(data), data);

              return stringifyTransaction({
                ...data,
                proofs: data.proofs.concat([base58Encode(signature)]),
              });
            }),
          );

          message.status = MessageStatus.Signed;
          break;
        }
        case 'wavesAuth': {
          const data = {
            ...message.data,
            publicKey: message.data.publicKey || publicKey,
            timestamp: message.data.timestamp || Date.now(),
          };

          const signature = await wallet.signWavesAuth(
            makeWavesAuthBytes(data),
          );

          message.result = {
            ...data,
            signature: base58Encode(signature),
          };

          message.status = MessageStatus.Signed;
          break;
        }
      }

      this.#updateMessage(message);
      this.emit(`${message.id}:finished`, message);

      return message;
    } catch (err) {
      if (
        err instanceof KeeperError &&
        err.message === 'Request is rejected on ledger'
      ) {
        this.reject(id);
        return message;
      }

      const errorMessage =
        err && typeof err === 'object' && 'message' in err && err.message
          ? String(err.message)
          : String(err);

      Object.assign(message, {
        status: MessageStatus.Failed,
        err: errorMessage,
      });

      this.#updateMessage(message);
      this.emit(`${message.id}:finished`, message);

      if (err instanceof Error) {
        throw err;
      } else {
        throw new Error(errorMessage);
      }
    }
  }

  reject(id: string, forever?: boolean) {
    const message = this.getMessageById(id);

    message.status = forever
      ? MessageStatus.RejectedForever
      : MessageStatus.Rejected;

    this.#updateMessage(message);
    this.emit(`${message.id}:finished`, message);
  }

  async updateTransactionFee(id: string, fee: MoneyLike) {
    const message = this.getMessageById(id);
    invariant(message.type === 'transaction');

    message.input.data.data.fee = fee;

    if (!message.input.data.data.initialFee) {
      message.input.data.data.initialFee = {
        assetId: 'feeAssetId' in message.data ? message.data.feeAssetId : null,
        coins: message.data.fee,
      };
    }

    const newMessage = await this.#generateMessage(message.input);
    newMessage.id = id;
    this.#updateMessage(newMessage);
    return newMessage;
  }

  rejectByOrigin(byOrigin: string) {
    const { messages } = this.store.getState();

    messages.forEach(({ id, origin }) => {
      if (byOrigin === origin) {
        this.reject(id);
      }
    });
  }

  removeMessagesFromConnection(connectionId: string) {
    const { messages } = this.store.getState();

    messages.forEach(message => {
      if (message.connectionId === connectionId) {
        this.reject(message.id);
      }
    });

    this.#updateStore(
      messages.filter(message => message.connectionId !== connectionId),
    );
  }

  clearMessages(ids?: string | string[]) {
    if (typeof ids === 'string') {
      this.deleteMessage(ids);
    } else if (ids && ids.length > 0) {
      ids.forEach(id => this.deleteMessage(id));
    } else {
      this.#updateStore([]);
    }
  }

  getUnapproved() {
    return this.store
      .getState()
      .messages.filter(({ status }) => status === MessageStatus.UnApproved);
  }

  #rejectAllByTime() {
    const { message_expiration_ms } =
      this.remoteConfigController.getMessagesConfig();

    const { messages } = this.store.getState();

    messages.forEach(({ id, timestamp, status }) => {
      if (
        Date.now() - timestamp > message_expiration_ms &&
        status === MessageStatus.UnApproved
      ) {
        this.reject(id);
      }
    });

    this.#updateMessagesByTimeout();
  }

  #updateMessagesByTimeout() {
    const { update_messages_ms } =
      this.remoteConfigController.getMessagesConfig();

    Browser.alarms.create('rejectMessages', {
      delayInMinutes: update_messages_ms / 1000 / 60,
    });
  }

  #updateMessage(message: Message) {
    const messages = this.store.getState().messages;
    messages[messages.findIndex(m => m.id === message.id)] = message;
    this.#updateStore(messages);
  }

  #updateStore(messages: Message[]) {
    this.store.updateState({ ...this.store.getState(), messages });
    this.#updateBadge();
  }

  #updateBadge() {
    this.emit('Update badge');
  }

  #getMoneyLikeValue(moneyLike: MoneyLike) {
    for (const key of ['tokens', 'coins', 'amount'] as const) {
      if (key in moneyLike) {
        return moneyLike[key] as Exclude<
          (typeof moneyLike)[typeof key],
          BigNumber
        >;
      }
    }

    return null;
  }

  #isNumberLikePositive(numberLike: string | number) {
    const bn = new BigNumber(numberLike);

    return bn.isFinite() && bn.gt(0);
  }

  #isMoneyLikeValuePositive(
    moneyLike: MoneyLike | string | number | null | undefined,
  ) {
    if (typeof moneyLike !== 'object' || moneyLike === null) {
      return false;
    }

    const value = this.#getMoneyLikeValue(moneyLike);

    if (value == null) {
      return false;
    }

    return this.#isNumberLikePositive(value);
  }

  #getFeeInAssetWithEnoughBalance(
    assets: AssetsRecord,
    txParams: Partial<Pick<MessageTx, 'fee' | 'initialFee'>> &
      (
        | (Omit<
            MessageTxTransfer,
            'fee' | 'id' | 'initialFee' | 'initialFeeAssetId'
          > &
            Partial<Pick<MessageTxTransfer, 'initialFeeAssetId'>>)
        | (Omit<
            MessageTxInvokeScript,
            'fee' | 'id' | 'initialFee' | 'initialFeeAssetId'
          > &
            Partial<Pick<MessageTxInvokeScript, 'initialFeeAssetId'>>)
      ),
    feeMoneyLike: MoneyLike,
  ) {
    const balance = this.getAccountBalance();

    const feeMoney = moneyLikeToMoney(feeMoneyLike, assets);

    const spendingAmounts = getSpendingAmountsForSponsorableTx({
      assets,
      messageTx: txParams,
    });

    if (
      isEnoughBalanceForFeeAndSpendingAmounts({
        balance: balance?.assets?.[feeMoney.asset.id]?.balance ?? 0,
        fee: feeMoney,
        spendingAmounts,
      })
    ) {
      return;
    }

    const feeOption = getFeeOptions({
      assets,
      balance,
      initialFee: feeMoney,
      txType: txParams.type,
      usdPrices: this.assetInfoController.getUsdPrices(),
    }).find(option =>
      isEnoughBalanceForFeeAndSpendingAmounts({
        balance: option.assetBalance.balance,
        fee: option.money,
        spendingAmounts,
      }),
    );

    if (!feeOption) return;

    const fee = feeOption.money.toCoins();

    const feeAssetId =
      feeOption.money.asset.id === 'WAVES' ? null : feeOption.money.asset.id;

    const { initialFee = fee, initialFeeAssetId = feeAssetId } = txParams;

    return {
      fee,
      feeAssetId,
      initialFee,
      initialFeeAssetId,
    };
  }

  async #generateMessageTx(
    account: PreferencesAccount,
    messageInputTx: MessageInputTx,
  ): Promise<MessageTx> {
    if (
      'fee' in messageInputTx.data &&
      !this.#isMoneyLikeValuePositive(messageInputTx.data.fee)
    ) {
      throw ERRORS.REQUEST_ERROR('fee is not valid', messageInputTx);
    }

    if (
      'chainId' in messageInputTx.data &&
      messageInputTx.data.chainId !==
        this.networkController.getNetworkCode().charCodeAt(0)
    ) {
      throw ERRORS.REQUEST_ERROR(
        'chainId does not match current network',
        messageInputTx,
      );
    }

    const chainId =
      messageInputTx.data.chainId ?? account.networkCode.charCodeAt(0);

    const proofs = messageInputTx.data.proofs ?? [];

    const senderPublicKey =
      messageInputTx.data.senderPublicKey ?? account.publicKey;

    const getSenderExtraFee = () =>
      getExtraFee(
        base58Encode(createAddress(base58Decode(senderPublicKey), chainId)),
        this.networkController.getNode(),
      );

    const timestamp = messageInputTx.data.timestamp ?? Date.now();

    const assets = this.assetInfoController.getAssets();

    function getRoundedUpKbs(byteCount: number) {
      return ((byteCount - 1) >> 10) + 1;
    }

    switch (messageInputTx.type) {
      case TRANSACTION_TYPE.ISSUE: {
        const versions = getTxVersions(account.type)[messageInputTx.type];
        const version = messageInputTx.data.version ?? versions[0];

        if (!versions.includes(version)) {
          throw ERRORS.REQUEST_ERROR('unsupported tx version', messageInputTx);
        }

        if (!this.#isNumberLikePositive(messageInputTx.data.quantity)) {
          throw ERRORS.REQUEST_ERROR('quantity is not valid', messageInputTx);
        }

        if (
          typeof messageInputTx.data.precision !== 'number' ||
          messageInputTx.data.precision < 0 ||
          messageInputTx.data.precision > 8
        ) {
          throw ERRORS.REQUEST_ERROR('precision is not valid', messageInputTx);
        }

        await this.assetInfoController.updateAssets([
          messageInputTx.data.fee?.assetId,
          messageInputTx.data.initialFee?.assetId,
        ]);

        let fee =
          messageInputTx.data.fee &&
          moneyLikeToMoney(messageInputTx.data.fee, assets).toCoins();

        if (!fee) {
          fee = new BigNumber(await getSenderExtraFee())
            .add(
              !messageInputTx.data.reissuable &&
                messageInputTx.data.precision === 0 &&
                new BigNumber(messageInputTx.data.quantity).eq(1)
                ? 10_0000
                : 1_0000_0000,
            )
            .toString();
        }

        const tx = {
          chainId,
          decimals: messageInputTx.data.precision,
          description: messageInputTx.data.description,
          fee,
          initialFee: messageInputTx.data.initialFee
            ? moneyLikeToMoney(messageInputTx.data.initialFee, assets).toCoins()
            : fee,
          name: messageInputTx.data.name,
          proofs: messageInputTx.data.proofs ?? [],
          quantity: messageInputTx.data.quantity,
          reissuable: messageInputTx.data.reissuable,
          script: messageInputTx.data.script || null,
          senderPublicKey,
          timestamp,
          type: messageInputTx.type,
          version,
        };

        return {
          id: base58Encode(computeTxHash(makeTxBytes(tx))),
          ...tx,
        };
      }
      case TRANSACTION_TYPE.TRANSFER: {
        const versions = getTxVersions(account.type)[messageInputTx.type];
        const version = messageInputTx.data.version ?? versions[0];

        if (!versions.includes(version)) {
          throw ERRORS.REQUEST_ERROR('unsupported tx version', messageInputTx);
        }

        if (!this.#isMoneyLikeValuePositive(messageInputTx.data.amount)) {
          throw ERRORS.REQUEST_ERROR('amount is not valid', messageInputTx);
        }

        await this.assetInfoController.updateAssets([
          messageInputTx.data.fee?.assetId,
          messageInputTx.data.initialFee?.assetId,
          messageInputTx.data.amount.assetId,
        ]);

        const txParams = {
          amount: moneyLikeToMoney(
            messageInputTx.data.amount,
            assets,
          ).toCoins(),
          assetId:
            messageInputTx.data.amount.assetId === 'WAVES'
              ? null
              : messageInputTx.data.amount.assetId,
          attachment: Array.isArray(messageInputTx.data.attachment)
            ? base58Encode(new Uint8Array(messageInputTx.data.attachment))
            : messageInputTx.data.attachment
            ? base58Encode(utf8Encode(messageInputTx.data.attachment))
            : undefined,
          chainId,
          fee:
            messageInputTx.data.fee &&
            moneyLikeToMoney(messageInputTx.data.fee, assets).toCoins(),
          feeAssetId:
            messageInputTx.data.fee?.assetId === 'WAVES'
              ? null
              : messageInputTx.data.fee?.assetId ?? null,
          initialFee:
            messageInputTx.data.initialFee &&
            moneyLikeToMoney(messageInputTx.data.initialFee, assets).toCoins(),
          initialFeeAssetId:
            messageInputTx.data.initialFee &&
            (messageInputTx.data.initialFee.assetId === 'WAVES'
              ? null
              : messageInputTx.data.initialFee.assetId ?? null),
          proofs,
          recipient: processAliasOrAddress(
            messageInputTx.data.recipient,
            chainId,
          ),
          senderPublicKey,
          timestamp,
          type: messageInputTx.type,
          version,
        };

        let { fee } = txParams;
        if (!fee) {
          fee = new BigNumber(await getSenderExtraFee())
            .add(
              txParams.assetId && assets[txParams.assetId]?.hasScript
                ? 50_0000
                : 10_0000,
            )
            .toString();
        }

        const {
          feeAssetId,
          initialFee = fee,
          initialFeeAssetId = feeAssetId,
        } = txParams;

        const tx = {
          ...txParams,
          ...((senderPublicKey === account.publicKey &&
            this.#getFeeInAssetWithEnoughBalance(assets, txParams, {
              assetId: feeAssetId,
              coins: fee,
            })) || {
            fee,
            feeAssetId,
            initialFee,
            initialFeeAssetId,
          }),
        };

        return {
          id: base58Encode(computeTxHash(makeTxBytes(tx))),
          ...tx,
        };
      }
      case TRANSACTION_TYPE.REISSUE: {
        const versions = getTxVersions(account.type)[messageInputTx.type];
        const version = messageInputTx.data.version ?? versions[0];

        if (!versions.includes(version)) {
          throw ERRORS.REQUEST_ERROR('unsupported tx version', messageInputTx);
        }

        const quantityInput =
          'quantity' in messageInputTx.data
            ? messageInputTx.data.quantity
            : messageInputTx.data.amount;

        if (!this.#isMoneyLikeValuePositive(quantityInput)) {
          if (
            typeof quantityInput !== 'object' &&
            !this.#isNumberLikePositive(quantityInput)
          ) {
            throw ERRORS.REQUEST_ERROR('quantity is not valid', messageInputTx);
          }
        }

        await this.assetInfoController.updateAssets([
          messageInputTx.data.fee?.assetId,
          messageInputTx.data.initialFee?.assetId,
          messageInputTx.data.assetId,
        ]);

        const quantityMaybeMoney =
          typeof quantityInput === 'object'
            ? moneyLikeToMoney(quantityInput, assets)
            : quantityInput;

        let assetId: string;
        let quantity: string | number;

        if (quantityMaybeMoney instanceof Money) {
          assetId = quantityMaybeMoney.asset.id;
          quantity = quantityMaybeMoney.toCoins();
        } else {
          invariant(messageInputTx.data.assetId);
          assetId = messageInputTx.data.assetId;
          quantity = quantityMaybeMoney;
        }

        const txParams = {
          assetId,
          chainId,
          proofs,
          quantity,
          reissuable: messageInputTx.data.reissuable,
          senderPublicKey,
          timestamp,
          type: messageInputTx.type,
          version,
        };

        let fee =
          messageInputTx.data.fee &&
          moneyLikeToMoney(messageInputTx.data.fee, assets).toCoins();

        if (!fee) {
          fee = new BigNumber(await getSenderExtraFee())
            .add(
              txParams.assetId && assets[txParams.assetId]?.hasScript
                ? 50_0000
                : 10_0000,
            )
            .toString();
        }

        const tx = {
          ...txParams,
          fee,
          initialFee: messageInputTx.data.initialFee
            ? moneyLikeToMoney(messageInputTx.data.initialFee, assets).toCoins()
            : fee,
        };

        return {
          id: base58Encode(computeTxHash(makeTxBytes(tx))),
          ...tx,
        };
      }
      case TRANSACTION_TYPE.BURN: {
        const versions = getTxVersions(account.type)[messageInputTx.type];
        const version = messageInputTx.data.version ?? versions[0];

        if (!versions.includes(version)) {
          throw ERRORS.REQUEST_ERROR('unsupported tx version', messageInputTx);
        }

        const amountInput =
          'quantity' in messageInputTx.data
            ? messageInputTx.data.quantity
            : messageInputTx.data.amount;

        if (!this.#isMoneyLikeValuePositive(amountInput)) {
          if (
            typeof amountInput !== 'object' &&
            !this.#isNumberLikePositive(amountInput)
          ) {
            throw ERRORS.REQUEST_ERROR('amount is not valid', messageInputTx);
          }
        }

        await this.assetInfoController.updateAssets([
          messageInputTx.data.fee?.assetId,
          messageInputTx.data.initialFee?.assetId,
          messageInputTx.data.assetId,
        ]);

        const amountMaybeMoney =
          typeof amountInput === 'object'
            ? moneyLikeToMoney(amountInput, assets)
            : amountInput;

        let assetId: string;
        let amount: string | number;
        if (amountMaybeMoney instanceof Money) {
          assetId = amountMaybeMoney.asset.id;
          amount = amountMaybeMoney.toCoins();
        } else {
          assetId = messageInputTx.data.assetId;
          amount = amountMaybeMoney;
        }

        const txParams = {
          assetId,
          amount,
          chainId,
          initialFee:
            messageInputTx.data.initialFee &&
            moneyLikeToMoney(messageInputTx.data.initialFee, assets).toCoins(),
          proofs,
          senderPublicKey,
          timestamp,
          type: messageInputTx.type,
          version,
        };

        let fee =
          messageInputTx.data.fee &&
          moneyLikeToMoney(messageInputTx.data.fee, assets).toCoins();

        if (!fee) {
          fee = new BigNumber(await getSenderExtraFee())
            .add(
              txParams.assetId && assets[txParams.assetId]?.hasScript
                ? 50_0000
                : 10_0000,
            )
            .toString();
        }

        const { initialFee = fee } = txParams;

        const tx = {
          ...txParams,
          fee,
          initialFee,
        };

        return {
          id: base58Encode(computeTxHash(makeTxBytes(tx))),
          ...tx,
        };
      }
      case TRANSACTION_TYPE.LEASE: {
        const versions = getTxVersions(account.type)[messageInputTx.type];
        const version = messageInputTx.data.version ?? versions[0];

        if (!versions.includes(version)) {
          throw ERRORS.REQUEST_ERROR('unsupported tx version', messageInputTx);
        }

        if (!this.#isMoneyLikeValuePositive(messageInputTx.data.amount)) {
          if (
            typeof messageInputTx.data.amount !== 'object' &&
            !this.#isNumberLikePositive(messageInputTx.data.amount)
          ) {
            throw ERRORS.REQUEST_ERROR('amount is not valid', messageInputTx);
          }
        }

        await this.assetInfoController.updateAssets([
          messageInputTx.data.fee?.assetId,
          messageInputTx.data.initialFee?.assetId,
        ]);

        const amount = moneyLikeToMoney(
          typeof messageInputTx.data.amount === 'object'
            ? messageInputTx.data.amount
            : { coins: messageInputTx.data.amount, assetId: 'WAVES' },
          assets,
        ).toCoins();

        const txParams = {
          amount,
          chainId,
          initialFee:
            messageInputTx.data.initialFee &&
            moneyLikeToMoney(messageInputTx.data.initialFee, assets).toCoins(),
          proofs,
          recipient: processAliasOrAddress(
            messageInputTx.data.recipient,
            chainId,
          ),
          senderPublicKey,
          timestamp,
          type: messageInputTx.type,
          version,
        };

        let fee =
          messageInputTx.data.fee &&
          moneyLikeToMoney(messageInputTx.data.fee, assets).toCoins();

        if (!fee) {
          fee = new BigNumber(await getSenderExtraFee())
            .add(10_0000)
            .toString();
        }

        const { initialFee = fee } = txParams;

        const tx = {
          ...txParams,
          fee,
          initialFee,
        };

        return {
          id: base58Encode(computeTxHash(makeTxBytes(tx))),
          ...tx,
        };
      }
      case TRANSACTION_TYPE.CANCEL_LEASE: {
        const versions = getTxVersions(account.type)[messageInputTx.type];
        const version = messageInputTx.data.version ?? versions[0];

        if (!versions.includes(version)) {
          throw ERRORS.REQUEST_ERROR('unsupported tx version', messageInputTx);
        }

        await this.assetInfoController.updateAssets([
          messageInputTx.data.fee?.assetId,
          messageInputTx.data.initialFee?.assetId,
        ]);

        const response = await fetch(
          new URL(
            `/transactions/info/${messageInputTx.data.leaseId}`,
            this.networkController.getNode(),
          ),
          {
            headers: {
              accept: 'application/json; large-significand-format=string',
            },
          },
        );

        if (!response.ok) {
          throw new Error(
            `Could not fetch lease transaction: ${await response.text()}`,
          );
        }

        const lease: LeaseTransactionFromNode = await response.json();

        const txParams = {
          chainId,
          initialFee:
            messageInputTx.data.initialFee &&
            moneyLikeToMoney(messageInputTx.data.initialFee, assets).toCoins(),
          leaseId: messageInputTx.data.leaseId,
          proofs,
          senderPublicKey,
          timestamp,
          type: messageInputTx.type,
          version,
        };

        let fee =
          messageInputTx.data.fee &&
          moneyLikeToMoney(messageInputTx.data.fee, assets).toCoins();

        if (!fee) {
          fee = new BigNumber(await getSenderExtraFee())
            .add(10_0000)
            .toString();
        }

        const { initialFee = fee } = txParams;

        const tx = {
          ...txParams,
          fee,
          initialFee,
        };

        return {
          id: base58Encode(computeTxHash(makeTxBytes(tx))),
          ...tx,
          lease,
        };
      }
      case TRANSACTION_TYPE.ALIAS: {
        const versions = getTxVersions(account.type)[messageInputTx.type];
        const version = messageInputTx.data.version ?? versions[0];

        if (!versions.includes(version)) {
          throw ERRORS.REQUEST_ERROR('unsupported tx version', messageInputTx);
        }

        await this.assetInfoController.updateAssets([
          messageInputTx.data.fee?.assetId,
          messageInputTx.data.initialFee?.assetId,
        ]);

        const txParams = {
          alias: messageInputTx.data.alias,
          chainId,
          initialFee:
            messageInputTx.data.initialFee &&
            moneyLikeToMoney(messageInputTx.data.initialFee, assets).toCoins(),
          proofs,
          senderPublicKey,
          timestamp,
          type: messageInputTx.type,
          version,
        };

        let fee =
          messageInputTx.data.fee &&
          moneyLikeToMoney(messageInputTx.data.fee, assets).toCoins();

        if (!fee) {
          fee = new BigNumber(await getSenderExtraFee())
            .add(10_0000)
            .toString();
        }

        const { initialFee = fee } = txParams;

        const tx = {
          ...txParams,
          fee,
          initialFee,
        };

        return {
          id: base58Encode(computeTxHash(makeTxBytes(tx))),
          ...tx,
        };
      }
      case TRANSACTION_TYPE.MASS_TRANSFER: {
        const versions = getTxVersions(account.type)[messageInputTx.type];
        const version = messageInputTx.data.version ?? versions[0];

        if (!versions.includes(version)) {
          throw ERRORS.REQUEST_ERROR('unsupported tx version', messageInputTx);
        }

        messageInputTx.data.transfers.forEach(({ amount }) => {
          if (!this.#isNumberLikePositive(amount)) {
            throw ERRORS.REQUEST_ERROR('amount is not valid', messageInputTx);
          }
        });

        await this.assetInfoController.updateAssets([
          messageInputTx.data.fee?.assetId,
          messageInputTx.data.initialFee?.assetId,
          messageInputTx.data.totalAmount.assetId,
        ]);

        const txParams = {
          assetId:
            messageInputTx.data.totalAmount.assetId === 'WAVES'
              ? null
              : messageInputTx.data.totalAmount.assetId,
          attachment: Array.isArray(messageInputTx.data.attachment)
            ? base58Encode(new Uint8Array(messageInputTx.data.attachment))
            : messageInputTx.data.attachment
            ? base58Encode(utf8Encode(messageInputTx.data.attachment))
            : undefined,
          chainId,
          initialFee:
            messageInputTx.data.initialFee &&
            moneyLikeToMoney(messageInputTx.data.initialFee, assets).toCoins(),
          proofs,
          senderPublicKey,
          timestamp,
          transfers: messageInputTx.data.transfers.map(transfer => ({
            amount: transfer.amount,
            recipient: processAliasOrAddress(transfer.recipient, chainId),
          })),
          type: messageInputTx.type,
          version,
        };

        let fee =
          messageInputTx.data.fee &&
          moneyLikeToMoney(messageInputTx.data.fee, assets).toCoins();

        if (!fee) {
          fee = new BigNumber(await getSenderExtraFee())
            .add(
              (((txParams.transfers.length + 1) >> 1) + 1) *
                (txParams.assetId && assets[txParams.assetId]?.hasScript
                  ? 50_0000
                  : 10_0000),
            )
            .toString();
        }

        const { initialFee = fee } = txParams;

        const tx = {
          ...txParams,
          fee,
          initialFee,
        };

        return {
          id: base58Encode(computeTxHash(makeTxBytes(tx))),
          ...tx,
        };
      }
      case TRANSACTION_TYPE.DATA: {
        const versions = getTxVersions(account.type)[messageInputTx.type];
        const version = messageInputTx.data.version ?? versions[0];

        if (!versions.includes(version)) {
          throw ERRORS.REQUEST_ERROR('unsupported tx version', messageInputTx);
        }

        messageInputTx.data.data.forEach(item => {
          if (item.type === 'integer') {
            const { value } = item;

            if (!new BigNumber(value).isInt()) {
              throw ERRORS.REQUEST_ERROR(
                `'${
                  item.key
                }' data key value must be a string or number representing an integer, got: ${
                  value === '' ? "''" : value
                }`,
                messageInputTx,
              );
            }
          }
        });

        await this.assetInfoController.updateAssets([
          messageInputTx.data.fee?.assetId,
          messageInputTx.data.initialFee?.assetId,
        ]);

        const txParams = {
          chainId,
          data: messageInputTx.data.data,
          initialFee:
            messageInputTx.data.initialFee &&
            moneyLikeToMoney(messageInputTx.data.initialFee, assets).toCoins(),
          proofs,
          senderPublicKey,
          timestamp,
          type: messageInputTx.type,
          version,
        };

        let fee =
          messageInputTx.data.fee &&
          moneyLikeToMoney(messageInputTx.data.fee, assets).toCoins();

        if (!fee) {
          const bytes =
            txParams.version === 1
              ? binary.serializeTx({ ...txParams, fee: 0 })
              : waves.DataTransactionData.encode({
                  data: txParams.data.map(entry => ({
                    key: entry.key,
                    intValue:
                      entry.type === 'integer'
                        ? Long.fromValue(entry.value)
                        : undefined,
                    boolValue:
                      entry.type === 'boolean' ? entry.value : undefined,
                    binaryValue:
                      entry.type === 'binary'
                        ? base64Decode(entry.value.replace(/^base64:/, ''))
                        : undefined,
                    stringValue:
                      entry.type === 'string' ? entry.value : undefined,
                  })),
                }).finish();

          fee = new BigNumber(await getSenderExtraFee())
            .add(getRoundedUpKbs(bytes.length) * 10_0000)
            .toString();
        }

        const { initialFee = fee } = txParams;

        const tx = {
          ...txParams,
          fee,
          initialFee,
        };

        return {
          id: base58Encode(computeTxHash(makeTxBytes(tx))),
          ...tx,
        };
      }
      case TRANSACTION_TYPE.SET_SCRIPT: {
        const versions = getTxVersions(account.type)[messageInputTx.type];
        const version = messageInputTx.data.version ?? versions[0];

        if (!versions.includes(version)) {
          throw ERRORS.REQUEST_ERROR('unsupported tx version', messageInputTx);
        }

        await this.assetInfoController.updateAssets([
          messageInputTx.data.fee?.assetId,
          messageInputTx.data.initialFee?.assetId,
        ]);

        const txParams = {
          chainId,
          initialFee:
            messageInputTx.data.initialFee &&
            moneyLikeToMoney(messageInputTx.data.initialFee, assets).toCoins(),
          proofs,
          script: messageInputTx.data.script || null,
          senderPublicKey,
          timestamp,
          type: messageInputTx.type,
          version,
        };

        let fee =
          messageInputTx.data.fee &&
          moneyLikeToMoney(messageInputTx.data.fee, assets).toCoins();

        if (!fee) {
          if (txParams.script == null) {
            fee = new BigNumber(await getSenderExtraFee())
              .add(10_0000)
              .toString();
          } else {
            const kbs = getRoundedUpKbs(
              base64Decode(txParams.script.replace(/^base64:/, '')).length,
            );

            fee = new BigNumber(await getSenderExtraFee())
              .add(kbs * 10_0000)
              .toString();
          }
        }

        const { initialFee = fee } = txParams;

        const tx = {
          ...txParams,
          fee,
          initialFee,
        };

        return {
          id: base58Encode(computeTxHash(makeTxBytes(tx))),
          ...tx,
        };
      }
      case TRANSACTION_TYPE.SPONSORSHIP: {
        const versions = getTxVersions(account.type)[messageInputTx.type];
        const version = messageInputTx.data.version ?? versions[0];

        if (!versions.includes(version)) {
          throw ERRORS.REQUEST_ERROR('unsupported tx version', messageInputTx);
        }

        const assetId = messageInputTx.data.minSponsoredAssetFee.assetId;

        if (typeof assetId !== 'string') {
          throw ERRORS.REQUEST_ERROR(
            'assetId must be a string',
            messageInputTx,
          );
        }

        await this.assetInfoController.updateAssets([
          messageInputTx.data.fee?.assetId,
          messageInputTx.data.initialFee?.assetId,
          messageInputTx.data.minSponsoredAssetFee.assetId,
        ]);

        const minSponsoredAssetFee = moneyLikeToMoney(
          messageInputTx.data.minSponsoredAssetFee,
          assets,
        ).getCoins();

        const txParams = {
          assetId,
          chainId,
          initialFee:
            messageInputTx.data.initialFee &&
            moneyLikeToMoney(messageInputTx.data.initialFee, assets).toCoins(),
          minSponsoredAssetFee: minSponsoredAssetFee.eq(0)
            ? null
            : minSponsoredAssetFee.toString(),
          proofs,
          senderPublicKey,
          timestamp,
          type: messageInputTx.type,
          version,
        };

        let fee =
          messageInputTx.data.fee &&
          moneyLikeToMoney(messageInputTx.data.fee, assets).toCoins();

        if (!fee) {
          fee = new BigNumber(await getSenderExtraFee())
            .add(10_0000)
            .toString();
        }

        const { initialFee = fee } = txParams;

        const tx = {
          ...txParams,
          fee,
          initialFee,
        };

        return {
          id: base58Encode(computeTxHash(makeTxBytes(tx))),
          ...tx,
        };
      }
      case TRANSACTION_TYPE.SET_ASSET_SCRIPT: {
        const versions = getTxVersions(account.type)[messageInputTx.type];
        const version = messageInputTx.data.version ?? versions[0];

        if (!versions.includes(version)) {
          throw ERRORS.REQUEST_ERROR('unsupported tx version', messageInputTx);
        }

        await this.assetInfoController.updateAssets([
          messageInputTx.data.fee?.assetId,
          messageInputTx.data.initialFee?.assetId,
          messageInputTx.data.assetId,
        ]);

        const txParams = {
          assetId: messageInputTx.data.assetId,
          chainId,
          initialFee:
            messageInputTx.data.initialFee &&
            moneyLikeToMoney(messageInputTx.data.initialFee, assets).toCoins(),
          proofs,
          script: messageInputTx.data.script,
          senderPublicKey,
          timestamp,
          type: messageInputTx.type,
          version,
        };

        let fee =
          messageInputTx.data.fee &&
          moneyLikeToMoney(messageInputTx.data.fee, assets).toCoins();

        if (!fee) {
          fee = new BigNumber(await getSenderExtraFee())
            .add(1_0000_0000)
            .toString();
        }

        const { initialFee = fee } = txParams;

        const tx = {
          ...txParams,
          fee,
          initialFee,
        };

        return {
          id: base58Encode(computeTxHash(makeTxBytes(tx))),
          ...tx,
        };
      }
      case TRANSACTION_TYPE.INVOKE_SCRIPT: {
        const versions = getTxVersions(account.type)[messageInputTx.type];
        const version = messageInputTx.data.version ?? versions[0];

        if (!versions.includes(version)) {
          throw ERRORS.REQUEST_ERROR('unsupported tx version', messageInputTx);
        }

        const payment = messageInputTx.data.payment ?? [];

        payment.forEach(p => {
          if (!this.#isMoneyLikeValuePositive(p)) {
            throw ERRORS.REQUEST_ERROR('payment is not valid', messageInputTx);
          }
        });

        await this.assetInfoController.updateAssets([
          messageInputTx.data.fee?.assetId,
          messageInputTx.data.initialFee?.assetId,
          ...payment.map(p => p.assetId),
        ]);

        const txParams = {
          call:
            messageInputTx.data.call == null
              ? null
              : {
                  ...messageInputTx.data.call,
                  args: messageInputTx.data.call.args ?? [],
                },
          chainId,
          dApp: processAliasOrAddress(messageInputTx.data.dApp, chainId),
          feeAssetId:
            messageInputTx.data.fee?.assetId === 'WAVES'
              ? null
              : messageInputTx.data.fee?.assetId ?? null,
          initialFee:
            messageInputTx.data.initialFee &&
            moneyLikeToMoney(messageInputTx.data.initialFee, assets).toCoins(),
          initialFeeAssetId:
            messageInputTx.data.initialFee &&
            (messageInputTx.data.initialFee.assetId === 'WAVES'
              ? null
              : messageInputTx.data.initialFee.assetId),
          payment: payment.map(p => ({
            amount: moneyLikeToMoney(p, assets).toCoins(),
            assetId: p.assetId === 'WAVES' ? null : p.assetId,
          })),
          proofs,
          senderPublicKey,
          timestamp,
          type: messageInputTx.type,
          version,
        };

        let fee =
          messageInputTx.data.fee &&
          moneyLikeToMoney(messageInputTx.data.fee, assets).toCoins();

        if (!fee) {
          fee = new BigNumber(await getSenderExtraFee())
            .add(50_0000)
            .toString();
        }

        const {
          feeAssetId,
          initialFee = fee,
          initialFeeAssetId = feeAssetId,
        } = txParams;

        const tx = {
          ...txParams,
          ...((senderPublicKey === account.publicKey &&
            this.#getFeeInAssetWithEnoughBalance(assets, txParams, {
              assetId: feeAssetId,
              coins: fee,
            })) || {
            fee,
            feeAssetId,
            initialFee,
            initialFeeAssetId,
          }),
        };

        return {
          id: base58Encode(computeTxHash(makeTxBytes(tx))),
          ...tx,
        };
      }
      case TRANSACTION_TYPE.UPDATE_ASSET_INFO: {
        const versions = getTxVersions(account.type)[messageInputTx.type];
        const version = messageInputTx.data.version ?? versions[0];

        if (!versions.includes(version)) {
          throw ERRORS.REQUEST_ERROR('unsupported tx version', messageInputTx);
        }

        await this.assetInfoController.updateAssets([
          messageInputTx.data.fee?.assetId,
          messageInputTx.data.initialFee?.assetId,
          messageInputTx.data.assetId,
        ]);

        const txParams = {
          assetId: messageInputTx.data.assetId,
          chainId,
          description: messageInputTx.data.description,
          initialFee:
            messageInputTx.data.initialFee &&
            moneyLikeToMoney(messageInputTx.data.initialFee, assets).toCoins(),
          name: messageInputTx.data.name,
          proofs,
          senderPublicKey,
          timestamp,
          type: messageInputTx.type,
          version,
        };

        let fee =
          messageInputTx.data.fee &&
          moneyLikeToMoney(messageInputTx.data.fee, assets).toCoins();

        if (!fee) {
          fee = new BigNumber(await getSenderExtraFee())
            .add(
              txParams.assetId && assets[txParams.assetId]?.hasScript
                ? 50_0000
                : 10_0000,
            )
            .toString();
        }

        const { initialFee = fee } = txParams;

        const tx = {
          ...txParams,
          fee,
          initialFee,
        };

        return {
          id: base58Encode(computeTxHash(makeTxBytes(tx))),
          ...tx,
        };
      }
    }
  }

  async #generateMessage(messageInput: MessageInput): Promise<Message> {
    if (!messageInput.data && messageInput.type !== 'authOrigin') {
      throw ERRORS.REQUEST_ERROR('should contain a data field', messageInput);
    }

    switch (messageInput.type) {
      case 'auth': {
        let successPath: string | null = null;

        try {
          successPath = messageInput.data.successPath
            ? new URL(
                messageInput.data.successPath,
                messageInput.data.referrer || `https://${messageInput.origin}`,
              ).href
            : null;
        } catch {
          // ignore
        }

        const { data, icon, name } = messageInput.data;

        const host =
          messageInput.data.host ||
          new URL(`https://${messageInput.origin}`).host;

        const prefix = 'WavesWalletAuthentication';

        return {
          ...messageInput,
          data: {
            referrer: messageInput.data.referrer,
            data: { data, host, icon, name, prefix },
          },
          ext_uuid: messageInput.options && messageInput.options.uid,
          id: nanoid(),
          messageHash: base58Encode(computeHash(makeAuthBytes({ data, host }))),
          status: MessageStatus.UnApproved,
          successPath,
          timestamp: Date.now(),
        };
      }
      case 'authOrigin':
        return {
          ...messageInput,
          id: nanoid(),
          ext_uuid: messageInput.options && messageInput.options.uid,
          status: MessageStatus.UnApproved,
          timestamp: Date.now(),
        };
      case 'cancelOrder': {
        const data = {
          senderPublicKey: messageInput.account.publicKey,
          ...messageInput.data.data,
        };

        return {
          ...messageInput,
          amountAsset: messageInput.data.amountAsset,
          data: { ...messageInput.data, data, timestamp: Date.now() },
          ext_uuid: messageInput.options && messageInput.options.uid,
          id: nanoid(),
          messageHash: base58Encode(
            computeHash(
              makeCancelOrderBytes({
                orderId: data.id,
                sender: data.senderPublicKey,
              }),
            ),
          ),
          priceAsset: messageInput.data.priceAsset,
          status: MessageStatus.UnApproved,
          timestamp: Date.now(),
        };
      }
      case 'customData': {
        try {
          const data = {
            ...messageInput.data,
            publicKey:
              messageInput.data.publicKey || messageInput.account.publicKey,
          };

          return {
            ...messageInput,
            data: {
              ...data,
              hash: base58Encode(computeHash(makeCustomDataBytes(data))),
            },
            ext_uuid: messageInput.options && messageInput.options.uid,
            id: nanoid(),
            status: MessageStatus.UnApproved,
            timestamp: Date.now(),
          };
        } catch (err) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          throw ERRORS.REQUEST_ERROR((err as any).message, messageInput);
        }
      }
      case 'order': {
        if (!this.#isMoneyLikeValuePositive(messageInput.data.data.amount)) {
          throw ERRORS.REQUEST_ERROR('amount is not valid', messageInput.data);
        }

        if (!this.#isMoneyLikeValuePositive(messageInput.data.data.price)) {
          throw ERRORS.REQUEST_ERROR('price is not valid', messageInput.data);
        }

        if (
          !this.#isMoneyLikeValuePositive(messageInput.data.data.matcherFee)
        ) {
          throw ERRORS.REQUEST_ERROR(
            'matcherFee is not valid',
            messageInput.data,
          );
        }

        const amountAssetId =
          messageInput.data.data.amount.assetId === 'WAVES'
            ? null
            : messageInput.data.data.amount.assetId;

        const matcherFeeAssetId =
          messageInput.data.data.matcherFee.assetId === 'WAVES'
            ? null
            : messageInput.data.data.matcherFee.assetId;

        const priceAssetId =
          messageInput.data.data.price.assetId === 'WAVES'
            ? null
            : messageInput.data.data.price.assetId;

        await this.assetInfoController.updateAssets([
          amountAssetId,
          matcherFeeAssetId,
          priceAssetId,
        ]);

        const assets = this.assetInfoController.getAssets();

        const amountAsset = assets[amountAssetId ?? 'WAVES'];
        invariant(amountAsset);

        const priceAsset = assets[priceAssetId ?? 'WAVES'];
        invariant(priceAsset);

        const version = messageInput.data.data.version ?? 3;

        const orderParams = {
          amount: moneyLikeToMoney(
            messageInput.data.data.amount,
            assets,
          ).toCoins(),
          assetPair: {
            amountAsset: amountAssetId,
            priceAsset: priceAssetId,
          },
          chainId:
            messageInput.data.data.chainId ??
            base58Decode(messageInput.account.address)[1],
          eip712Signature: messageInput.data.data.eip712Signature,
          expiration: messageInput.data.data.expiration,
          matcherFee: moneyLikeToMoney(
            messageInput.data.data.matcherFee,
            assets,
          ).toCoins(),
          matcherFeeAssetId,
          matcherPublicKey:
            messageInput.data.data.matcherPublicKey ??
            (await this.networkController.getMatcherPublicKey()),
          orderType: messageInput.data.data.orderType,
          price: moneyLikeToMoney(messageInput.data.data.price, assets)
            .getTokens()
            .mul(
              new BigNumber(10).pow(
                version < 4 ||
                  messageInput.data.data.priceMode === 'assetDecimals'
                  ? 8 + priceAsset.precision - amountAsset.precision
                  : 8,
              ),
            )
            .toString(),
          priceMode: messageInput.data.data.priceMode ?? 'fixedDecimals',
          proofs: messageInput.data.data.proofs ?? [],
          senderPublicKey: messageInput.account.publicKey,
          timestamp: messageInput.data.data.timestamp ?? Date.now(),
          version,
        };

        const order = {
          id: base58Encode(computeHash(makeOrderBytes(orderParams))),
          ...orderParams,
        };

        return {
          ...messageInput,
          data: order,
          ext_uuid: messageInput.options && messageInput.options.uid,
          id: nanoid(),
          status: MessageStatus.UnApproved,
          timestamp: Date.now(),
        };
      }
      case 'request': {
        const data = {
          timestamp: Date.now(),
          senderPublicKey: messageInput.account.publicKey,
          ...messageInput.data.data,
        };

        return {
          ...messageInput,
          data: { ...messageInput.data, data },
          ext_uuid: messageInput.options && messageInput.options.uid,
          id: nanoid(),
          messageHash: base58Encode(
            computeHash(
              makeRequestBytes({
                senderPublicKey: data.senderPublicKey,
                timestamp: data.timestamp,
              }),
            ),
          ),
          status: MessageStatus.UnApproved,
          timestamp: Date.now(),
        };
      }
      case 'transaction': {
        const messageTx = await this.#generateMessageTx(
          messageInput.account,
          messageInput.data,
        );

        return {
          ...messageInput,
          data: messageTx,
          ext_uuid: messageInput.options?.uid,
          id: nanoid(),
          input: messageInput,
          status: MessageStatus.UnApproved,
          successPath: messageInput.data.successPath || undefined,
          timestamp: Date.now(),
        };
      }
      case 'transactionPackage': {
        const { max, allow_tx } = this.remoteConfigController.getPackConfig();

        const msgs = messageInput.data.length;

        if (!msgs || msgs > max) {
          throw ERRORS.REQUEST_ERROR(
            `max transactions in pack is ${max}`,
            messageInput,
          );
        }

        const unavailableTx = messageInput.data.filter(
          ({ type }) => !allow_tx.includes(type),
        );

        if (unavailableTx.length) {
          throw ERRORS.REQUEST_ERROR(
            `tx type can be ${allow_tx.join(', ')}`,
            messageInput,
          );
        }

        const txs = await Promise.all(
          messageInput.data.map(txParams =>
            this.#generateMessageTx(messageInput.account, txParams),
          ),
        );

        return {
          ...messageInput,
          data: txs,
          ext_uuid: messageInput.options && messageInput.options.uid,
          id: nanoid(),
          input: messageInput,
          status: MessageStatus.UnApproved,
          timestamp: Date.now(),
        };
      }
      case 'wavesAuth': {
        try {
          const data = {
            ...messageInput.data,
            publicKey:
              messageInput.data.publicKey || messageInput.account.publicKey,
          };

          return {
            ...messageInput,
            data: {
              ...data,
              address: messageInput.account.address,
              hash: base58Encode(blake2b(makeWavesAuthBytes(data))),
            },
            ext_uuid: messageInput.options && messageInput.options.uid,
            id: nanoid(),
            status: MessageStatus.UnApproved,
            timestamp: Date.now(),
          };
        } catch (err) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          throw ERRORS.REQUEST_ERROR((err as any).message, messageInput);
        }
      }
    }
  }
}
