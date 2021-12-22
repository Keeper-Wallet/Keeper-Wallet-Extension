import { Asset, Money } from '@waves/data-entities';
import { SIGN_TYPE } from '@waves/signature-adapter';
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

    this.assetInfo = options.assetInfo;
    this.broadcast = options.broadcast;
    this.getAssets = options.getAssets;
    this.getNetwork = options.getNetwork;
    this.getSelectedAccount = options.getSelectedAccount;
    this.signTx = options.signTx;
    this.updateAssets = options.updateAssets;
  }

  async updateExchangers(network) {
    const swopFiConfig = swopFiConfigsByNetwork[network];

    if (!swopFiConfig) {
      throw new Error(`exchangers are not available for network "${network}"`);
    }

    const [exchangersJson, exchangersDataJson] = await Promise.all([
      fetch(new URL('/exchangers/', swopFiConfig.backend).toString()).then(
        res => res.json()
      ),
      fetch(new URL('/exchangers/data/', swopFiConfig.backend).toString()).then(
        res => res.json()
      ),
    ]);

    if (!exchangersJson.success || !exchangersDataJson.success) {
      throw new Error('Could not fetch exchangers from SwopFi backend');
    }

    const activeExchangers = Object.fromEntries(
      Object.entries(exchangersJson.data)
        .filter(([_id, exchanger]) => exchanger.active)
        .map(([id, exchanger]) => [
          id,
          {
            ...exchanger,
            ...exchangersDataJson.data[id],
          },
        ])
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

  async performSwap({
    exchangerId,
    fee,
    feeAssetId,
    fromAssetId,
    fromCoins,
    minReceivedCoins,
    toCoins,
  }) {
    const selectedAccount = this.getSelectedAccount();

    const network = this.getNetwork();
    const { exchangers } = this.store.getState();
    const exchanger = exchangers[network][exchangerId];

    const [feeAssetInfo, fromAssetInfo] = await Promise.all([
      this.assetInfo(feeAssetId),
      this.assetInfo(fromAssetId),
    ]);

    const exchangerVersion = Number(exchanger.version.split('.')[0]);

    const tx = {
      type: SIGN_TYPE.SCRIPT_INVOCATION,
      data: {
        dApp: exchangerId,
        fee: Money.fromCoins(fee, new Asset(feeAssetInfo)),
        payment: [Money.fromCoins(fromCoins, new Asset(fromAssetInfo))],
        call: {
          function: 'exchange',
          args: [{ type: 'integer', value: toCoins }].concat(
            exchangerVersion === 2
              ? [{ type: 'integer', value: minReceivedCoins }]
              : []
          ),
        },
      },
    };

    const signedTx = await this.signTx(selectedAccount.address, tx, network);

    const text = await this.broadcast({
      type: 'transaction',
      result: signedTx,
    });

    const json = JSON.parse(text);

    return {
      transactionId: json.id,
    };
  }
}
