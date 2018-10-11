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

        // Signing method from WalletController
        this.signWavesTx = options.sign;

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

        const txId = await this.validateAndBuildTxId(tx, from);
        let meta = this._generateMetadata(origin, from, broadcast);
        meta.tx = tx;
        meta.txHash = txId;
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

    approve(id, address) {
        const message = this._getMessageById(id);
        if (address) {
            message.account = address
        }
        return new Promise((resolve, reject) => {
            if (address) {
                message.account = address
            }
            if (!message.account) reject('Orphaned tx. No account public key');

            this._convertMoneyLikeFieldsToMoney(message.tx.data)
                .then(txDataWithMoney => this.signWavesTx(message.account, Object.assign({}, message.tx, {data: txDataWithMoney})))
                .then(signedTxData => {
                    message.status = 'signed';
                    message.tx = signedTxData
                })
                .then(()=>{
                    if (message.broadcast){
                        return this.broadcast(message.tx)
                    }else throw new Error('BRAKE')
                })
                .then(broadCastedTx => {
                    message.tx = broadCastedTx;
                    message.status = 'published'
                })
                .then(()=>{
                    if (message.successPath){
                        const url = new URL(message.successPath);
                        url.searchParams.append('txId', message.txHash);
                        extension.tabs.create({
                            url: url.href
                        })
                    }
                    throw new Error('BRAKE')
                })
                .catch(e=>{
                    if(e.message !== 'BRAKE'){
                        message.status = 'failed';
                        message.err = {
                            message: e.toString(),
                            stack: e.stack
                        };
                    }
                    this._updateMessage(message);
                    this.emit(`${message.id}:finished`, message);
                    message.status === 'failed' ? reject(message.err.message) : resolve(message.tx)
                });
        })

        // checkAddress().then(makeSignableData).then(sign).then(publish).then(openPaymentApiLink).then(processFinish).catch(error)
        // try {
        //     if (!message.account) throw new Error('Orphaned tx. No account public key');
        //     const txDataWithMoney = await this._convertMoneyLikeFieldsToMoney(message.tx.data);
        //     message.tx = await this.signWavesTx(message.account, Object.assign({}, message.tx, {data: txDataWithMoney}));
        //     message.status = 'signed';
        //     if (message.broadcast) {
        //         message.tx = await this.broadcast(message.tx);
        //         message.status = 'published'
        //     }
        // } catch (e) {
        //     message.err = {
        //         message: e.toString(),
        //         stack: e.stack
        //     };
        //     message.status = 'failed'
        // }
        // this._updateMessage(message);
        //
        // this.emit(`${message.id}:finished`, message);
        // if (message.status === 'signed' || message.status === 'published') {
        //     return message.tx
        // } else if (message.status === 'failed') {
        //     throw message.err
        // } else {
        //     throw new Error('Unknown error')
        // }
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

    // _setStatus(id, status) {
    //     let messages = this.store.getState().messages;
    //     const index = messages.findIndex(message => message.id === id);
    //     messages[index].status = status;
    //     this.store.updateState({messages})
    // }

    _updateMessage(message) {
        const messages = this.store.getState().messages;
        const id = message.id;
        const index = messages.findIndex(message => message.id === id);
        messages[index] = message;
        this._updateStore(messages);
    }

    _getMessageById(id) {
        return this.store.getState().messages.find(message => message.id === id);
    }

    _generateMetadata(origin, from, broadcast) {
        return {
            account: from,
            broadcast,
            id: uuid(),
            origin,
            status: 'unapproved',
            time: Date.now()

        }
    }

    _updateStore(messages) {
        this.store.updateState({messages});
        this._updateBage(messages);
    }

    _updateBage(messages) {
        const unapproved = messages.filter(({ status }) => status === 'unapproved').length;
        const text = unapproved ? unapproved.toString() : '';
        extension.browserAction.setBadgeText({ text });
        extension.browserAction.setBadgeBackgroundColor({ color: '#768FFF' });
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

    async validateAndBuildTxId(tx, from) {
        // Correct transaction check
        let data = await this._convertMoneyLikeFieldsToMoney(tx.data);
        const Adapter = getAdapterByType('seed')
        Adapter.initOptions({networkCode: networkByteFromAddress(from)});
        const adapter = new Adapter('validation seed');
        const signable = adapter.makeSignable({...tx, data});
        return await signable.getId();
    }
}
