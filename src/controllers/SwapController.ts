import { BigNumber } from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import { SwapClientInvokeTransaction } from '@keeper-wallet/swap-client';
import { AssetInfoController } from './assetInfo';
import { NetworkController } from './network';
import { PreferencesController } from './preferences';
import { WalletController } from './wallet';
import ObservableStore from 'obs-store';
import { ExtensionStorage } from 'storage/storage';
import { extension } from 'lib/extension';

export interface SwapAssetsParams {
  feeCoins: string;
  feeAssetId: string;
  tx: SwapClientInvokeTransaction;
}

export interface SwapAssetsResult {
  transactionId: string;
}

const SWAPPABLE_ASSETS_FROM_VENDOR_URL =
  'https://swap-api.keeper-wallet.app/assets';
const SWAPPABLE_ASSETS_FROM_VENDOR_PERIOD_IN_MINUTES = 240;

export class SwapController {
  private assetInfoController;
  private networkController;
  private preferencesController;
  private walletController;
  private store;

  constructor({
    assetInfoController,
    networkController,
    preferencesController,
    walletController,
    extensionStorage,
  }: {
    assetInfoController: AssetInfoController;
    networkController: NetworkController;
    preferencesController: PreferencesController;
    walletController: WalletController;
    extensionStorage: ExtensionStorage;
  }) {
    this.assetInfoController = assetInfoController;
    this.networkController = networkController;
    this.preferencesController = preferencesController;
    this.walletController = walletController;

    const initState = extensionStorage.getInitState({
      swappableAssetsFromVendor: {},
    });

    this.store = new ObservableStore(initState);
    extensionStorage.subscribe(this.store);

    extension.alarms.create('updateSwappableAssetsFromVendor', {
      periodInMinutes: SWAPPABLE_ASSETS_FROM_VENDOR_PERIOD_IN_MINUTES,
    });

    extension.alarms.onAlarm.addListener(({ name }) => {
      switch (name) {
        case 'updateSwappableAssetsFromVendor':
          this.updateSwappableAssetsFromVendor();
          break;
        default:
          break;
      }
    });
  }

  async updateSwappableAssetsFromVendor() {
    console.log('updateSwappableAssetsFromVendor');
    const resp = await fetch(new URL(SWAPPABLE_ASSETS_FROM_VENDOR_URL));

    if (resp.ok) {
      const swappableAssetsFromVendor = await resp.json();
      this.store.updateState({ swappableAssetsFromVendor });
    }
  }

  getSwappableAssetsFromVendor = () => this.store.getState().swappableAssetsFromVendor;

  async swapAssets({
    feeCoins,
    feeAssetId,
    tx,
  }: SwapAssetsParams): Promise<SwapAssetsResult> {
    const [feeAssetInfo, ...paymentAssetInfos] = await Promise.all([
      this.assetInfoController.assetInfo(feeAssetId),
      ...tx.payment.map(payment =>
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.assetInfoController.assetInfo(payment.assetId!)
      ),
    ]);

    const network = this.networkController.getNetwork();
    const selectedAccount = this.preferencesController.getSelectedAccount();

    const signedTx = await this.walletController.signTx(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      selectedAccount!.address,
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
