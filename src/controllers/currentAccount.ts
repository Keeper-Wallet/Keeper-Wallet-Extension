import { type BalancesItem } from 'balances/types';
import { collectBalances, getBalanceKey } from 'balances/utils';
import ObservableStore from 'obs-store';
import Browser from 'webextension-polyfill';

import { type NetworkName } from '../networks/types';
import { type MultiWallet } from '../services/types';
import { type ExtensionStorage } from '../storage/storage';
import { Unit0Api } from './api/unit0Api';
import { type AssetInfoController } from './assetInfo';
import { type NetworkController } from './network';
import { type NftInfoController } from './NftInfoController';
import { type PreferencesController } from './preferences';
import { BalanceContext } from './strategies/contexts/BalanceContext';
import { type VaultController } from './VaultController';

const PERIOD_IN_SECONDS = 10;

export class CurrentAccountController {
  private store;
  private getAccounts;
  private getNetwork;
  private getNode;
  private getSelectedAccount;
  private isLocked;
  private getBlockchainType;
  private balanceContext: BalanceContext;
  private isUpdatingBalance = false;
  private isUpdatingOtherAccounts = false;

  constructor({
    extensionStorage,
    assetInfoController,
    nftInfoController,
    getAccounts,
    getNetwork,
    getNode,
    getSelectedAccount,
    isLocked,
    getBlockchainType,
  }: {
    extensionStorage: ExtensionStorage;
    assetInfoController: AssetInfoController;
    nftInfoController: NftInfoController;
    getAccounts: PreferencesController['getAccounts'];
    getNetwork: NetworkController['getNetwork'];
    getNode: NetworkController['getNode'];
    getSelectedAccount: PreferencesController['getSelectedAccount'];
    isLocked: VaultController['isLocked'];
    getBlockchainType: NetworkController['getCurrentBlockchainType'];
  }) {
    this.getAccounts = getAccounts;
    this.getNetwork = getNetwork;
    this.getNode = getNode;
    this.getSelectedAccount = getSelectedAccount;
    this.isLocked = isLocked;
    this.getBlockchainType = getBlockchainType;

    const currentNetwork = this.getNetwork();
    const currentBlockchainType = this.getBlockchainType();
    const defaults: Partial<Record<string, BalancesItem>> = Object.fromEntries(
      this.getAddressesForCurrentNetworkAndBlockchain().map(address => {
        const balanceKeySuffix = getBalanceKey(
          currentBlockchainType,
          currentNetwork,
          address,
        );
        return [`balance_${balanceKeySuffix}`, undefined];
      }),
    );

    const initState = extensionStorage.getInitState(defaults);

    const emptyKeys = Object.entries(initState)
      .filter(([, value]) => value == null)
      .map(([key]) => key);

    extensionStorage.removeState(emptyKeys);

    emptyKeys.forEach(key => {
      delete initState[key];
    });

    this.store = new ObservableStore(initState);

    extensionStorage.subscribe(this.store);

    // Initialize balance context (handles transactions internally)
    this.balanceContext = new BalanceContext(
      this.getNode,
      assetInfoController,
      nftInfoController,
    );

    Browser.alarms.onAlarm.addListener(({ name }) => {
      if (name === 'updateCurrentAccountBalance') {
        this.updateCurrentAccountBalance();
      }
    });

    this.restartPolling();
  }

  restartPolling() {
    Browser.alarms.create('updateCurrentAccountBalance', {
      periodInMinutes: PERIOD_IN_SECONDS / 60,
    });
  }

  getAccountBalance() {
    const selectedAccount = this.getSelectedAccount();

    if (!selectedAccount) {
      return undefined;
    }

    const state = this.store.getState();
    const balances = collectBalances(state);

    const currentNetwork = this.getNetwork();
    const currentBlockchainType = this.getBlockchainType();

    const key = getBalanceKey(
      currentBlockchainType,
      currentNetwork,
      selectedAccount.address,
    );

    return balances[key] ?? balances[selectedAccount.address];
  }

