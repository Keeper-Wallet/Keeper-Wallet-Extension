import ObservableStore from 'obs-store';
import EventEmitter from 'events';
import { libs, utils, TX_TYPE_MAP } from '@waves/signature-generator';
import {addressFromPublicKey} from '../lib/cryptoUtil'

export class BalanceController {
    constructor(options = {}){
        const defaults = {
            balances: {},
            pollInterval: options.pollInterval || 10000
        };

        this.getAccounts = options.getAccounts;
        this.getNetwork = options.getNetwork;
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
        const urlBase = URL_MAP[network];
        let balances = await Promise.all(accounts.map(async account => {
            const address = addressFromPublicKey(account.publicKey, network);
            const url = `${urlBase}addresses/balance/${address}`;
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


const URL_MAP = {
    testnet: 'https://testnet1.wavesnodes.com/',
    mainnet: 'https://nodes.wavesplatform.com/'
}
