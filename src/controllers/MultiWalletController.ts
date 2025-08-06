import { EventEmitter } from 'events';
import ObservableStore from 'obs-store';

import { NetworkName } from '../networks/types';
import { type ExtensionStorage } from '../storage/storage';
import { MultiWallet } from '../services/types';

export interface MultiWalletAccount {
  network: NetworkName;
  address: string;
}


interface MultiWalletControllerState {
  multiWallets: MultiWallet[];
}

export class MultiWalletController extends EventEmitter {
  readonly store: ObservableStore<{ MultiWalletController: MultiWalletControllerState }>;

  constructor({ extensionStorage }: { extensionStorage: ExtensionStorage }) {
    super();

    // Initialize store with extension storage
    this.store = new ObservableStore(
      extensionStorage.getInitState({
        MultiWalletController: { multiWallets: [] }
      })
    );

    // TODO: maybe we will use it  for adding vault
    // extensionStorage.subscribe(this.store);
  }

  /**
   * Add a new multi-wallet to storage
   */
  addMultiWallet(multiWallet: MultiWallet): void {
    const state = this.store.getState();
    const { multiWallets } = state.MultiWalletController;

    // Add the new multi-wallet
    const updatedWallets = [...multiWallets, multiWallet];

    // Save to store
    this.store.updateState({
      MultiWalletController: {
        multiWallets: updatedWallets
      }
    });

    console.log(updatedWallets, 'updatedWallets');
    // Emit change event
    this.emit('multiWalletsChanged', updatedWallets);
    console.log('MultiWallet added:', multiWallet.name);
  }

  /**
   * Get all multi-wallets
   */
  getMultiWallets(): MultiWallet[] {
    const state = this.store.getState();
    return state.MultiWalletController.multiWallets;
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
  findMultiWalletByAccount(address: string, network: NetworkName): MultiWallet | undefined {
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
        multiWallets: updatedWallets
      }
    });

    this.emit('multiWalletsChanged', updatedWallets);
  }
}
