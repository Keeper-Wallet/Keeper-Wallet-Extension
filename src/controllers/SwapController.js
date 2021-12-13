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

    this.store.updateState({ exchangers });
  }
}
