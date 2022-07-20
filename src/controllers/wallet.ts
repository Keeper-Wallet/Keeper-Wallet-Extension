import ObservableStore from 'obs-store';
import { seedUtils } from '@waves/waves-transactions';
import { createWallet } from 'wallets';
import { EventEmitter } from 'events';
import ExtensionStore from 'lib/localStore';
import { AssetInfoController } from './assetInfo';
import { NetworkController } from './network';
import { TrashController } from './trash';
import { LedgerApi } from 'wallets/ledger';
import { Wallet } from 'wallets/wallet';
import { IdentityApi } from './IdentityController';
import { Account } from 'accounts/types';

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

type GetAssetInfo = AssetInfoController['assetInfo'];
type GetNetwork = NetworkController['getNetwork'];
type GetNetworks = NetworkController['getNetworks'];
type GetNetworkCode = NetworkController['getNetworkCode'];

export class WalletController extends EventEmitter {
  store: ObservableStore;
  password: string | undefined;
  _setSession: ExtensionStore['setSession'];
  wallets: Array<Wallet<Account>>;
  assetInfo: GetAssetInfo;
  getNetwork: GetNetwork;
  getNetworks: GetNetworks;
  getNetworkCode: GetNetworkCode;
  ledger: LedgerApi;
  trashControl: TrashController;
  identity: IdentityApi;

  constructor({
    localStore,
    assetInfo,
    getNetwork,
    getNetworks,
    getNetworkCode,
    ledger,
    trash,
    identity,
  }: {
    localStore: ExtensionStore;
    assetInfo: GetAssetInfo;
    getNetwork: GetNetwork;
    getNetworks: GetNetworks;
    getNetworkCode: GetNetworkCode;
    ledger: LedgerApi;
    trash: TrashController;
    identity: IdentityApi;
  }) {
    super();

    this.store = new ObservableStore(
      localStore.getInitState({
        WalletController: { vault: undefined },
      })
    );
    localStore.subscribe(this.store);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.password = localStore.getInitSession().password as any;
    this._setSession = localStore.setSession.bind(localStore);

    this.wallets = [];
    this.assetInfo = assetInfo;
    this.getNetwork = getNetwork;
    this.getNetworks = getNetworks;
    this.getNetworkCode = getNetworkCode;
    this.ledger = ledger;
    this.trashControl = trash;
    this.identity = identity;

    this._restoreWallets(this.password);
  }

  // Public
  addWallet(options) {
    const networkCode =
      options.networkCode || this.getNetworkCode(options.network);

    const wallet = this._createWallet({ ...options, networkCode });

    const foundWallet = this.getWalletsByNetwork(options.network).find(
      item => item.getAccount().address === wallet.getAccount().address
    );
    if (foundWallet) {
      return foundWallet;
    }

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
    this.store.updateState({ WalletController: { vault: undefined } });
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

  checkPassword(password) {
    return password === this.password;
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
    let changed = false;

    this.wallets.forEach((wallet, index) => {
      const account = wallet.getAccount();

      if (account.network === network && account.networkCode !== code) {
        changed = true;

        this.wallets[index] = this._createWallet({
          ...wallet.serialize(),
          networkCode: code,
        });
      }
    });

    if (changed) {
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

  _saveWallets() {
    const walletsData = this.wallets.map(wallet => wallet.serialize());
    this.store.updateState({
      WalletController: { vault: encrypt(walletsData, this.password) },
    });
  }

  _restoreWallets(password) {
    const vault = this.store.getState().WalletController.vault;

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
