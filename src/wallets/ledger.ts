import { base58Decode } from '@keeper-wallet/waves-crypto';
import {
  type ISignData,
  type ISignOrderData,
  type ISignTxData,
} from '@waves/ledger/lib/Waves';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import { type AssetInfoController } from 'controllers/assetInfo';
import { type MessageTx } from 'messages/types';
import { type NetworkName } from 'networks/types';

import { type WalletPrivateDataOfType } from './types';
import { Wallet } from './wallet';

export interface LedgerApi {
  signOrder: (data: ISignOrderData) => Promise<string>;
  signRequest: (data: ISignData) => Promise<string>;
  signSomeData: (data: ISignData) => Promise<string>;
  signTransaction: (data: ISignTxData) => Promise<string>;
}

export class LedgerWallet extends Wallet<WalletPrivateDataOfType<'ledger'>> {
  readonly #getAssetInfo;
  readonly #ledger;

  constructor(
    {
      address,
      id,
      name,
      network,
      networkCode,
      publicKey,
    }: {
      address: string;
      id: number;
      name: string;
      network: NetworkName;
      networkCode: string;
      publicKey: string;
    },
    ledger: LedgerApi,
    getAssetInfo: AssetInfoController['assetInfo'],
  ) {
    super({
      address,
      id,
      name,
      network,
      networkCode,
      publicKey,
      type: 'ledger',
    });

    this.#getAssetInfo = getAssetInfo;
    this.#ledger = ledger;
  }

  getAccount() {
    return {
      address: this.data.address,
      id: this.data.id,
      name: this.data.name,
      network: this.data.network,
      networkCode: this.data.networkCode,
      publicKey: this.data.publicKey,
      type: this.data.type,
    };
  }

  protected async signBytes(dataBuffer: Uint8Array) {
    const signature = await this.#ledger.signSomeData({ dataBuffer });
    return base58Decode(signature);
  }

  async signAuth(dataBuffer: Uint8Array) {
    const signature = await this.#ledger.signRequest({ dataBuffer });

    return base58Decode(signature);
  }

  async signCancelOrder(dataBuffer: Uint8Array) {
    const signature = await this.#ledger.signRequest({ dataBuffer });

    return base58Decode(signature);
  }

  async signOrder(dataBuffer: Uint8Array, dataVersion: 1 | 2 | 3 | 4) {
    const signature = await this.#ledger.signOrder({ dataBuffer, dataVersion });

    return base58Decode(signature);
  }

  async signRequest(dataBuffer: Uint8Array) {
    const signature = await this.#ledger.signRequest({ dataBuffer });

    return base58Decode(signature);
  }

  async signTx(dataBuffer: Uint8Array, tx: MessageTx) {
    let amountPrecision = 0;
    let feePrecision = 0;

    switch (tx.type) {
      case TRANSACTION_TYPE.TRANSFER: {
        const [asset, feeAsset] = await Promise.all([
          this.#getAssetInfo(tx.assetId),
          this.#getAssetInfo(tx.feeAssetId),
        ]);

        amountPrecision = asset.precision;
        feePrecision = feeAsset.precision;
        break;
      }
    }

    const signature = await this.#ledger.signTransaction({
      amountPrecision,
      feePrecision,
      dataBuffer,
      dataType: tx.type,
      dataVersion: tx.version,
    });

    return base58Decode(signature);
  }
}
