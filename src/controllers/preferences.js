const ObservableStore = require('obs-store');

export class PreferencesController {
    constructor(options = {}) {
        const defaults = {
            currentLocale: options.initLangCode || 'en',
            accounts: [],
            selectedAccount: undefined
        };

        const initState = Object.assign({}, defaults, options.initState);
        this.store = new ObservableStore(initState)
    }


    setCurrentLocale(key) {
        this.store.updateState({currentLocale: key})
    }

    addAccount(account) {
        const accounts = this.store.getState().accounts
        if (!this._getAccountById(account.id)){
            accounts.push(Object.assign({id: generateID(), name: generateName()}, account))
            this.store.updateState({accounts})
        }else {
            console.log(`Account ${account} already exists`)
        }
    }

    setAccounts(accounts) {

    }

    syncAccounts(accounts) {
        this.store.updateState({})
    }

    selectAccount(id) {
        const selectedAccount = this._getAccountById(id);
        this.store.updateState({selectedAccount})
    }

    _getAccountById(id) {
        const accounts = this.store.getState().accounts;
        return accounts.find(account => account.id === id)
    }
}