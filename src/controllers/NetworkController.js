import ObservableStore from 'obs-store';
import { NETWORKS, NETWORK_CODES } from '../constants';

const WAVESKEEPER_DEBUG = process.env.WAVESKEEPER_DEBUG;

export class NetworkController {
    constructor(options = {}){
        const defaults = {
            currentNetwork: WAVESKEEPER_DEBUG ? 'testnet' : 'mainnet'
        };
        this.store =  new ObservableStore(Object.assign({}, defaults, options.initState))
    }

    getNetworks() {
        return NETWORKS.map(name => ({ name, code: NETWORK_CODES[name] }));
    }

    setNetwork(network){
        this.store.updateState({currentNetwork:network})
    }

    getNetwork(){
        return this.store.getState().currentNetwork
    }
}
