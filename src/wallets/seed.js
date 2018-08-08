import {Seed} from '@waves/waves-signature-generator'

export class SeedWallet {
    constructor(phrase) {
        this.seed = new Seed(phrase);
        this.type = 'seed'
    }

    getAccount() {
        return {publicKey: this.seed.keyPair.publicKey, type: this.type}
    }

    serialize(){
        return this.seed.phrase
    }
}