import ObservableStore from 'obs-store';
import { seedUtils } from '@waves/waves-transactions';
import { createWallet } from 'wallets';
import { EventEmitter } from 'events';
import { ExtensionStore } from '../storage/storage';
import { AssetInfoController } from './assetInfo';
import { NetworkController } from './network';
import { TrashController } from './trash';
import { LedgerApi } from 'wallets/ledger';
import { Wallet } from 'wallets/wallet';
import { IdentityApi } from './IdentityController';
import {
  SaAuth,
  SaCancelOrder,
  SaOrder,
  SaRequest,
  SaTransaction,
} from 'transactions/utils';
import { IWavesAuthParams } from '@waves/waves-transactions/dist/transactions';
import { TCustomData } from '@waves/waves-transactions/dist/requests/custom-data';
import { TBinaryIn } from '@waves/ts-lib-crypto';
import { NetworkName } from 'networks/types';
import { CreateWalletInput, WalletPrivateData } from 'wallets/types';

function encrypt(object: unknown, password: string) {
  const jsonObj = JSON.stringify(object);
  return seedUtils.encryptSeed(jsonObj, password);
}

function decrypt(ciphertext: string, password: string) {
  try {
    const decryptedJson = seedUtils.decryptSeed(ciphertext, password);
    return JSON.parse(decryptedJson);
  } catch (e) {
    throw new Error('Invalid password');
  }
}

export class WalletController extends EventEmitter {
  store;
  private password: string | null | undefined;
  private _setSession;
  private wallets: Array<Wallet<WalletPrivateData>>;
  private assetInfo;
  private getNetworks;
  private getNetworkCode;
  private ledger;
  private trashControl;
  private identity;

