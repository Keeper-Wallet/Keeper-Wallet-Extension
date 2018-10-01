import ObservableStore from 'obs-store';

const WAVES = {
    quantity: "10000000000000000",
    ticker: 'WAVES',
    id: 'WAVES',
    name: 'Waves',
    precision: 8,
    description: '',
    height: 0,
    timestamp: '2016-04-11T21:00:00.000Z',
    sender: '',
    reissuable: false,
    displayName: 'WAVES'
}
export class AssetInfoController {
    constructor(options = {}) {
        const defaults = {
            assets: {
                mainnet: {
                    WAVES
                },
                testnet: {
                    WAVES
                }
            }
        };
        this.getNode = options.getNode;
        this.getNetwork = options.getNetwork;
        this.store = new ObservableStore(Object.assign({}, defaults, options.initState));
    }

    async assetInfo(assetId) {
        const network = this.getNetwork();
        const API_BASE = this.getNode();
        const url = new URL(`assets/details/${assetId}`, API_BASE).toString();
        let assets = this.store.getState().assets;
        if (!assets[network][assetId]) {
            let assetInfo = await fetch(url).then(resp => resp.text())
                .then(text => JSON.parse(text.replace(/(".+?"[ \t\n]*:[ \t\n]*)(\d{15,})/gm,'$1"$2"')));
            
            if (! assetInfo.error){
                const mapped = {
                        quantity: assetInfo.quantity,
                        ticker: assetInfo.ticker,
                        id: assetInfo.assetId,
                        name: assetInfo.name,
                        precision: assetInfo.decimals,
                        description: assetInfo.description,
                        height: assetInfo.issueHeight,
                        timestamp: (new Date(parseInt(assetInfo.issueTimestamp))).toJSON(),
                        sender: assetInfo.issuer,
                        reissuable: assetInfo.reissuable,
                        displayName: assetInfo.ticker || assetInfo.name
                    }
                assets[network][assetId] = mapped;
                this.store.updateState({assets})
            }``
        }
        return assets[network][assetId]
    }
}