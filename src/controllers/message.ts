import { BigNumber } from '@waves/bignumber';
import { Money } from '@waves/data-entities';
import { address } from '@waves/ts-lib-crypto';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import { customData, wavesAuth } from '@waves/waves-transactions';
import EventEmitter from 'events';
import log from 'loglevel';
import { MessageInput, MessageStoreItem } from 'messages/types';
import { nanoid } from 'nanoid';
import ObservableStore from 'obs-store';
import create from 'parse-json-bignumber';
import { PERMISSIONS } from 'permissions/constants';
import { PreferencesAccount } from 'preferences/types';
import Browser from 'webextension-polyfill';

import { MSG_STATUSES } from '../constants';
import {
  getFeeOptions,
  getSpendingAmountsForSponsorableTx,
  isEnoughBalanceForFeeAndSpendingAmounts,
} from '../fee/utils';
import { networkByteFromAddress } from '../lib/cryptoUtil';
import { ERRORS, ERRORS_DATA } from '../lib/keeperError';
import { ExtensionStorage } from '../storage/storage';
import { convertFromSa, getHash, makeBytes } from '../transactions/utils';
import { getMoney, IMoneyLike } from '../ui/utils/converters';
import { getTxVersions } from '../wallets';
import { AssetInfoController } from './assetInfo';
import { calculateFeeFabric } from './calculateFee';
import { CurrentAccountController } from './currentAccount';
import { NetworkController } from './network';
import { PermissionsController } from './permissions';
import { RemoteConfigController } from './remoteConfig';
import { TxInfoController } from './txInfo';
import { WalletController } from './wallet';

const { stringify } = create({ BigNumber });

export class MessageController extends EventEmitter {
  private messages;
  private store;
  private signTx;
  private signOrder;
  private signCancelOrder;
  private signWavesAuth;
  private signCustomData;
  private auth;
  private signRequest;
  private broadcast: NetworkController['broadcast'];
  private getMatcherPublicKey;
  private networkController;
  private getMessagesConfig;
  private getPackConfig;
  private assetInfo;
  private assetInfoController;
  private txInfo;
  setPermission;
  private getFee;
  private getFeeConfig;
  private getAccountBalance;

  constructor({
    extensionStorage,
    signTx,
    signOrder,
    signCancelOrder,
    signWavesAuth,
    signCustomData,
    auth,
    signRequest,
    assetInfoController,
    networkController,
    getMatcherPublicKey,
    getMessagesConfig,
    getPackConfig,
    txInfo,
    setPermission,
    getAccountBalance,
    getFeeConfig,
  }: {
    extensionStorage: ExtensionStorage;
    signTx: WalletController['signTx'];
    signOrder: WalletController['signOrder'];
    signCancelOrder: WalletController['signCancelOrder'];
    signWavesAuth: WalletController['signWavesAuth'];
    signCustomData: WalletController['signCustomData'];
    auth: WalletController['auth'];
    signRequest: WalletController['signRequest'];
    assetInfoController: AssetInfoController;
    networkController: NetworkController;
    getMatcherPublicKey: NetworkController['getMatcherPublicKey'];
    getMessagesConfig: RemoteConfigController['getMessagesConfig'];
    getPackConfig: RemoteConfigController['getPackConfig'];
    txInfo: TxInfoController['txInfo'];
    setPermission: PermissionsController['setPermission'];
    getAccountBalance: CurrentAccountController['getAccountBalance'];
    getFeeConfig: RemoteConfigController['getFeeConfig'];
  }) {
    super();

    this.messages = extensionStorage.getInitState({
      messages: [],
    });

    this.store = new ObservableStore(this.messages);
    extensionStorage.subscribe(this.store);

    // Signing methods from WalletController
    this.signTx = signTx;
    this.signOrder = signOrder;
    this.signCancelOrder = signCancelOrder;
    this.signWavesAuth = signWavesAuth;
    this.signCustomData = signCustomData;
    this.auth = auth;
    this.signRequest = signRequest;

    // Broadcast and getMatcherPublicKey method from NetworkController
    this.broadcast = messages => networkController.broadcast(messages);
    this.getMatcherPublicKey = getMatcherPublicKey;
    this.networkController = networkController;

    this.getMessagesConfig = getMessagesConfig;
    this.getPackConfig = getPackConfig;

    // Get assetInfo method from AssetInfoController
    this.assetInfo = assetInfoController.assetInfo.bind(assetInfoController);
    this.assetInfoController = assetInfoController;
    // tx by txId
    this.txInfo = txInfo;

    // permissions
    this.setPermission = setPermission;

    this.getFee = calculateFeeFabric(assetInfoController, networkController);
    this.getFeeConfig = getFeeConfig;
    this.getAccountBalance = getAccountBalance;

    this.rejectAllByTime();

    Browser.alarms.onAlarm.addListener(({ name }) => {
      if (name === 'rejectMessages') {
        this.rejectAllByTime();
      }
    });

    this._updateBadge();
  }

