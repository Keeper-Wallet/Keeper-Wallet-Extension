import ObservableStore from 'obs-store';
import log from 'loglevel'

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
        const accounts = this.store.getState().accounts;
        if (!this._getAccountByPk(account.publicKey)) {
            accounts.push(Object.assign({name: `Account ${accounts.length}`}, account));
            this.store.updateState({accounts})
        } else {
            log.log(`Account with public key ${account} already exists`)
        }
    }

    syncAccounts(fromKeyrings) {
        const oldAccounts = this.store.getState().accounts;
        const accounts = fromKeyrings.map((account, i) => {
            return Object.assign(
                {name: `Account ${i + 1}`},
                account,
                oldAccounts.find(oldAcc => oldAcc.publicKey === account.publicKey)
            )
        });
        this.store.updateState({accounts})
    }

    addLabel(account, label) {
        const accounts = this.store.getState().accounts;
        const index = accounts.findIndex(current => current.publicKey === account.publicKey);
        accounts[index].name = label;
        this.store.updateState({accounts})
    }

    selectAccount(account) {
        //const selectedAccount = this._getAccountByPk(publicKey);
        this.store.updateState({selectedAccount: account.publicKey})
    }

    _getAccountByPk(publicKey) {
        const accounts = this.store.getState().accounts;
        return accounts.find(account => account.publicKey === publicKey)
    }
}