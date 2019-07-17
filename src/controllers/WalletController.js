import ObservableStore from 'obs-store';
import { seedUtils, libs } from '@waves/waves-transactions';
import { encrypt, decrypt } from '../lib/encryprtor';
import { Wallet } from "../lib/wallet";

const { Seed } = seedUtils;

export class WalletController {
    constructor(options = {}) {
        const defaults = {
            initialized: false
        };
        const initState = Object.assign({}, defaults, options.initState);
        this.store = new ObservableStore(initState);
        this.store.updateState({ locked: true });
        this.password = null;
        this.wallets = [];
        this.getNetwork = options.getNetwork;
        this.getNetworks = options.getNetworks;
        this.getNetworkCode = options.getNetworkCode;
    }

    // Public
    addWallet(options) {
        if (this.store.getState().locked) throw new Error('App is locked');
        let user;
        switch (options.type) {
            case 'seed':
                const networkCode = this.getNetworkCode(options.network);
                const seed = new Seed(options.seed, networkCode);
                user = {
                    seed: seed.phrase,
                    publicKey: seed.keyPair.publicKey,
                    address: seed.address,
                    networkCode: options.networkCode || networkCode,
                    network: options.network,
                    type: options.type,
                    name: options.name
                };
                break;
            default:
                throw new Error(`Unsupported type: ${options.type}`)
        }

        const wallet = new Wallet(user);

        this._checkForDuplicate(wallet.getAccount().address, user.network);

        this.wallets.push(wallet);
        this._saveWallets()
    }

    removeWallet(address, network) {
        if (this.store.getState().locked) throw new Error('App is locked');
        const wallet = this.getWalletsByNetwork(network).find(wallet => wallet.getAccount().address === address);
        const index = this.wallets.indexOf(wallet);
        this.wallets.splice(index, 1);
        this._saveWallets();
    }

    getAccounts() {
        return this.wallets.map(wallet => wallet.getAccount())
    }

    lock() {
        this.password = null;
        this.wallets = [];
        if (!this.store.getState().locked) {
            this.store.updateState({ locked: true });
        }
    }

    unlock(password) {
        this._restoreWallets(password);
        this.password = password;
        this._migrateWalletsNetwork();
        this.store.updateState({ locked: false })
    }

    initVault(password) {
        if (!password || typeof password !== 'string') {
            throw new Error('Password is needed to init vault')
        }
        this.password = password;
        this.wallets = [];
        this._saveWallets();
        this.store.updateState({ locked: false, initialized: true })
    }

    deleteVault() {
        this.password = null;
        this.wallets = [];
        this.store.updateState({ locked: true, initialized: false, vault: undefined });
    }

    newPassword(oldPassword, newPassword) {
        if (!oldPassword || !newPassword || typeof oldPassword !== 'string' || typeof newPassword !== 'string') {
            throw new Error('Password is required');
        }
        this._restoreWallets(oldPassword);
        this.password = newPassword;
        this._saveWallets()
    }

    /**
     * Returns account seed
     * @param {string} address - wallet address
     * @param {string} password - application password
     * @returns {string} encrypted seed
     */
    exportAccount(address, password, network) {
        if (!password) throw new Error('Password is required');
        this._restoreWallets(password);

        const wallet = this.getWalletsByNetwork(network).find(wallet => wallet.getAccount().address === address);
        if (!wallet) throw new Error(`Wallet not found for address: ${address} in ${network}`);
        return wallet.getSecret();
    }

    exportSeed(address, network) {
        const wallet = this._findWallet(address, network);
        if (!wallet) throw new Error(`Wallet not found for address: ${address} in ${network}`);
        const seed = new Seed(wallet.user.seed);
        return seed.encrypt(this.password, 5000);
    }

    /**
     * Returns encrypted with current password account seed
     * @param {string} address - wallet address
     * @returns {string} encrypted seed
     */
    encryptedSeed(address, network) {
        const wallet = this._findWallet(address, network);
        const seed = wallet.getSecret();
        return Seed.encryptSeedPhrase(seed, this.password)
    }

