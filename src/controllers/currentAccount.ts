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

const PERIOD_IN_SECONDS = 10;

export class CurrentAccountController {
  private store;
  private getLegacyFormatAccounts;
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
    getLegacyFormatAccounts,
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
    getLegacyFormatAccounts: PreferencesController['getLegacyFormatAccounts'];
    getNetwork: NetworkController['getNetwork'];
    getNode: NetworkController['getNode'];
    getSelectedAccount: PreferencesController['getSelectedAccount'];
    isLocked: VaultController['isLocked'];
    getBlockchainType: NetworkController['getCurrentBlockchainType'];
  }) {
    const defaults: Partial<Record<string, BalancesItem>> = Object.fromEntries(
      getLegacyFormatAccounts().map(acc => [
        `balance_${acc.address}`,
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

    this.getLegacyFormatAccounts = getLegacyFormatAccounts;
    this.getNetwork = getNetwork;
    this.getNode = getNode;
    this.getSelectedAccount = getSelectedAccount;
    this.isLocked = isLocked;
    this.getBlockchainType = getBlockchainType;

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
    const accounts = this.getLegacyFormatAccounts().filter(
      ({ network }) => network === currentNetwork,
    );
    const activeAccount = this.getSelectedAccount();

    if (this.isLocked() || accounts.length < 1 || !activeAccount) {
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
    const addresses = this.getLegacyFormatAccounts().map(
      account => account.address,
    );

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
}
