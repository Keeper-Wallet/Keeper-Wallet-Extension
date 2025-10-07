import {
  base58Encode,
  base64Decode,
  base64Encode,
  createPrivateKey,
  decryptSeed,
  encryptSeed,
  utf8Decode,
  utf8Encode,
} from '@keeper-wallet/waves-crypto';
import { EventEmitter } from 'events';
import ObservableStore from 'obs-store';
import invariant from 'tiny-invariant';

import { NetworkName } from '../networks/types';
import { type MultiWallet, type WalletInstance } from '../services/types';
import { type ExtensionStorage } from '../storage/storage';
import { SeedWalletStrategy } from './multiwallet/strategies/SeedWalletStrategy';
import { DebugMultiWalletStrategy } from './multiwallet/strategies/DebugMultiWalletStrategy';
import { WavesPrivateKeyStrategy } from './multiwallet/strategies/WavesPrivateKeyStrategy';
import { WavesEncodedSeedStrategy } from './multiwallet/strategies/WavesEncodedSeedStrategy';
import { WavesWxWalletStrategy } from './multiwallet/strategies/WavesWxWalletStrategy';
import { WavesLedgerWalletStrategy } from './multiwallet/strategies/WavesLedgerWalletStrategy';
import type { PreferencesController } from './preferences';
import type { IdentityApi } from './IdentityController';
import type { AssetInfoController } from './assetInfo';
import type { LedgerApi } from '../wallets/ledger';

// Type for strategy that can create wallet instances
type WalletInstanceCreator = {
  createWalletInstances(
    networks: NetworkName[],
    ...args: any[]
  ): Promise<{ [key: string]: WalletInstance }>;
};

export interface MultiWalletAccount {
  network: NetworkName;
  address: string;
}

interface MultiWalletControllerState {
  vault?: string;
  multiWallets: MultiWallet[];
}

async function encryptVault(input: MultiWallet[], password: string) {
  const json = JSON.stringify(input);
  const vault = await encryptSeed(utf8Encode(json), utf8Encode(password));
  return base64Encode(vault);
}

async function decryptVault(vault: string, password: string) {
  try {
    const decryptedData = await decryptSeed(
      base64Decode(vault),
      utf8Encode(password),
    );
    return JSON.parse(utf8Decode(decryptedData)) as MultiWallet[];
  } catch {
    throw new Error('Invalid password');
  }
}

export class MultiWalletController extends EventEmitter {
  readonly store: ObservableStore<{
    MultiWalletController: MultiWalletControllerState;
  }>;
  #password: string | null | undefined;
  #setSession;
  #multiwallets: MultiWallet[]; // Private property to store multiwallets in memory
  #identityApi: IdentityApi | null = null;
  #assetInfoController: AssetInfoController;
  #ledgerApi: LedgerApi;
  getAccounts;

  constructor({
    extensionStorage,
    getAccounts,
    assetInfoController,
    ledgerApi,
  }: {
    extensionStorage: ExtensionStorage;
    getAccounts: PreferencesController['getAccounts'];
    assetInfoController: AssetInfoController;
    ledgerApi: LedgerApi;
  }) {
    super();

    this.getAccounts = getAccounts;
    this.#assetInfoController = assetInfoController;
    this.#ledgerApi = ledgerApi;

    // Initialize store with extension storage
    this.store = new ObservableStore(
      extensionStorage.getInitState({
        MultiWalletController: { vault: undefined, multiWallets: [] },
      }),
    );

    extensionStorage.subscribe(this.store);
    this.#password = extensionStorage.getInitSession().password;
    this.#setSession = extensionStorage.setSession.bind(extensionStorage);
    this.#multiwallets = []; // Initialize empty array

    if (this.#password) {
      this.#restoreMultiWallets(this.#password).catch(console.error);
    }
  }

  /**
   * Set the IdentityApi for WX wallet support
   * Must be called after IdentityController is initialized
   */
  setIdentityApi(identityApi: IdentityApi): void {
    this.#identityApi = identityApi;
  }

