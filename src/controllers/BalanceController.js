import ObservableStore from 'obs-store';

export class BalanceController {
    constructor(options = {}){
        const defaults = {
            balances: {},
            pollInterval: options.pollInterval || 10000
        };

        this.getAccounts = options.getAccounts;
        this.getNode = options.getNode;
        this.store = new ObservableStore(Object.assign({}, defaults, options.initState));
        this.poller = undefined;
        this.restartPolling();
    }

    restartPolling(){
        clearInterval(this.poller);
        const pollInterval = this.store.getState().pollInterval;
        this.poller = setInterval(this.updateBalances.bind(this), pollInterval)
    }

    async updateBalances(){
        const accounts = this.getAccounts();
        if (accounts.length < 1) return;
        const API_BASE = this.getNode();
        let balances = await Promise.all(accounts.map(async account => {
            const address = account.address;
            const url = new URL(`addresses/balance/${address}`, API_BASE).toString()
            try {
                return await fetch(url)
                    .then(resp => resp.text())
                    // Convert numbers to strings
                    .then(text => JSON.parse(text.replace(/(".+?"[ \t\n]*:[ \t\n]*)(\d{15,})/gm,'$1"$2"')))
            }catch (e) {
                return undefined
            }
        }));
        balances = balances.filter(bal => bal !== undefined).reduce((prev, next) => {
            prev[next.address] = next.balance;
            return prev
        },{});
        const oldBalances = this.store.getState().balances;
        this.store.updateState({balances: Object.assign({}, oldBalances, balances)})
    }
}
