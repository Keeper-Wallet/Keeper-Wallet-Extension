import ObservableStore from 'obs-store';
import { MSG_STATUSES } from '../constants';
import uuid from 'uuid/v4';
import log from 'loglevel';
import EventEmitter from 'events';
import { Asset, Money } from '@waves/data-entities';
import { BigNumber } from '@waves/bignumber';
import { address } from '@waves/ts-lib-crypto';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import { customData, wavesAuth } from '@waves/waves-transactions';
import { networkByteFromAddress } from '../lib/cryptoUtil';
import { ERRORS } from '../lib/KeeperError';
import { PERMISSIONS } from './PermissionsController';
import { calculateFeeFabric } from './CalculateFeeController';
import { clone } from 'ramda';
import create from 'parse-json-bignumber';
import { convertFromSa, getHash, makeBytes } from '../transactions/utils';
import { getTxVersions } from '../wallets';

const { stringify } = create({ BigNumber });

// msg statuses: unapproved, signed, published, rejected, failed

export class MessageController extends EventEmitter {
  constructor(options = {}) {
    super();
    const defaults = {
      messages: [],
    };

    this.messages = Object.assign({}, defaults, options.initState);
    this.store = new ObservableStore(this.messages);

    // Signing methods from WalletController
    this.signTx = options.signTx;
    this.signOrder = options.signOrder;
    this.signCancelOrder = options.signCancelOrder;
    this.signWavesAuth = options.signWavesAuth;
    this.signCustomData = options.signCustomData;
    this.auth = options.auth;
    this.signRequest = options.signRequest;

    // Broadcast and getMatcherPublicKey method from NetworkController
    this.broadcast = messages => options.networkController.broadcast(messages);
    this.getMatcherPublicKey = options.getMatcherPublicKey;
    this.networkController = options.networkController;

    this.getMessagesConfig = options.getMessagesConfig;
    this.getPackConfig = options.getPackConfig;

    // Get assetInfo method from AssetInfoController
    this.assetInfo = options.assetInfoController.assetInfo.bind(
      options.assetInfoController
    );
    this.assetInfoController = options.assetInfoController;
    //tx by txId
    this.txInfo = options.txInfo;

    // permissions
    this.setPermission = options.setPermission;
    this.canAutoApprove = options.canAutoApprove;

    this.getFee = calculateFeeFabric(
      options.assetInfoController,
      options.networkController
    );

    this.rejectAllByTime();
    this._updateBadge();
  }

