import ObservableStore from 'obs-store';
import uuid from 'uuid/v4';
import log from 'loglevel';
import EventEmitter from 'events'
import {getAdapterByType} from "@waves/signature-adapter";
import {BigNumber, Money} from '@waves/data-entities';
import {networkByteFromAddress} from "../lib/cryptoUtil";

// msg statuses: unapproved, signed, published, rejected, failed

export class MessageController extends EventEmitter {
    MAX_MESSAGES = 100;

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

        // Get assetInfo method from AssetInfoController
        this.assetInfo = options.assetInfo;

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
    async newMessage(data, type, origin, account, broadcast = false) {
        log.debug(`New message ${type}: ${JSON.stringify(data)}`);

        const message = await this._generateMessage(data, type, origin, account, broadcast);

        let messages = this.store.getState().messages;

        while (messages.length > this.MAX_MESSAGES) {
            const oldest = messages.filter(msg => ['published', 'signed', 'failed', 'rejected'].indexOf(msg.status) > -1)
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
        return new Promise((resolve, reject) => {
            this.once(`${id}:finished`, finishedMessage => {
                switch (finishedMessage.status) {
                    case 'signed':
                    case 'published':
                        return resolve(finishedMessage.data);
                    case 'rejected':
                        return reject(new Error('User denied message'));
                    case 'failed':
                        return reject(new Error(finishedMessage.err.message));
                    default:
                        return reject(new Error('Unknown error'))
                }
            })
        })
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
                    log.error(e)
                    message.status = 'failed';
                    message.err = {
                        message: e.toString(),
                        stack: e.stack
                    };
                })
                .finally(() => {
                    this._updateMessage(message);
                    this.emit(`${message.id}:finished`, message);
                    message.status === 'failed' ? reject(message.err.message) : resolve(message.data)
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
        this.emit(`${message.id}:finished`, message)
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
        const {messages} = this.store.getState()
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
        const unapproved = messages.filter(({status}) => status === 'unapproved').length;
        const text = unapproved ? unapproved.toString() : '';
        this.emit('Update badge', text)
    }

    async _transformData(data) {

        if (!data || typeof data !== 'object' || data instanceof BigNumber || data instanceof Money) {
            return data;
        }

        if (Array.isArray(data)) {
            data = [ ...data ];
        } else {
            data = { ...data };
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
            default:
                return message
        }

    }

    async _signMessage(message) {
        let signedData = message.data;
        switch (message.type) {
            case 'order':
            case 'cancelOrder':
            case 'transaction':
                signedData = await this.signTx(message.account.address, message.data);
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
                break;
            default:
                throw new Error(`Unknown message type ${message.type}`)
        }
        message.status = 'signed';
        message.data = signedData;
        return message;
    }

    async _broadcastMessage(message) {
        if (!message.broadcast || ['transaction', 'order', 'cancelOrder'].indexOf(message.type) === -1) {
            return message;
        }

        const broadcastResp = await this.broadcast(message);
        message.status = 'published';
        message.data = broadcastResp;
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
                    url.searchParams.append('p', message.data.publicKey);
                    url.searchParams.append('s', message.data.signature);
                    url.searchParams.append('a', message.data.address);
                    this.emit('Open new tab', url.href);
                    break;
            }
        }
        return message
    }

    /**
     * Generates message hash. Throws if data is invalid
     * @param {object} message - Message to approve
     * @returns {Promise<string>}
     */
    async _getMessageHash(message) {
        let signableData = await this._transformData({...message.data.data});
        const Adapter = getAdapterByType('seed');
        Adapter.initOptions({networkCode: networkByteFromAddress(message.account.address).charCodeAt(0)});
        const adapter = new Adapter('validation seed');
        const signable = adapter.makeSignable({...message.data, data: signableData});
        return await signable.getId();
    }

    async _generateMessage(data, type, origin, account, broadcast) {
        const message = {
            account,
            broadcast,
            id: uuid(),
            origin,
            data,
            status: 'unapproved',
            timestamp: Date.now(),
            type
        };
        return await this._validateAndTransform(message)
    }

    async _validateAndTransform(message) {
        let result = {...message};
        switch (message.type) {
            case 'auth':
                result.data = {
                    type: 1000,
                    data: {
                        data: message.data.data,
                        prefix: 'WavesWalletAuthentication',
                        host: (new URL(message.data.referrer || 'https://' + message.origin)).host,
                        name: message.data.name,
                        icon: message.data.icon
                    }
                };
                result.messageHash = await this._getMessageHash(result);
                if (message.data.successPath) {
                    result.successPath = message.data.successPath
                }
                break;
            case 'order':
                if (message.data.matcherPublicKey == null) {
                    result.data.matcherPublicKey = await this.getMatcherPublicKey()
                }
            case 'transaction':
                const txDefaults = {
                    timestamp: Date.now(),
                    senderPublicKey: message.account.publicKey
                };
                result.data.data = {...txDefaults, ...result.data.data};
                result.messageHash = await this._getMessageHash(result);
                if (message.data.successPath) {
                    result.successPath = message.data.successPath
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
                result.messageHash = await this._getMessageHash(result);
                break;
            case 'bytes':
                break;
            case 'pairing':
                break
            default:
                throw new Error(`Incorrect type "${type}"`)
        }
        return result
    }
}