  /**
   * Add a new multi-wallet to storage and create wallet instances
   */
  async addMultiWallet(multiWallet: MultiWallet): Promise<MultiWallet> {
    if (!this.#password) {
      throw new Error(
        'Password must be set before creating wallets. Please unlock the vault first.',
      );
    }

    // Validate wallet doesn't already exist
    const existingWallet = this.#multiwallets.find(
      wallet => wallet.id === multiWallet.id,
    );
    if (existingWallet) {
      throw new Error(`Multi-wallet with ID ${multiWallet.id} already exists`);
    }

    // Create wallet instances for signing operations
    try {
      const walletInstances = await this.#restoreWalletInstances(multiWallet);
      if (walletInstances) {
        multiWallet.walletInstances = walletInstances;
      } else {
        console.warn(
          `No wallet instances created for ${multiWallet.type} wallet ${multiWallet.id}`,
        );
      }
    } catch (error) {
      console.error('Failed to create wallet instances:', error);
      throw error; // Re-throw to prevent adding wallet without instances
    }

    // Add the new multi-wallet to the in-memory array
    this.#multiwallets.push(multiWallet);

    // Save changes to encrypted storage
    if (this.#password) {
      this.#saveMultiWallets().catch(error => {
        console.error(
          'Failed to save multi-wallets to encrypted storage:',
          error,
        );
        // Remove from memory if save failed
        this.#multiwallets = this.#multiwallets.filter(
          wallet => wallet.id !== multiWallet.id,
        );
        throw new Error('Failed to save wallet to encrypted storage');
      });
    } else {
      // If not yet initialized with password, update the store state
      const state = this.store.getState();
      this.store.updateState({
        MultiWalletController: {
          ...state.MultiWalletController,
          multiWallets: this.#multiwallets,
        },
      });
    }

    this.emit('multiWalletsChanged', this.#multiwallets);

    return multiWallet;
  }

  /**
   * Get all multi-wallets
   */
  getMultiWallets(): MultiWallet[] {
    // Return a copy of the in-memory array to prevent direct modification
    return [...this.#multiwallets];
  }

  async getWalletForSigning(
    address: string,
    network: NetworkName,
  ): Promise<WalletInstance> {
    // Find the MultiWallet from stored wallets
    const multiWallet = this.findMultiWalletByAccount(address, network);

    if (!multiWallet) {
      throw new Error(
        `Wallet with address ${address} on network ${network} not found`,
      );
    }

    // Return wallet instance if available
    if (multiWallet.walletInstances && multiWallet.walletInstances[network]) {
      return multiWallet.walletInstances[network];
    }

    // If no wallet instance available, try to create one on demand
    console.warn(
      `Wallet instance not found for ${address} on ${network}. Attempting to create...`,
    );

    try {
      const walletInstances = await this.#restoreWalletInstances(multiWallet);
      if (walletInstances && walletInstances[network]) {
        multiWallet.walletInstances = walletInstances;
        return walletInstances[network];
      }
    } catch (error) {
      console.error('Failed to create wallet instance on demand:', error);
    }

    throw new Error(
      `Wallet instance not available for address ${address} on network ${network}. Please ensure wallet instances are created.`,
    );
  }

  /**
   * Restore wallet instances from stored wallet data
   */
  async #restoreWalletInstances(
    multiWallet: MultiWallet,
  ): Promise<{ [key: string]: WalletInstance } | null> {
    try {
      const strategy = this.#createStrategyFromMultiWallet(multiWallet);
      if (!strategy) {
        return null;
      }

      const networks = this.#extractNetworksFromMultiWallet(multiWallet);
      if (networks.length === 0) {
        return null;
      }

      // For WX wallets, pass identityApi
      if (
        multiWallet.type === 'wx' &&
        strategy instanceof WavesWxWalletStrategy
      ) {
        if (!this.#identityApi) {
          throw new Error(
            'IdentityApi not available for WX wallet creation. Ensure setIdentityApi() is called first.',
          );
        }
        return await strategy.createWalletInstances(
          networks,
          this.#identityApi,
        );
      }

      // For Ledger wallets, pass ledgerApi and assetInfoController
      if (
        multiWallet.type === 'ledger' &&
        strategy instanceof WavesLedgerWalletStrategy
      ) {
        return await strategy.createWalletInstances(
          networks,
          this.#ledgerApi,
          this.#assetInfoController,
        );
      }

      return await strategy.createWalletInstances(networks);
    } catch (error) {
      console.error('Error creating wallet instances from MultiWallet:', error);
      return null;
    }
  }

  /**
   * Create appropriate strategy from MultiWallet data
   */
  #createStrategyFromMultiWallet(
    multiWallet: MultiWallet,
  ): WalletInstanceCreator | null {
    try {
      switch (multiWallet.type) {
        case 'seed': {
          if (!multiWallet.seed) return null;
          return new SeedWalletStrategy(multiWallet.seed);
        }

        case 'privateKey': {
          if (!multiWallet.privateKey) return null;
          return new WavesPrivateKeyStrategy(multiWallet.privateKey);
        }

        case 'encodedSeed': {
          if (!multiWallet.encodedSeed) return null;
          return new WavesEncodedSeedStrategy(multiWallet.encodedSeed);
        }

        case 'wx': {
          const wxData = multiWallet.coins.waves;
          if (!wxData?.publicKey || !wxData?.networks?.mainnet?.address)
            return null;
          if (!multiWallet.wxUuid || !multiWallet.wxUsername) return null;

          return new WavesWxWalletStrategy(
            multiWallet.wxUuid,
            multiWallet.wxUsername,
            wxData.publicKey,
            wxData.networks.mainnet.address,
          );
        }

        case 'ledger': {
          const ledgerData = multiWallet.coins.waves;
          if (!ledgerData?.publicKey || !multiWallet.ledgerId) return null;

          return new WavesLedgerWalletStrategy(
            multiWallet.ledgerId,
            ledgerData.publicKey,
            ledgerData.networks.mainnet.address,
          );
        }

        case 'debug': {
          const debugAddress =
            multiWallet.coins.waves?.networks?.mainnet?.address;
          if (!debugAddress) return null;
          return new DebugMultiWalletStrategy(debugAddress);
        }

        default: {
          console.warn(
            `Unsupported wallet type for instance creation: ${multiWallet.type}`,
          );
          return null;
        }
      }
    } catch (error) {
      console.error('Error creating strategy from MultiWallet:', error);
      return null;
    }
  }

  /**
   * Extract network names from MultiWallet structure
   */
  #extractNetworksFromMultiWallet(multiWallet: MultiWallet): NetworkName[] {
    const networks: NetworkName[] = [];

    // Extract Waves networks
    if (multiWallet.coins.waves?.networks) {
      const wavesNetworks = multiWallet.coins.waves.networks;
      if (wavesNetworks.mainnet) networks.push(NetworkName.Mainnet);
      if (wavesNetworks.testnet) networks.push(NetworkName.Testnet);
      if (wavesNetworks.stagenet) networks.push(NetworkName.Stagenet);
      if (wavesNetworks.custom) networks.push(NetworkName.Custom);
    }

    // Extract Unit0 networks
    if (multiWallet.coins.unit0?.networks) {
      const unit0Networks = multiWallet.coins.unit0.networks;
      if (unit0Networks.mainnet) networks.push(NetworkName.unit0MainNet);
      if (unit0Networks.testnet) networks.push(NetworkName.unit0Testnet);
    }

    return networks;
  }

  /**
   * Find a multi-wallet that contains an account with the given address and network
   */
  findMultiWalletByAccount(
    address: string,
    network: NetworkName,
  ): MultiWallet | undefined {
    return this.#multiwallets.find(wallet => {
      // Check if this wallet has the requested address in any of its networks
      const wavesNetworks = wallet.coins.waves?.networks;
      if (wavesNetworks) {
        if (
          wavesNetworks.mainnet?.address === address &&
          network === NetworkName.Mainnet
        ) {
          return true;
        }
        if (
          wavesNetworks.testnet?.address === address &&
          network === NetworkName.Testnet
        ) {
          return true;
        }
        if (
          wavesNetworks.stagenet?.address === address &&
          network === NetworkName.Stagenet
        ) {
          return true;
        }
      }

      // Check Unit0 networks if they exist
      const unit0Networks = wallet.coins.unit0?.networks;
      if (unit0Networks) {
        if (unit0Networks.mainnet?.address === address) {
          return true;
        }
        if (unit0Networks.testnet?.address === address) {
          return true;
        }
      }

      return false;
    });
  }

  // VaultController-required methods

  async #setPassword(password: string | null) {
    if (password?.length === 0) {
      throw new Error('Password is required');
    }
    this.#password = password;
    this.#setSession({ password });
  }

  async #saveMultiWallets(wallets?: MultiWallet[]) {
    if (!this.#password) {
      throw new Error('Password is required to save multi-wallets');
    }
    invariant(this.#password);
    const walletsToSave = wallets || this.#multiwallets;

    const vault = await encryptVault(walletsToSave, this.#password);

    this.store.updateState({
      MultiWalletController: {
        ...this.store.getState().MultiWalletController,
        vault,
      },
    });

    // Create sanitized copy for emitting event
    const sanitizedWallets = JSON.parse(
      JSON.stringify(walletsToSave),
    ) as MultiWallet[];
    sanitizedWallets.forEach(wallet => {
      delete wallet.seed;
      delete wallet.privateKey;
    });

    this.emit('multiWalletsChanged', sanitizedWallets);
    return sanitizedWallets;
  }

  async updateVault(walletsToSave: MultiWallet[]) {
    const vault = await encryptVault(walletsToSave, this.#password as string);
    this.store.updateState({
      MultiWalletController: {
        ...this.store.getState().MultiWalletController,
        vault,
      },
    });
  }

  async #restoreMultiWallets(password: string) {
    if (!password) throw new Error('Password is required');

    const state = this.store.getState();
    const { vault } = state.MultiWalletController;

    if (!vault) return;

    try {
      // Decrypt the vault and populate the in-memory array
      const decryptedWallets = await decryptVault(vault, password);
      this.#multiwallets = decryptedWallets;

      // Recreate wallet instances for each restored wallet
      for (const wallet of this.#multiwallets) {
        try {
          const walletInstances = await this.#restoreWalletInstances(wallet);
          if (walletInstances) {
            wallet.walletInstances = walletInstances;
          }
        } catch (error) {
          console.warn(
            `Failed to create wallet instances for wallet ${wallet.id}:`,
            error,
          );
          // Continue with other wallets even if one fails
        }
      }

      // Update the store state
      this.store.updateState({
        MultiWalletController: {
          ...state.MultiWalletController,
          multiWallets: decryptedWallets,
        },
      });

      // Create deep copy of wallets and remove sensitive data before emitting
      const sanitizedWallets = JSON.parse(
        JSON.stringify(decryptedWallets),
      ) as MultiWallet[];

      // Remove seed from each wallet in the sanitized copy
      sanitizedWallets.forEach(wallet => {
        delete wallet.seed;
        delete wallet.privateKey;
      });

      this.emit('multiWalletsChanged', sanitizedWallets);
    } catch (error) {
      console.error('Failed to restore multi-wallets:', error);
      throw error;
    }
  }

  async initVault(password: string) {
    await this.#setPassword(password);
    await this.#saveMultiWallets();
  }

  lock() {
    this.#setPassword(null);
    // Clear sensitive data from memory
    this.#multiwallets = [];

    // Update store state
    const state = this.store.getState();
    this.store.updateState({
      MultiWalletController: {
        ...state.MultiWalletController,
        multiWallets: [],
      },
    });
  }

  async unlock(password: string) {
    await this.#restoreMultiWallets(password);
    await this.#setPassword(password);
  }

  async newPassword(oldPassword: string, newPassword: string) {
    await this.#restoreMultiWallets(oldPassword);
    await this.#setPassword(newPassword);
    await this.#saveMultiWallets();
  }

  async deleteVault() {
    this.#multiwallets = [];
    await this.#setPassword(null);

    this.store.updateState({
      MultiWalletController: {
        vault: undefined,
        multiWallets: [],
      },
    });
    this.emit('multiWalletsChanged', []);
    this.emit('saveAccounts', []);
  }

  // This method is needed for VaultController.migrate()
  async assertPasswordIsValid(password: string) {
    await this.#restoreMultiWallets(password);
  }

  /**
   * Find a wallet that contains an account with the given address for a specific blockchain type
   */
  async #findMatchedWallet(
    address: string,
    blockChainType: string,
    password: string,
  ): Promise<MultiWallet | undefined> {
    // First try to find in the in-memory wallets if they're already loaded
    if (this.#multiwallets.length > 0) {
      return this.#multiwallets.find(wallet => {
        // Type-safe access based on blockchain type
        if (blockChainType === 'waves') {
          const wavesNetworks = wallet.coins.waves?.networks;
          return (
            wavesNetworks?.mainnet?.address === address ||
            wavesNetworks?.testnet?.address === address ||
            wavesNetworks?.stagenet?.address === address
          );
        } else if (blockChainType === 'unit0') {
          const unit0Networks = wallet.coins.unit0?.networks;
          return (
            unit0Networks?.mainnet?.address === address ||
            unit0Networks?.testnet?.address === address
          );
        }
        return false;
      });
    }

    // If not in memory, try to decrypt the vault
    const state = this.store.getState();
    const { vault } = state.MultiWalletController;
    if (!vault) return undefined;

    const decryptedWallets = await decryptVault(vault, password);
    // Store the decrypted wallets in memory
    this.#multiwallets = decryptedWallets;

    return decryptedWallets.find(wallet => {
      // Type-safe access based on blockchain type
      if (blockChainType === 'waves') {
        const wavesNetworks = wallet.coins.waves?.networks;
        return (
          wavesNetworks?.mainnet?.address === address ||
          wavesNetworks?.testnet?.address === address ||
          wavesNetworks?.stagenet?.address === address
        );
      } else if (blockChainType === 'unit0') {
        const unit0Networks = wallet.coins.unit0?.networks;
        return (
          unit0Networks?.mainnet?.address === address ||
          unit0Networks?.testnet?.address === address
        );
      }
      return false;
    });
  }

  async getAccountPrivateKey(
    address: string,
    blockChainType: string,
    password: string,
  ): Promise<string | undefined> {
    // Validate password
    await this.assertPasswordIsValid(password);

    // Find the wallet with matching address
    const matchedWallet = await this.#findMatchedWallet(
      address,
      blockChainType,
      password,
    );

    if (matchedWallet?.privateKey) {
      return matchedWallet?.privateKey;
    }
    if (!matchedWallet?.seed) return;
    const privateKey = await createPrivateKey(utf8Encode(matchedWallet.seed!));
    return base58Encode(privateKey);
  }

  async getAccountSeed(
    address: string,
    blockChainType: string,
    password: string,
  ) {
    await this.assertPasswordIsValid(password);
    const matchedWallet = await this.#findMatchedWallet(
      address,
      blockChainType,
      password,
    );

    return matchedWallet?.seed ?? '';
  }

  /**
   * Returns decrypted vault contents
   * @param password - Password to decrypt the vault
   * @returns Promise that resolves to an array of MultiWallet objects
   * @throws Error if password is invalid or vault doesn't exist
   */
  async getDecryptedVault(password: string): Promise<MultiWallet[]> {
    // If we already have decrypted wallets in memory, return a copy
    if (this.#multiwallets.length > 0 && this.#password === password) {
      return JSON.parse(JSON.stringify(this.#multiwallets)) as MultiWallet[];
    }

    const state = this.store.getState();
    const { vault } = state.MultiWalletController;

    if (!vault) {
      throw new Error('Vault does not exist');
    }

    try {
      // Use the existing decryptVault function to decrypt the vault
      const decryptedWallets = await decryptVault(vault, password);
      return decryptedWallets;
    } catch (error) {
      console.error('Failed to decrypt vault:', error);
      throw error;
    }
  }

  async removeWallet(id: string) {
    const multiWallets = this.getAccounts() as unknown as MultiWallet[];

    // Find wallets where the address matches any network address
    this.#multiwallets = multiWallets.filter(wallet => {
      if (!wallet.coins?.waves?.networks) {
        return true; // Keep non-waves wallets
      }

      const wavesNetworks = wallet.coins.waves.networks;

      // Check if address matches any network address
      const hasMatchingAddress =
        wavesNetworks.mainnet?.address === id ||
        wavesNetworks.testnet?.address === id ||
        wavesNetworks.stagenet?.address === id;

      // Keep wallets that DON'T match the address (filter out matching ones)
      return !hasMatchingAddress;
    });
    this.updateVault(this.#multiwallets);
    this.emit('saveAccounts', this.#multiwallets);
  }
}