  async newMessage(messageData: MessageInput) {
    log.debug(
      `New message ${messageData.type}: ${JSON.stringify(messageData.data)}`
    );

    let message: MessageStoreItem;
    try {
      message = await this._generateMessage(messageData);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      throw ERRORS_DATA[e.code as keyof typeof ERRORS_DATA]
        ? e
        : ERRORS.UNKNOWN(e.message, e.stack);
    }

    const messages = this.store.getState().messages;

    while (messages.length > this.getMessagesConfig().max_messages) {
      const oldest = messages
        .filter(msg => Object.values(MSG_STATUSES).includes(msg.status))
        .sort((a, b) => a.timestamp - b.timestamp)[0];
      if (oldest) {
        this._deleteMessage(oldest.id);
      } else {
        break;
      }
    }

    const { options } = messageData;
    const { getMeta } = options || {};

    if (getMeta) {
      return {
        noSign: true,
        id: message.id,
        hash: message.messageHash,
      };
    }

    log.debug(`Generated message ${JSON.stringify(message)}`);

    messages.push(message);

    this._updateStore(messages);

    return { id: message.id };
  }

  async getMessageResult(id: string) {
    const message = this._getMessageById(id);

    switch (message.status) {
      case MSG_STATUSES.SIGNED:
      case MSG_STATUSES.PUBLISHED:
        return message.result;
      case MSG_STATUSES.REJECTED:
      case MSG_STATUSES.REJECTED_FOREVER:
        throw ERRORS.USER_DENIED(undefined, message.status);
      case MSG_STATUSES.FAILED:
        throw ERRORS.FAILED_MSG(undefined, message.err.message);
    }

    const finishedMessage = await new Promise<MessageStoreItem>(resolve => {
      this.once(`${id}:finished`, resolve);
    });

    switch (finishedMessage.status) {
      case MSG_STATUSES.SIGNED:
      case MSG_STATUSES.PUBLISHED:
        return finishedMessage.result;
      case MSG_STATUSES.REJECTED:
      case MSG_STATUSES.REJECTED_FOREVER:
        throw ERRORS.USER_DENIED(undefined, message.status);
      case MSG_STATUSES.FAILED:
        throw ERRORS.FAILED_MSG(undefined, finishedMessage.err.message);
      default:
        throw ERRORS.UNKNOWN();
    }
  }

  getMessageById(id: string) {
    return this._getMessageById(id);
  }

  deleteMessage(id: string) {
    return this._deleteMessage(id);
  }

