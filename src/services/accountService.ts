import { ExtensionStorage } from '../storage/storage';
import { type WalletAccount } from '../wallets/types';
import type { NetworkName } from '../networks/types';
import type { MultiWallet } from './types';
import ObservableStore from 'obs-store';

/**
 * AccountService acts as the single source of truth for all wallet accounts
 * in the Keeper Wallet Extension. It handles storage, retrieval, and transformation
 * of accounts between different formats.
 */
export class AccountService {
  private storage: ExtensionStorage;
  private store: ObservableStore<{
    accounts: WalletAccount[];
    multiWallets: MultiWallet[];
  }>;

  constructor(storage: ExtensionStorage) {
    this.storage = storage;

    // Initialize the store with data from storage
    this.store = new ObservableStore(
      this.storage.getInitState({
        accounts: [],
        multiWallets: [],
      })
    );

    // Subscribe the store to storage updates
    storage.subscribe(this.store);
  }

  /**
   * Get all accounts in the legacy format.
   * This is the primary method that should be used by all components that need account data.
   * Initially returns accounts directly from storage, but will be enhanced to
   * transform MultiWallets into legacy account format for backward compatibility.
   */
  getAccounts(): WalletAccount[] {
    return this.store.getState().accounts;
  }

  /**
   * Get accounts filtered by network
   * @param network The network to filter by
   */
  getAccountsByNetwork(network: NetworkName): WalletAccount[] {
    const accounts = this.getAccounts();
    return accounts.filter(account => account.network === network);
  }

  /**
   * Add a new account in the legacy format
   * @param account The account to add
   */
  addAccount(account: WalletAccount): void {
    const accounts = [...this.getAccounts(), account];
    this.store.updateState({ accounts });
  }
  
  /**
   * Add multiple accounts at once
   * @param newAccounts Array of accounts to add
   */
  batchAddAccounts(newAccounts: WalletAccount[]): void {

    if (!newAccounts.length) return;
    
    const accounts = [...this.getAccounts(), ...newAccounts];
    this.store.updateState({ accounts });
  }

  /**
   * Update an existing account
   * @param updatedAccount The updated account data
   */
  updateAccount(updatedAccount: WalletAccount): void {
    const accounts = this.getAccounts();
    const index = accounts.findIndex(
      account =>
        account.address === updatedAccount.address &&
        account.network === updatedAccount.network
    );

    if (index !== -1) {
      const updatedAccounts = [...accounts];
      updatedAccounts[index] = updatedAccount;
      this.store.updateState({ accounts: updatedAccounts });
    }
  }

  /**
   * Get MultiWallets
   * Returns all MultiWallets stored in the extension
   */
  getMultiWallets(): MultiWallet[] {
    return this.store.getState().multiWallets || [];
  }

  /**
   * Add a new MultiWallet
   * @param wallet The MultiWallet to add
   */
  addMultiWallet(wallet: MultiWallet): void {
    const multiWallets = [...this.getMultiWallets(), wallet];
    this.store.updateState({ multiWallets });
  }

  /**
   * Remove an account by address and network
   * @param address The address of the account to remove
   * @param network The network of the account to remove
   */
  removeAccount(address: string, network: NetworkName): void {
    const accounts = this.getAccounts();
    const filteredAccounts = accounts.filter(
      account => !(account.address === address && account.network === network)
    );

    this.store.updateState({ accounts: filteredAccounts });
  }
}
