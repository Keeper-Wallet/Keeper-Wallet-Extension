import ObservableStore from 'obs-store';
import { MSG_STATUSES } from '../constants';
import uuid from 'uuid/v4';
import log from 'loglevel';
import EventEmitter from 'events'
import { getAdapterByType } from "@waves/signature-adapter";
import { BigNumber, Money } from '@waves/data-entities';
import { networkByteFromAddress } from "../lib/cryptoUtil";
import { ERRORS } from '../lib/KeeperError';

// msg statuses: unapproved, signed, published, rejected, failed

export class MessageController extends EventEmitter {

    constructor(options = {}) {
        super();
        const defaults = {
            messages: []
        };
        this.store = new ObservableStore(Object.assign({}, defaults, options.initState));

        // Signing methods from WalletController
        this.signTx = options.signTx;
        this.auth = options.auth;
        this.signRequest = options.signRequest;
        this.signBytes = options.signBytes;

        // Broadcast and getMatcherPublicKey method from NetworkController
        this.broadcast = options.broadcast;
        this.getMatcherPublicKey = options.getMatcherPublicKey;

        this.getMessagesConfig = options.getMessagesConfig;
        this.getPackConfig = options.getPackConfig;

        // Get assetInfo method from AssetInfoController
        this.assetInfo = options.assetInfo;
        this.txInfo = options.txInfo;
        this.setPermission = options.setPermission;
        this.rejectAllByTime();
        this._updateBage(this.store.getState().messages);
    }


    /**
     * Generates message with metadata. Add tx to pipeline
     * @param {object} data - message data
     * @param {string} origin - Domain, which has sent this data
     * @param {string} type - type of message(transaction, request, auth, bytes)
     * @param {object | undefined} account - Account, that should approve message. Can be undefined
     * @param {boolean} broadcast - Should this message be sent(node, matcher, somewhere else)
     * @returns {Promise<string>} id - message id
     */
    async newMessage(data, type, origin, account, broadcast = false, title = '') {
        log.debug(`New message ${type}: ${JSON.stringify(data)}`);

        let message;
        try {
            message = await this._generateMessage(data, type, origin, account, broadcast, title);
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
        log.debug(`Generated message ${JSON.stringify(message)}`);
        messages.push(message);
        this._updateStore(messages);
        return message.id
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
                return Promise.reject(ERRORS.FILED_MSG(message.err.message));
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
                                return reject(ERRORS.FILED_MSG(finishedMessage.err.message));
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
        this._updateBage(this.store.getState().messages);
    }

    rejectByOrigin(byOrigin) {
        const {messages} = this.store.getState();
        messages.forEach(({id, origin}) => {
            if (byOrigin === origin) {
                this.reject(id);
            }
        });
    }

    rejectAllByTime() {
        const { message_expiration_ms } = this.getMessagesConfig();
        const time = Date.now();
        const {messages} = this.store.getState();
        messages.forEach(({id, timestamp, status}) => {
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
        const {messages} = this.store.getState();
        const index = messages.findIndex(message => message.id === id);
        if (index > -1) {
            messages.splice(index, 1);
            this._updateStore(messages);
        }
    }

    _updateStore(messages) {
        this.store.updateState({messages});
        this._updateBage(messages);
    }

    _updateBage(messages) {
        const unapproved = messages.filter(({status}) => status === MSG_STATUSES.UNAPPROVED).length;
        const text = unapproved ? unapproved.toString() : '';
        this.emit('Update badge', text)
    }

    async _transformData(data) {

        if (!data || typeof data !== 'object' || data instanceof BigNumber || data instanceof Money) {
            return data;
        }

        if (Array.isArray(data)) {
            data = [...data];
        } else {
            data = {...data};
        }

        for (const key in data) {
            if (!data.hasOwnProperty(key)) {
                continue;
            }

            // Validate fields containing assetId
            if (['assetId', 'amountAsset', 'priceAsset'].includes(key)) {
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
                } else if (Array.isArray(field)) {
                    data[key] = await Promise.all(data[key].map((item) => this._transformData(item)));
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
                message.data.data = await this._transformData({...message.data.data});
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
                signedData = await this.signTx(message.account.address, message.data);
                break;
            case 'transactionPackage':
                signedData = await Promise.all(message.data.map(txParams => {
                    return this.signTx(message.account.address, txParams)
                }));
                break;
            case 'auth':
                signedData = await this.auth(message.account.address, message.data);
                break;
            case 'request':
                signedData = await this.signRequest(message.account.address, message.data);
                break;
            case 'bytes':
                signedData = await this.signBytes(message.account.address, message.data);
                break;
            case 'pairing':
                signedData = {...signedData, approved: 'OK'};
                break;
            case 'authOrigin':
                signedData = {...signedData, approved: 'OK'};
                this.setPermission(signedData.origin, signedData.permission);
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
     * @returns {Promise<string>}
     */
    async _getMessageDataHash(data, account) {
        let signableData = await this._transformData({...data.data});
        const Adapter = getAdapterByType('seed');
        Adapter.initOptions({networkCode: networkByteFromAddress(account.address).charCodeAt(0)});
        const adapter = new Adapter('validation seed');
        const signable = adapter.makeSignable({...data, data: signableData});
        return await signable.getId();
    }

    async _generateMessage(data, type, origin, account, broadcast, title) {
        const message = {
            account,
            broadcast,
            id: uuid(),
            ext_uuid: data && data.uid,
            origin,
            data,
            status: MSG_STATUSES.UNAPPROVED,
            timestamp: Date.now(),
            type,
            title,
        };
        return await this._validateAndTransform(message)
    }

    async _validateAndTransform(message) {
        let result = {...message};

        if (message.data && message.data.successPath) {
            result.successPath = message.data.successPath
        }

        switch (message.type) {
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
                    data: {
                        data: message.data.data,
                        prefix: 'WavesWalletAuthentication',
                        host: (new URL(message.data.referrer || 'https://' + message.origin)).host,
                        name: message.data.name,
                        icon: message.data.icon
                    }
                };
                result.messageHash = await this._getMessageDataHash(result.data, message.account);
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

                result.data = message.data.map(txParams => {
                    const data = this._prepareTx(txParams.data, message.account);
                    return {...txParams, data}
                });
                const validationPromises = result.data.map(data => this._getMessageDataHash(data, message.account));
                result.messageHash = await Promise.all(validationPromises);
                break;
            case 'order':
                result.data.data = await this._prepareOrder(result.data.data, message.account);
                result.messageHash = await this._getMessageDataHash(result.data, message.account);
                break;
            case 'transaction':
                if (!result.data.type) {
                    throw ERRORS.REQUEST_ERROR(result.data);
                }

                result.data.data = this._prepareTx(result.data.data, message.account);
                result.messageHash = await this._getMessageDataHash(result.data, message.account);
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
                result.data.data = {...requestDefaults, ...result.data.data};
                result.messageHash = await this._getMessageDataHash(result.data, message.account);
                break;
            case 'bytes':
            case 'authOrigin':
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

    _prepareTx(txParams, account) {
        const txDefaults = {
            timestamp: Date.now(),
            senderPublicKey: account.publicKey,
            chainId: networkByteFromAddress(account.address).charCodeAt(0)
        };
        return {...txDefaults, ...txParams}
    }

    async _prepareOrder(orderParams, account) {
        const orderDefaults = {
            timestamp: Date.now(),
            senderPublicKey: account.publicKey,
            chainId: networkByteFromAddress(account.address).charCodeAt(0),
            matcherPublicKey: await this.getMatcherPublicKey()

        };
        return {...orderDefaults, ...orderParams}
    }
}

