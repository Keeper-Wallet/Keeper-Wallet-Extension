import EventEmitter from 'events';
import { type NetworkName } from 'networks/types';
import ObservableStore from 'obs-store';
import { type IdleOptions, type PreferencesAccount } from 'preferences/types';
import { compareAccountsByLastUsed } from 'preferences/utils';
import { type WalletAccount } from 'wallets/types';

import { type MultiWallet } from '../services/types';
import { type ExtensionStorage } from '../storage/storage';
import { type NetworkController } from './network';

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

  syncAccounts(wallets: Array<WalletAccount | MultiWallet>) {
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
    wallets.forEach(wallet => {
      // Handle MultiWallet objects (have id property)
      if ('id' in wallet && wallet.id) {
        accountsById.set(wallet.id, wallet);
      }
      // Handle WalletAccount objects (legacy accounts)
      else if ('address' in wallet && 'network' in wallet) {
        // Create a unique key for legacy accounts
        const key = `${wallet.address}-${wallet.network}`;
        accountsById.set(key, wallet);
      }
    });

    // Convert map back to array
    const accounts = Array.from(accountsById.values());

    this.store.updateState({ accounts });
    this.ensureSelectedAccountInCurrentNetwork();
  }
  saveAccounts(accounts: MultiWallet[]) {
    this.store.updateState({ accounts });
    this.ensureSelectedAccountInCurrentNetwork();
  }

  ensureSelectedAccountInCurrentNetwork() {
    const currentNetwork = this.getNetwork();
    const currentBlockchainType = this.getCurrentBlockchainType();
    const accounts = this.store.getState().accounts as unknown as MultiWallet[];
    const selectedAccount = this.store.getState().selectedAccount;

    // If no selected account, select an appropriate one
    if (!selectedAccount) {
      const currentNetworkWallets = this.getNetworkWalletsForCurrentNetwork(
        accounts,
        currentNetwork,
        currentBlockchainType,
      );

      if (currentNetworkWallets.length > 0) {
        const sortedWallets = currentNetworkWallets.sort(
          compareAccountsByLastUsed,
        );
        this.emit('updateSelectedAccount', sortedWallets[0]);
        this.selectAccount(sortedWallets[0].address, currentNetwork);
      }
      return;
    }

    // Get the wallet ID from the selected account
    const selectedWalletId = selectedAccount.walletId;
    if (!selectedWalletId) {
      // Handle legacy accounts
      const currentNetworkWallets = this.getNetworkWalletsForCurrentNetwork(
        accounts,
        currentNetwork,
        currentBlockchainType,
      );

      if (currentNetworkWallets.length > 0) {
        const sortedWallets = currentNetworkWallets.sort(
          compareAccountsByLastUsed,
        );
        this.emit('updateSelectedAccount', sortedWallets[0]);
        this.selectAccount(sortedWallets[0].address, currentNetwork);
      } else {
        this.selectAccount(undefined, currentNetwork);
      }
      return;
    }

    // Find the selected wallet
    const selectedWallet = accounts.find(
      wallet => wallet.id === selectedWalletId,
    );
    if (!selectedWallet?.coins) {
      // Handle legacy or invalid wallets
      const currentNetworkWallets = this.getNetworkWalletsForCurrentNetwork(
        accounts,
        currentNetwork,
        currentBlockchainType,
      );

      if (currentNetworkWallets.length > 0) {
        const sortedWallets = currentNetworkWallets.sort(
          compareAccountsByLastUsed,
        );
        this.emit('updateSelectedAccount', sortedWallets[0]);
        this.selectAccount(sortedWallets[0].address, currentNetwork);
      } else {
        this.selectAccount(undefined, currentNetwork);
      }
      return;
    }

    // Special Unit0 handling - if blockchain is Unit0, prioritize Unit0 accounts
    if (currentBlockchainType === 'unit0') {
      const unit0Coin = selectedWallet.coins.unit0;
      if (unit0Coin?.networks) {
        // For Unit0, stagenet doesn't exist so map to testnet
        const unit0Network =
          currentNetwork === 'stagenet' ? 'testnet' : currentNetwork;

        const networkData =
          unit0Coin.networks[unit0Network as keyof typeof unit0Coin.networks];
        if (networkData?.address) {
          // Found Unit0 account in the same wallet for this network
          this.emit('updateSelectedAccount', {
            address: networkData.address,
            network: currentNetwork,
            walletId: selectedWallet.id,
            name: selectedWallet.name,
            networkCode: networkData.networkCode,
            coinType: 'unit0',
            publicKey: unit0Coin.publicKey,
          });
          this.selectAccount(networkData.address, currentNetwork);
          return;
        }
      }
    }

    // For Waves blockchain or if no Unit0 account was found
    if (
      currentBlockchainType === 'waves' ||
      currentBlockchainType === 'unit0'
    ) {
      // Try to find the account in the specified blockchain first
      const targetCoin = selectedWallet.coins[currentBlockchainType];
      if (targetCoin?.networks) {
        const networkData =
          targetCoin.networks[
            currentNetwork as keyof typeof targetCoin.networks
          ];
        if (networkData?.address) {
          // Found account in the same wallet for this network and blockchain type
          this.emit('updateSelectedAccount', {
            address: networkData.address,
            network: currentNetwork,
            walletId: selectedWallet.id,
            name: selectedWallet.name,
            networkCode: networkData.networkCode,
            coinType: currentBlockchainType,
            publicKey: targetCoin.publicKey,
          });
          this.selectAccount(networkData.address, currentNetwork);
          return;
        }
      }

      // If no account found in the current blockchain type, try the other one
      const otherType = currentBlockchainType === 'waves' ? 'unit0' : 'waves';
      const otherCoin = selectedWallet.coins[otherType];
      if (otherCoin?.networks) {
        // Handle network mapping for Unit0
        const networkToUse =
          otherType === 'unit0' && currentNetwork === 'stagenet'
            ? 'testnet'
            : currentNetwork;

        const networkData =
          otherCoin.networks[networkToUse as keyof typeof otherCoin.networks];
        if (networkData?.address) {
          // Found account in the other blockchain type
          this.emit('updateSelectedAccount', {
            address: networkData.address,
            network: currentNetwork,
            walletId: selectedWallet.id,
            name: selectedWallet.name,
            networkCode: networkData.networkCode,
            coinType: otherType,
            publicKey: otherCoin.publicKey,
          });
          this.selectAccount(networkData.address, currentNetwork);
          return;
        }
      }
    }

    // Fallback: If no matching account found in the selected wallet,
    // select the most recently used account for this network and blockchain type
    const currentNetworkWallets = this.getNetworkWalletsForCurrentNetwork(
      accounts,
      currentNetwork,
      currentBlockchainType,
    );

    if (currentNetworkWallets.length > 0) {
      const sortedWallets = currentNetworkWallets.sort(
        compareAccountsByLastUsed,
      );
      this.emit('updateSelectedAccount', sortedWallets[0]);
      this.selectAccount(sortedWallets[0].address, currentNetwork);
    } else {
      this.selectAccount(undefined, currentNetwork);
    }
  }

  // Helper method to get wallets for current network and blockchain type
  private getNetworkWalletsForCurrentNetwork(
    accounts: MultiWallet[],
    currentNetwork: string,
    currentBlockchainType: string,
  ): PreferencesAccount[] {
    return accounts.flatMap(wallet => {
      if (wallet.coins) {
        // First try to match the current blockchain type
        const relevantCoin =
          wallet.coins[currentBlockchainType as keyof typeof wallet.coins];

        if (relevantCoin?.networks) {
          // For Unit0, handle stagenet mapping to testnet
          const networkKey =
            currentBlockchainType === 'unit0' && currentNetwork === 'stagenet'
              ? ('testnet' as keyof typeof relevantCoin.networks)
              : (currentNetwork as keyof typeof relevantCoin.networks);

          const coinNetwork = relevantCoin.networks[networkKey];

          if (coinNetwork) {
            return [
              {
                address: coinNetwork.address,
                network: currentNetwork,
                walletId: wallet.id,
                lastUsed: wallet.lastUsed || wallet.createdAt,
                networkCode: coinNetwork.networkCode,
                coinType: currentBlockchainType as string,
                name: wallet.name,
                type: wallet.type,
                publicKey: relevantCoin.publicKey,
              },
            ];
          }
        }
      }
      return [];
    }) as PreferencesAccount[];
  }

  addLabel(address: string, label: string, network: NetworkName) {
    const { accounts, selectedAccount } = this.store.getState();

    const account = (accounts as unknown as MultiWallet[]).find(wallet => {
      const wavesNetworks = wallet.coins?.waves?.networks;
      if (!wavesNetworks) return false;

      // Type-safe network access for Waves networks only
      let networkItem;
      switch (network) {
        case 'mainnet':
          networkItem = wavesNetworks.mainnet;
          break;
        case 'testnet':
          networkItem = wavesNetworks.testnet;
          break;
        case 'stagenet':
          networkItem = wavesNetworks.stagenet;
          break;
        case 'custom':
          networkItem = wavesNetworks.custom;
          break;
        default:
          return false; // Unit0 or other networks don't exist on Waves
      }

      return networkItem?.address === address;
    });

    if (!account) {
      throw new Error(
        `Account with address "${address}" in ${network} not found`,
      );
    }

    account.name = label;

    // Update the label in the MultiWallet structure
    const updatedAccounts = (accounts as unknown as MultiWallet[]).map(
      wallet => {
        const wavesNetworks = wallet.coins?.waves?.networks;
        if (!wavesNetworks) return wallet;

        // Type-safe network access for Waves networks only
        let networkItem;
        switch (network) {
          case 'mainnet':
            networkItem = wavesNetworks.mainnet;
            break;
          case 'testnet':
            networkItem = wavesNetworks.testnet;
            break;
          case 'stagenet':
            networkItem = wavesNetworks.stagenet;
            break;
          case 'custom':
            networkItem = wavesNetworks.custom;
            break;
          default:
            return wallet; // Unit0 or other networks don't exist on Waves
        }

        if (networkItem?.address === address) {
          return {
            ...wallet,
            name: label, // Update the wallet name since it applies to all networks
          };
        }
        return wallet;
      },
    );

    this.store.updateState({
      accounts: updatedAccounts,
      selectedAccount:
        selectedAccount &&
        selectedAccount.address === address &&
        selectedAccount.network === network
          ? { ...selectedAccount, name: label }
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
          // Check waves accounts first
          const wavesNetworks = wallet.coins.waves?.networks;
          if (wavesNetworks) {
            if (
              wavesNetworks[network as keyof typeof wavesNetworks]?.address ===
              address
            ) {
              selectedAccount = {
                address,
                network,
                name: wallet.name,
                type: wallet.type,
                walletId: wallet.id,
                publicKey: wallet.coins.waves.publicKey,
                networkCode:
                  wavesNetworks[network as keyof typeof wavesNetworks]
                    ?.networkCode,
                coinType: 'waves',
                // For Ledger wallets, include the ledger account ID
                ...(wallet.type === 'ledger' && wallet.ledgerId !== undefined
                  ? { id: wallet.ledgerId }
                  : {}),
                // For WX wallets, include uuid and username
                ...(wallet.type === 'wx' && wallet.wxUuid && wallet.wxUsername
                  ? {
                      uuid: wallet.wxUuid,
                      username: wallet.wxUsername,
                    }
                  : {}),
              };
              break;
            }
          }

          // Check unit0 accounts
          const unit0Networks = wallet.coins.unit0?.networks;
          if (unit0Networks) {
            // For Unit0, map stagenet to testnet since Unit0 doesn't have stagenet
            const unit0Network = network === 'stagenet' ? 'testnet' : network;

            if (
              unit0Networks[unit0Network as keyof typeof unit0Networks]
                ?.address === address
            ) {
              selectedAccount = {
                address,
                network,
                name: wallet.name,
                type: wallet.type,
                walletId: wallet.id,
                publicKey: wallet.coins.unit0?.publicKey,
                networkCode:
                  unit0Networks[unit0Network as keyof typeof unit0Networks]
                    ?.networkCode,
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

    // Replace the problematic line with our selected account object
    const typedSelectedAccount = selectedAccount as PreferencesAccount;

    // Ensure lastUsed is set in selectedAccount if it's from a MultiWallet
    if (typedSelectedAccount && typedSelectedAccount.walletId) {
      const matchedWallet = accounts.find(
        acc => acc.coins && acc.id === typedSelectedAccount.walletId,
      );
      if (matchedWallet) {
        typedSelectedAccount.lastUsed =
          matchedWallet.lastUsed || matchedWallet.createdAt;
      }
    }

    this.store.updateState({
      accounts,
      selectedAccount: typedSelectedAccount, // This now contains either a legacy account or a reference to a MultiWallet account
    });
  }
}
