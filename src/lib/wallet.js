import {getAdapterByType} from '@waves/signature-adapter'
import { encryptMessage, decryptMessage, getSharedKey, base58encode, stringToUint8Array, blake2b, libs } from '@waves/waves-crypto';
import {BigNumber} from '@waves/data-entities';
import create from 'parse-json-bignumber';
const {stringify, parse} = create({BigNumber});

export class Wallet {

    /**
     * user
     * @type {
     * {
     *  address: string,
     *  seed: string,
     *  networkCode: string,
     *  name: string,
     *  publicKey: string,
     *  type: string,
     *  network: string
     *  }
     *}
     */
    user = null;

    constructor(user) {
        if (!user) throw new Error('user required');
        this.user = user
    }

    get _adapter(){
        const Adapter = getAdapterByType(this.user.type);

        Adapter.initOptions({networkCode: this.user.networkCode.charCodeAt(0)});

        //Todo: temporary for seed
        let params = this.user;
        if (this.user.type === 'seed'){
            params = this.user.seed;
        }
        return new Adapter(params)
    }

    isMyNetwork(network) {
        return network === this.user.network;
    }

    getAccount() {
        let account = Object.assign({}, this.user);
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

    async encryptMessage(message, publicKey, prefix = '', passwordLength) {
        passwordLength = passwordLength ? passwordLength : Math.round(Math.random() * 128 + 128);
        passwordLength = passwordLength < 50 ? 128 : passwordLength;
        const privateKey = await this._adapter.getPrivateKey();
        const sharedKey = libs.base58.encode(
            blake2b(stringToUint8Array(`${prefix}_${base58encode(getSharedKey(privateKey, publicKey))}`))
        );
        return encryptMessage(sharedKey, message, passwordLength);
    }

    async decryptMessage(message, publicKey, prefix = '') {
        const privateKey = await this._adapter.getPrivateKey();
        const sharedKey = libs.base58.encode(
            blake2b(stringToUint8Array(`${prefix}_${base58encode(getSharedKey(privateKey, publicKey))}`))
        );
        return decryptMessage(sharedKey, message);
    }

    async signTx(tx){
        const signable = this._adapter.makeSignable(tx);
        return stringify(await signable.getDataForApi());
    }

    async signBytes(bytes){
        return await this._adapter.signData(Uint8Array.from(bytes))
    }

    async signRequest(request){
        const signable = this._adapter.makeSignable(request);
        return await signable.getSignature()
    }
}
