import ObservableStore from 'obs-store';
import uuid from 'uuid/v4';
import log from 'loglevel';
import EventEmitter from 'events'
import {Money, BigNumber} from '@waves/data-entities';
import {moneylikeToMoney} from '../lib/moneyUtil';

// msg statuses: unapproved, signed, published, rejected, failed

export class MessageController extends EventEmitter {
    constructor(options = {}) {
        super();
        const defaults = {
            messages: []
        };
        this.store = new ObservableStore(Object.assign({}, defaults, options.initState));

        // Signing method from WalletController
        this.signWavesTx = options.sign

        // Broadcast method from NetworkController
        this.broadcast = options.broadcast

        // Get assetInfo methid from AssetInfoController
        this.assetInfo = options.assetInfo
    }

    /**
     * Generates metadata for tx. Add tx to pipeline
     * @param {tx} tx - Transaction to sign
     * @param {string} origin - Domain, which has sent this tx
     * @param {string | undefined} from - Address of the account, that should sign tx. Can be undefined
     * @param {boolean} broadcast - Should this tx be sent to node
     * @returns {Promise<tx>}
     */
    newTx(tx, origin, from, broadcast = false) {
        log.debug(`New tx ${JSON.stringify(tx)}`);
        let meta = this._generateMetadata(origin, from, broadcast);
        meta.tx = tx;
        let messages = this.store.getState().messages;
        messages.push(meta);
        this.store.updateState({messages});
        return new Promise((resolve, reject) => {
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

    async sign(id, address) {
        const message = this._getMessageById(id);
        if (address) {
            message.account = address
        }
        try {
            if (!message.account) throw new Error('Orphaned tx. No account public key');
            const txDataWithMoney = await this._convertMoneylikeFieldsToMoney(message.tx.data);
            message.tx = await this.signWavesTx(message.account, Object.assign({}, message.tx, {data: txDataWithMoney}));
            message.status = 'signed';
            if (message.broadcast) {
                await this.broadcast(message.tx);
                message.status = 'published'
            }
        } catch (e) {
            message.err = e;
            message.status = 'failed'
        }
        this._updateMessage(message);

        this.emit(`${message.id}:finished`, message);
        if (message.status === 'signed' || message.status === 'published') {
            return message.tx
        } else if (message.status === 'failed') {
            throw message.err
        } else {
            throw new Error('Unknown error')
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
        this.store.updateState({messages: []})
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
        this.store.updateState({messages});
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

    async _convertMoneylikeFieldsToMoney(txData) {
        let result = Object.assign({}, txData);
        for (let key in txData){
            const field = txData[key];
            if (field.hasOwnProperty('tokens') && field.hasOwnProperty('assetId')){
                const asset = await this.assetInfo(txData[key].assetId);
                let amount = new BigNumber(field.tokens).multipliedBy(10 ** asset.precision).toString();
                result[key] = new Money(amount, asset)
            }
        }
        return result
    }
}
