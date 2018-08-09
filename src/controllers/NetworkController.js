import ObservableStore from 'obs-store';

const WAVESKEEPER_DEBUG = process.env.WAVESKEEPER_DEBUG;

export class NetworkController {
    constructor(options = {}){
        const defaults = {
            currentNetwork: WAVESKEEPER_DEBUG ? 'testnet' : 'mainnet'
        };
        this.store =  new ObservableStore(Object.assign({}, defaults, options.initState))
    }

    setNetwork(network){
        this.store.updateState({currentNetwork:network})
    }
}