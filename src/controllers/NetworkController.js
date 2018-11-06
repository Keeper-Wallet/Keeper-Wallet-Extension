import ObservableStore from 'obs-store';
import { NETWORKS, NETWORK_CONFIG } from '../constants';

const WAVESKEEPER_DEBUG = process.env.WAVESKEEPER_DEBUG;


export class NetworkController {
    constructor(options = {}){
        const defaults = {
            currentNetwork: WAVESKEEPER_DEBUG ? 'testnet' : 'mainnet',
            customNodes: {
                mainnet: null,
                testnet: null
            },
            customMatchers: {
                mainnet: null,
                testnet: null
            }
        };
        this.store =  new ObservableStore(Object.assign({}, defaults, options.initState))
    }

    getNetworks() {
        return NETWORKS.map(name => ({ ...NETWORK_CONFIG[name], name }));
    }

    setNetwork(network){
        this.store.updateState({currentNetwork:network});
    }

    getNetwork(){
        return this.store.getState().currentNetwork
    }

    setCustomNode(url, network = 'mainnet'){
        let { customNodes } = this.store.getState();
        customNodes[network] = url;
        this.store.updateState({customNodes});
    }

    setCustomMatcher(url, network = 'mainnet'){
        let { customMatchers } = this.store.getState();
        customMatchers[network] = url;
        this.store.updateState({customMatchers});
    }

    getCustomNodes(){
        return this.store.getState().customNodes;
    }

    getNode(){
        const network = this.getNetwork();
        return this.getCustomNodes()[network] || NETWORK_CONFIG[network].server;
    }

    getCustomMatchers(){
        return this.store.getState().customMatchers;
    }

    getMather(){
        const network = this.getNetwork();
        return this.getCustomMatchers()[network] || NETWORK_CONFIG[network].matcher;
    }

    async getMatcherPublicKey(){
        const keyMap = {};
        const url =  new URL('/matcher', this.getMather()).toString();
        if (keyMap[url] == null){
            const resp = await fetch(url);

            keyMap[url] = await resp.text()
        }
        console.log(keyMap[url]);
        return keyMap[url];
    }

    async broadcast(message){
        const {data,  type} = message;
        let API_BASE, url;

        switch (type) {
            case 'transaction':
                API_BASE = this.getNode();
                url = new URL('transactions/broadcast', API_BASE).toString();
                break;
            case 'order':
                API_BASE = this.getMather();
                if (!API_BASE){
                    throw new Error('Matcher not set. Cannot send order')
                }
                url = new URL('matcher/orderbook', API_BASE).toString();
                break;
            case 'cancelOrder':
                const {amountId, priceId} = message;
                API_BASE = this.getMather();
                if (!API_BASE){
                    throw new Error('Matcher not set. Cannot send order')
                }
                url = new URL(`matcher/orderbook/${amountId}/${priceId}/cancel`, API_BASE).toString();
                break;
            default:
                throw new Error(`Unknown message type: ${type}`)
        }

        const resp =  await fetch(url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: data
        });

        switch (resp.status) {
            case 200:
                return await resp.text();
            case 400:
                const error = await resp.json();
                throw new Error(error.message);
            default:
                throw new Error(await resp.text())
        }
    }

}

