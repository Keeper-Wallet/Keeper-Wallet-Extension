import { Asset, Money } from '@waves/data-entities';
import { SIGN_TYPE } from '@waves/signature-adapter';
import ObservableStore from 'obs-store';
import { SWAP_DAPPS } from '../constants';

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

  async performSwap({
    exchangerId,
    fee,
    feeAssetId,
    fromAssetId,
    fromCoins,
    minReceivedCoins,
    toAssetId,
    toCoins,
  }) {
    const network = this.getNetwork();
    const dApp = SWAP_DAPPS[network];

    if (!dApp) {
      throw new Error(
        `swapping is not supported in current network (${network})`
      );
    }

    const selectedAccount = this.getSelectedAccount();

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
        dApp,
        fee: Money.fromCoins(fee, new Asset(feeAssetInfo)),
        payment: [Money.fromCoins(fromCoins, new Asset(fromAssetInfo))],
        call: {
          function: 'swap',
          args: [
            { type: 'string', value: exchangerId },
            { type: 'string', value: toAssetId },
            { type: 'integer', value: minReceivedCoins },
            { type: 'integer', value: exchangerVersion === 2 ? toCoins : 0 },
          ],
        },
      },
    };

    const signedTx = await this.signTx(selectedAccount.address, tx, network);

    const sendTx = async () => {
      const text = await this.broadcast({
        type: 'transaction',
        result: signedTx,
      });

      const json = JSON.parse(text);

      return json.id;
    };

    const transactionId = await sendTx();

    return {
      transactionId,
    };
  }
}
