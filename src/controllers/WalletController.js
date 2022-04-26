import ObservableStore from 'obs-store';
import { seedUtils } from '@waves/waves-transactions';
import { createWallet } from 'wallets';
import { EventEmitter } from 'events';

function encrypt(object, password) {
  const jsonObj = JSON.stringify(object);
  return seedUtils.encryptSeed(jsonObj, password);
}

function decrypt(ciphertext, password) {
  try {
    const decryptedJson = seedUtils.decryptSeed(ciphertext, password);
    return JSON.parse(decryptedJson);
  } catch (e) {
    throw new Error('Invalid password');
  }
}

export class WalletController extends EventEmitter {
  constructor(options = {}) {
    super();
    this.store = new ObservableStore(options.initState);
    this.password = options.initSession.password;
    this.wallets = [];
    this.assetInfo = options.assetInfo;
    this.getNetwork = options.getNetwork;
    this.getNetworks = options.getNetworks;
    this.getNetworkCode = options.getNetworkCode;
    this.ledger = options.ledger;
    this.trashControl = options.trash;
    this.identity = options.identity;
    this._setSession = options.setSession;

    this._restoreWallets(this.password);
  }

  // Public
  addWallet(options) {
    const networkCode =
      options.networkCode || this.getNetworkCode(options.network);

    const wallet = this._createWallet({ ...options, networkCode });

    this._checkForDuplicate(wallet.getAccount().address, options.network);

    this.wallets.push(wallet);
    this._saveWallets();
    this.emit('addWallet', wallet);
    return wallet.getAccount();
  }

  removeWallet(address, network) {
    const wallet = this.getWalletsByNetwork(network).find(
      wallet => wallet.getAccount().address === address
    );
    this._walletToTrash(wallet);
    this.wallets = this.wallets.filter(w => {
      return w !== wallet;
    });
    this._saveWallets();
    this.emit('removeWallet', wallet);
  }

  getAccounts() {
    return this.wallets.map(wallet => wallet.getAccount());
  }

  lock() {
    this._setPassword(null);
    this.wallets = [];
  }

  unlock(password) {
    this._restoreWallets(password);
    this._setPassword(password);
    this._migrateWalletsNetwork();
  }

  initVault(password) {
    if (!password || typeof password !== 'string') {
      throw new Error('Password is needed to init vault');
    }
    (this.wallets || []).forEach(wallet => this._walletToTrash(wallet));
    this._setPassword(password);
    this.wallets = [];
    this._saveWallets();
  }

  deleteVault() {
    (this.wallets || []).forEach(wallet => this._walletToTrash(wallet));
    this._setPassword(null);
    this.wallets = [];
    this.store.updateState({ vault: undefined });
  }

  newPassword(oldPassword, newPassword) {
    if (
      !oldPassword ||
      !newPassword ||
      typeof oldPassword !== 'string' ||
      typeof newPassword !== 'string'
    ) {
      throw new Error('Password is required');
    }
    this._restoreWallets(oldPassword);
    this._setPassword(newPassword);
    this._saveWallets();
  }

  getAccountSeed(address, network, password) {
    if (!password) throw new Error('Password is required');
    this._restoreWallets(password);

    return this._findWallet(address, network).getSeed();
  }

  getAccountEncodedSeed(address, network, password) {
    if (!password) throw new Error('Password is required');
    this._restoreWallets(password);

    return this._findWallet(address, network).getEncodedSeed();
  }

  getAccountPrivateKey(address, network, password) {
    if (!password) throw new Error('Password is required');
    this._restoreWallets(password);

    return this._findWallet(address, network).getPrivateKey();
  }

  exportSeed(address, network) {
    const wallet = this._findWallet(address, network);
    if (!wallet)
      throw new Error(`Wallet not found for address: ${address} in ${network}`);
    const seed = new seedUtils.Seed(wallet.user.seed);
    return seed.encrypt(this.password, 5000);
  }

  /**
   * Returns encrypted with current password account seed
   * @param {string} address - wallet address
   * @param network
   * @returns {string} encrypted seed
   */
  encryptedSeed(address, network) {
    const wallet = this._findWallet(address, network);
    const seed = wallet.getSeed();
    return seedUtils.Seed.encryptSeedPhrase(seed, this.password);
  }

