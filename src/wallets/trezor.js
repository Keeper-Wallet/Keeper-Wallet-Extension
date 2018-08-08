export class TrezorWallet {
    constructor(publicKey) {
        this.publicKey = publicKey;
        this.type = 'trezor'
    }

    getAccount() {
        return {publicKey: this.publicKey, type: this.type}
    }

    serialize() {
        return this.publicKey
    }

    getSecret() {

    }
}