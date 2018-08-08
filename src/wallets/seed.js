export class SeedWallet {
    constructor(seed) {
        this.seed = seed;
        this.publicKey = seed;
        this.type = 'seed'
    }

    getAccount() {
        return {publicKey: this.publicKey, type: this.type}
    }

    serialize(){
        return this.seed
    }
}