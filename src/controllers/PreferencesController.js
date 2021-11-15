import ObservableStore from 'obs-store';
import EventEmitter from 'events';

export class PreferencesController extends EventEmitter {
  constructor(options = {}) {
    super();

    const defaults = {
      currentLocale: options.initLangCode || 'en',
      idleOptions: { type: 'idle', interval: 0 },
      accounts: [],
      currentNetworkAccounts: [],
      selectedAccount: undefined,
    };
    this.getNetworkConfig = options.getNetworkConfig;
    const initState = Object.assign({}, defaults, options.initState);
    this.store = new ObservableStore(initState);

    this.getNetwork = options.getNetwork;
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
    const accounts = this.store.getState().accounts;
    const currentNetworkAccounts = accounts.filter(
      account => account.network === network
    );
    this.store.updateState({ currentNetworkAccounts });

    // Ensure we have selected account from current network
    let selectedAccount = this.store.getState().selectedAccount;
    if (
      !selectedAccount ||
      !currentNetworkAccounts.find(
        account =>
          account.address === selectedAccount.address &&
          account.network === selectedAccount.network
      )
    ) {
      const addressToSelect =
        currentNetworkAccounts.length > 0
          ? currentNetworkAccounts[0].address
          : undefined;
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

  selectAccount(address, network, lastActive = Date.now()) {
    let selectedAccount = this.store.getState().selectedAccount;
    if (
      !selectedAccount ||
      selectedAccount.address !== address ||
      selectedAccount.network !== network
    ) {
      selectedAccount = this._getAccountByAddress(address, network);

      const accounts = this.store.getState().accounts.map(account => {
        const selected = account.selected || 0;
        let isSelected =
          account.address === address && account.network === network;
        return isSelected
          ? { ...account, lastActive, selected: selected + 1 }
          : account;
      });

      this.store.updateState({ selectedAccount, accounts });
      this.emit('accountChange');
    }
  }

  _getAccountByAddress(address, network) {
    const accounts = this.store.getState().accounts;
    return accounts.find(
      account => account.address === address && account.network === network
    );
  }
}
