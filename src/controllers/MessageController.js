import ObservableStore from 'obs-store';
import uuid from 'uuid/v4';
import log from 'loglevel';
import EventEmitter from 'events'
import extension from 'extensionizer';
import {getAdapterByType} from "@waves/signature-adapter";
import {BigNumber, Money} from '@waves/data-entities';
import {networkByteFromAddress} from "../lib/cryptoUtil";

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

        // Broadcast method from NetworkController
        this.broadcast = options.broadcast;

        // Get assetInfo method from AssetInfoController
        this.assetInfo = options.assetInfo;

        this._updateBage(this.store.getState().messages);
    }

    /**
     * Generates metadata for tx. Add tx to pipeline
     * @param {tx} tx - Transaction to approve
     * @param {string} origin - Domain, which has sent this tx
     * @param {string | undefined} from - Address of the account, that should approve tx. Can be undefined
     * @param {boolean} broadcast - Should this tx be sent to node
     * @returns {Promise<tx>}
     */
    async newTx(tx, origin, from, broadcast = false) {
        log.debug(`New tx ${JSON.stringify(tx)}`);

        const messageHash = await this._validateAndBuildTxId(tx, from);
        let meta = this._generateMetadata(origin, from, 'transaction', broadcast);
        meta.tx = tx;
        meta.messageHash = messageHash;
        meta.successPath = tx.successPath

        let messages = this.store.getState().messages;
        messages.push(meta);
        this._updateStore(messages);
        return await new Promise((resolve, reject) => {
            this.once(`${meta.id}:finished`, finishedMeta => {
                switch (finishedMeta.status) {
                    case 'signed':
                    case 'published':
                        return resolve(finishedMeta.tx);
                    case 'rejected':
                        return reject(new Error('User denied message'));
                    case 'failed':
                        return reject(new Error(finishedMeta.err.message));
                    default:
                        return reject(new Error('Unknown error'))
                }
            })
        })
    }

    /**
     * Generates metadata for authMsg. Add authMsg to pipeline
     * @param {authData} authData - authMsg to approve
     * @param {string} origin - Domain, which has sent this authMsg
     * @param {string | undefined} from - Address of the account, that should approve authMsg. Can be undefined
     * @returns {Promise<authData>}
     */
    async newAuthMsg(authData, origin, from) {
        log.debug(`New authMessage ${JSON.stringify(authData)}`);

        const messageHash = await this._validateAndBuildTxId(authData, from);
        let meta = this._generateMetadata(origin, from, 'auth');
        meta.authData = authData;
        meta.messageHash = messageHash;
        meta.successPath = authData.successPath;

        let messages = this.store.getState().messages;
        messages.push(meta);
        this._updateStore(messages);
        return await new Promise((resolve, reject) => {
            this.once(`${meta.id}:finished`, finishedMeta => {
                switch (finishedMeta.status) {
                    case 'signed':
                        return resolve(finishedMeta.authData);
                    case 'rejected':
                        return reject(new Error('User denied message'));
                    case 'failed':
                        return reject(new Error(finishedMeta.err.message));
                    default:
                        return reject(new Error('Unknown error'))
                }
            })
        })
    }

    /**
     * Generates metadata for request. Add signRequest to pipeline
     * @param {signRequest} request - signRequest to approve
     * @param {string} origin - Domain, which has sent this signRequest
     * @param {string | undefined} from - Address of the account, that should approve request. Can be undefined
     * @returns {Promise<string>}
     */
    newRequest(request, origin, from) {
        log.debug(`New authMessage ${JSON.stringify(request)}`);
        let meta = this._generateMetadata(origin, from, 'request');
        meta.request = request;

        let messages = this.store.getState().messages;
        messages.push(meta);
        this._updateStore(messages);
        return new Promise((resolve, reject) => {
            this.once(`${meta.id}:finished`, finishedMeta => {
                switch (finishedMeta.status) {
                    case 'signed':
                        return resolve(finishedMeta.request);
                    case 'rejected':
                        return reject(new Error('User denied message'));
                    case 'failed':
                        return reject(new Error(finishedMeta.err.message));
                    default:
                        return reject(new Error('Unknown error'))
                }
            })
        })
    }

    /**
     * Generates message with metadata. Add tx to pipeline
     * @param {data} data - message data
     * @param {string} origin - Domain, which has sent this data
     * @param {string} type - type of message(transaction, request, auth, bytes)
     * @param {object | undefined} account - Account, that should approve message. Can be undefined
     * @param {boolean} broadcast - Should this message be sent(node, matcher, somewhere else)
     * @returns {Promise<object>}
     */
    async newMessage(data, type, origin, account, broadcast = false) {
        log.debug(`New message ${type}: ${JSON.stringify(data)}`);

        const message = await this._generateMessage(data, type, origin, account, broadcast);

        let messages = this.store.getState().messages;
        log.debug(`Generated message ${JSON.stringify(message)}`);
        messages.push(message);
        this._updateStore(messages);
        return await new Promise((resolve, reject) => {
            this.once(`${message.id}:finished`, finishedMessage => {
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

    approve(id, address) {
        const message = this._getMessageById(id);
        message.account = address || message.account;
        if (!message.account) return Promise.reject('Message has empty account filed and no address is provided');

        switch (message.type) {
            case 'transaction':
                return this._approveTx(message);
            case 'auth':
                return this._approveAuth(message);
            case 'request':
                return this._approveRequest(message);
            default:
                Promise.reject('Unknown message type')
        }
    }

    reject(id) {
        const message = this._getMessageById(id);
        message.status = 'rejected';
        this._updateMessage(message);
        this.emit(`${message.id}:finished`, message)
    }

    // for debug purposes
    clearMessages() {
        this._updateStore([]);
    }


    _approveTx(message) {
        return new Promise((resolve, reject) => {
            this._convertMoneyLikeFieldsToMoney(message.data.data)
                .then(txDataWithMoney => this.signTx(message.account.address, Object.assign({}, message.data, {data: txDataWithMoney})))
                .then(signedTxData => {
                    message.status = 'signed';
                    message.data = signedTxData;
                    if (message.broadcast) {
                        return this.broadcast(message.data)
                    } else throw new Error('BRAKE')
                })
                .then(broadCastedTx => {
                    message.data = broadCastedTx;
                    message.status = 'published';
                    if (message.successPath) {
                        const url = new URL(message.successPath);
                        url.searchParams.append('txId', message.messageHash);
                        extension.tabs.create({
                            url: url.href
                        })
                    }
                })
                .catch(e => {
                    if (e.message !== 'BRAKE') {
                        message.status = 'failed';
                        message.err = {
                            message: e.toString(),
                            stack: e.stack
                        };
                    }
                })
                .finally(() => {
                    this._updateMessage(message);
                    this.emit(`${message.id}:finished`, message);
                    message.status === 'failed' ? reject(message.err.message) : resolve(message.data)
                });
        })
    }

    _approveAuth(message) {
        return new Promise((resolve, reject) => {
            this.auth(message.account.address, message.data)
                .then(signedAuthData => {
                    message.data = signedAuthData;
                    message.status = 'signed';
                    if (message.successPath) {
                        const url = new URL(message.successPath);
                        url.searchParams.append('d', signedAuthData.data);
                        url.searchParams.append('p', signedAuthData.publicKey);
                        url.searchParams.append('s', signedAuthData.signature);
                        url.searchParams.append('a', signedAuthData.address);
                        extension.tabs.create({
                            url: url.href
                        })
                    }
                }).catch(e => {
                if (e.message !== 'BRAKE') {
                    message.status = 'failed';
                    message.err = {
                        message: e.toString(),
                        stack: e.stack
                    };
                }
            }).finally(() => {
                this._updateMessage(message);
                this.emit(`${message.id}:finished`, message);
                message.status === 'failed' ? reject(message.err.message) : resolve(message.data)
            });
        })
    }

    _approveRequest(message) {
        return new Promise((resolve, reject) => {
            this.signRequest(message.account.address, message.data)
                .then(signedRequest => {
                    message.request = signedRequest;
                    message.status = 'signed';
                }).catch(e => {
                if (e.message !== 'BRAKE') {
                    message.status = 'failed';
                    message.err = {
                        message: e.toString(),
                        stack: e.stack
                    };
                }
            }).finally(() => {
                this._updateMessage(message);
                this.emit(`${message.id}:finished`, message);
                message.status === 'failed' ? reject(message.err.message) : resolve(message.request)
            });
        })
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

    _generateMetadata(origin, from, type, broadcast) {
        return {
            account: from,
            broadcast,
            id: uuid(),
            origin,
            status: 'unapproved',
            time: Date.now(),
            type
        }
    }

    _updateStore(messages) {
        this.store.updateState({messages});
        this._updateBage(messages);
    }

    _updateBage(messages) {
        const unapproved = messages.filter(({status}) => status === 'unapproved').length;
        const text = unapproved ? unapproved.toString() : '';
        extension.browserAction.setBadgeText({text});
        extension.browserAction.setBadgeBackgroundColor({color: '#768FFF'});
    }

    async _convertMoneyLikeFieldsToMoney(txData) {
        let result = Object.assign({}, txData);
        for (let key in txData) {
            const field = txData[key];
            if (field.hasOwnProperty('tokens') && field.hasOwnProperty('assetId')) {
                const asset = await this.assetInfo(txData[key].assetId);
                let amount = new BigNumber(field.tokens).multipliedBy(10 ** asset.precision).toString();
                result[key] = new Money(amount, asset)
            }
        }
        return result
    }

    /**
     * Generates transaction ID. Throws if tx is invalid
     * @param {tx} tx - Transaction to approve
     * @param {string} from - Address of the account, that should approve tx
     * @returns {Promise<string>}
     */
    async _validateAndBuildTxId(tx, from) {
        // Correct transaction check
        let data = await this._convertMoneyLikeFieldsToMoney(tx.data);
        const Adapter = getAdapterByType('seed')
        Adapter.initOptions({networkCode: networkByteFromAddress(from)});
        const adapter = new Adapter('validation seed');
        const signable = adapter.makeSignable({...tx, data});
        return await signable.getId();
    }

    /**
     * Generates message hash. Throws message is invalid
     * @param {object} message - Message to approve
     * @returns {Promise<string>}
     */
    async _getMessageHash(message) {
        let signableData = await this._convertMoneyLikeFieldsToMoney(message.data.data);
        const Adapter = getAdapterByType('seed')
        Adapter.initOptions({networkCode: networkByteFromAddress(message.account)});
        const adapter = new Adapter('validation seed');
        const signable = adapter.makeSignable({data: signableData, type: message.data.type});
        return await signable.getId();
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
                        host: message.data.referrer || message.origin
                    }
                };
                result.messageHash = await this._getMessageHash(result);
                if (message.data.successPath) {
                    result.successPath = new URL(message.data.successPath, 'https://' + message.origin).href
                }
                break;
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
            case 'request':
                result.messageHash = await this._getMessageHash(result);
                break;
            case 'bytes':
                break;
            default:
                throw new Error(`Incorrect type "${type}"`)
        }
        return result
    }

    async _generateMessage(data, type, origin, account, broadcast) {
        const message = {
            account,
            broadcast,
            id: uuid(),
            origin,
            data,
            status: 'unapproved',
            time: Date.now(),
            type
        };
        return await this._validateAndTransform(message)
    }
}