  constructor({
    localStore,
    assetInfo,
    getNetworks,
    getNetworkCode,
    ledger,
    trash,
    identity,
  }: {
    localStore: ExtensionStore;
    assetInfo: AssetInfoController['assetInfo'];
    getNetworks: NetworkController['getNetworks'];
    getNetworkCode: NetworkController['getNetworkCode'];
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

    this.password = localStore.getInitSession().password;
    this._setSession = localStore.setSession.bind(localStore);

    this.wallets = [];
    this.assetInfo = assetInfo;
    this.getNetworks = getNetworks;
    this.getNetworkCode = getNetworkCode;
    this.ledger = ledger;
    this.trashControl = trash;
    this.identity = identity;

    this._restoreWallets(this.password);
  }

  // Public
  addWallet(
    options: Omit<CreateWalletInput, 'networkCode'> & {
      networkCode?: string;
    }
  ) {
    const networkCode =
      options.networkCode || this.getNetworkCode(options.network);

    const wallet = this._createWallet({
      ...options,
      networkCode,
    } as CreateWalletInput);

    const foundWallet = this.getWalletsByNetwork(options.network).find(
      item => item.getAccount().address === wallet.getAccount().address
    );

    if (foundWallet) {
      return foundWallet.getAccount();
    }

    this.wallets.push(wallet);
    this._saveWallets();
    this.emit('addWallet', wallet);
    return wallet.getAccount();
  }

  removeWallet(address: string, network: NetworkName) {
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

  unlock(password: string) {
    this._restoreWallets(password);
    this._setPassword(password);
    this._migrateWalletsNetwork();
  }

  initVault(password: string) {
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

  newPassword(oldPassword: string, newPassword: string) {
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

  checkPassword(password: string) {
    return password === this.password;
  }

  getAccountSeed(address: string, network: NetworkName, password: string) {
    if (!password) throw new Error('Password is required');
    this._restoreWallets(password);

    return this._findWallet(address, network).getSeed();
  }

  getAccountEncodedSeed(
    address: string,
    network: NetworkName,
    password: string
  ) {
    if (!password) throw new Error('Password is required');
    this._restoreWallets(password);

    return this._findWallet(address, network).getEncodedSeed();
  }

  getAccountPrivateKey(
    address: string,
    network: NetworkName,
    password: string
  ) {
    if (!password) throw new Error('Password is required');
    this._restoreWallets(password);

    return this._findWallet(address, network).getPrivateKey();
  }

  encryptedSeed(address: string, network: NetworkName) {
    const wallet = this._findWallet(address, network);
    const seed = wallet.getSeed();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return seedUtils.Seed.encryptSeedPhrase(seed, this.password!);
  }

  updateNetworkCode(network: NetworkName, code: string | undefined) {
    let changed = false;

    this.wallets.forEach((wallet, index) => {
      const account = wallet.getAccount();

      if (account.network === network && account.networkCode !== code) {
        changed = true;

        this.wallets[index] = this._createWallet({
          ...wallet.serialize(),
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          networkCode: code!,
        });
      }
    });

    if (changed) {
      this._saveWallets();
    }
  }

  getWalletsByNetwork(network: NetworkName) {
    return this.wallets.filter(
      wallet => wallet.getAccount().network === network
    );
  }

  _walletToTrash(wallet: Wallet<WalletPrivateData> | undefined) {
    const walletsData = wallet && wallet.serialize && wallet.serialize();
    if (walletsData) {
      const saveData = {
        walletsData: this.password
          ? encrypt(walletsData, this.password)
          : walletsData,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        address: (wallet as any).address,
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

  async signTx(address: string, tx: SaTransaction, network: NetworkName) {
    const wallet = this._findWallet(address, network);

    return await wallet.signTx({
      ...tx,
      data: {
        senderPublicKey: wallet.getAccount().publicKey,
        ...tx.data,
      },
    } as SaTransaction);
  }

  async signOrder(address: string, order: SaOrder, network: NetworkName) {
    const wallet = this._findWallet(address, network);

    return await wallet.signOrder({
      ...order,
      data: {
        senderPublicKey: wallet.getAccount().publicKey,
        ...order.data,
      },
    });
  }

  async signCancelOrder(
    address: string,
    cancelOrder: SaCancelOrder,
    network: NetworkName
  ) {
    const wallet = this._findWallet(address, network);
    return await wallet.signCancelOrder(cancelOrder);
  }

  async signWavesAuth(
    data: IWavesAuthParams,
    address: string,
    network: NetworkName
  ) {
    const wallet = this._findWallet(address, network);
    return await wallet.signWavesAuth(data);
  }

  async signCustomData(
    data: TCustomData,
    address: string,
    network: NetworkName
  ) {
    const wallet = this._findWallet(address, network);
    return await wallet.signCustomData(data);
  }

  async signRequest(address: string, request: SaRequest, network: NetworkName) {
    const wallet = this._findWallet(address, network);
    return wallet.signRequest(request);
  }

  async auth(
    address: string,
    authData: SaAuth & { data: { name: unknown } },
    network: NetworkName
  ) {
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

  async getKEK(
    address: string,
    network: NetworkName,
    publicKey: string,
    prefix: string
  ) {
    const wallet = this._findWallet(address, network);
    return await wallet.getKEK(publicKey, prefix);
  }

  async encryptMessage(
    address: string,
    network: NetworkName,
    message: string,
    publicKey: TBinaryIn,
    prefix: string | undefined
  ) {
    const wallet = this._findWallet(address, network);
    return await wallet.encryptMessage(message, publicKey, prefix);
  }

  async decryptMessage(
    address: string,
    network: NetworkName,
    message: TBinaryIn,
    publicKey: TBinaryIn,
    prefix: string | undefined
  ) {
    const wallet = this._findWallet(address, network);
    return await wallet.decryptMessage(message, publicKey, prefix);
  }

  _saveWallets() {
    const walletsData = this.wallets.map(wallet => wallet.serialize());
    this.store.updateState({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      WalletController: { vault: encrypt(walletsData, this.password!) },
    });
  }

  _restoreWallets(password: string | null | undefined) {
    const vault = this.store.getState().WalletController.vault;

    if (!vault || !password) {
      return;
    }

    const decryptedData = decrypt(vault, password) as CreateWalletInput[];
    this.wallets = decryptedData.map(user => this._createWallet(user));
  }

  _createWallet(user: CreateWalletInput) {
    return createWallet(user, {
      getAssetInfo: this.assetInfo,
      identity: this.identity,
      ledger: this.ledger,
    });
  }

  _findWallet(address: string, network: NetworkName) {
    const wallet = this.getWalletsByNetwork(network).find(
      wallet => wallet.getAccount().address === address
    );
    if (!wallet) throw new Error(`Wallet not found for address ${address}`);
    return wallet;
  }

  _setPassword(password: string | null) {
    this.password = password;
    this._setSession({ password });
  }
}
