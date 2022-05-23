import { BigNumber } from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import { SwapClientInvokeTransaction } from 'swap/client';

export interface SwapAssetsParams {
  feeCoins: string;
  feeAssetId: string;
  tx: SwapClientInvokeTransaction;
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
    tx,
  }: SwapAssetsParams): Promise<SwapAssetsResult> {
    const [feeAssetInfo, ...paymentAssetInfos] = await Promise.all([
      this.assetInfoController.assetInfo(feeAssetId),
      ...tx.payment.map(payment =>
        this.assetInfoController.assetInfo(payment.assetId)
      ),
    ]);

    const network = this.networkController.getNetwork();
    const selectedAccount = this.preferencesController.getSelectedAccount();

    const signedTx = await this.walletController.signTx(
      selectedAccount.address,
      {
        type: TRANSACTION_TYPE.INVOKE_SCRIPT,
        data: {
          dApp: tx.dApp,
          call: tx.call,
          payment: tx.payment.map(
            (payment, index) =>
              new Money(
                new BigNumber(payment.amount),
                new Asset(paymentAssetInfos[index])
              )
          ),
          timestamp: Date.now(),
          fee: new Money(new BigNumber(feeCoins), new Asset(feeAssetInfo)),
        },
      },
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
