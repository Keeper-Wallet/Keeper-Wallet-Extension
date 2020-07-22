import ObservableStore from 'obs-store';
import { MSG_STATUSES } from '../constants';
import uuid from 'uuid/v4';
import log from 'loglevel';
import EventEmitter from 'events'
import { getAdapterByType } from "@waves/signature-adapter";
import { Asset, Money } from '@waves/data-entities';
import { BigNumber } from '@waves/bignumber';
import { networkByteFromAddress } from "../lib/cryptoUtil";
import { ERRORS } from '../lib/KeeperError';
import { PERMISSIONS } from './PermissionsController';
import { calculateFeeFabric } from "./CalculateFeeController";
import { waves } from "./wavesTransactionsController";

// msg statuses: unapproved, signed, published, rejected, failed

export class MessageController extends EventEmitter {

    constructor(options = {}) {
        super();
        const defaults = {
            messages: []
        };

        this.messages = Object.assign({}, defaults, options.initState);
        this.store = new ObservableStore(this.messages);

        // Signing methods from WalletController
        this.signTx = options.signTx;
        this.signWaves = options.signWaves;
        this.auth = options.auth;
        this.signRequest = options.signRequest;
        this.signBytes = options.signBytes;

        // Broadcast and getMatcherPublicKey method from NetworkController
        this.broadcast = messages => options.networkController.broadcast(messages);
        this.getMatcherPublicKey = options.getMatcherPublicKey;

        this.getMessagesConfig = options.getMessagesConfig;
        this.getPackConfig = options.getPackConfig;

        // Get assetInfo method from AssetInfoController
        this.assetInfo = id => options.assetInfoController.assetInfo(id);
        this.assetInfoController = options.assetInfoController;
        //tx by txId
        this.txInfo = options.txInfo;

        // permissions
        this.setPermission = options.setPermission;
        this.canAutoApprove = options.canAutoApprove;

        this.getFee = calculateFeeFabric(options.assetInfoController, options.networkController);

        this.rejectAllByTime();
        this._updateBadge();
    }


    /**
     * Generates message with metadata. Add tx to pipeline
     * @param {object} data - message data
     * @param {string} origin - Domain, which has sent this data
     * @param {string} type - type of message(transaction, request, auth, bytes)
     * @param {object | undefined} account - Account, that should approve message. Can be undefined
     * @param {boolean} broadcast - Should this message be sent(node, matcher, somewhere else)
     * @returns {Promise<Object>} id - message id
     */
    async newMessage(messageData) {
        log.debug(`New message ${messageData.type}: ${JSON.stringify(messageData.data)}`);

        let message;
        try {
            message = await this._generateMessage(messageData);
        } catch (e) {
            throw ERRORS.REQUEST_ERROR(e.message);
        }


        let messages = this.store.getState().messages;

        while (messages.length > this.getMessagesConfig().max_messages) {
            const oldest = messages.filter(msg => Object.values(MSG_STATUSES).includes(msg.status))
                .sort((a, b) => a.timestamp - b.timestamp)[0];
            if (oldest) {
                this._deleteMessage(oldest.id)
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
                bytes: message.bytes,
                showNotification: false,
            };
        }

        const { bytes, ...toSave } = message;

        log.debug(`Generated message ${JSON.stringify(message)}`);

        messages.push(toSave);

        this._updateStore(messages);

        let showNotification = true;
        if (this.canAutoApprove(message.origin, message.data)) {
            showNotification = false;
            this.approve(message.id);
        }
        return { id: message.id, showNotification };
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
            message = this._getMessageById(id)
        } catch (e) {
            return Promise.reject(e)
        }

