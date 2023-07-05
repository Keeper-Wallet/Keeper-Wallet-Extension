import {
  base58Encode,
  base64Decode,
  base64Encode,
  decryptSeed,
  encryptSeed,
  utf8Decode,
  utf8Encode,
} from '@keeper-wallet/waves-crypto';
import { EventEmitter } from 'events';
import { type NetworkName } from 'networks/types';
import ObservableStore from 'obs-store';
import invariant from 'tiny-invariant';
import { DebugWallet } from 'wallets/debug';
import { EncodedSeedWallet } from 'wallets/encodedSeed';
import { type LedgerApi, LedgerWallet } from 'wallets/ledger';
import { PrivateKeyWallet } from 'wallets/privateKey';
import { SeedWallet } from 'wallets/seed';
import { type CreateWalletInput, type WalletPrivateData } from 'wallets/types';
import { type Wallet } from 'wallets/wallet';
import { WxWallet } from 'wallets/wx';

import { NETWORK_CONFIG } from '../constants';
import { type ExtensionStorage } from '../storage/storage';
import { type AssetInfoController } from './assetInfo';
import { type IdentityApi } from './IdentityController';
import { type TrashController } from './trash';

async function encryptVault(input: WalletPrivateData[], password: string) {
  const json = JSON.stringify(input);
  const vault = await encryptSeed(utf8Encode(json), utf8Encode(password));

  return base64Encode(vault);
}

async function decryptVault(vault: string, password: string) {
  try {
    const decryptedSeed = await decryptSeed(
      base64Decode(vault),
      utf8Encode(password),
    );

    return JSON.parse(utf8Decode(decryptedSeed)) as WalletPrivateData[];
  } catch {
    throw new Error('Invalid password');
  }
}

export class WalletController extends EventEmitter {
  #assetInfo;
  #identity;
  #ledger;
  #password: string | null | undefined;
  #setSession;
  #trashController;
  #wallets: Array<Wallet<WalletPrivateData>>;

  readonly store;

  constructor({
    assetInfo,
    extensionStorage,
    identity,
    ledger,
    trash,
  }: {
    assetInfo: AssetInfoController['assetInfo'];
    extensionStorage: ExtensionStorage;
    identity: IdentityApi;
    ledger: LedgerApi;
    trash: TrashController;
  }) {
    super();

    this.store = new ObservableStore(
      extensionStorage.getInitState({
        WalletController: { vault: undefined },
      }),
    );

    extensionStorage.subscribe(this.store);

    this.#assetInfo = assetInfo;
    this.#identity = identity;
    this.#ledger = ledger;
    this.#password = extensionStorage.getInitSession().password;
    this.#setSession = extensionStorage.setSession.bind(extensionStorage);
    this.#trashController = trash;
    this.#wallets = [];

    if (this.#password) {
      this.#restoreWallets(this.#password);
    }
  }

