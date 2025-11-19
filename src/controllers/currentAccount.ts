import { type BalancesItem } from 'balances/types';
import { collectBalances, getBalanceKey } from 'balances/utils';
import ObservableStore from 'obs-store';
import Browser from 'webextension-polyfill';

import { type ExtensionStorage } from '../storage/storage';
import { type AssetInfoController } from './assetInfo';
import { type NetworkController } from './network';
import { type NftInfoController } from './NftInfoController';
import { type PreferencesController } from './preferences';
import { BalanceContext } from './strategies/contexts/BalanceContext';
import { type VaultController } from './VaultController';
import { type MultiWallet } from '../services/types';

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

    const defaults: Partial<Record<string, BalancesItem>> = Object.fromEntries(
      this.getAddressesForCurrentNetworkAndBlockchain().map(address => [
        `balance_${address}`,
        undefined,
      ]),
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

      const balanceResult = await this.balanceContext.fetchBalance(
        address,
        currentNetwork,
      );

      if (!balanceResult.success) {
        return;
      }

      const balance = balanceResult.balance;

      this.store.updateState({
        [`balance_${balanceKey}`]: balance,
      });
    } catch (error) {
      console.error('Error updating account balance:', error);
    } finally {
      this.isUpdatingBalance = false;
    }
  }

  async updateOtherAccountsBalances() {
    const url = new URL('addresses/balance', this.getNode());

    const addresses = this.getAddressesForCurrentNetworkAndBlockchain();

    while (addresses.length > 0) {
      const splicedAddresses = addresses.splice(0, 1000);
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
          const balanceKey = `balance_${regularBalance.id}`;
          const existingBalance = storeState[balanceKey];

          const balance = {
            ...existingBalance,
            regular: regularBalance.balance,
          };

          return [balanceKey, balance];
        }),
      );

      this.store.updateState(balances);
    }
  }

  private getAddressesForCurrentNetworkAndBlockchain(): string[] {
    const currentNetwork = this.getNetwork();
    const currentBlockchainType = this.getBlockchainType();
    const accounts = this.getAccounts() as unknown as MultiWallet[];

    const addresses: string[] = [];

    accounts.forEach(wallet => {
      if (!wallet.coins) {
        return;
      }

      if (currentBlockchainType === 'waves' && wallet.coins.waves?.networks) {
        const wavesNetworks = wallet.coins.waves.networks;

        if (currentNetwork === 'mainnet' && wavesNetworks.mainnet?.address) {
          addresses.push(wavesNetworks.mainnet.address);
        } else if (
          currentNetwork === 'testnet' &&
          wavesNetworks.testnet?.address
        ) {
          addresses.push(wavesNetworks.testnet.address);
        } else if (
          currentNetwork === 'stagenet' &&
          wavesNetworks.stagenet?.address
        ) {
          addresses.push(wavesNetworks.stagenet.address);
        } else if (currentNetwork === 'custom' && wavesNetworks.custom?.address) {
          addresses.push(wavesNetworks.custom.address);
        }
      } else if (
        currentBlockchainType === 'unit0' &&
        wallet.coins.unit0?.networks
      ) {
        const unit0Networks = wallet.coins.unit0.networks;

        if (currentNetwork === 'mainnet' && unit0Networks.mainnet?.address) {
          addresses.push(unit0Networks.mainnet.address);
        } else if (
          (currentNetwork === 'testnet' || currentNetwork === 'stagenet') &&
          unit0Networks.testnet?.address
        ) {
          addresses.push(unit0Networks.testnet.address);
        }
      }
    });

    return addresses;
  }
}