  /**
   * Generates message with metadata. Add tx to pipeline
   * @param {object} messageData - message data
   * @returns {Promise<Object>} id - message id
   */
  async newMessage(messageData) {
    log.debug(
      `New message ${messageData.type}: ${JSON.stringify(messageData.data)}`
    );

    let message;
    try {
      message = await this._generateMessage(messageData);
    } catch (e) {
      throw ERRORS.REQUEST_ERROR(messageData);
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

  // Todo: Find appropriate name. What if message has already been finished?
  /**
   * Get message result once it has been approved or rejected
   * @param {string} id - message id
   * @returns {Promise<object>}
   */
  getMessageResult(id) {
    let message;

    try {
      message = this._getMessageById(id);
    } catch (e) {
      return Promise.reject(e);
    }

    switch (message.status) {
      case MSG_STATUSES.SIGNED:
      case MSG_STATUSES.PUBLISHED:
        return Promise.resolve(message.result);
      case MSG_STATUSES.REJECTED:
      case MSG_STATUSES.REJECTED_FOREVER:
        return Promise.reject(ERRORS.USER_DENIED(message.status));
      case MSG_STATUSES.FAILED:
        return Promise.reject(ERRORS.FAILED_MSG(message.err.message));
      default:
        return new Promise((resolve, reject) => {
          this.once(`${id}:finished`, finishedMessage => {
            switch (finishedMessage.status) {
              case MSG_STATUSES.SIGNED:
              case MSG_STATUSES.PUBLISHED:
                return resolve(finishedMessage.result);
              case MSG_STATUSES.REJECTED:
              case MSG_STATUSES.REJECTED_FOREVER:
                return reject(ERRORS.USER_DENIED(message.status));
              case MSG_STATUSES.FAILED:
                return reject(ERRORS.FAILED_MSG(finishedMessage.err.message));
              default:
                return reject(ERRORS.UNKNOWN());
            }
          });
        });
    }
  }

  getMessageById(id) {
    return this._getMessageById(id);
  }

  deleteMessage(id) {
    return this._deleteMessage(id);
  }

  /**
   * Approves message
   * @param {string} id - message id
   * @param {object} [account] - Account, approving this tx
   * @returns {Promise<object>}
   */
  approve(id, account) {
    const message = this._getMessageById(id);
    message.account = account || message.account;
    if (!message.account)
      return Promise.reject(
        'Message has empty account filed and no address is provided'
      );

    return new Promise((resolve, reject) => {
      this._fillSignableData(message)
        .then(this._signMessage.bind(this))
        .then(this._broadcastMessage.bind(this))
        .then(this._processSuccessPath.bind(this))
        .catch(e => {
          message.status = MSG_STATUSES.FAILED;
          message.err = {
            message: e.toString(),
            stack: e.stack,
          };
        })
        .finally(() => {
          this._updateMessage(message);
          this.emit(`${message.id}:finished`, message);
          message.status === MSG_STATUSES.FAILED
            ? reject(message.err.message)
            : resolve(message.result);
        });
    });
  }

  /**
   * Rejects message
   * @param {string} id - message id
   * @param {boolean} forever - reject forever flag
   */
  reject(id, forever) {
    const message = this._getMessageById(id);
    message.status = !forever
      ? MSG_STATUSES.REJECTED
      : MSG_STATUSES.REJECTED_FOREVER;
    this._updateMessage(message);
    this.emit(`${message.id}:finished`, message);
  }

  /**
   * Update transaction fee
   * @param {string} id - message id
   * @param {IMoneyLike} fee
   */
  async updateTransactionFee(id, fee) {
    const message = this._getMessageById(id);
    message.data.data.fee = fee;
    const updatedMsg = await this._generateMessage(message);
    updatedMsg.id = id;
    this._updateMessage(updatedMsg);
    return updatedMsg;
  }

  updateBadge() {
    this._updateBadge(this.store.getState().messages);
  }

  rejectByOrigin(byOrigin) {
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

  // for debug purposes
  /**
   * Deletes all messages
   * @param {array} [ids] - message id
   */
  clearMessages(ids) {
    if (typeof ids === 'string') {
      this._deleteMessage(ids);
    } else if (ids && ids.length > 0) {
      ids.forEach(id => this._deleteMessage(id));
    } else {
      this._updateStore([]);
    }
  }

  /**
   * Removes unused messages in final states from previous versions of Keeper Wallet
   */
  clearUnusedMessages() {
    const unusedStatuses = [
      MSG_STATUSES.REJECTED,
      MSG_STATUSES.REJECTED_FOREVER,
      MSG_STATUSES.SIGNED,
      MSG_STATUSES.PUBLISHED,
      MSG_STATUSES.FAILED,
    ];
    const unusedMessages = [],
      actualMessages = [];

    this.messages.messages.forEach(message => {
      const { status } = message;
      if (unusedStatuses.indexOf(status) === -1) {
        actualMessages.push(message);
      } else {
        unusedMessages.push(message);
      }
    });

    if (unusedMessages.length) {
      this._updateStore(actualMessages);
    }
  }

  getUnapproved() {
    return this.messages.messages.filter(
      ({ status }) => status === MSG_STATUSES.UNAPPROVED
    );
  }

  _updateMessagesByTimeout() {
    clearTimeout(this._updateTimer);
    const { update_messages_ms } = this.getMessagesConfig();
    this._updateTimer = setTimeout(
      () => this.rejectAllByTime(),
      update_messages_ms
    );
  }

  _updateMessage(message) {
    const messages = this.store.getState().messages;
    const id = message.id;
    const index = messages.findIndex(message => message.id === id);
    messages[index] = message;
    this._updateStore(messages);
  }

  _getMessageById(id) {
    const result = this.store
      .getState()
      .messages.find(message => message.id === id);
    if (!result) throw new Error(`Failed to get message with id ${id}`);
    return result;
  }

  _deleteMessage(id) {
    const { messages } = this.store.getState();
    const index = messages.findIndex(message => message.id === id);
    if (index > -1) {
      messages.splice(index, 1);
      this._updateStore(messages);
    }
  }

  _updateStore(messages) {
    this.messages = { ...this.store.getState(), messages };
    this.store.updateState(this.messages);
    this._updateBadge();
  }

  _updateBadge() {
    this.emit('Update badge');
  }

  async _transformData(data) {
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
          data[key] = Money.fromTokens(field.tokens, asset);
        } else if (
          Object.prototype.hasOwnProperty.call(field, 'coins') &&
          Object.prototype.hasOwnProperty.call(field, 'assetId')
        ) {
          const asset = await this.assetInfo(data[key].assetId);
          data[key] = Money.fromCoins(field.coins, asset);
        } else if (
          Object.prototype.hasOwnProperty.call(field, 'amount') &&
          Object.prototype.hasOwnProperty.call(field, 'assetId') &&
          Object.keys(field).length === 2
        ) {
          const asset = await this.assetInfo(data[key].assetId);
          data[key] = Money.fromCoins(field.amount, asset);
        } else {
          data[key] = await this._transformData(field);
        }
      }
    }

    return data;
  }