  async updateCurrentAccountBalance() {
    if (this.isUpdatingBalance) {
      return;
    }

    const currentNetwork = this.getNetwork();
    const currentBlockchainType = this.getBlockchainType();
    const addresses = this.getAddressesForCurrentNetworkAndBlockchain();
    const activeAccount = this.getSelectedAccount();

    if (this.isLocked() || addresses.length < 1 || !activeAccount) {
      return;
    }

    this.isUpdatingBalance = true;

    const { address } = activeAccount;
    const balanceKey = getBalanceKey(
      currentBlockchainType,
      currentNetwork,
      address,
    );

    try {
      this.balanceContext.setStrategy(currentBlockchainType);

      // Get existing balance to merge with
      const existingBalance = this.store.getState()[`balance_${balanceKey}`] as
        | BalancesItem
        | undefined;

      // Callback for incremental updates (Unit0 streaming)
      const onUpdate = (partialBalance: BalancesItem) => {
        // Merge new assets with existing ones (don't remove old assets)
        const mergedAssets = {
          ...(existingBalance?.assets || {}),
          ...partialBalance.assets,
        };

        // Merge NFTs by id (don't remove old NFTs)
        const existingNftsMap = new Map(
          (existingBalance?.nfts || []).map(nft => [nft.id, nft]),
        );
        (partialBalance.nfts || []).forEach(nft => {
          existingNftsMap.set(nft.id, nft);
        });
        const mergedNfts = Array.from(existingNftsMap.values());

        this.store.updateState({
          [`balance_${balanceKey}`]: {
            ...partialBalance,
            assets: mergedAssets,
            nfts: mergedNfts,
          },
        });
      };

      const balanceResult = await this.balanceContext.fetchBalance(
        address,
        currentNetwork,
        onUpdate,
      );

      if (!balanceResult.success) {
        return;
      }

      const balance = balanceResult.balance;

      // Get CURRENT balance from store (it was updated by onUpdate callbacks)
      const currentBalance = this.store.getState()[`balance_${balanceKey}`] as
        | BalancesItem
        | undefined;

      // Final update - merge with current assets and NFTs
      const finalAssets = {
        ...(currentBalance?.assets || {}),
        ...balance.assets,
      };

      const currentNftsMap = new Map(
        (currentBalance?.nfts || []).map(nft => [nft.id, nft]),
      );
      (balance.nfts || []).forEach(nft => {
        currentNftsMap.set(nft.id, nft);
      });
      const finalNfts = Array.from(currentNftsMap.values());

      this.store.updateState({
        [`balance_${balanceKey}`]: {
          ...balance,
          assets: finalAssets,
          nfts: finalNfts,
        },
      });
    } finally {
      this.isUpdatingBalance = false;
    }
  }