  updateNetworkCode(network, code) {
    code = code || this.getNetworkCode(network);
    const wallets = this.getWalletsByNetwork(network);
    wallets.forEach(wallet => {
      if (wallet.user.networkCode !== code) {
        const seed = new seedUtils.Seed(wallet.user.seed, code);
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
    return this.wallets.filter(
      wallet => wallet.getAccount().network === network
    );
  }

  _walletToTrash(wallet) {
    const walletsData = wallet && wallet.serialize && wallet.serialize();
    if (walletsData) {
      const saveData = {
        walletsData: this.password
          ? encrypt(walletsData, this.password)
          : walletsData,
        address: wallet.address,
      };
      this.trashControl.addData(saveData);
    }
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
        data.network = networks[data.networkCode];
      }

      return data;
    });

    this.wallets = walletsData.map(user => this._createWallet(user));
    this._saveWallets();
  }

  /**
   * Signs transaction
   * @param {string} address - wallet address
   * @param {object} tx - transaction to sign
   * @param {object} network
   * @returns {Promise<string>} signed transaction as json string
   */
  async signTx(address, tx, network) {
    const wallet = this._findWallet(address, network);

    return await wallet.signTx({
      ...tx,
      data: {
        senderPublicKey: wallet.getAccount().publicKey,
        ...tx.data,
      },
    });
  }

  /**
   * Signs order
   * @param {string} address - wallet address
   * @param {object} order - order to sign
   * @param {object} network
   * @returns {Promise<string>} signed order as json string
   */
  async signOrder(address, order, network) {
    const wallet = this._findWallet(address, network);

    return await wallet.signOrder({
      ...order,
      data: {
        senderPublicKey: wallet.getAccount().publicKey,
        ...order.data,
      },
    });
  }

  /**
   * Signs order cancellation request
   * @param {string} address - wallet address
   * @param {object} cancelOrder - order cancellation request to sign
   * @param {object} network
   * @returns {Promise<string>} signed order cancellation request as json string
   */
  async signCancelOrder(address, cancelOrder, network) {
    const wallet = this._findWallet(address, network);
    return await wallet.signCancelOrder(cancelOrder);
  }

  async signWavesAuth(data, address, network) {
    const wallet = this._findWallet(address, network);
    return await wallet.signWavesAuth(data);
  }

  async signCustomData(data, address, network) {
    const wallet = this._findWallet(address, network);
    return await wallet.signCustomData(data);
  }

  /**
   * Signs request
   * @param {string} address - wallet address
   * @param {object} request - transaction to sign
   * @param network
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
   * @param network
   * @returns {Promise<object>} object, representing auth response
   */
  async auth(address, authData, network) {
    const wallet = this._findWallet(address, network);
    const signature = await wallet.signAuth(authData);
    const { host, name, prefix, version } = authData.data;
    return {
      host,
      name,
      prefix,
      address,
      publicKey: wallet.getAccount().publicKey,
      signature,
      version,
    };
  }

  async getKEK(address, network, publicKey, prefix) {
    const wallet = this._findWallet(address, network);
    return await wallet.getKEK(publicKey, prefix);
  }

  async encryptMessage(address, network, message, publicKey, prefix) {
    const wallet = this._findWallet(address, network);
    return await wallet.encryptMessage(message, publicKey, prefix);
  }

  async decryptMessage(address, network, message, publicKey, prefix) {
    const wallet = this._findWallet(address, network);
    return await wallet.decryptMessage(message, publicKey, prefix);
  }

  // Private
  _checkForDuplicate(address, network) {
    if (
      this.getWalletsByNetwork(network).find(
        account => account.address === address
      )
    ) {
      throw new Error(`Account with address ${address} already exists`);
    }
  }

  _saveWallets() {
    const walletsData = this.wallets.map(wallet => wallet.serialize());
    this.store.updateState({ vault: encrypt(walletsData, this.password) });
  }

  _restoreWallets(password) {
    const vault = this.store.getState().vault;

    if (!vault || !password) {
      return;
    }

    const decryptedData = decrypt(vault, password);
    this.wallets = decryptedData.map(user => this._createWallet(user));
  }

  _createWallet(user) {
    return createWallet(user, {
      getAssetInfo: this.assetInfo,
      identity: this.identity,
      ledger: this.ledger,
    });
  }

  _findWallet(address, network) {
    const wallet = this.getWalletsByNetwork(network).find(
      wallet => wallet.getAccount().address === address
    );
    if (!wallet) throw new Error(`Wallet not found for address ${address}`);
    return wallet;
  }

  _setPassword(password) {
    this.password = password;
    this._setSession({ password });
  }
}
