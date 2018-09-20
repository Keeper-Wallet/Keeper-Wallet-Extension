import ObservableStore from 'obs-store';
import {addressFromPublicKey} from '../lib/cryptoUtil'
import {NETWORK_CONFIG} from "../constants";

export class BalanceController {
    constructor(options = {}){
        const defaults = {
            balances: {},
            pollInterval: options.pollInterval || 10000
        };

        this.getAccounts = options.getAccounts;
        this.getNetwork = options.getNetwork;
        this.getCustomNodes = options.getCustomNodes
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
        const network = this.getNetwork();
        const API_BASE = this.getCustomNodes()[network] || NETWORK_CONFIG[this.getNetwork()].server
        let balances = await Promise.all(accounts.map(async account => {
            const address = addressFromPublicKey(account.publicKey, network);
            const url = new URL(`addresses/balance/${address}`, API_BASE).toString()
            try {
                return await fetch(url).then(resp => resp.json())
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
