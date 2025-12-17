import {
  base58Decode,
  base58Encode,
  base64Decode,
  base64Encode,
  createAddress,
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

export interface MultiWalletAccount {
  network: NetworkName;
  address: string;
}

interface MultiWalletControllerState {
  vault?: string;
}

async function encryptVault(input: MultiWallet[], password: string) {
  // Remove walletInstances before serialization (they are runtime-only)
  const walletsToSerialize = input.map(wallet => {
    const { walletInstances, ...walletData } = wallet;
    return walletData;
  });
  const json = JSON.stringify(walletsToSerialize);
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
  #restorationPromise: Promise<void> | null = null; // Track restoration state
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
        MultiWalletController: { vault: undefined },
      }),
    );

    extensionStorage.subscribe(this.store);
    this.#password = extensionStorage.getInitSession().password;
    this.#setSession = extensionStorage.setSession.bind(extensionStorage);
    this.#multiwallets = []; // Initialize empty array

    if (this.#password) {
      // Store the restoration promise so we can wait for it
      this.#restorationPromise = this.#restoreMultiWallets(
        this.#password,
      ).catch(error => {
        console.error('Failed to restore multiwallets:', error);
        this.#restorationPromise = null;
      });
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
      // Use a key that can be translated in the UI
      const error = new Error(
        `Multi-wallet with ID ${multiWallet.id} already exists`,
      );
      (error as any).code = 'WALLET_ALREADY_EXISTS';
      (error as any).walletId = multiWallet.id;
      throw error;
    }

    const restoredInstances = await this.#restoreWalletInstances(multiWallet);
    if (restoredInstances) {
      multiWallet.walletInstances = restoredInstances;
    }

    // Add the new multi-wallet to the in-memory array
    this.#multiwallets.push(multiWallet);

    // Save changes to encrypted storage
    if (this.#password) {
      try {
        await this.#saveMultiWallets();
      } catch (error) {
        // Remove from memory if save failed
        this.#multiwallets = this.#multiwallets.filter(
          wallet => wallet.id !== multiWallet.id,
        );
        const err = new Error('Failed to save wallet to encrypted storage');
        (err as any).code = 'FAILED_TO_SAVE';
        throw err;
      }
    }

    // Emit sanitized wallets
    const sanitizedForEvent = this.getMultiWallets();
    this.emit('multiWalletsChanged', sanitizedForEvent);

    // Return sanitized wallet (remove walletInstances and sensitive data)
    const {
      walletInstances: _,
      seed,
      privateKey,
      encodedSeed,
      ...sanitizedWallet
    } = multiWallet;
    return sanitizedWallet as MultiWallet;
  }

  /**
   * Get all multi-wallets (sanitized - without sensitive data)
   */
  getMultiWallets(): MultiWallet[] {
    // Return wallets without walletInstances and sensitive data
    return this.#multiwallets.map(wallet => {
      const {
        walletInstances,
        seed,
        privateKey,
        encodedSeed,
        ...sanitizedWallet
      } = wallet;
      return sanitizedWallet as MultiWallet;
    });
  }

  /**
   * Update wallets with custom network addresses
   * Updates the internal #multiwallets array and saves to vault
   */
  async updateWalletsWithCustomNetwork(networkCode: string): Promise<boolean> {
    let hasUpdates = false;

    // Update #multiwallets directly to preserve sensitive data
    for (const wallet of this.#multiwallets) {
      // Skip if custom address already exists
      if (wallet.coins?.waves?.networks?.custom) {
        continue;
      }

      // Skip if no Waves coin data or public key
      if (!wallet.coins?.waves?.publicKey) {
        continue;
      }

      try {
        // Use the public key to generate custom address
        const publicKey = base58Decode(wallet.coins.waves.publicKey);
        const customAddress = base58Encode(
          createAddress(publicKey, networkCode.charCodeAt(0)),
        );

        // Update the wallet in place
        if (!wallet.coins.waves.networks) {
          wallet.coins.waves.networks = {} as any;
        }

        wallet.coins.waves.networks.custom = {
          address: customAddress,
          networkCode,
        };

        hasUpdates = true;
      } catch (error) {
        console.error(
          `Failed to generate custom address for ${wallet.name}:`,
          error,
        );
      }
    }

    // Save to vault if there were updates
    if (hasUpdates) {
      await this.#saveMultiWallets();
    }

    return hasUpdates;
  }

  async getWalletForSigning(
    address: string,
    network: NetworkName,
  ): Promise<WalletInstance> {
    // Wait for restoration to complete if it's in progress
    if (this.#restorationPromise) {
      try {
        await this.#restorationPromise;
      } catch (error) {
        console.error('Restoration failed, continuing anyway:', error);
      }
    }

    // Find the MultiWallet from stored wallets
    const multiWallet = this.findMultiWalletByAccount(address, network);

    if (!multiWallet) {
      throw new Error(
        `Wallet with address ${address} on network ${network} not found. ` +
          `Total wallets loaded: ${this.#multiwallets.length}. ` +
          `Please ensure the wallet is unlocked and properly restored. ` +
          `If you just upgraded, try logging out and back in to migrate your wallets.`,
      );
    }

    // Return wallet instance if available
    if (multiWallet.walletInstances?.[network]) {
      return multiWallet.walletInstances[network];
    }

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

      // Get custom network code from wallet data if available
      const customCode = multiWallet.coins.waves?.networks?.custom?.networkCode;

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

      // For seed-based wallets (seed, privateKey, encodedSeed), pass customCode
      if (
        strategy instanceof SeedWalletStrategy ||
        strategy instanceof WavesPrivateKeyStrategy ||
        strategy instanceof WavesEncodedSeedStrategy
      ) {
        return await strategy.createWalletInstances(networks, customCode);
      }

      return await strategy.createWalletInstances(networks);
    } catch (error) {
      return null;
    }
  }

  /**
   * Create appropriate strategy from MultiWallet data
   */
  #createStrategyFromMultiWallet(
    multiWallet: MultiWallet,
  ):
    | (
        | SeedWalletStrategy
        | WavesPrivateKeyStrategy
        | WavesEncodedSeedStrategy
        | WavesWxWalletStrategy
        | WavesLedgerWalletStrategy
        | DebugMultiWalletStrategy
      )
    | null {
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

          if (!ledgerData?.publicKey || multiWallet.ledgerId === undefined) {
            return null;
          }

          // Get mainnet address, fallback to testnet or stagenet if mainnet not available
          const address =
            ledgerData.networks?.mainnet?.address ||
            ledgerData.networks?.testnet?.address ||
            ledgerData.networks?.stagenet?.address;

          if (!address) {
            return null;
          }

          return new WavesLedgerWalletStrategy(
            multiWallet.ledgerId,
            ledgerData.publicKey,
            address,
          );
        }

        case 'debug': {
          const debugAddress =
            multiWallet.coins.waves?.networks?.mainnet?.address;
          if (!debugAddress) return null;
          return new DebugMultiWalletStrategy(debugAddress);
        }

        default: {
          return null;
        }
      }
    } catch (error) {
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
      if (unit0Networks.mainnet) networks.push(NetworkName.Mainnet);
      if (unit0Networks.testnet) networks.push(NetworkName.Testnet);
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
        if (
          wavesNetworks.custom?.address === address &&
          network === NetworkName.Custom
        ) {
          return true;
        }
      }

      // Check Unit0 networks if they exist
      const unit0Networks = wallet.coins.unit0?.networks;
      if (unit0Networks) {
        if (
          unit0Networks.mainnet?.address === address &&
          network === NetworkName.Mainnet
        ) {
          return true;
        }
        if (
          unit0Networks.testnet?.address === address &&
          network === NetworkName.Testnet
        ) {
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

    // Create sanitized copy for emitting event (remove walletInstances and sensitive data)
    const sanitizedWallets = walletsToSave.map(wallet => {
      const {
        walletInstances,
        seed,
        privateKey,
        encodedSeed,
        ...sanitizedWallet
      } = wallet;
      return sanitizedWallet as MultiWallet;
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

    if (!vault) {
      this.#restorationPromise = null;
      return;
    }

    try {
      // Decrypt the vault and populate the in-memory array
      const decryptedWallets = await decryptVault(vault, password);
      this.#multiwallets = decryptedWallets;

      // Recreate wallet instances for each restored wallet
      for (const wallet of this.#multiwallets) {
        // Clear any old serialized walletInstances (they lost their methods during JSON serialization)
        delete wallet.walletInstances;

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

      // Create sanitized copy for emitting event (remove walletInstances and sensitive data)
      const sanitizedWallets = decryptedWallets.map(wallet => {
        const {
          walletInstances,
          seed,
          privateKey,
          encodedSeed,
          ...sanitizedWallet
        } = wallet;
        return sanitizedWallet as MultiWallet;
      });
      this.emit('multiWalletsChanged', sanitizedWallets);

      // Clear the restoration promise on success
      this.#restorationPromise = null;
    } catch (error) {
      this.#restorationPromise = null;
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
  }

  async unlock(password: string) {
    this.#restorationPromise = this.#restoreMultiWallets(password);
    await this.#restorationPromise;
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
   * @returns Promise that resolves to an array of MultiWallet objects (without walletInstances)
   * @throws Error if password is invalid or vault doesn't exist
   */
  async getDecryptedVault(password: string): Promise<MultiWallet[]> {
    // If we already have decrypted wallets in memory, return a copy without walletInstances
    if (this.#multiwallets.length > 0 && this.#password === password) {
      return this.#multiwallets.map(wallet => {
        const { walletInstances, ...walletData } = wallet;
        return walletData as MultiWallet;
      });
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
      throw error;
    }
  }

  async removeWallet(id: string) {
    // Filter directly from #multiwallets to preserve sensitive data
    this.#multiwallets = this.#multiwallets.filter(wallet => {
      const wavesNetworks = wallet.coins.waves?.networks;
      const unit0Networks = wallet.coins.unit0?.networks;

      const matchesWaves = wavesNetworks
        ? wavesNetworks.mainnet?.address === id ||
          wavesNetworks.testnet?.address === id ||
          wavesNetworks.stagenet?.address === id
        : false;

      const matchesUnit0 = unit0Networks
        ? unit0Networks.mainnet?.address === id ||
          unit0Networks.testnet?.address === id
        : false;

      const hasMatchingAddress = matchesWaves || matchesUnit0;

      // Keep wallets that DON'T match the address (filter out matching ones)
      return !hasMatchingAddress;
    });

    await this.#saveMultiWallets();
    this.emit('saveAccounts', this.getMultiWallets());
  }

  /**
   * Regenerate custom network addresses for all wallets when network code changes
   * This is called from NetworkController when custom network code is updated
   */
  async regenerateCustomNetworkAddresses(newNetworkCode: string) {
    if (!this.#password) {
      throw new Error('Wallet is locked. Cannot regenerate addresses.');
    }

    let hasUpdates = false;

    // Update #multiwallets directly (same approach as updateWalletsWithCustomNetwork)
    for (const wallet of this.#multiwallets) {
      // Skip if wallet doesn't have Waves custom network
      if (!wallet.coins?.waves?.networks?.custom) {
        continue;
      }

      // Skip if no Waves public key
      if (!wallet.coins?.waves?.publicKey) {
        continue;
      }

      try {
        // Use the public key to generate custom address (same as updateWalletsWithCustomNetwork)
        const publicKey = base58Decode(wallet.coins.waves.publicKey);
        const customAddress = base58Encode(
          createAddress(publicKey, newNetworkCode.charCodeAt(0)),
        );

        // Update the wallet in place
        wallet.coins.waves.networks.custom = {
          address: customAddress,
          networkCode: newNetworkCode,
        };

        // Remove old custom wallet instance - it will be recreated on demand
        if (wallet.walletInstances?.[NetworkName.Custom]) {
          delete wallet.walletInstances[NetworkName.Custom];
        }

        hasUpdates = true;
      } catch (error) {
        console.error(
          `Failed to regenerate custom address for ${wallet.name}:`,
          error,
        );
      }
    }

    // Save to vault if there were updates (same pattern as updateWalletsWithCustomNetwork)
    if (hasUpdates) {
      await this.#saveMultiWallets();
    }

    return hasUpdates;
  }
}
