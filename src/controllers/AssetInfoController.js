import ObservableStore from 'obs-store';
import {default as DataServiceClient} from '@waves/data-service-client-js'

export class AssetInfoController {
    constructor(options = {}) {
        const defaults = {
            assets: {
                mainnet:{},
                testnet:{}
            }
        }
        this.getNetwork = options.getNetwork
        this.store = new ObservableStore(Object.assign({}, defaults, options.initState));
        this.clients ={
            mainnet: new DataServiceClient({
                rootUrl: 'http://api.wavesplatform.com/v0',
                fetch: req => fetch(req).then(res => res.text()), // fetch must return string
                parse: str => JSON.parse(str),
            }),
            testnet: new DataServiceClient({
                rootUrl: 'http://api.testnet.wavesplatform.com/v0',
                fetch: req => fetch(req).then(res => res.text()), // fetch must return string
                parse: str => JSON.parse(str),
            })
        }
    }

    async assetInfo(assetId) {
        const network = this.getNetwork()
        let assets = this.store.getState().assets;
        if (!assets[network][assetId]) {
            let assetInfo = (await this.clients[network].getAssets(assetId)).data[0];
            //Convert Bignuber to string
            if (assetInfo) assetInfo.quantity = assetInfo.quantity.toString();
            assets[network][assetId] = assetInfo;
            this.store.updateState({assets})
        }
        return assets[network][assetId]
    }
}