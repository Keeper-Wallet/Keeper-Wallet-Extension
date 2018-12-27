import ObservableStore from 'obs-store';
import {NETWORK_CONFIG} from "../constants";
import { BigNumber } from "@waves/data-entities";

export class BalanceController {

    active = true;

    constructor(options = {}) {
        const defaults = {
            balances: {},
            pollInterval: options.pollInterval || 10000
        };

        this.getAccounts = options.getAccounts;
        this.getNetwork = options.getNetwork;
        this.getNode = options.getNode;
        this.store = new ObservableStore(Object.assign({}, defaults, options.initState));
        this.poller = undefined;
        this.restartPolling();
    }

    restartPolling() {
        clearInterval(this.poller);
        const pollInterval = this.store.getState().pollInterval;
        this.poller = setInterval(this.updateBalances.bind(this), pollInterval)
    }

    getByUrl(url) {
        const API_BASE = this.getNode();
        url = new URL(url, API_BASE).toString();

        return fetch(url)
            .then(resp => resp.text())
            .then(txt => JSON.parse(txt.replace(/(".+?"[ \t\n]*:[ \t\n]*)(\d{15,})/gm, '$1"$2"')))
    }

    async updateBalances() {
        const accounts = this.getAccounts().filter(account => account.networkCode === NETWORK_CONFIG[this.getNetwork()].code);
        if (!this.active || accounts.length < 1) return;

        const data = await Promise.all(
            accounts.map(async account => {
                try {
                    const address = account.address;
                    const wavesBalances = await this.getByUrl(`addresses/balance/details/${address}`);
                    const available = new BigNumber(wavesBalances.available);
                    const regular = new BigNumber(wavesBalances.regular);
                    const leasedOut = regular.minus(available);
                    return { available: available.toString(), leasedOut: leasedOut.toString(), address };
                } catch (e) {
                    return null;
                }
            })
        );

        const balances = data.reduce((prev, next) => {
            if (next) {
                const { address, ...balance } = next;
                prev[address] = balance;
            }
            return prev
        }, Object.create(null));

        const oldBalances = this.store.getState().balances;
        this.store.updateState({balances: Object.assign({}, oldBalances, balances)})
    }
}
