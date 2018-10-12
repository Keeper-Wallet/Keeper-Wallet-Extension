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

        return new Promise((resolve, reject) => {
            this._fillSignableData(message)
                .then(this._signMessage.bind(this))
                .then(this._broadcastMessage.bind(this))
                .then(this._processSuccessPath.bind(this))
                .catch(e => {
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

    async _fillSignableData(message) {
        switch (message.type) {
            case 'transaction':
                let result = {...message.data.data}
                for (let key in message.data.data) {
                    const field = message.data.data[key];
                    if (field.hasOwnProperty('tokens') && field.hasOwnProperty('assetId')) {
                        const asset = await this.assetInfo(message.data.data[key].assetId);
                        let amount = new BigNumber(field.tokens).multipliedBy(10 ** asset.precision).toString();
                        result[key] = new Money(amount, asset)
                    }
                }
                message.data.data = result;
                return message;
            default:
                return message
        }

    }

    async _signMessage(message) {
        let signedData = message.data;
        switch (message.type) {
            case 'transaction':
                signedData = await this.signTx(message.account.address, message.data);
                break;
            case 'auth':
                signedData = await this.auth(message.account.address, message.data);
                break;
            case 'request':
                signedData = await this.signRequest(message.account.address, message.data);
                break;
            default:
                throw new Error(`Unknown message type ${message.type}`)
        }
        message.status = 'signed';
        message.data = signedData;
        return message;
    }

    async _broadcastMessage(message) {
        if (!message.broadcast || message.type !== 'transaction') return message;

        const broadcastResp = await this.broadcast(message.data);
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
                    extension.tabs.create({
                        url: url.href
                    });
                    break;
                case 'auth':
                    //url.searchParams.append('d', message.data.data);
                    url.searchParams.append('p', message.data.publicKey);
                    url.searchParams.append('s', message.data.signature);
                    url.searchParams.append('a', message.data.address);
                    extension.tabs.create({
                        url: url.href
                    });
                    break;
            }
        }
        return message
    }

    /**
     * Generates message hash. Throws message is invalid
     * @param {object} message - Message to approve
     * @returns {Promise<string>}
     */
    async _getMessageHash(message) {
        let signableMessage = await this._fillSignableData(message);
        const Adapter = getAdapterByType('seed');
        Adapter.initOptions({networkCode: networkByteFromAddress(message.account)});
        const adapter = new Adapter('validation seed');
        const signable = adapter.makeSignable(signableMessage.data);
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
                    result.successPath =  message.data.successPath
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

