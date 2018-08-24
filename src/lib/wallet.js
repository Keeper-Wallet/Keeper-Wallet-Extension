import {Seed} from '@waves/signature-generator'
import {getAdapterByType} from '@waves/signature-adapter'

export class Wallet {
    constructor(user) {
        this.user = user
    }

    getAccount() {
        let account = Object.assign({}, this.user)
        delete account['id'];
        delete account['seed'];
        return account;
    }

    serialize() {
        return this.user
    }

    getSecret() {
        return this.user.seed
    }
}