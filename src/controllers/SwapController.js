import ObservableStore from 'obs-store';

const swopFiConfigsByNetwork = {
  mainnet: {
    backend: 'https://backend.swop.fi',
  },
  testnet: {
    backend: 'https://backend-dev.swop.fi',
  },
};

export class SwapController {
  constructor(options) {
    const defaults = {
      exchangers: {
        mainnet: null,
        testnet: null,
      },
    };

    this.store = new ObservableStore(
      Object.assign({}, defaults, options.initState)
    );

    this.getAssets = options.getAssets;
    this.updateAssets = options.updateAssets;
  }

  async updateExchangers(network) {
    const swopFiConfig = swopFiConfigsByNetwork[network];

    if (!swopFiConfig) {
      throw new Error(`exchangers are not available for network "${network}"`);
    }

    const json = await fetch(
      new URL('/exchangers/', swopFiConfig.backend).toString()
    ).then(res => res.json());

    if (!json.success) {
      throw new Error('Could not fetch exchangers from SwopFi backend');
    }

    const activeExchangers = Object.fromEntries(
      Object.entries(json.data).filter(([_id, exchanger]) => exchanger.active)
    );

    const { exchangers } = this.store.getState();

    exchangers[network] = activeExchangers;

    const assetIdsFromExchangers = Array.from(
      new Set(
        Object.values(activeExchangers).flatMap(exchanger => [
          exchanger.A_asset_id,
          exchanger.B_asset_id,
        ])
      )
    );

    const assets = this.getAssets();

    const assetIdsToFetch = assetIdsFromExchangers.filter(
      assetId => !assets[assetId]
    );

    if (assetIdsToFetch.length !== 0) {
      await this.updateAssets(assetIdsToFetch);
    }

    this.store.updateState({ exchangers });
  }
}
