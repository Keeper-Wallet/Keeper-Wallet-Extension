import ObservableStore from 'obs-store';
import *  as SG from '@waves/signature-generator'
import {encrypt, decrypt} from '../lib/encryprtor';
import {Wallet} from "../lib/wallet";

export class WalletController {
    constructor(options = {}) {
        const defaults = {
            initialized: false
        };
        const initState = Object.assign({}, defaults, options.initState);
        this.store = new ObservableStore(initState);
        this.store.updateState({locked: true});
        this.password = null;
        this.wallets = []
        //this.getNetwork = opts.getNetwork
    }

    // Public
    addWallet(options) {
        if (this.store.getState().locked) throw new Error('App is locked');
        let user;
        switch (options.type){
            case 'seed':
                SG.config.set({networkByte: options.networkCode.charCodeAt(0)});
                const seed = new SG.Seed(options.seed);
                user = {
                    seed: seed.phrase,
                    publicKey: seed.keyPair.publicKey,
                    address: seed.address,
                    networkCode: options.networkCode,
                    type: options.type,
                    name: options.name
                };
                break;
            default:
                throw new Error(`Unsupported type: ${options.type}`)
        }

        const wallet = new Wallet(user);

        this._checkForDuplicate(wallet.getAccount().address);

        this.wallets.push(wallet);
        this._saveWallets()
    }

    removeWallet(address) {
        if (this.store.getState().locked) throw new Error('App is locked');
        const index = this.wallets.findIndex(wallet => wallet.getAccount().address === address);
        this.wallets.splice(index, 1);
        this._saveWallets();
    }

    getAccounts() {
        return this.wallets.map(wallet => wallet.getAccount())
    }

    lock() {
        this.password = null;
        this.wallets = [];
        this.store.updateState({locked: true})
    }

    unlock(password) {
        this._restoreWallets(password);
        this.password = password;
        this.store.updateState({locked: false})
    }

    initVault(password) {
        if (!password || typeof password !== 'string') {
            this.store.updateState({locked: true, initialized: false});
            this.password = '';
            this.wallets = [];
            this._saveWallets();
            return null;
        }
        this.password = password;
        this.wallets = [];
        this._saveWallets();
        this.store.updateState({locked: false, initialized:true})
    }

    newPassword(oldPassword, newPassword) {
        if (!oldPassword || !newPassword || typeof oldPassword !== 'string' || typeof newPassword !== 'string') {
            throw new Error('Password is required');
        }
        this._restoreWallets(oldPassword);
        this.password = newPassword;
        this._saveWallets()
    }

    exportAccount(address, password) {
        if (!password) throw new Error('Password is required');
        this._restoreWallets(password);

        const wallet = this.wallets.find(wallet => wallet.getAccount().address === address);
        if (!wallet) throw new Error(`Wallet not found for address: ${address}`);

        return wallet.getSecret();
    }

    /**
     * Signs transaction
     * @param {string} address - wallet address
     * @param {object} tx - transaction to sign
     * @returns {Promise<string>} signed transaction as json string
     */
    async signTx(address, tx) {
        const wallet = this._findWallet(address);
        return await wallet.signTx(tx);
    }

    /**
     * Signs request
     * @param {string} address - wallet address
     * @param {object} request - transaction to sign
     * @returns {Promise<string>} signature
     */
    async signRequest(address, request){
        const wallet = this._findWallet(address);
        return wallet.signRequest(request);
    }

    /**
     * Signs request
     * @param {string} address - wallet address
     * @param {object} authData - object, representing auth request
     * @returns {Promise<object>} object, representing auth response
     */
    async auth(address, authData){
        const wallet = this._findWallet(address);
        const signature = await wallet.signRequest(authData);
        const {publicKey} = wallet.getAccount();
        return {
            ...authData.data,
            address,
            publicKey,
            signature
        }
    }
    // Private
    _checkForDuplicate(address) {
        if (this.getAccounts().find(account => account.address === address)) {
            throw new Error(`Account with address ${address} already exists`)
        }
    }

    _saveWallets() {
        const walletsData = this.wallets.map(wallet => wallet.serialize());
        this.store.updateState({vault: encrypt(walletsData, this.password)})
    }

    _restoreWallets(password) {
        const decryptedData = decrypt(this.store.getState().vault, password);
        this.wallets = decryptedData.map(user => new Wallet(user));
    }

    _findWallet(address){
        if (this.store.getState().locked) throw new Error('App is locked');
        const wallet = this.wallets.find(wallet => wallet.getAccount().address === address);
        if (!wallet) throw new Error(`Wallet not found for address ${address}`);
        return wallet;
    }
}
