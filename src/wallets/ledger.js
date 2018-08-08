export class LedgerWallet {
    constructor(publicKey) {
        this.publicKey = publicKey;
        this.type = 'ledger'
    }

    getAccount() {
        return {publicKey: this.publicKey, type: this.type}
    }

    serialize() {
        return this.publicKey
    }

    getSecret(){

    }
}