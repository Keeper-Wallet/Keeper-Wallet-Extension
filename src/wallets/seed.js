import {Seed} from '@waves/signature-adapter'

export class SeedWallet {
    constructor(phrase) {
        this.seed = new Seed(phrase);
        this.type = 'seed'
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