  async _fillSignableData(message) {
    switch (message.type) {
      case 'order':
      case 'cancelOrder':
      case 'transaction':
        message.data.data = await this._transformData({ ...message.data.data });
        return message;
      case 'transactionPackage':
        message.data = await Promise.all(
          message.data.map(async data => await this._transformData(data))
        );
        return message;
      default:
        return message;
    }
  }

  async _signMessage(message) {
    let signedData;
    switch (message.type) {
      case 'transaction':
        signedData = await this.signTx(
          message.account.address,
          message.data,
          message.account.network
        );
        break;
      case 'transactionPackage':
        signedData = await Promise.all(
          message.data.map(txParams => {
            return this.signTx(
              message.account.address,
              txParams,
              message.account.network
            );
          })
        );
        break;
      case 'order':
        signedData = await this.signOrder(
          message.account.address,
          message.data,
          message.account.network
        );
        break;
      case 'cancelOrder':
        signedData = await this.signCancelOrder(
          message.account.address,
          message.data,
          message.account.network
        );
        break;
      case 'auth':
        signedData = await this.auth(
          message.account.address,
          message.data,
          message.account.network
        );
        signedData = message.data.isRequest ? signedData.signature : signedData;
        break;
      case 'wavesAuth':
        signedData = await this.signWavesAuth(
          message.data,
          message.account.address,
          message.account.network
        );
        break;
      case 'request':
        signedData = await this.signRequest(
          message.account.address,
          message.data,
          message.account.network
        );
        break;
      case 'customData':
        signedData = await this.signCustomData(
          message.data,
          message.account.address,
          message.account.network
        );
        break;
      case 'pairing':
        signedData = { approved: 'OK' };
        break;
      case 'authOrigin':
        signedData = { approved: 'OK' };
        this.setPermission(message.origin, PERMISSIONS.APPROVED);
        break;
      default:
        throw new Error(`Unknown message type ${message.type}`);
    }
    message.status = MSG_STATUSES.SIGNED;
    message.result = signedData;
    return message;
  }

  async _broadcastMessage(message) {
    if (
      !message.broadcast ||
      ['transaction', 'order', 'cancelOrder'].indexOf(message.type) === -1
    ) {
      return message;
    }

    const broadcastResp = await this.broadcast(message);
    message.status = MSG_STATUSES.PUBLISHED;
    message.result = broadcastResp;
    return message;
  }

