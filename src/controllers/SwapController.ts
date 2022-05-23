import { BigNumber } from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import { SwapClientInvokeParams } from 'swap/client/channelClient';

export interface SwapAssetsParams {
  feeCoins: string;
  feeAssetId: string;
  fromAssetId: string;
  fromCoins: string;
  invoke: SwapClientInvokeParams;
}

export interface SwapAssetsResult {
  transactionId: string;
}

export class SwapController {
  private assetInfoController;
  private networkController;
  private preferencesController;
  private walletController;

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
    invoke,
  }: SwapAssetsParams): Promise<SwapAssetsResult> {
    const [feeAssetInfo, fromAssetInfo] = await Promise.all([
      this.assetInfoController.assetInfo(feeAssetId),
      this.assetInfoController.assetInfo(fromAssetId),
    ]);

    const tx = {
      type: TRANSACTION_TYPE.INVOKE_SCRIPT,
      data: {
        timestamp: Date.now(),
        dApp: invoke.dApp,
        fee: new Money(new BigNumber(feeCoins), new Asset(feeAssetInfo)),
        payment: [
          new Money(new BigNumber(fromCoins), new Asset(fromAssetInfo)),
        ],
        call: {
          function: invoke.function,
          args: invoke.args,
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
