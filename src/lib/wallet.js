import {getAdapterByType} from '@waves/signature-adapter'

export class Wallet {
    constructor(user) {
        if (!user) throw new Error('user required')
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

    async sign(tx){
        const Adapter = getAdapterByType(this.user.type);
        Adapter.initOptions({networkCode: this.user.networkCode});
        const adapter = new Adapter(this.user);
        const signable = adapter.makeSignable(tx);
        return await signable.getDataForApi()
    }
}
//
// export class Wallet {
//     constructor(options = {}) {
//         this.networkCode = options.networkCode;
//         const Adapter = getAdapterByType(options.type);
//         Adapter.initOptions({networkCode: this.networkCode});
//         this._adapter = new Adapter(options.data);
//         this.type = options.type
//     }
//
//     async getAccount() {
//         return {
//             networkCode: this.networkCode,
//             publicKey: await this._adapter.getPublicKey(),
//             type: this.type,
//         }
//     }
//
//     async serialize() {
//         return {
//             data: await this._adapter.getSeed(),
//             networkCode: this.networkCode,
//         }
//     }
//
//     async getSecret() {
//         return await this._adapter.getSeed()
//     }
//
//     async sign(tx) {
//         const signable = this._adapter.makeSignable(tx);
//         return await signable.getDataForApi()
//     }
// }