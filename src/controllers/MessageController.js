import ObservableStore from 'obs-store';
import uuid from 'uuid/v4';
import log from 'loglevel';
import EventEmitter from 'events'

// msg statuses: unapproved, signed, rejected, failed

export class MessageController extends EventEmitter {
    constructor(options = {}) {
        super();
        const defaults = {
            messages: []
        };
        this.store = new ObservableStore(Object.assign({}, defaults, options.initState));

        // Signing method from WalletController
        this.signWavesTx = options.sign
    }

    newTx(from, origin, tx) {
        log.debug(`New tx ${JSON.stringify(tx)}`);
        let meta = this._generateMetadata(from, origin);
        meta.tx = tx;
        let messages = this.store.getState().messages;
        messages.push(meta);
        this.store.updateState({messages});
        return new Promise((resolve, reject) => {
            this.once(`${meta.id}:finished`, finishedMeta => {
                switch (finishedMeta.status) {
                    case 'signed':
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

    async sign(id) {
        const message = this._getMessageById(id);
        try {
            message.tx = await this.signWavesTx(message.account, message.tx);
            message.status = 'signed'
        } catch (e) {
            message.err = e;
            message.status = 'failed'
        }
        this._updateMessage(message);
        this.emit(`${message.id}:finished`, message);
        if (message.status === 'signed'){
            return message.tx
        }else if (message.status === 'failed'){
            throw message.err
        }else {
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

    _generateMetadata(from, origin) {
        return {
            account: from,
            id: uuid(),
            origin,
            status: 'unapproved',
            time: Date.now()

        }
    }
}