  async updateOtherAccountsBalances() {
    if (this.isUpdatingOtherAccounts) {
      return;
    }

    this.isUpdatingOtherAccounts = true;

    try {
      const currentNetwork = this.getNetwork();
      const currentBlockchainType = this.getBlockchainType();

      if (this.isLocked()) {
        return;
      }

      const addresses = this.getAddressesForCurrentNetworkAndBlockchain();

      if (addresses.length === 0) {
        return;
      }

      // Unit0: use Blockscout-style explorer API balancemulti endpoint
      if (currentBlockchainType === 'unit0') {
        const unit0Api = new Unit0Api();
        const updates: Record<string, BalancesItem> = {};
        const storeState = this.store.getState();

        const remaining = [...addresses];
        const MAX_ADDRESSES_PER_REQUEST = 20;

        while (remaining.length > 0) {
          const splicedAddresses = remaining.splice(
            0,
            MAX_ADDRESSES_PER_REQUEST,
          );

          try {
            const multiBalances = await unit0Api.fetchBalancesMulti(
              splicedAddresses,
              currentNetwork as NetworkName,
            );

            // Build a lookup map by lowercased address from the explorer response
            const byAddress = new Map<string, string>();
            for (const entry of multiBalances) {
              const addr = entry.address?.toLowerCase?.();
              if (!addr) continue;
              byAddress.set(addr, entry.balance);
            }

            for (const address of splicedAddresses) {
              const normalizedAddress = address.toLowerCase();
              const balanceValue = byAddress.get(normalizedAddress) ?? '0';

              const balanceKeySuffix = getBalanceKey(
                currentBlockchainType,
                currentNetwork,
                address,
              );
              const balanceKey = `balance_${balanceKeySuffix}`;
              const existingBalance =
                (storeState[balanceKey] as BalancesItem | undefined) ?? {};

              const unit0AssetBalance = {
                balance: balanceValue,
                sponsorBalance: balanceValue,
                minSponsoredAssetFee: null,
              };

              const mergedAssets = {
                ...(existingBalance.assets || {}),
                unit0: unit0AssetBalance,
              };

              updates[balanceKey] = {
                ...existingBalance,
                regular: balanceValue,
                available: balanceValue,
                network: currentNetwork as NetworkName,
                assets: mergedAssets,
              };
            }
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(
              'Error updating Unit0 other account balances:',
              error,
            );
          }
        }

        if (Object.keys(updates).length > 0) {
          this.store.updateState(updates);
        }

        return;
      }

      // Waves keep existing node-based batch behavior
      const url = new URL('addresses/balance', this.getNode());

      const remaining = [...addresses];

      while (remaining.length > 0) {
        const splicedAddresses = remaining.splice(0, 1000);
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            accept: 'application/json; large-significand-format=string',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            addresses: splicedAddresses,
          }),
        });

        const regularBalances = (await response.json()) as Array<{
          id: string;
          balance: string;
        }>;

        const storeState = this.store.getState();

        const balances = Object.fromEntries(
          regularBalances.map(regularBalance => {
            // Use proper balance key with network prefix
            const balanceKeySuffix = getBalanceKey(
              currentBlockchainType,
              currentNetwork,
              regularBalance.id,
            );
            const balanceKey = `balance_${balanceKeySuffix}`;
            const existingBalance =
              (storeState[balanceKey] as BalancesItem | undefined) ?? {};

            const balance: BalancesItem = {
              ...existingBalance,
              regular: regularBalance.balance,
              network: currentNetwork as NetworkName,
            };

            return [balanceKey, balance];
          }),
        );

        this.store.updateState(balances);
      }
    } finally {
      this.isUpdatingOtherAccounts = false;
    }
  }

  private getAddressesForCurrentNetworkAndBlockchain(): string[] {
    const currentNetwork = this.getNetwork();
    const currentBlockchainType = this.getBlockchainType();
    const accounts = (this.getAccounts() as unknown as MultiWallet[])
      .slice()
      .sort((walletA, walletB) => {
        const aTime = (walletA.lastUsed ?? walletA.createdAt ?? 0) as number;
        const bTime = (walletB.lastUsed ?? walletB.createdAt ?? 0) as number;

        return bTime - aTime;
      });

    const addresses: string[] = [];
    const seenAddresses = new Set<string>();

    accounts.forEach(wallet => {
      if (!wallet.coins) {
        return;
      }

      if (currentBlockchainType === 'waves' && wallet.coins.waves?.networks) {
        const wavesNetworks = wallet.coins.waves.networks;
        let address: string | undefined;

        if (currentNetwork === 'mainnet' && wavesNetworks.mainnet?.address) {
          address = wavesNetworks.mainnet.address;
        } else if (
          currentNetwork === 'testnet' &&
          wavesNetworks.testnet?.address
        ) {
          address = wavesNetworks.testnet.address;
        } else if (
          currentNetwork === 'stagenet' &&
          wavesNetworks.stagenet?.address
        ) {
          address = wavesNetworks.stagenet.address;
        } else if (
          currentNetwork === 'custom' &&
          wavesNetworks.custom?.address
        ) {
          address = wavesNetworks.custom.address;
        }

        if (address && !seenAddresses.has(address)) {
          seenAddresses.add(address);
          addresses.push(address);
        }
      } else if (
        currentBlockchainType === 'unit0' &&
        wallet.coins.unit0?.networks
      ) {
        const unit0Networks = wallet.coins.unit0.networks;
        let address: string | undefined;

        if (currentNetwork === 'mainnet' && unit0Networks.mainnet?.address) {
          address = unit0Networks.mainnet.address;
        } else if (
          currentNetwork === 'testnet' &&
          unit0Networks.testnet?.address
        ) {
          address = unit0Networks.testnet.address;
        }

        if (address && !seenAddresses.has(address)) {
          seenAddresses.add(address);
          addresses.push(address);
        }
      }
    });

    return addresses;
  }
}
