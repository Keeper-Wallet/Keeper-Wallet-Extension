import EventEmitter from 'events';
import { type NetworkName } from 'networks/types';
import ObservableStore from 'obs-store';
import { type IdleOptions, PreferencesAccount } from 'preferences/types';
import { compareAccountsByLastUsed } from 'preferences/utils';
import { type WalletAccount } from 'wallets/types';

import { type ExtensionStorage } from '../storage/storage';
import { type NetworkController } from './network';
import { MultiWallet } from '../services/types';

export class PreferencesController extends EventEmitter {
  store;
  private getNetwork;
  private getCurrentBlockchainType;

  constructor({
    extensionStorage,
    initLangCode,
    getNetwork,
    getCurrentBlockchainType,
  }: {
    extensionStorage: ExtensionStorage;
    initLangCode: string | null | undefined;
    getNetwork: NetworkController['getNetwork'];
    getCurrentBlockchainType: NetworkController['getCurrentBlockchainType'];
  }) {
    super();

    this.store = new ObservableStore(
      extensionStorage.getInitState({
        currentLocale: initLangCode || 'en',
        idleOptions: { type: '1h', interval: 60 * 60 * 1000 },
        accounts: [],
        selectedAccount: undefined,
      }),
    );

    extensionStorage.subscribe(this.store);

    this.getNetwork = getNetwork;
    this.getCurrentBlockchainType = getCurrentBlockchainType;
  }

  getAccounts() {
    const { accounts } = this.store.getState();

    return accounts;
  }

  getSelectedAccount() {
    return this.store.getState().selectedAccount;
  }

  setCurrentLocale(key: string) {
    this.store.updateState({ currentLocale: key });
  }

  setIdleOptions(options: IdleOptions) {
    this.store.updateState({ idleOptions: options });
  }

  syncAccounts(wallets: (WalletAccount | MultiWallet)[]) {
    const multiWallets = wallets as MultiWallet[];
    const oldAccounts = this.store.getState()
      .accounts as unknown as MultiWallet[];

    // Create a map of existing accounts by ID for quick lookup
    const accountsById = new Map();

    // Add old accounts to the map first (keeping existing accounts as priority)
    oldAccounts.forEach(account => {
      if (account.id) {
        accountsById.set(account.id, account);
      }
    });

    // Add new accounts or update existing ones
    multiWallets.forEach(wallet => {
      if (wallet.id) {
        // If this ID doesn't exist in our map, or we want to update it
        // You could add logic here to decide whether to update or keep old account
        accountsById.set(wallet.id, wallet);
      }
    });

    // Convert map back to array
    const accounts = Array.from(accountsById.values());

    this.store.updateState({ accounts });
    this.ensureSelectedAccountInCurrentNetwork();
  }

  ensureSelectedAccountInCurrentNetwork() {
    const currentNetwork = this.getNetwork();
    const accounts = this.store.getState().accounts as unknown as MultiWallet[];
    const selectedAccount = this.store.getState().selectedAccount;
    // Extract wallet addresses for current network from MultiWallet structure

    const currentNetworkWallets = accounts.flatMap(wallet => {
      // For MultiWallet structure
      if (wallet.coins) {
        // Handle both wallet types (waves-only and multichain)
        const relevantCoin = wallet.coins.waves || wallet.coins.unit0;
        if (relevantCoin?.networks) {
          const coinNetwork =
            relevantCoin?.networks?.[
              currentNetwork as keyof typeof relevantCoin.networks
            ];

          if (coinNetwork) {
            return [
              {
                address: coinNetwork.address,
                network: currentNetwork,
                walletId: wallet.id,
                lastUsed: wallet.createdAt,
                networkCode: coinNetwork.networkCode,
              },
            ];
          }
        }
        return [];
      }
      return [];
    }) as PreferencesAccount[];
    const isSelectedAccountValid =
      selectedAccount &&
      currentNetworkWallets.some(

        wallet =>
          wallet.address === selectedAccount.address &&
          wallet.network === currentNetwork,
      );

    // If no valid selection, select the most recently used account
    if (!isSelectedAccountValid) {
      if (currentNetworkWallets.length > 0) {
        const sortedWallets = currentNetworkWallets.sort(
          compareAccountsByLastUsed,
        );
        this.emit('updateSelectedAccount', sortedWallets[0]);
        this.selectAccount(sortedWallets[0].address, currentNetwork);
      } else {
        // No accounts for this network
        this.selectAccount(undefined, currentNetwork);
      }
    }
  }