        switch (message.status) {
            case MSG_STATUSES.SIGNED:
            case MSG_STATUSES.PUBLISHED:
                return Promise.resolve(message.result);
            case MSG_STATUSES.REJECTED:
                return Promise.reject(ERRORS.USER_DENIED());
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
                                return reject(ERRORS.USER_DENIED());
                            case MSG_STATUSES.FAILED:
                                return reject(ERRORS.FAILED_MSG(finishedMessage.err.message));
                            default:
                                return reject(ERRORS.UNKNOWN());
                        }
                    })
                })
        }
    }

    getMessageById(id) {
        return this._getMessageById(id);
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
        if (!message.account) return Promise.reject('Message has empty account filed and no address is provided');

        return new Promise((resolve, reject) => {
            this._fillSignableData(message)
                .then(this._signMessage.bind(this))
                .then(this._broadcastMessage.bind(this))
                .then(this._processSuccessPath.bind(this))
                .catch(e => {
                    message.status = MSG_STATUSES.FAILED;
                    message.err = {
                        message: e.toString(),
                        stack: e.stack
                    };
                })
                .finally(() => {
                    this._updateMessage(message);
                    this.emit(`${message.id}:finished`, message);
                    message.status === MSG_STATUSES.FAILED ? reject(message.err.message) : resolve(message.result)
                })
        })
    }

    /**
     * Rejects message
     * @param {string} id - message id
     */
    reject(id) {
        const message = this._getMessageById(id);
        message.status = 'rejected';
        this._updateMessage(message);
        this.emit(`${message.id}:finished`, message);
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
            if ((time - timestamp) > message_expiration_ms && status === MSG_STATUSES.UNAPPROVED) {
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
            this._deleteMessage(ids)
        } else if (ids && ids.length > 0) {
            ids.forEach(id => this._deleteMessage(id))
        } else {
            this._updateStore([]);
        }
    }

    getUnapproved() {
        return this.messages.messages.filter(({ status }) => status === MSG_STATUSES.UNAPPROVED);
    }

    _updateMessagesByTimeout() {
        clearTimeout(this._updateTimer);
        const { update_messages_ms } = this.getMessagesConfig();
        this._updateTimer = setTimeout(() => this.rejectAllByTime(), update_messages_ms)
    }

    _updateMessage(message) {
        const messages = this.store.getState().messages;
        const id = message.id;
        const index = messages.findIndex(message => message.id === id);
        messages[index] = message;
        this._updateStore(messages);
    }

    _getMessageById(id) {
        const result = this.store.getState().messages.find(message => message.id === id);
        if (!result) throw new Error(`Failed to ge message with id ${id}`);
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
        this.emit('Update badge')
    }

    async _transformData(data) {
        if (!data || typeof data !== 'object' || data instanceof BigNumber || data instanceof Money) {
            return data;
        }

        if (Array.isArray(data)) {
            data = [...data];
        } else {
            data = { ...data };
        }

        for (const key in data) {
            if (!data.hasOwnProperty(key)) {
                continue;
            }

            // Validate fields containing assetId
            if (['assetId', 'amountAsset', 'amountAssetId', 'priceAsset', 'priceAssetId', 'feeAssetId', 'matcherFeeAssetId'].includes(key)) {
                await this.assetInfo(data[key]);
            }

            // Convert moneyLike fields
            const field = data[key];

            if (field && typeof field === 'object') {

                if (field.hasOwnProperty('tokens') && field.hasOwnProperty('assetId')) {
                    const asset = await this.assetInfo(data[key].assetId);
                    data[key] = Money.fromTokens(field.tokens, asset)
                } else if (field.hasOwnProperty('coins') && field.hasOwnProperty('assetId')) {
                    const asset = await this.assetInfo(data[key].assetId);
                    data[key] = Money.fromCoins(field.coins, asset)
                } else if (field.hasOwnProperty('amount') && field.hasOwnProperty('assetId') && Object.keys(field).length === 2) {
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
                message.data = await Promise.all(message.data.map(async data => await this._transformData(data)));
                return message;
            default:
                return message
        }

    }

    async _signMessage(message) {
        let signedData;
        switch (message.type) {
            case 'order':
            case 'cancelOrder':
            case 'transaction':
                signedData = await this.signTx(message.account.address, message.data, message.account.network);
                break;
            case 'transactionPackage':
                signedData = await Promise.all(message.data.map(txParams => {
                    return this.signTx(message.account.address, txParams, message.account.network);
                }));
                break;
            case 'auth':
                signedData = await this.auth(message.account.address, message.data, message.account.network);
                signedData = message.data.isRequest ? signedData.signature : signedData;
                break;
            case 'wavesAuth':
                signedData = await this.signWaves('signWavesAuth', message.data, message.account.address, message.account.network);
                break;
            case 'request':
                signedData = await this.signRequest(message.account.address, message.data, message.account.network);
                break;
            case 'customData':
                signedData = await this.signWaves('signCustomData', message.data, message.account.address, message.account.network);
                break;
            case 'bytes':
                signedData = await this.signBytes(message.account.address, message.data, message.account.network);
                break;
            case 'pairing':
                signedData = { ...signedData, approved: 'OK' };
                break;
            case 'authOrigin':
                signedData = { ...signedData, approved: 'OK' };
                this.setPermission(message.origin, PERMISSIONS.APPROVED);
                break;
            default:
                throw new Error(`Unknown message type ${message.type}`)
        }
        message.status = MSG_STATUSES.SIGNED;
        message.result = signedData;
        return message;
    }

    async _broadcastMessage(message) {
        if (!message.broadcast || ['transaction', 'order', 'cancelOrder'].indexOf(message.type) === -1) {
            return message;
        }

        const broadcastResp = await this.broadcast(message);
        message.status = MSG_STATUSES.PUBLISHED;
        message.result = broadcastResp;
        return message
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
        return message
    }

    /**
     * Calculates hash of message data. It is TX id for transactions. Also used for auth and requests. Throws if data is invalid
     * @param {object} data - data field from message
     * @param {object} account - waveskeeper account
     * @returns {Promise<{ id, bytes }>}
     */
    async _getMessageDataHash(data, account) {

        if (data && data.type === 'wavesAuth') {
            return  waves.parseWavesAuth(data);
        }

        if (data && data.type === 'customData') {
            return waves.parseCustomData(data);
        }

        let signableData = await this._transformData({ ...data.data });
        const Adapter = getAdapterByType('seed');
        const adapter = new Adapter('validation seed', networkByteFromAddress(account.address).charCodeAt(0));

        const signable = adapter.makeSignable({ ...data, data: signableData });

        const id = await signable.getId();
        const bytes = Array.from(await signable.getBytes());

        return { id, bytes };
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
        return await this._validateAndTransform(message)
    }

    async _validateAndTransform(message) {
        console.log('message', message)
        let result = { ...message };
        let messageMeta;
        if (message.data && message.data.successPath) {
            result.successPath = message.data.successPath
        }

        const hasFee = message.data.data && (message.data.data.fee || message.data.data.matcherFee);

        switch (message.type) {
            case 'wavesAuth':
                result.data = message.data;
                result.data.publicKey = message.data.publicKey = message.data.publicKey || message.account.publicKey;
                messageMeta = await this._getMessageDataHash(message, message.account);
                result.messageHash = messageMeta.id;
                break;
            case 'auth':
                try {
                    result.successPath = result.successPath ?
                        (new URL(result.successPath, message.data.referrer || 'https://' + message.origin)).href :
                        null;
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
                        host: message.data.host || (new URL('https://' + message.origin)).host,
                        name: message.data.name,
                        icon: message.data.icon
                    }
                };

                messageMeta = await this._getMessageDataHash(result.data, message.account);
                result.messageHash = messageMeta.id;
                result.bytes = Array.from(messageMeta.bytes);
                break;
            case 'transactionPackage':
                if (!Array.isArray(message.data)) throw new Error('Should contain array of txParams');
                const { max, allow_tx } = this.getPackConfig();
                const {} = this.getMessagesConfig();

                const msgs = message.data.length;

                if (!msgs || msgs > max) {
                    throw new Error(`Max transactions in pack is ${max}`);
                }

                const unavailableTx = message.data.filter(({ type }) => !allow_tx.includes(type));

                if (unavailableTx.length) {
                    throw new Error(`Tx type can be ${allow_tx.join(', ')}`);
                }

                const ids = [];
                const bytes = [];

                const dataPromises = message.data.map(async txParams => {
                    const hasFee = !!txParams.data.fee;
                    const data = this._prepareTx(txParams.data, message.account);
                    let readyData = { ...txParams, data };
                    const feeData = !hasFee ? await this._getFee(message, readyData) : {};
                    readyData = { ...readyData, data: { ...data, ...feeData } };
                    messageMeta = await this._getMessageDataHash( readyData, message.account);
                    ids.push(messageMeta.id);
                    bytes.push(messageMeta.bytes);
                    readyData.id = messageMeta.id;
                    return readyData;
                });
                result.data = await Promise.all(dataPromises);
                result.messageHash = ids;
                result.bytes = bytes;
                break;
            case 'order':
                result.data.data = await this._prepareOrder(result.data.data, message.account);
                const matcherFeeData = !hasFee ? await this._getFee(message, result.data) : {};
                result.data.data = { ...result.data.data, ...matcherFeeData };
                messageMeta = await this._getMessageDataHash(result.data, message.account);
                result.messageHash = messageMeta.id;
                result.bytes = Array.from(messageMeta.bytes);
                break;
            case 'transaction':
                if (!result.data.type || result.data.type >= 1000) {
                    throw ERRORS.REQUEST_ERROR(result.data);
                }

                result.data.data = this._prepareTx(result.data.data, message.account);
                const feeData = !hasFee ? await this._getFee(message, result.data) : {};
                result.data.data = { ...result.data.data, ...feeData };
                messageMeta = await this._getMessageDataHash(result.data, message.account);
                result.messageHash = messageMeta.id;
                result.bytes = Array.from(messageMeta.bytes);

                switch (result.data.type) {
                    case 9:
                        result.lease = await this.txInfo(result.data.data.leaseId);
                        break;
                }
                break;
            case 'cancelOrder':
                result.amountAsset = message.data.amountAsset;
                result.priceAsset = message.data.priceAsset;
            case 'request':
                const requestDefaults = {
                    timestamp: Date.now(),
                    senderPublicKey: message.account.publicKey
                };
                result.data.data = { ...requestDefaults, ...result.data.data };
                messageMeta = await this._getMessageDataHash(result.data, message.account);
                result.messageHash = messageMeta.id;
                result.bytes = Array.from(messageMeta.bytes);
                break;
            case 'bytes':
            case 'authOrigin':
                break;
            case 'customData':
                result.data.publicKey = message.data.publicKey = message.data.publicKey || message.account.publicKey;
                messageMeta = await this._getMessageDataHash(result, message.account);
                result.messageHash = messageMeta.id;
                break;
            case 'pairing':
                if (!(typeof message.data.address === 'string' && typeof message.data.encryptedSeed === 'string'))
                    throw new Error('Address and encryptedSeed are required for pairing');
                break;
            default:
                throw new Error(`Incorrect type "${type}"`)
        }

        return result
    }

    async _getFee(message, signData) {
        let signableData = await this._transformData({ ...signData });
        const Adapter = getAdapterByType('seed');
        const adapter = new Adapter('validation seed', networkByteFromAddress(message.account.address).charCodeAt(0));
        const fee = { coins: (await this.getFee(adapter, signableData)).toString(), assetId: 'WAVES' };
        return {
            fee,
            matcherFee: fee,
        }
    }

    _prepareTx(txParams, account) {
        const defaultFee = Money.fromCoins(0, new Asset(this.assetInfoController.getWavesAsset())).toJSON();

        const txDefaults = {
            timestamp: Date.now(),
            senderPublicKey: account.publicKey,
            chainId: networkByteFromAddress(account.address).charCodeAt(0),
            fee: defaultFee,
            matcherFee: defaultFee,
        };
        return { ...txDefaults, ...txParams }
    }

    async _prepareOrder(orderParams, account) {
        const defaultFee = Money.fromCoins(0, new Asset(this.assetInfoController.getWavesAsset()));

        const orderDefaults = {
            timestamp: Date.now(),
            senderPublicKey: account.publicKey,
            chainId: networkByteFromAddress(account.address).charCodeAt(0),
            matcherPublicKey: await this.getMatcherPublicKey(),
            matcherFee: defaultFee,

        };
        return { ...orderDefaults, ...orderParams }
    }
}

