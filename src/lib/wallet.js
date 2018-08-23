import {Seed} from '@waves/waves-signature-generator'
import {getAdapterByType} from '@waves/signature-adapter'

export class SeedWallet {
    constructor(options = {}) {
        this.data = options.data;
        this.type = options.type;
        this.networkCode = options.networkCode
    }

    getAccount() {
        return {publicKey: this.seed.keyPair.publicKey, type: this.type}
    }

    serialize() {
        return this.seed.phrase
    }

    getSecret() {
        return this.seed.phrase
    }
}