import { BigNumber } from '@waves/bignumber';
import { Money } from '@waves/data-entities';
import {
  ISignData,
  ISignOrderData,
  ISignTxData,
} from '@waves/ledger/lib/Waves';
import { base58Encode, blake2b } from '@waves/ts-lib-crypto';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import { customData, serializeCustomData } from '@waves/waves-transactions';
import { TCustomData } from '@waves/waves-transactions/dist/requests/custom-data';
import { serializeWavesAuthData } from '@waves/waves-transactions/dist/requests/wavesAuth';
import { IWavesAuthParams } from '@waves/waves-transactions/dist/transactions';
import { validate } from '@waves/waves-transactions/dist/validators';
import { AssetInfoController } from 'controllers/assetInfo';
import { NetworkName } from 'networks/types';
import * as create from 'parse-json-bignumber';
import {
  convertFromSa,
  makeBytes,
  SaAuth,
  SaCancelOrder,
  SaOrder,
  SaRequest,
  SaTransaction,
} from 'transactions/utils';

import { WalletPrivateDataOfType } from './types';
import { Wallet } from './wallet';

const { stringify } = create({ BigNumber });

export interface LedgerWalletInput {
  address: string;
  id: number;
  name: string;
  network: NetworkName;
  networkCode: string;
  publicKey: string;
}

export interface LedgerApi {
  signOrder: (data: ISignOrderData) => Promise<string>;
  signRequest: (data: ISignData) => Promise<string>;
  signSomeData: (data: ISignData) => Promise<string>;
  signTransaction: (data: ISignTxData) => Promise<string>;
}

export class LedgerWallet extends Wallet<WalletPrivateDataOfType<'ledger'>> {
  private getAssetInfo;
  private readonly ledger;

  constructor(
    { address, id, name, network, networkCode, publicKey }: LedgerWalletInput,
    ledger: LedgerApi,
    getAssetInfo: AssetInfoController['assetInfo']
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

    this.getAssetInfo = getAssetInfo;
    this.ledger = ledger;
  }

  getAccount() {
    return {
      address: this.data.address,
      name: this.data.name,
      network: this.data.network,
      networkCode: this.data.networkCode,
      publicKey: this.data.publicKey,
      type: this.data.type,
      id: this.data.id,
    };
  }

  getSeed(): string {
    throw new Error('Cannot get seed');
  }

  getPrivateKey(): string {
    throw new Error('Cannot get private key');
  }

  async signTx(tx: SaTransaction): Promise<string> {
    let amountPrecision: number, amount2Precision: number;

    if (tx.type === TRANSACTION_TYPE.INVOKE_SCRIPT) {
      const payment: Money[] = tx.data.payment ?? [];
      amountPrecision = payment[0]?.asset.precision || 0;
      amount2Precision = payment[1]?.asset.precision || 0;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      amountPrecision = (tx.data as any).amount?.asset?.precision || 0;
      amount2Precision = 0;
    }

    const result = convertFromSa.transaction(
      tx,
      this.data.networkCode.charCodeAt(0),
      'ledger'
    );

    const feePrecision =
      ('feeAssetId' in result &&
        (await this.getAssetInfo(result.feeAssetId))?.precision) ||
      0;

    result.proofs.push(
      await this.ledger.signTransaction({
        amountPrecision,
        amount2Precision,
        feePrecision,
        dataBuffer: makeBytes.transaction(result),
        dataType: result.type,
        dataVersion: result.version,
      })
    );

    return stringify(result);
  }

  async signAuth(auth: SaAuth) {
    return this.ledger.signRequest({
      dataBuffer: makeBytes.auth(convertFromSa.auth(auth)),
    });
  }

  async signRequest(request: SaRequest) {
    return this.ledger.signRequest({
      dataBuffer: makeBytes.request(convertFromSa.request(request)),
    });
  }

  async signOrder(order: SaOrder): Promise<string> {
    const result = convertFromSa.order(
      order,
      this.data.networkCode.charCodeAt(0)
    );

    result.proofs.push(
      await this.ledger.signOrder({
        amountPrecision: order.data.amount?.asset?.precision || 0,
        feePrecision: 8,
        dataBuffer: makeBytes.order(result),
        dataVersion: result.version,
      })
    );

    return stringify(result);
  }

  async signCancelOrder(cancelOrder: SaCancelOrder): Promise<string> {
    const result = convertFromSa.cancelOrder(cancelOrder);

    result.signature = await this.ledger.signRequest({
      dataBuffer: makeBytes.cancelOrder(result),
    });

    return stringify(result);
  }

  async signWavesAuth(data: IWavesAuthParams) {
    const account = this.getAccount();
    const publicKey = data.publicKey || account.publicKey;
    const timestamp = data.timestamp || Date.now();
    validate.wavesAuth({ publicKey, timestamp });

    const rx = {
      timestamp,
      publicKey,
      address: account.address,
    };

    const bytes = serializeWavesAuthData(rx);

    return {
      ...rx,
      hash: base58Encode(blake2b(bytes)),
      signature: await this.ledger.signSomeData({ dataBuffer: bytes }),
    };
  }

  async signCustomData(data: TCustomData) {
    const bytes = serializeCustomData(data);

    return {
      ...customData(data),
      publicKey: data.publicKey || this.getAccount().publicKey,
      signature: await this.ledger.signSomeData({ dataBuffer: bytes }),
    };
  }
}