  async approve(id: string, account?: PreferencesAccount) {
    const message = this._getMessageById(id);
    message.account = account || message.account;

    if (!message.account) {
      throw new Error(
        'Message has empty account filled and no address is provided'
      );
    }

    try {
      await this._signMessage(message);

      if (
        message.broadcast &&
        (message.type === 'transaction' ||
          message.type === 'order' ||
          message.type === 'cancelOrder')
      ) {
        message.result = await this.broadcast(message);
        message.status = MSG_STATUSES.PUBLISHED;
      }

      if (message.successPath) {
        const url = new URL(message.successPath);

        switch (message.type) {
          case 'transaction':
            url.searchParams.append('txId', message.messageHash);
            this.emit('Open new tab', url.href);
            break;
          case 'auth':
            if (message.result && typeof message.result !== 'string') {
              url.searchParams.append('p', message.result.publicKey);
              url.searchParams.append('s', message.result.signature);
              url.searchParams.append('a', message.result.address);
              this.emit('Open new tab', url.href);
            }
            break;
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      message.status = MSG_STATUSES.FAILED;
      message.err = {
        message: e.toString(),
        stack: e.stack,
      };
    }

    this._updateMessage(message);
    this.emit(`${message.id}:finished`, message);

    if (message.status === MSG_STATUSES.FAILED) {
      throw new Error(message.err.message);
    }

    return message;
  }

  reject(id: string, forever?: boolean) {
    const message = this._getMessageById(id);
    message.status = !forever
      ? MSG_STATUSES.REJECTED
      : MSG_STATUSES.REJECTED_FOREVER;
    this._updateMessage(message);
    this.emit(`${message.id}:finished`, message);
  }

  async updateTransactionFee(id: string, fee: IMoneyLike) {
    const message = this._getMessageById(id) as Extract<
      MessageStoreItem,
      { type: 'transaction' }
    >;

    message.data.data.fee = fee;
    const updatedMsg = await this._generateMessage(message);
    updatedMsg.id = id;
    this._updateMessage(updatedMsg);
    return updatedMsg;
  }

  updateBadge() {
    this._updateBadge();
  }

  rejectByOrigin(byOrigin: string) {
    const { messages } = this.store.getState();
    messages.forEach(({ id, origin }) => {
      if (byOrigin === origin) {
        this.reject(id);
      }
    });
  }

  rejectAllByTime() {
    const { message_expiration_ms } = this.getMessagesConfig();
    const time = Date.now();
    const { messages } = this.store.getState();
    messages.forEach(({ id, timestamp, status }) => {
      if (
        time - timestamp > message_expiration_ms &&
        status === MSG_STATUSES.UNAPPROVED
      ) {
        this.reject(id);
      }
    });
    this._updateMessagesByTimeout();
  }

  removeMessagesFromConnection(connectionId: string) {
    const { messages } = this.store.getState();

    messages.forEach(message => {
      if (message.connectionId === connectionId) {
        this.reject(message.id);
      }
    });

    this._updateStore(
      messages.filter(message => message.connectionId !== connectionId)
    );
  }

  clearMessages(ids?: string | string[]) {
    if (typeof ids === 'string') {
      this._deleteMessage(ids);
    } else if (ids && ids.length > 0) {
      ids.forEach(id => this._deleteMessage(id));
    } else {
      this._updateStore([]);
    }
  }

  getUnapproved() {
    return this.messages.messages.filter(
      ({ status }) => status === MSG_STATUSES.UNAPPROVED
    );
  }

  _updateMessagesByTimeout() {
    const { update_messages_ms } = this.getMessagesConfig();
    Browser.alarms.create('rejectMessages', {
      delayInMinutes: update_messages_ms / 1000 / 60,
    });
  }

  _updateMessage(message: MessageStoreItem) {
    const messages = this.store.getState().messages;
    const id = message.id;
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const index = messages.findIndex(message => message.id === id);
    messages[index] = message;
    this._updateStore(messages);
  }

  _getMessageById(id: string) {
    const result = this.store
      .getState()
      .messages.find(message => message.id === id);
    if (!result) throw new Error(`Failed to get message with id ${id}`);
    return result;
  }

  _deleteMessage(id: string) {
    const { messages } = this.store.getState();
    const index = messages.findIndex(message => message.id === id);
    if (index > -1) {
      messages.splice(index, 1);
      this._updateStore(messages);
    }
  }

  _updateStore(messages: MessageStoreItem[]) {
    this.messages = { ...this.store.getState(), messages };
    this.store.updateState(this.messages);
    this._updateBadge();
  }

  _updateBadge() {
    this.emit('Update badge');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async _transformData(data: any) {
    if (
      !data ||
      typeof data !== 'object' ||
      data instanceof BigNumber ||
      data instanceof Money
    ) {
      return data;
    }

    if (Array.isArray(data)) {
      data = [...data];
    } else {
      data = { ...data };
    }

    for (const key in data) {
      if (!Object.prototype.hasOwnProperty.call(data, key)) {
        continue;
      }

      // Validate fields containing assetId
      if (
        [
          'assetId',
          'amountAsset',
          'amountAssetId',
          'priceAsset',
          'priceAssetId',
          'feeAssetId',
          'matcherFeeAssetId',
        ].includes(key)
      ) {
        await this.assetInfo(data[key]);
      }

      // Convert moneyLike fields
      const field = data[key];

      if (field && typeof field === 'object') {
        if (
          Object.prototype.hasOwnProperty.call(field, 'tokens') &&
          Object.prototype.hasOwnProperty.call(field, 'assetId')
        ) {
          const asset = await this.assetInfo(data[key].assetId);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data[key] = Money.fromTokens(field.tokens, asset as any);
        } else if (
          Object.prototype.hasOwnProperty.call(field, 'coins') &&
          Object.prototype.hasOwnProperty.call(field, 'assetId')
        ) {
          const asset = await this.assetInfo(data[key].assetId);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data[key] = Money.fromCoins(field.coins, asset as any);
        } else if (
          Object.prototype.hasOwnProperty.call(field, 'amount') &&
          Object.prototype.hasOwnProperty.call(field, 'assetId') &&
          Object.keys(field).length === 2
        ) {
          const asset = await this.assetInfo(data[key].assetId);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data[key] = Money.fromCoins(field.amount, asset as any);
        } else {
          data[key] = await this._transformData(field);
        }
      }
    }

    return data;
  }

  async _signMessage(message: MessageStoreItem) {
    switch (message.type) {
      case 'transaction':
        message.result = await this.signTx(
          message.account.address,
          {
            ...message.data,
            data: await this._transformData(message.data.data),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
          message.account.network
        );
        break;
      case 'transactionPackage':
        message.result = await Promise.all(
          message.data.map(async data => {
            const txParams = await this._transformData(data);

            return this.signTx(
              message.account.address,
              txParams,
              message.account.network
            );
          })
        );
        break;
      case 'order':
        message.result = await this.signOrder(
          message.account.address,
          {
            ...message.data,
            data: await this._transformData(message.data.data),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
          message.account.network
        );
        break;
      case 'cancelOrder':
        message.result = await this.signCancelOrder(
          message.account.address,
          {
            ...message.data,
            data: await this._transformData(message.data.data),
          },
          message.account.network
        );
        break;
      case 'auth': {
        const signedData = await this.auth(
          message.account.address,
          message.data,
          message.account.network
        );

        message.result = message.data.isRequest
          ? signedData.signature
          : signedData;
        break;
      }
      case 'wavesAuth':
        message.result = await this.signWavesAuth(
          message.data,
          message.account.address,
          message.account.network
        );
        break;
      case 'request':
        message.result = await this.signRequest(
          message.account.address,
          message.data,
          message.account.network
        );
        break;
      case 'customData':
        message.result = await this.signCustomData(
          message.data,
          message.account.address,
          message.account.network
        );
        break;
      case 'authOrigin':
        message.result = { approved: 'OK' };
        this.setPermission(message.origin, PERMISSIONS.APPROVED);
        break;
      default:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        throw new Error(`Unknown message type ${(message as any).type}`);
    }
    message.status = MSG_STATUSES.SIGNED;
  }

  async _generateMessage(messageData: MessageInput): Promise<MessageStoreItem> {
    const message = {
      ...messageData,
      id: nanoid(),
      timestamp: Date.now(),
      ext_uuid: messageData.options && messageData.options.uid,
      status: MSG_STATUSES.UNAPPROVED,
    };

    if (!message.data && message.type !== 'authOrigin') {
      throw ERRORS.REQUEST_ERROR('should contain a data field', message);
    }

    switch (message.type) {
      case 'wavesAuth': {
        const result = {
          ...message,
          successPath: message.data.successPath || undefined,
          data: {
            ...message.data,
            publicKey: message.data.publicKey || message.account.publicKey,
          },
        };

        let messageHash: string;

        try {
          messageHash = wavesAuth(message.data, 'fake user').hash;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          throw ERRORS.REQUEST_ERROR(e.message, message);
        }

        return {
          ...result,
          messageHash,
        };
      }
      case 'auth': {
        let successPath: string | null = null;

        try {
          successPath = message.data.successPath
            ? new URL(
                message.data.successPath,
                message.data.referrer || `https://${message.origin}`
              ).href
            : null;
        } catch {
          // ignore
        }

        const data = {
          type: 1000 as const,
          referrer: message.data.referrer,
          isRequest: message.data.isRequest,
          data: {
            data: message.data.data,
            prefix: 'WavesWalletAuthentication',
            host:
              message.data.host || new URL(`https://${message.origin}`).host,
            name: message.data.name,
            icon: message.data.icon,
          },
        };

        return {
          ...message,
          successPath,
          messageHash: getHash.auth(makeBytes.auth(convertFromSa.auth(data))),
          data,
        };
      }
      case 'transactionPackage': {
        const { max, allow_tx } = this.getPackConfig();

        const msgs = message.data.length;

        if (!msgs || msgs > max) {
          throw ERRORS.REQUEST_ERROR(
            `max transactions in pack is ${max}`,
            message
          );
        }

        const unavailableTx = message.data.filter(
          ({ type }) => !allow_tx.includes(type)
        );

        if (unavailableTx.length) {
          throw ERRORS.REQUEST_ERROR(
            `tx type can be ${allow_tx.join(', ')}`,
            message
          );
        }

        const data = await Promise.all(
          message.data.map(async txParams => {
            this._validateTx(txParams, message.account);

            // eslint-disable-next-line @typescript-eslint/no-shadow
            const data = {
              timestamp: Date.now(),
              senderPublicKey: message.account.publicKey,
              chainId: networkByteFromAddress(
                message.account.address
              ).charCodeAt(0),
              ...txParams.data,
            };

            const readyData = {
              ...txParams,
              data: {
                ...data,
                fee:
                  txParams.data.fee ||
                  (await this._getDefaultTxFee(message, { ...txParams, data })),
              },
            };

            const id = getHash.transaction(
              makeBytes.transaction(
                convertFromSa.transaction(
                  await this._transformData(readyData),
                  this.networkController.getNetworkCode().charCodeAt(0),
                  message.account.type
                )
              )
            );

            if (
              txParams.type === TRANSACTION_TYPE.CANCEL_LEASE &&
              txParams.data.leaseId
            ) {
              readyData.data.lease = await this.txInfo(txParams.data.leaseId);
            }

            return {
              ...readyData,
              id,
            };
          })
        );

        return {
          ...message,
          successPath: message.data.successPath || undefined,
          data,
          messageHash: data.map(tx => tx.id),
        };
      }
      case 'order': {
        if (message.data.type !== 1002) {
          throw ERRORS.REQUEST_ERROR('unexpected type', message.data);
        }

        if (!this._isMoneyLikeValuePositive(message.data.data.amount)) {
          throw ERRORS.REQUEST_ERROR('amount is not valid', message.data);
        }

        if (!this._isMoneyLikeValuePositive(message.data.data.price)) {
          throw ERRORS.REQUEST_ERROR('price is not valid', message.data);
        }

        if (!this._isMoneyLikeValuePositive(message.data.data.matcherFee)) {
          throw ERRORS.REQUEST_ERROR('matcherFee is not valid', message.data);
        }

        const data = {
          ...message.data,
          data: {
            timestamp: Date.now(),
            senderPublicKey: message.account.publicKey,
            chainId: networkByteFromAddress(message.account.address).charCodeAt(
              0
            ),
            matcherPublicKey: await this.getMatcherPublicKey(),
            ...message.data.data,
          },
        };

        const result = {
          ...message,
          successPath: message.data.successPath || undefined,
          data,
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filledMessageData: any = result.data;

        const convertedData = convertFromSa.order(
          {
            ...filledMessageData,
            data: await this._transformData(filledMessageData.data),
          },
          this.networkController.getNetworkCode().charCodeAt(0)
        );

        const messageHash = getHash.order(makeBytes.order(convertedData));

        const json = stringify(
          {
            ...convertedData,
            sender: address(
              { publicKey: convertedData.senderPublicKey },
              this.networkController.getNetworkCode().charCodeAt(0)
            ),
          },
          null,
          2
        );

        return {
          ...result,
          messageHash,
          json,
        };
      }
      case 'transaction': {
        if (!message.data.type || message.data.type >= 1000) {
          throw ERRORS.REQUEST_ERROR('invalid transaction type', message);
        }

        this._validateTx(message.data, message.account);

        const result = {
          ...message,
          successPath: message.data.successPath || undefined,
          data: {
            ...message.data,
            data: {
              timestamp: Date.now(),
              senderPublicKey: message.account.publicKey,
              chainId: networkByteFromAddress(
                message.account.address
              ).charCodeAt(0),
              ...message.data.data,
            },
          },
        } as unknown as Extract<MessageStoreItem, { type: 'transaction' }>;

        result.data.data.fee =
          message.data.data.fee ||
          (await this._getDefaultTxFee(message, result.data));

        result.data.data.initialFee = result.data.data.initialFee || {
          ...result.data.data.fee,
        };

        if (result.data.type === TRANSACTION_TYPE.CANCEL_LEASE) {
          result.data.data.lease = await this.txInfo(result.data.data.leaseId);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filledMessageData: any = result.data;

        const convertedData = convertFromSa.transaction(
          {
            ...filledMessageData,
            data: await this._transformData(filledMessageData.data),
          },
          result.data.data.chainId,
          message.account.type
        );

        return {
          ...result,
          messageHash: getHash.transaction(
            makeBytes.transaction(convertedData)
          ),
          json: stringify(
            {
              ...convertedData,
              sender: address(
                { publicKey: convertedData.senderPublicKey },
                result.data.data.chainId
              ),
            },
            null,
            2
          ),
        };
      }
      case 'cancelOrder': {
        const result = {
          ...message,
          successPath: message.data.successPath || undefined,
          amountAsset: message.data.amountAsset,
          priceAsset: message.data.priceAsset,
          data: {
            ...message.data,
            data: {
              timestamp: Date.now(),
              senderPublicKey: message.account.publicKey,
              ...message.data.data,
            },
          },
        };

        return {
          ...result,
          messageHash: getHash.request(
            makeBytes.request(convertFromSa.request(result.data))
          ),
        };
      }
      case 'request': {
        const result = {
          ...message,
          successPath: message.data.successPath || undefined,
          data: {
            ...message.data,
            data: {
              timestamp: Date.now(),
              senderPublicKey: message.account.publicKey,
              ...message.data.data,
            },
          },
        };

        return {
          ...result,
          messageHash: getHash.request(
            makeBytes.request(convertFromSa.request(result.data))
          ),
        };
      }
      case 'authOrigin':
        return {
          ...message,
          successPath: message.data.successPath || undefined,
        };
      case 'customData': {
        const result = {
          ...message,
          successPath: message.data.successPath || undefined,
          data: {
            ...message.data,
            publicKey: message.data.publicKey || message.account.publicKey,
          },
        };

        let messageHash: string;

        try {
          messageHash = customData(result.data, 'fake user').hash;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          throw ERRORS.REQUEST_ERROR(e.message, message);
        }

        return {
          ...result,
          messageHash,
        };
      }
      default:
        throw ERRORS.REQUEST_ERROR(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          `incorrect type "${(message as any).type}"`,
          message
        );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async _getDefaultTxFee(message: any, signData: any) {
    const signableData = await this._transformData({ ...signData });
    const chainId = this.networkController.getNetworkCode().charCodeAt(0);

    let fee: IMoneyLike = {
      assetId: 'WAVES',
      coins: (
        await this.getFee(
          signableData,
          chainId,
          message.account,
          this.getFeeConfig()
        )
      ).toString(),
    };

    const assets = this.assetInfoController.getAssets();
    const balance = this.getAccountBalance();
    const feeMoney = getMoney(fee, assets);

    const spendingAmounts = getSpendingAmountsForSponsorableTx({
      assets,
      message,
    });

    if (
      !isEnoughBalanceForFeeAndSpendingAmounts({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        assetBalance: balance!.assets![feeMoney!.asset.id],
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        fee: feeMoney!,
        spendingAmounts,
      })
    ) {
      const feeOptions = getFeeOptions({
        assets,
        balance,
        feeConfig: this.getFeeConfig(),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        initialFee: feeMoney!,
        txType: message.data.type,
        usdPrices: this.assetInfoController.getUsdPrices(),
      });

      const feeOption = feeOptions.find(({ assetBalance, money }) =>
        isEnoughBalanceForFeeAndSpendingAmounts({
          assetBalance,
          fee: money,
          spendingAmounts,
        })
      );

      if (feeOption) {
        fee = feeOption.money.toJSON();
      }
    }

    return fee;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _getMoneyLikeValue(moneyLike: any) {
    for (const key of ['tokens', 'coins', 'amount']) {
      if (key in moneyLike) {
        return moneyLike[key];
      }
    }

    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _isNumberLikePositive(numberLike: any) {
    const bn = new BigNumber(numberLike);

    return bn.isFinite() && bn.gt(0);
  }

  _isMoneyLikeValuePositive(moneyLike: unknown) {
    if (typeof moneyLike !== 'object' || moneyLike === null) {
      return false;
    }

    const value = this._getMoneyLikeValue(moneyLike);

    if (value == null) {
      return false;
    }

    return this._isNumberLikePositive(value);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _validateTx(tx: any, account: PreferencesAccount) {
    if ('fee' in tx.data && !this._isMoneyLikeValuePositive(tx.data.fee)) {
      throw ERRORS.REQUEST_ERROR('fee is not valid', tx);
    }

    if (
      'chainId' in tx.data &&
      tx.data.chainId !== this.networkController.getNetworkCode().charCodeAt(0)
    ) {
      throw ERRORS.REQUEST_ERROR('chainId does not match current network', tx);
    }

    const versions = getTxVersions(account.type)[tx.type];

    if ('version' in tx.data && !versions.includes(tx.data.version)) {
      throw ERRORS.REQUEST_ERROR('unsupported tx version', tx);
    }

    switch (tx.type) {
      case TRANSACTION_TYPE.ISSUE:
        if (!this._isNumberLikePositive(tx.data.quantity)) {
          throw ERRORS.REQUEST_ERROR('quantity is not valid', tx);
        }

        if (tx.data.precision < 0) {
          throw ERRORS.REQUEST_ERROR('precision is not valid', tx);
        }
        break;
      case TRANSACTION_TYPE.TRANSFER:
        if (!this._isMoneyLikeValuePositive(tx.data.amount)) {
          throw ERRORS.REQUEST_ERROR('amount is not valid', tx);
        }
        break;
      case TRANSACTION_TYPE.REISSUE:
        if (
          !this._isMoneyLikeValuePositive(tx.data.quantity || tx.data.amount) &&
          !this._isNumberLikePositive(tx.data.quantity || tx.data.amount)
        ) {
          throw ERRORS.REQUEST_ERROR('quantity is not valid', tx);
        }
        break;
      case TRANSACTION_TYPE.BURN:
        if (
          !this._isMoneyLikeValuePositive(tx.data.quantity || tx.data.amount) &&
          !this._isNumberLikePositive(tx.data.quantity || tx.data.amount)
        ) {
          throw ERRORS.REQUEST_ERROR('amount is not valid', tx);
        }
        break;
      case TRANSACTION_TYPE.LEASE:
        if (
          !this._isMoneyLikeValuePositive(tx.data.amount) &&
          !this._isNumberLikePositive(tx.data.amount)
        ) {
          throw ERRORS.REQUEST_ERROR('amount is not valid', tx);
        }
        break;
      case TRANSACTION_TYPE.MASS_TRANSFER:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tx.data.transfers.forEach(({ amount }: any) => {
          if (
            !this._isMoneyLikeValuePositive(amount) &&
            !this._isNumberLikePositive(amount)
          ) {
            throw ERRORS.REQUEST_ERROR('amount is not valid', tx);
          }
        });
        break;
      case TRANSACTION_TYPE.SPONSORSHIP: {
        const value = this._getMoneyLikeValue(tx.data.minSponsoredAssetFee);
        const bn = value === null ? null : new BigNumber(value);

        if (!bn || !bn.isFinite() || bn.lt(0)) {
          throw ERRORS.REQUEST_ERROR('minSponsoredAssetFee is not valid', tx);
        }
        break;
      }
      case TRANSACTION_TYPE.INVOKE_SCRIPT:
        if (tx.data.payment) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          tx.data.payment.forEach((payment: any) => {
            if (!this._isMoneyLikeValuePositive(payment)) {
              throw ERRORS.REQUEST_ERROR('payment is not valid', tx);
            }
          });
        }
        break;
    }
  }
}
