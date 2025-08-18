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
  getLegacyFormatAccounts;

  constructor({
    extensionStorage,
    getLegacyFormatAccounts,
  }: {
    extensionStorage: ExtensionStorage;
    getLegacyFormatAccounts: PreferencesController['getLegacyFormatAccounts'];
  }) {
    super();

    this.getLegacyFormatAccounts = getLegacyFormatAccounts;
    // Initialize store with extension storage
    this.store = new ObservableStore(
      extensionStorage.getInitState({
        MultiWalletController: { vault: undefined, multiWallets: [] },
      }),
    );

    extensionStorage.subscribe(this.store);
    this.#password = extensionStorage.getInitSession().password;
    this.#setSession = extensionStorage.setSession.bind(extensionStorage);

    if (this.#password) {
      this.#restoreMultiWallets(this.#password).catch(console.error);
    }
  }

  /**
   * Add a new multi-wallet to storage
   */
   addMultiWallet(multiWallet: MultiWallet): MultiWallet {
    const state = this.store.getState();
    const { multiWallets } = state.MultiWalletController;

    // Add the new multi-wallet
    const updatedWallets = [...multiWallets, multiWallet];

    this.emit('multiWalletsChanged', updatedWallets);

    return multiWallet;
    // Emit change event
  }

  /**
   * Get all multi-wallets
   */
  getMultiWallets(): MultiWallet[] {
    const state = this.store.getState();
    return state.MultiWalletController.multiWallets || [];
  }

  /**
   * Find a multi-wallet by ID
   */
  findMultiWalletById(id: string): MultiWallet | undefined {
    const multiWallets = this.getMultiWallets();
    return multiWallets.find(wallet => wallet.id === id);
  }

  /**
   * Find a multi-wallet that contains an account with the given address and network
   */
  findMultiWalletByAccount(
    address: string,
    network: NetworkName,
  ): MultiWallet | undefined {
    const multiWallets = this.getMultiWallets();

    //TODO: need to write logic for it
    return multiWallets.find(wallet => true);
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
    const state = this.store.getState();
    const { multiWallets } = state.MultiWalletController;

    const updatedWallets = multiWallets.filter(wallet => wallet.id !== id);

    if (updatedWallets.length === multiWallets.length) {
      // No wallet was removed
      return;
    }

    this.store.updateState({
      MultiWalletController: {
        ...state.MultiWalletController,
        multiWallets: updatedWallets,
      },
    });

    this.emit('multiWalletsChanged', updatedWallets);
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

    const multiWallets = wallets || this.getMultiWallets();
    const vault = await encryptVault(multiWallets, this.#password);

    this.store.updateState({
      MultiWalletController: {
        ...this.store.getState().MultiWalletController,
        vault,
      },
    });

    multiWallets.forEach(wallet => {
      delete wallet.seed;
    });
    this.emit('multiWalletsChanged', multiWallets);
    return multiWallets;
  }

  async #restoreMultiWallets(password: string) {
    if (!password) throw new Error('Password is required');

    const state = this.store.getState();
    const { vault } = state.MultiWalletController;

    if (!vault) return;

    try {
      const decryptedWallets = await decryptVault(vault, password);

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
    await this.#setPassword(null);
    this.store.updateState({
      MultiWalletController: {
        vault: undefined,
        multiWallets: [],
      },
    });
    this.emit('multiWalletsChanged', []);
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
    const state = this.store.getState();
    const { vault } = state.MultiWalletController;
    if (!vault) return undefined;

    const decryptedWallets = await decryptVault(vault, password);

    return decryptedWallets.find(wallet => {
      const networks =
        wallet.coins[blockChainType as keyof typeof wallet.coins]?.networks;
      // Check if the address matches any of the network addresses
      return (
        networks?.mainnet.address === address ||
        networks?.testnet.address === address ||
        networks?.stagenet.address === address
      );
    });
  }

  async getAccountPrivateKey(
    address: string,
    network: NetworkName,
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
}
