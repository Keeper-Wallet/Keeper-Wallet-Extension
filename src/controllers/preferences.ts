import * as Sentry from '@sentry/react';
import { compareAccountsByLastUsed } from 'accounts/utils';
import ObservableStore from 'obs-store';
import EventEmitter from 'events';
import ExtensionStore from 'lib/localStore';
import { NetworkController } from './network';
import { RemoteConfigController } from './remoteConfig';

type GetNetworkConfig = RemoteConfigController['getNetworkConfig'];
type GetNetwork = NetworkController['getNetwork'];

export class PreferencesController extends EventEmitter {
  store: ObservableStore;
  getNetwork: GetNetwork;
  getNetworkConfig: GetNetworkConfig;

  constructor({
    localStore,
    initLangCode,
    getNetwork,
    getNetworkConfig,
  }: {
    localStore: ExtensionStore;
    initLangCode: string;
    getNetwork: GetNetwork;
    getNetworkConfig: GetNetworkConfig;
  }) {
    super();

    const defaults = {
      currentLocale: initLangCode || 'en',
      idleOptions: { type: 'idle', interval: 0 },
      accounts: [],
      currentNetworkAccounts: [],
      selectedAccount: undefined,
    };
    this.store = new ObservableStore(localStore.getInitState(defaults));
    localStore.subscribe(this.store);

    this.getNetworkConfig = getNetworkConfig;
    this.getNetwork = getNetwork;
  }

  getSelectedAccount() {
    return this.store.getState().selectedAccount;
  }

  setCurrentLocale(key) {
    this.store.updateState({ currentLocale: key });
  }

  setIdleOptions(options) {
    this.store.updateState({ idleOptions: options });
  }

  syncAccounts(fromKeyrings) {
    const oldAccounts = this.store.getState().accounts;
    const accounts = fromKeyrings.map((account, i) => {
      return Object.assign(
        { name: `Account ${i + 1}` },
        account,
        oldAccounts.find(
          oldAcc =>
            oldAcc.address === account.address &&
            oldAcc.network === account.network
        )
      );
    });
    this.store.updateState({ accounts });

    this.syncCurrentNetworkAccounts();
  }

  syncCurrentNetworkAccounts() {
    const network = this.getNetwork();
    const { accounts, selectedAccount } = this.store.getState();
    const currentNetworkAccounts = accounts.filter(
      account => account.network === network
    );
    this.store.updateState({ currentNetworkAccounts });

    // Ensure we have selected account from current network
    if (
      !selectedAccount ||
      !currentNetworkAccounts.some(
        account =>
          account.address === selectedAccount.address &&
          account.network === selectedAccount.network
      )
    ) {
      let addressToSelect;

      if (currentNetworkAccounts.length > 0) {
        const sortedAccounts = currentNetworkAccounts.sort(
          compareAccountsByLastUsed
        );

        addressToSelect = sortedAccounts[0].address;
      }

      this.selectAccount(addressToSelect, network);
    }
  }

  addLabel(address, label, network) {
    const accounts = this.store.getState().accounts;
    const index = accounts.findIndex(
      current => current.address === address && current.network === network
    );
    if (index === -1) {
      throw new Error(
        `Account with address "${address}" in ${network} not found`
      );
    }
    accounts[index].name = label;
    this.store.updateState({ accounts });
  }

  selectAccount(address, network) {
    const { accounts, selectedAccount } = this.store.getState();

    if (
      !selectedAccount ||
      selectedAccount.address !== address ||
      selectedAccount.network !== network
    ) {
      Sentry.addBreadcrumb({
        type: 'user',
        category: 'account-change',
        level: Sentry.Severity.Info,
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
          account => account.address === address && account.network === network
        ),
      });

      this.emit('accountChange');
    }
  }
}