  addLabel(address: string, label: string, network: NetworkName) {
    const { accounts, selectedAccount } = this.store.getState();

    const account = accounts.find(
      current => current.address === address && current.network === network,
    );

    if (!account) {
      throw new Error(
        `Account with address "${address}" in ${network} not found`,
      );
    }

    account.name = label;

    this.store.updateState({
      accounts,

      // selectedAccount can point to a separate object, not an accounts array
      // item, so we need to update it explicitly
      selectedAccount:
        selectedAccount && address === selectedAccount.address
          ? account
          : selectedAccount,
    });
  }

  selectAccount(address: string | undefined, network: string) {
    const { accounts } = this.store.getState();
    let selectedAccount = null;

    if (address && network) {
      // First check MultiWallet structure
      for (const wallet of accounts as unknown as MultiWallet[]) {
        if (wallet.coins) {
          const relevantNetwork = wallet.coins.waves?.networks;
          if (relevantNetwork) {
            // Check waves accounts
            if (
              relevantNetwork[network as keyof typeof relevantNetwork]
                ?.address === address
            ) {
              selectedAccount = {
                address,
                network,
                name: wallet.name,
                type: wallet.type,
                walletId: wallet.id,
                publicKey: wallet.coins.waves.publicKey,
                networkCode:
                  wallet.coins.waves.networks[
                    network as keyof typeof relevantNetwork
                  ]?.networkCode,
                coinType: 'waves',
              };
              break;
            }

            // Check unit0 accounts
            if (
              relevantNetwork[network as keyof typeof relevantNetwork]
                ?.address === address
            ) {
              selectedAccount = {
                address,
                network,
                name: wallet.name,
                type: wallet.type,
                walletId: wallet.id,
                publicKey: wallet.coins.unit0?.publicKey,
                coinType: 'unit0',
              };
              break;
            }
          }
        }
        // Legacy account format
        else if (
          (wallet as unknown as WalletAccount).address === address &&
          (wallet as unknown as WalletAccount).network === network
        ) {
          selectedAccount = wallet;
          break;
        }
      }
    }

    // Update last used time for previous account
    const { selectedAccount: previousAccount } = this.store.getState();
    if (previousAccount) {
      accounts.forEach(acc => {
        if (
          !(acc as unknown as MultiWallet).coins &&
          acc.address === previousAccount.address
        ) {
          acc.lastUsed = Date.now();
        }
      });
    }

    // Replace the problematic line with our selected account object
    const typedSelectedAccount = selectedAccount as PreferencesAccount;
    this.store.updateState({
      accounts,
      selectedAccount: typedSelectedAccount, // This now contains either a legacy account or a reference to a MultiWallet account
    });
  }

  /**
   * Get legacy format accounts filtered by current network and blockchain type
   * @param currentNetwork - Current active network name (mainnet, testnet, etc.)
   * @param currentBlockchainType - Current blockchain type (waves, unit0, etc.)
   * @returns Array of legacy format accounts for the current network and blockchain
   */
  getLegacyFormatAccounts(): Array<{
    address: string;
    name: string;
    network: string;
    publicKey: string;
    type: string;
    id: string;
  }> {
    const currentNetwork = this.getNetwork();
    const currentBlockchainType = this.getCurrentBlockchainType();
    const multiWallets = this.getAccounts() as unknown as MultiWallet[];
    const legacyAccounts: Array<{
      address: string;
      name: string;
      network: string;
      networkCode: string;
      publicKey: string;
      type: string;
      id: string;
    }> = [];

    // Convert each MultiWallet to legacy accounts for current network and blockchain
    multiWallets.forEach(wallet => {
      // Check if the wallet has the current blockchain type
      if (wallet.coins?.[currentBlockchainType]) {
        const blockchainData = wallet.coins[currentBlockchainType];
        const { publicKey, networks } = blockchainData;

        // Check if the wallet has the current network
        if (networks?.[currentNetwork] && networks[currentNetwork].address) {
          const networkData = networks[currentNetwork];

          legacyAccounts.push({
            address: networkData.address,
            name: wallet.name,
            networkCode: networkData.networkCode,
            network: currentNetwork,
            publicKey,
            type: wallet.type,
            id: wallet.id,
          });
        }
      }
    });

    return legacyAccounts;
  }

  async removeWallet(id: string) {
    const multiWallets = this.getAccounts() as unknown as MultiWallet[];

    // Find wallets where the address matches any network address
    const accounts = multiWallets.filter(wallet => {
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

    this.store.updateState({ accounts });
    this.ensureSelectedAccountInCurrentNetwork();
  }
}
