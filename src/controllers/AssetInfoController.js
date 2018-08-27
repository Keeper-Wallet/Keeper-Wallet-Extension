import ObservableStore from 'obs-store';
import {default as DataServiceClient} from '@waves/data-service-client-js'

export class AssetInfoController {
    constructor(options = {}) {
        this.store = new ObservableStore(Object.assign({}, options.initState));
        this.client = new DataServiceClient({
            rootUrl: 'http://api.wavesplatform.com/v0',
            fetch: req => fetch(req).then(res => res.text()), // fetch must return string
            parse: str => JSON.parse(str),
        });
    }

    async assetInfo(assetId) {
        let assetInfo = this.store.getState()[assetId];
        if (!assetInfo) {
            assetInfo = (await this.client.getAssets(assetId)).data[0];
            this.store.updateState({[assetId]: assetInfo})
        }
        return assetInfo
    }
}