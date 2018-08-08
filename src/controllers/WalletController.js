import ObservableStore from 'obs-store';
import log from 'loglevel';
import {encrypt, decrypt} from '../lib/encryprtor';
import {WALLET_MAP} from "../wallets";

export class WalletController {
    constructor(options = {}) {
        const initState = options.initState || {};
        this.store = new ObservableStore(initState);
        this.memStore = new ObservableStore({
            locked: true,
            wallets: [],
        });
        this.password = null;
        this.wallets = []
        //this.getNetwork = opts.getNetwork
    }

    // Public
    addWallet(type, options) {
        const wallet = new WALLET_MAP[type](options);

        this._checkForDuplicate(wallet.getAccount().publicKey)

        this.wallets.push(wallet);
        this._saveWallets()
    }

    removeWallet(publicKey){
        const index = this.wallets.findIndex(wallet => wallet.publicKey === publicKey);
        this.wallets.splice(index, 1);
        this._saveWallets();
    }

    getAccounts() {
        return this.wallets.map(wallet => wallet.getAccount())
    }

    lock() {
        this.password = null;
        this.wallets = [];
        this.memStore.updateState({locked: true})
    }

    unlock(password) {
        this._restoreWallets(password);
        this.password = password;
        this.memStore.updateState({locked: false})
    }

    sign(publicKey, data){
        const wallet = this.wallets.find(wallet => wallet.publicKey === publicKey);
        return wallet.sign(data)
    }
    // Private
    _checkForDuplicate(publicKey) {
        if (this.getAccounts().find(account => account.publicKey === publicKey)) {
            throw new Error(`Account with public key ${publicKey} already exists`)
        }
    }

    _saveWallets() {
        const walletsData = this.wallets.map(wallet => {
            return {
                type: wallet.type,
                data: wallet.serialize()
            }
        });
        this.store.updateState({vault: encrypt(walletsData, this.password)})
    }

    _restoreWallets(password) {
        const decryptedData = decrypt(this.store.getState().vault, password);
        this.wallets = decryptedData.map(walletData => new WALLET_MAP[walletData.type](walletData.data));
    }
}