  async #createWallet(
    input: CreateWalletInput,
    network: NetworkName,
    networkCode: string,
  ) {
    switch (input.type) {
      case 'debug':
        return new DebugWallet({
          address: input.address,
          name: input.name,
          network,
          networkCode,
        });
      case 'encodedSeed':
        return EncodedSeedWallet.create({
          encodedSeed: input.encodedSeed,
          name: input.name,
          network,
          networkCode,
        });
      case 'ledger':
        return new LedgerWallet(
          {
            address: input.address,
            id: input.id,
            name: input.name,
            network,
            networkCode,
            publicKey: input.publicKey,
          },
          this.#ledger,
          this.#assetInfo,
        );
      case 'privateKey':
        return PrivateKeyWallet.create({
          name: input.name,
          network,
          networkCode,
          privateKey: input.privateKey,
        });
      case 'seed':
        return SeedWallet.create({
          name: input.name,
          network,
          networkCode,
          seed: input.seed,
        });
      case 'wx':
        return new WxWallet(
          {
            name: input.name,
            network,
            networkCode,
            publicKey: input.publicKey,
            address: input.address,
            uuid: input.uuid,
            username: input.username,
          },
          this.#identity,
        );
    }
  }

  async #saveWallets() {
    invariant(this.#password);

    const vault = await encryptVault(
      this.#wallets.map(wallet => wallet.data),
      this.#password,
    );

    this.store.updateState({ WalletController: { vault } });
  }

  async #restoreWallets(password: string) {
    if (!password) throw new Error('Password is required');

    const state = this.store.getState();
    const { vault } = state.WalletController;

    if (!vault) return;

    const decryptedVault = await decryptVault(vault, password);

    this.#wallets = await Promise.all(
      decryptedVault.map(user =>
        this.#createWallet(user, user.network, user.networkCode),
      ),
    );

    this.emit('updateWallets');
  }

  #getWalletsByNetwork(network: NetworkName) {
    return this.#wallets.filter(wallet => wallet.data.network === network);
  }

  #setPassword(password: string | null) {
    if (password?.length === 0) {
      throw new Error('Password is required');
    }

    this.#password = password;
    this.#setSession({ password });
  }

  async #putWalletIntoTrash(wallet: Wallet<WalletPrivateData>) {
    invariant(this.#password);

    const walletsData = await encryptSeed(
      utf8Encode(JSON.stringify(wallet.data)),
      utf8Encode(this.#password),
    );

    this.#trashController.addItem({
      address: wallet.data.address,
      walletsData: base64Encode(walletsData),
    });
  }

  async addWallet(
    input: CreateWalletInput,
    network: NetworkName,
    networkCode: string,
  ) {
    const wallet = await this.#createWallet(input, network, networkCode);

    const foundWallet = this.#getWalletsByNetwork(network).find(
      w => w.data.address === wallet.data.address,
    );

    if (foundWallet) {
      return foundWallet.getAccount();
    }

    this.#wallets.push(wallet);
    await this.#saveWallets();

    this.emit('addWallet', wallet);
    this.emit('updateWallets');

    return wallet.getAccount();
  }

  async batchAddWallets(
    inputs: Array<
      CreateWalletInput & { network: NetworkName; networkCode: string }
    >,
  ) {
    const newWallets = await Promise.all(
      inputs.map(input =>
        this.#createWallet(input, input.network, input.networkCode),
      ),
    );

    this.#wallets.push(...newWallets);

    await this.#saveWallets();

    newWallets.forEach(wallet => {
      this.emit('addWallet', wallet);
    });

    this.emit('updateWallets');
  }

  async removeWallet(address: string, network: NetworkName) {
    const wallet = this.#getWalletsByNetwork(network).find(
      w => w.data.address === address,
    );

    if (!wallet) return;

    await this.#putWalletIntoTrash(wallet);
    this.#wallets = this.#wallets.filter(w => w !== wallet);
    await this.#saveWallets();
    this.emit('removeWallet', wallet);
    this.emit('updateWallets');
  }

  async updateNetworkCode(network: NetworkName, code: string | null) {
    let changed = false;

    await Promise.all(
      this.#wallets.map(async (wallet, index) => {
        if (
          wallet.data.network === network &&
          wallet.data.networkCode !== code
        ) {
          this.#wallets[index] = await this.#createWallet(
            wallet.data,
            wallet.data.network,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            code!,
          );

          changed = true;
        }
      }),
    );

    if (changed) {
      await this.#saveWallets();
    }

    this.emit('updateWallets');
  }

  getAccounts() {
    return this.#wallets.map(wallet => wallet.getAccount());
  }

  async initVault(password: string) {
    this.#setPassword(password);
    await this.#saveWallets();
  }

  async deleteVault() {
    await Promise.all(
      this.#wallets.map(wallet => this.#putWalletIntoTrash(wallet)),
    );

    this.#wallets.forEach(wallet => {
      this.emit('removeWallet', wallet);
    });

    this.#setPassword(null);
    this.#wallets = [];
    this.emit('updateWallets');
    this.store.updateState({ WalletController: { vault: undefined } });
  }

  async assertPasswordIsValid(password: string) {
    await this.#restoreWallets(password);
  }

  async newPassword(oldPassword: string, newPassword: string) {
    await this.#restoreWallets(oldPassword);
    this.#setPassword(newPassword);
    await this.#saveWallets();
  }

  lock() {
    this.#setPassword(null);
    this.#wallets = [];
  }

  async unlock(password: string) {
    await this.#restoreWallets(password);
    this.#setPassword(password);

    if (this.#wallets.some(wallet => !wallet.data.network)) {
      const networks = Object.fromEntries(
        Object.values(NETWORK_CONFIG).map(net => [net.networkCode, net.name]),
      );

      this.#wallets = await Promise.all(
        this.#wallets.map(wallet =>
          this.#createWallet(
            wallet.data,
            networks[wallet.data.networkCode],
            wallet.data.networkCode,
          ),
        ),
      );

      await this.#saveWallets();
    }

    this.emit('updateWallets');
  }

  getWallet(address: string, network: NetworkName) {
    const wallet = this.#getWalletsByNetwork(network).find(
      w => w.data.address === address,
    );

    if (!wallet) throw new Error(`Wallet not found for address ${address}`);

    return wallet;
  }

  async getAccountSeed(
    address: string,
    network: NetworkName,
    password: string,
  ) {
    await this.assertPasswordIsValid(password);
    return this.getWallet(address, network).getSeed();
  }

  async getAccountEncodedSeed(
    address: string,
    network: NetworkName,
    password: string,
  ) {
    await this.assertPasswordIsValid(password);
    return this.getWallet(address, network).getEncodedSeed();
  }

  async getAccountPrivateKey(
    address: string,
    network: NetworkName,
    password: string,
  ) {
    await this.assertPasswordIsValid(password);
    const privateKey = await this.getWallet(address, network).getPrivateKey();
    return base58Encode(privateKey);
  }
}
