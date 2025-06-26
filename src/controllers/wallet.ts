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
import { nanoid } from 'nanoid';
import { type Network, type NetworkProfile } from 'networks/types';
import ObservableStore from 'obs-store';
import invariant from 'tiny-invariant';
import { DebugWallet } from 'wallets/debug';
import { EncodedSeedWallet } from 'wallets/encodedSeed';
import { type LedgerApi, LedgerWallet } from 'wallets/ledger';
import { MultichainWallet } from 'wallets/multichain';
import { PrivateKeyWallet } from 'wallets/privateKey';
import { SeedWallet } from 'wallets/seed';
import { type CreateWalletInput, type WalletPrivateData } from 'wallets/types';
import { type Wallet } from 'wallets/wallet';
import { WxWallet } from 'wallets/wx';

import { NETWORKS } from '../networks/config';
import { type ExtensionStorage } from '../storage/storage';
import { getEthereumData, getWavesData } from '../units/ed25519';
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

function findProfileByChainId(
  chainId: string,
): { profile: NetworkProfile; network: Network } | undefined {
  for (const net of NETWORKS) {
    for (const profile of Object.keys(net.params)) {
      if (net.params[profile as keyof typeof net.params]?.chainId === chainId) {
        return { profile: profile as NetworkProfile, network: net.network };
      }
    }
  }
  return undefined;
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
    network?: NetworkProfile,
    networkCode?: string,
  ) {
    if ('accountType' in input && input.accountType === 'multichain') {
      const { seed, name, id } = input;
      const waves = await getWavesData(seed);
      const ethereum = getEthereumData(seed);
      return new MultichainWallet({
        accountType: 'multichain',
        id: id || nanoid(),
        name,
        seed,
        accounts: {
          waves,
          ethereum,
        },
        type: 'seed',
      });
    }
    if (!network || !networkCode)
      throw new Error('network and networkCode are required for waves account');
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
      decryptedVault.map(user => {
        if (user.accountType === 'multichain') {
          return this.#createWallet({
            accountType: 'multichain',
            type: 'seed',
            seed: user.seed,
            name: user.name,
            id: user.id,
          });
        }
        return this.#createWallet(user, user.network, user.networkCode);
      }),
    );
    this.emit('updateWallets');
  }

  #getWalletsByNetwork(network: NetworkProfile) {
    return this.#wallets.filter(
      wallet =>
        wallet.data.accountType === 'waves' &&
        'network' in wallet.data &&
        wallet.data.network === network,
    );
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
    let address = '';
    if (wallet.data.accountType === 'waves') {
      address = wallet.data.address;
    } else if (wallet.data.accountType === 'multichain') {
      address = wallet.data.id;
    }
    const walletsData = await encryptSeed(
      utf8Encode(JSON.stringify(wallet.data)),
      utf8Encode(this.#password),
    );
    this.#trashController.addItem({
      address,
      walletsData: base64Encode(walletsData),
    });
  }

  async addWallet(
    input: CreateWalletInput,
    network?: NetworkProfile,
    networkCode?: string,
  ) {
    if ('accountType' in input && input.accountType === 'multichain') {
      const wallet = await this.#createWallet(input);
      const foundWallet = this.#wallets.find(
        w =>
          w.data.accountType === 'multichain' &&
          'id' in w.data &&
          'id' in wallet.data &&
          w.data.id === wallet.data.id,
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
    if (!network || !networkCode)
      throw new Error('network and networkCode are required for waves account');
    const wallet = await this.#createWallet(input, network, networkCode);
    const foundWallet = this.#getWalletsByNetwork(network).find(
      w =>
        w.data.accountType === 'waves' &&
        'address' in w.data &&
        'address' in wallet.data &&
        w.data.address === wallet.data.address,
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
      | (CreateWalletInput & {
          network: NetworkProfile;
          networkCode: string;
        })
      | Extract<CreateWalletInput, { accountType: 'multichain' }>
    >,
  ) {
    const newWallets = await Promise.all(
      inputs.map(input => {
        if ('accountType' in input && input.accountType === 'multichain') {
          return this.#createWallet(input);
        }
        return this.#createWallet(input, input.network, input.networkCode);
      }),
    );
    this.#wallets.push(...newWallets);
    await this.#saveWallets();
    newWallets.forEach(wallet => {
      this.emit('addWallet', wallet);
    });
    this.emit('updateWallets');
  }

  async removeWallet(addressOrId: string, network?: NetworkProfile) {
    let wallet;
    if (network) {
      wallet = this.#getWalletsByNetwork(network).find(
        w => w.data.accountType === 'waves' && w.data.address === addressOrId,
      );
    } else {
      wallet = this.#wallets.find(
        w => w.data.accountType === 'multichain' && w.data.id === addressOrId,
      );
    }
    if (!wallet) return;
    await this.#putWalletIntoTrash(wallet);
    this.#wallets = this.#wallets.filter(w => w !== wallet);
    await this.#saveWallets();
    this.emit('removeWallet', wallet);
    this.emit('updateWallets');
  }

  async updateNetworkCode(network: NetworkProfile, code: string | null) {
    let changed = false;

    await Promise.all(
      this.#wallets.map(async (wallet, index) => {
        if (wallet.data.accountType === 'waves') {
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

    if (
      this.#wallets.some(
        wallet => wallet.data.accountType === 'waves' && !wallet.data.network,
      )
    ) {
      this.#wallets = await Promise.all(
        this.#wallets.map(wallet => {
          if (wallet.data.accountType === 'multichain') {
            return this.#createWallet({
              accountType: 'multichain',
              type: 'seed',
              seed: wallet.data.seed,
              name: wallet.data.name,
              id: wallet.data.id,
            });
          }
          const found = findProfileByChainId(wallet.data.networkCode);
          const network = (found?.profile as NetworkProfile) || 'mainnet';
          return this.#createWallet(
            wallet.data,
            network,
            wallet.data.networkCode,
          );
        }),
      );
      await this.#saveWallets();
    }

    this.emit('updateWallets');
  }

  getWallet(
    addressOrId: string,
    networkProfile: NetworkProfile,
    chain?: Network,
  ) {
    if (chain === 'waves' || (!chain && networkProfile)) {
      const wallet = this.#getWalletsByNetwork(networkProfile).find(
        w => w.data.accountType === 'waves' && w.data.address === addressOrId,
      );
      if (wallet) return wallet;
    }

    if (chain) {
      const wallet = this.#wallets.find(
        w =>
          w.data.accountType === 'multichain' &&
          w.data.accounts[chain]?.address === addressOrId,
      );
      if (wallet) return wallet;
    }

    const multi = this.#wallets.find(
      w => w.data.accountType === 'multichain' && w.data.id === addressOrId,
    );
    if (multi) return multi;

    throw new Error(
      `Wallet not found for address/id ${addressOrId} (profile: ${networkProfile}, chain: ${chain})`,
    );
  }

  async getAccountSeed(
    address: string,
    network: NetworkProfile,
    password: string,
    chain?: Network,
  ) {
    await this.assertPasswordIsValid(password);
    return this.getWallet(address, network, chain).getSeed();
  }

  async getAccountEncodedSeed(
    address: string,
    network: NetworkProfile,
    password: string,
    chain?: Network,
  ) {
    await this.assertPasswordIsValid(password);
    return this.getWallet(address, network, chain).getEncodedSeed();
  }

  async getAccountPrivateKey(
    address: string,
    network: NetworkProfile,
    password: string,
    chain?: Network,
  ) {
    await this.assertPasswordIsValid(password);
    const privateKey = await this.getWallet(
      address,
      network,
      chain,
    ).getPrivateKey();
    return base58Encode(privateKey);
  }
}
