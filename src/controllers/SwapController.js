import { BigNumber } from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import { SIGN_TYPE } from '@waves/signature-adapter';
import { SWAP_DAPP_ADDRESS } from '../constants';

export class SwapController {
  constructor({
    assetInfoController,
    networkController,
    preferencesController,
    walletController,
  }) {
    this.assetInfoController = assetInfoController;
    this.networkController = networkController;
    this.preferencesController = preferencesController;
    this.walletController = walletController;
  }

  async swapAssets({
    feeCoins,
    feeAssetId,
    fromAssetId,
    fromCoins,
    minReceivedCoins,
    route,
    slippageTolerance,
  }) {
    const [feeAssetInfo, fromAssetInfo] = await Promise.all([
      this.assetInfoController.assetInfo(feeAssetId),
      this.assetInfoController.assetInfo(fromAssetId),
    ]);

    const tx = {
      type: SIGN_TYPE.SCRIPT_INVOCATION,
      data: {
        timestamp: Date.now(),
        dApp: SWAP_DAPP_ADDRESS,
        fee: new Money(new BigNumber(feeCoins), new Asset(feeAssetInfo)),
        payment: [
          new Money(new BigNumber(fromCoins), new Asset(fromAssetInfo)),
        ],
        call: {
          function: 'testSeq',
          args: [
            {
              type: 'list',
              value: route.map(pool => ({
                type: 'string',
                value: pool.dApp,
              })),
            },
            {
              type: 'list',
              value: route.map(pool => ({
                type: 'string',
                value: pool.toAssetId,
              })),
            },
            {
              type: 'list',
              value: route.map(pool => ({
                type: 'integer',
                value: pool.type === 'flat' ? pool.estimatedAmount : 0,
              })),
            },
            {
              type: 'integer',
              value: slippageTolerance,
            },
            {
              type: 'integer',
              value: minReceivedCoins,
            },
          ],
        },
      },
    };

    const network = this.networkController.getNetwork();
    const selectedAccount = this.preferencesController.getSelectedAccount();

    const signedTx = await this.walletController.signTx(
      selectedAccount.address,
      tx,
      network
    );

    const text = await this.networkController.broadcast({
      type: 'transaction',
      result: signedTx,
    });

    const json = JSON.parse(text);

    return {
      transactionId: json.id,
    };
  }
}
