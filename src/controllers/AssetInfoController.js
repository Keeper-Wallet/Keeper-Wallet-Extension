import ObservableStore from 'obs-store';
import {default as DataServiceClient} from '@waves/data-service-client-js'
import {Money} from "@waves/data-entities";

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

    async addAssetInfo(tx){
        // Provide Money instance instead of raw number for tx
        const assetInfo = await this.assetInfo(tx.data.assetId);
        const feeAssetInfo = await this.assetInfo(tx.data.feeAssetId);
        const amount = new Money(tx.data.amount, assetInfo);
        const fee =  new Money(tx.data.fee, feeAssetInfo);
        const data =  Object.assign({}, tx.data, {amount, fee})
        return {
            data,
            type: tx.type
        }
    }
}