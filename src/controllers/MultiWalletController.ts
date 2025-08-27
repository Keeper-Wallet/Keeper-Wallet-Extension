import { EventEmitter } from 'events';
import ObservableStore from 'obs-store';
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
import invariant from 'tiny-invariant';

import { NetworkName } from '../networks/types';
import { type ExtensionStorage } from '../storage/storage';
import { MultiWallet } from '../services/types';
import type { PreferencesController } from './preferences';

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
  getLegacyFormatAccounts;
  getAccounts;

  constructor({
    extensionStorage,
    getLegacyFormatAccounts,
    getAccounts,
  }: {
    extensionStorage: ExtensionStorage;
    getLegacyFormatAccounts: PreferencesController['getLegacyFormatAccounts'];
    getAccounts: PreferencesController['getAccounts'];
  }) {
    super();

    this.getLegacyFormatAccounts = getLegacyFormatAccounts;
    this.getAccounts = getAccounts;
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
   * Add a new multi-wallet to storage
   */
  addMultiWallet(multiWallet: MultiWallet): MultiWallet {
    // Add the new multi-wallet to the in-memory array
    this.#multiwallets.push(multiWallet);

    // Save changes to encrypted storage
    if (this.#password) {
      this.#saveMultiWallets().catch(console.error);
    } else {
      // If not yet initialized with password, just update the store state
      const state = this.store.getState();
      // this.store.updateState({
      //   MultiWalletController: {
      //     ...state.MultiWalletController,
      //     multiWallets: this.#multiwallets,
      //   },
      // });
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

  /**
   * Find a multi-wallet by ID
   */
  findMultiWalletById(id: string): MultiWallet | undefined {
    return this.#multiwallets.find(wallet => wallet.id === id);
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

  /**
   * Generate a marker for individual accounts to identify them as part of a multi-wallet
   */
  generateMultiWalletMarker(walletId: string): string {
    return `multiWallet:${walletId}`;
  }

  /**
   * Check if a string is a multi-wallet marker
   */
  isMultiWalletMarker(str: string | undefined): boolean {
    if (!str) return false;
    return str.startsWith('multiWallet:');
  }

  /**
   * Extract wallet ID from a marker
   */
  extractWalletIdFromMarker(marker: string): string | null {
    if (!this.isMultiWalletMarker(marker)) return null;
    return marker.replace('multiWallet:', '');
  }

  /**
   * Process a list of accounts, adding multi-wallet metadata where applicable
   */
  processAccounts(accounts: Array<MultiWallet>): Array<MultiWallet> {
    // This is where we could add any special handling for multi-wallet accounts
    // For now, just return the accounts as-is
    return accounts;
  }

  /**
   * Remove a multi-wallet by ID
   */
  removeMultiWallet(id: string): void {
    const initialLength = this.#multiwallets.length;

    // Filter out the wallet with the specified ID
    this.#multiwallets = this.#multiwallets.filter(wallet => wallet.id !== id);

    if (this.#multiwallets.length === initialLength) {
      // No wallet was removed
      return;
    }

    // Save the updated list to storage
    if (this.#password) {
      this.#saveMultiWallets().catch(console.error);
    } else {
      // If not initialized with password, just update the store state
      const state = this.store.getState();
      // this.store.updateState({
      //   MultiWalletController: {
      //     ...state.MultiWalletController,
      //     multiWallets: this.#multiwallets,
      //   },
      // });
    }

    this.emit('multiWalletsChanged', this.#multiwallets);
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

      // // Update the store state
      // this.store.updateState({
      //   MultiWalletController: {
      //     ...state.MultiWalletController,
      //     multiWallets: decryptedWallets,
      //   },
      // });

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
    // this.store.updateState({
    //   MultiWalletController: {
    //     ...state.MultiWalletController,
    //     multiWallets: [],
    //   },
    // });
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
        const networks =
          wallet.coins[blockChainType as keyof typeof wallet.coins]?.networks;
        // Check if the address matches any of the network addresses
        return (
          networks?.mainnet.address === address ||
          networks?.testnet.address === address ||
          networks?.stagenet?.address === address
        );
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
      const networks =
        wallet.coins[blockChainType as keyof typeof wallet.coins]?.networks;
      // Check if the address matches any of the network addresses
      return (
        networks?.mainnet.address === address ||
        networks?.testnet.address === address ||
        networks?.stagenet?.address === address
      );
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