  async _processSuccessPath(message) {
    if (message.successPath) {
      const url = new URL(message.successPath);
      switch (message.type) {
        case 'transaction':
          url.searchParams.append('txId', message.messageHash);
          this.emit('Open new tab', url.href);
          break;
        case 'auth':
          //url.searchParams.append('d', message.data.data);
          url.searchParams.append('p', message.result.publicKey);
          url.searchParams.append('s', message.result.signature);
          url.searchParams.append('a', message.result.address);
          this.emit('Open new tab', url.href);
          break;
      }
    }
    return message;
  }

  async _generateMessage(messageData) {
    const { options } = messageData;

    const message = {
      ...messageData,
      id: uuid(),
      timestamp: Date.now(),
      ext_uuid: options && options.uid,
      status: MSG_STATUSES.UNAPPROVED,
    };
    return await this._validateAndTransform(message);
  }

  async _validateAndTransform(message) {
    const result = { ...message };

    if (message.data && message.data.successPath) {
      result.successPath = message.data.successPath;
    }

    const hasFee =
      message.data.data &&
      (message.data.data.fee || message.data.data.matcherFee);

    switch (message.type) {
      case 'wavesAuth':
        result.data = message.data;
        result.data.publicKey = message.data.publicKey =
          message.data.publicKey || message.account.publicKey;
        result.messageHash = wavesAuth(message.data, 'fake user').hash;
        break;
      case 'auth':
        try {
          result.successPath = result.successPath
            ? new URL(
                result.successPath,
                message.data.referrer || 'https://' + message.origin
              ).href
            : null;
        } catch (e) {
          result.successPath = null;
        }

        result.data = {
          type: 1000,
          referrer: message.data.referrer,
          isRequest: message.data.isRequest,
          data: {
            data: message.data.data,
            prefix: 'WavesWalletAuthentication',
            host:
              message.data.host || new URL('https://' + message.origin).host,
            name: message.data.name,
            icon: message.data.icon,
          },
        };

        result.messageHash = getHash.auth(
          makeBytes.auth(convertFromSa.auth(result.data))
        );
        break;
      case 'transactionPackage': {
        if (!Array.isArray(message.data))
          throw new Error('Should contain array of txParams');
        const { max, allow_tx } = this.getPackConfig();

        const msgs = message.data.length;

        if (!msgs || msgs > max) {
          throw new Error(`Max transactions in pack is ${max}`);
        }

        const unavailableTx = message.data.filter(
          ({ type }) => !allow_tx.includes(type)
        );

        if (unavailableTx.length) {
          throw new Error(`Tx type can be ${allow_tx.join(', ')}`);
        }

        const ids = [];

        const dataPromises = message.data.map(async txParams => {
          this._validateTx(txParams, message.account);
          const data = this._prepareTx(txParams.data, message.account);

          const feeData = !txParams.data.fee
            ? await this._getFee(message, { ...txParams, data })
            : {};

          const readyData = await this._transformData({
            ...txParams,
            data: { ...data, ...feeData },
          });

          const id = getHash.transaction(
            makeBytes.transaction(
              convertFromSa.transaction(
                readyData,
                this.networkController.getNetworkCode().charCodeAt(0),
                message.account.type
              )
            )
          );
          ids.push(id);
          readyData.id = id;
          if (txParams.type === 9 && txParams.data.leaseId) {
            readyData.data.lease = await this.txInfo(txParams.data.leaseId);
          }
          return readyData;
        });
        result.data = await Promise.all(dataPromises);
        result.messageHash = ids;
        break;
      }
      case 'order': {
        this._validateOrder(result.data);

        result.data.data = await this._prepareOrder(
          result.data.data,
          message.account
        );

        const matcherFeeData = !hasFee
          ? await this._getFee(message, result.data)
          : {};

        const filledMessage = await this._fillSignableData(clone(result));
        const convertedData = convertFromSa.order(filledMessage.data);

        result.data.data = { ...result.data.data, ...matcherFeeData };
        result.messageHash = getHash.order(makeBytes.order(convertedData));

        result.json = stringify(
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
        break;
      }
      case 'transaction': {
        if (!result.data.type || result.data.type >= 1000) {
          throw ERRORS.REQUEST_ERROR(result.data);
        }

        this._validateTx(result.data, message.account);
        result.data.data = this._prepareTx(result.data.data, message.account);

        const feeData = !hasFee ? await this._getFee(message, result.data) : {};

        result.data.data = { ...result.data.data, ...feeData };
        result.data.data.initialFee = result.data.data.initialFee || {
          ...result.data.data.fee,
        };

        const [lease, filledMessage] = await Promise.all([
          result.data.type === 9 && this.txInfo(result.data.data.leaseId),
          this._fillSignableData(clone(result)),
        ]);

        result.data.data.lease = lease;

        const chainId = this.networkController.getNetworkCode().charCodeAt(0);

        const convertedData = convertFromSa.transaction(
          filledMessage.data,
          chainId,
          message.account.type
        );

        result.messageHash = getHash.transaction(
          makeBytes.transaction(convertedData)
        );

        result.json = stringify(
          {
            ...convertedData,
            sender: address(
              { publicKey: convertedData.senderPublicKey },
              chainId
            ),
          },
          null,
          2
        );
        break;
      }
      case 'cancelOrder':
        result.amountAsset = message.data.amountAsset;
        result.priceAsset = message.data.priceAsset;
      // falls through
      case 'request': {
        const requestDefaults = {
          timestamp: Date.now(),
          senderPublicKey: message.account.publicKey,
        };
        result.data.data = { ...requestDefaults, ...result.data.data };
        result.messageHash = getHash.request(
          makeBytes.request(convertFromSa.request(result.data))
        );
        break;
      }
      case 'authOrigin':
        break;
      case 'customData':
        result.data.publicKey = message.data.publicKey =
          message.data.publicKey || message.account.publicKey;
        result.messageHash = customData(result.data, 'fake user').hash;
        break;
      case 'pairing':
        if (
          !(
            typeof message.data.address === 'string' &&
            typeof message.data.encryptedSeed === 'string'
          )
        )
          throw new Error('Address and encryptedSeed are required for pairing');
        break;
      default:
        throw new Error(`Incorrect type "${message.type}"`);
    }

    return result;
  }

  async _getFee(message, signData) {
    const signableData = await this._transformData({ ...signData });
    const chainId = this.networkController.getNetworkCode().charCodeAt(0);

    const fee = {
      coins: (
        await this.getFee(signableData, chainId, message.account)
      ).toString(),
      assetId: 'WAVES',
    };
    return {
      fee,
      matcherFee: fee,
    };
  }

  _getMoneyLikeValue(moneyLike) {
    for (const key of ['tokens', 'coins', 'amount']) {
      if (key in moneyLike) {
        return moneyLike[key];
      }
    }

    return null;
  }

  _isNumberLikePositive(numberLike) {
    const bn = new BigNumber(numberLike);

    return bn.isFinite() && bn.gt(0);
  }

  _isMoneyLikeValuePositive(moneyLike) {
    if (typeof moneyLike !== 'object' || moneyLike === null) {
      return false;
    }

    const value = this._getMoneyLikeValue(moneyLike);

    if (value == null) {
      return false;
    }

    return this._isNumberLikePositive(value);
  }

  _validateTx(tx, account) {
    if ('fee' in tx.data && !this._isMoneyLikeValuePositive(tx.data.fee)) {
      throw new Error('fee is not valid');
    }

    if (
      'chainId' in tx.data &&
      tx.data.chainId !== this.networkController.getNetworkCode().charCodeAt(0)
    ) {
      throw new Error('chainId does not match current network');
    }

    const versions = getTxVersions(account.type)[tx.type];

    if ('version' in tx.data && !versions.includes(tx.data.version)) {
      throw new Error('Unsupported tx version');
    }

    switch (tx.type) {
      case TRANSACTION_TYPE.ISSUE:
        if (!this._isNumberLikePositive(tx.data.quantity)) {
          throw new Error('quantity is not valid');
        }

        if (tx.data.precision < 0) {
          throw new Error('precision is not valid');
        }
        break;
      case TRANSACTION_TYPE.TRANSFER:
        if (!this._isMoneyLikeValuePositive(tx.data.amount)) {
          throw new Error('amount is not valid');
        }
        break;
      case TRANSACTION_TYPE.REISSUE:
        if (
          !this._isMoneyLikeValuePositive(tx.data.quantity || tx.data.amount) &&
          !this._isNumberLikePositive(tx.data.quantity || tx.data.amount)
        ) {
          throw new Error('quantity is not valid');
        }
        break;
      case TRANSACTION_TYPE.BURN:
        if (
          !this._isMoneyLikeValuePositive(tx.data.quantity || tx.data.amount) &&
          !this._isNumberLikePositive(tx.data.quantity || tx.data.amount)
        ) {
          throw new Error('amount is not valid');
        }
        break;
      case TRANSACTION_TYPE.LEASE:
        if (
          !this._isMoneyLikeValuePositive(tx.data.amount) &&
          !this._isNumberLikePositive(tx.data.amount)
        ) {
          throw new Error('amount is not valid');
        }
        break;
      case TRANSACTION_TYPE.MASS_TRANSFER:
        tx.data.transfers.forEach(({ amount }) => {
          if (
            !this._isMoneyLikeValuePositive(amount) &&
            !this._isNumberLikePositive(amount)
          ) {
            throw new Error('amount is not valid');
          }
        });
        break;
      case TRANSACTION_TYPE.SPONSORSHIP: {
        const value = this._getMoneyLikeValue(tx.data.minSponsoredAssetFee);
        const bn = value === null ? null : new BigNumber(value);

        if (!bn || !bn.isFinite() || bn.lt(0)) {
          throw new Error('minSponsoredAssetFee is not valid');
        }
        break;
      }
      case TRANSACTION_TYPE.INVOKE_SCRIPT:
        if (tx.data.payment) {
          tx.data.payment.forEach(payment => {
            if (!this._isMoneyLikeValuePositive(payment)) {
              throw new Error('payment is not valid');
            }
          });
        }
        break;
    }
  }

  _prepareTx(txParams, account) {
    const defaultFee = Money.fromCoins(
      0,
      new Asset(this.assetInfoController.getWavesAsset())
    ).toJSON();

    const txDefaults = {
      timestamp: Date.now(),
      senderPublicKey: account.publicKey,
      chainId: networkByteFromAddress(account.address).charCodeAt(0),
      fee: defaultFee,
      matcherFee: defaultFee,
    };
    return { ...txDefaults, ...txParams };
  }

  _validateOrder(order) {
    if (order.type !== 1002) {
      throw new Error('Unexpected type');
    }

    if (!this._isMoneyLikeValuePositive(order.data.amount)) {
      throw new Error('amount is not valid');
    }

    if (!this._isMoneyLikeValuePositive(order.data.price)) {
      throw new Error('price is not valid');
    }

    if (!this._isMoneyLikeValuePositive(order.data.matcherFee)) {
      throw new Error('matcherFee is not valid');
    }
  }

  async _prepareOrder(orderParams, account) {
    const defaultFee = Money.fromCoins(
      0,
      new Asset(this.assetInfoController.getWavesAsset())
    );

    const orderDefaults = {
      timestamp: Date.now(),
      senderPublicKey: account.publicKey,
      chainId: networkByteFromAddress(account.address).charCodeAt(0),
      matcherPublicKey: await this.getMatcherPublicKey(),
      matcherFee: defaultFee,
    };
    return { ...orderDefaults, ...orderParams };
  }
}