    updateNetworkCode(network, code) {
        code = code || this.getNetworkCode(network);
        const wallets = this.getWalletsByNetwork(network);
        wallets.forEach(wallet => {
            if (wallet.user.networkCode !== code) {
                const seed = Seed(wallet.user.seed, code);
                wallet.user.network = network;
                wallet.user.networkCode = code;
                wallet.user.address = seed.address;
            }
        });

        if (wallets.length) {
            this._saveWallets();
        }
    }

    getWalletsByNetwork(network) {
        return this.wallets.filter(wallet => wallet.isMyNetwork(network));
    }

    _migrateWalletsNetwork() {
        const networks = this.getNetworks().reduce((acc, net) => {
            acc[net.code] = net.name;
            return acc;
        }, Object.create(null));

        const wallets = this.wallets.map(wallet => wallet.serialize());

        if (!wallets.find(item => !item.network)) {
            return null;
        }

        const walletsData = this.wallets.map(wallet => {
            const data = wallet.serialize();
            if (!data.network) {
                data.network = networks[data.networkCode]
            }

            return data;
        });


        this.wallets = walletsData.map(user => new Wallet(user));
        this._saveWallets();
    }

    /**
     * Signs transaction
     * @param {string} address - wallet address
     * @param {object} tx - transaction to sign
     * @returns {Promise<string>} signed transaction as json string
     */
    async signTx(address, tx, network) {
        const wallet = this._findWallet(address, network);
        return await wallet.signTx(tx);
    }

    /**
     * Signs transaction
     * @param {string} address - wallet address
     * @param {array} bytes - array of bytes
     * @returns {Promise<string>} signed transaction as json string
     */
    async signBytes(address, bytes, network) {
        const wallet = this._findWallet(address, network);
        return await wallet.signBytes(bytes);
    }

    /**
     * Signs request
     * @param {string} address - wallet address
     * @param {object} request - transaction to sign
     * @returns {Promise<string>} signature
     */
    async signRequest(address, request, network) {
        const wallet = this._findWallet(address, network);
        return wallet.signRequest(request);
    }

    /**
     * Signs request
     * @param {string} address - wallet address
     * @param {object} authData - object, representing auth request
     * @returns {Promise<object>} object, representing auth response
     */
    async auth(address, authData, network) {
        const wallet = this._findWallet(address, network);
        const signature = await wallet.signRequest(authData);
        const { publicKey } = wallet.getAccount();
        const { host, name, prefix, version } = authData.data;
        return {
            host,
            name,
            prefix,
            address,
            publicKey,
            signature,
            version
        }
    }

    async getKEK(address, network, publicKey, prefix) {
        const wallet = this._findWallet(address, network);
        return await wallet.getKEK(publicKey, prefix);
    }

    async encryptMessage(address,network, message, publicKey, prefix) {
        const wallet = this._findWallet(address, network);
        return await wallet.encryptMessage(message, publicKey, prefix);
    }

    async decryptMessage(address,network, message, publicKey, prefix) {
        const wallet = this._findWallet(address, network);
        return await wallet.decryptMessage(message, publicKey, prefix);
    }

    // Private
    _checkForDuplicate(address, network) {
        if (this.getWalletsByNetwork(network).find(account => account.address === address)) {
            throw new Error(`Account with address ${address} already exists`)
        }
    }

    _saveWallets() {
        const walletsData = this.wallets.map(wallet => wallet.serialize());
        this.store.updateState({ vault: encrypt(walletsData, this.password) })
    }

    _restoreWallets(password) {
        const decryptedData = decrypt(this.store.getState().vault, password);
        this.wallets = decryptedData.map(user => new Wallet(user));
    }

    _findWallet(address, network) {
        if (this.store.getState().locked) throw new Error('App is locked');
        const wallet = this.getWalletsByNetwork(network).find(wallet => wallet.getAccount().address === address);
        if (!wallet) throw new Error(`Wallet not found for address ${address}`);
        return wallet;
    }
}
