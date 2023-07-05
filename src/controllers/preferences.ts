import { addBreadcrumb } from '@sentry/browser';
import EventEmitter from 'events';
import { type NetworkName } from 'networks/types';
import ObservableStore from 'obs-store';
import { type IdleOptions } from 'preferences/types';
import { compareAccountsByLastUsed } from 'preferences/utils';
import { type WalletAccount } from 'wallets/types';

import { type ExtensionStorage } from '../storage/storage';
import { type NetworkController } from './network';

export class PreferencesController extends EventEmitter {
  store;
  private getNetwork;

  constructor({
    extensionStorage,
    initLangCode,
    getNetwork,
  }: {
    extensionStorage: ExtensionStorage;
    initLangCode: string | null | undefined;
    getNetwork: NetworkController['getNetwork'];
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

  syncAccounts(fromKeyrings: WalletAccount[]) {
    const oldAccounts = this.store.getState().accounts;
    const accounts = fromKeyrings.map((account, i) => {
      return Object.assign(
        { name: `Account ${i + 1}` },
        account,
        oldAccounts.find(
          oldAcc =>
            oldAcc.address === account.address &&
            oldAcc.network === account.network,
        ),
      );
    });
    this.store.updateState({ accounts });

    this.ensureSelectedAccountInCurrentNetwork();
  }

  ensureSelectedAccountInCurrentNetwork() {
    const network = this.getNetwork();
    const { accounts, selectedAccount } = this.store.getState();
    const currentNetworkAccounts = accounts.filter(
      account => account.network === network,
    );

    if (
      !selectedAccount ||
      !currentNetworkAccounts.some(
        account =>
          account.address === selectedAccount.address &&
          account.network === selectedAccount.network,
      )
    ) {
      let addressToSelect: string | undefined;

      if (currentNetworkAccounts.length > 0) {
        const sortedAccounts = currentNetworkAccounts.sort(
          compareAccountsByLastUsed,
        );

        addressToSelect = sortedAccounts[0].address;
      }

      this.selectAccount(addressToSelect, network);
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
    const { accounts, selectedAccount } = this.store.getState();

    if (
      !selectedAccount ||
      selectedAccount.address !== address ||
      selectedAccount.network !== network
    ) {
      addBreadcrumb({
        type: 'user',
        category: 'account-change',
        level: 'info',
        message: 'Change active account',
      });

      if (selectedAccount) {
        accounts.forEach(acc => {
          if (acc.address === selectedAccount.address) {
            acc.lastUsed = Date.now();
          }
        });
      }

      this.store.updateState({
        accounts,
        selectedAccount: accounts.find(
          account => account.address === address && account.network === network,
        ),
      });

      this.emit('accountChange');
    }
  }
}
