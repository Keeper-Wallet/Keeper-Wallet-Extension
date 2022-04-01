import { BigNumber } from '@waves/bignumber';
import { Money } from '@waves/data-entities';
import {
  ISignData,
  ISignOrderData,
  ISignTxData,
} from '@waves/ledger/lib/Waves';
import { binary, serializePrimitives } from '@waves/marshall';
import { base58Encode, blake2b, concat } from '@waves/ts-lib-crypto';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import {
  customData,
  makeTxBytes,
  serializeCustomData,
} from '@waves/waves-transactions';
import { serializeAuthData } from '@waves/waves-transactions/dist/requests/auth';
import { cancelOrderParamsToBytes } from '@waves/waves-transactions/dist/requests/cancel-order';
import { TCustomData } from '@waves/waves-transactions/dist/requests/custom-data';
import { serializeWavesAuthData } from '@waves/waves-transactions/dist/requests/wavesAuth';
import { validate } from '@waves/waves-transactions/dist/validators';
import * as create from 'parse-json-bignumber';
import { AccountOfType, NetworkName } from 'accounts/types';
import { AssetDetail } from 'ui/services/Background';
import { fromSignatureAdapterToNode } from 'transactions/utils';
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

type LedgerWalletData = AccountOfType<'ledger'> & {
  id: number;
};

export interface LedgerApi {
  signOrder: (data: ISignOrderData) => Promise<string>;
  signRequest: (data: ISignData) => Promise<string>;
  signSomeData: (data: ISignData) => Promise<string>;
  signTransaction: (data: ISignTxData) => Promise<string>;
}

type GetAssetInfo = (assetId: string | null) => Promise<AssetDetail>;

export class LedgerWallet extends Wallet<LedgerWalletData> {
  private getAssetInfo: GetAssetInfo;
  private readonly ledger: LedgerApi;

  constructor(
    { address, id, name, network, networkCode, publicKey }: LedgerWalletInput,
    ledger: LedgerApi,
    getAssetInfo: GetAssetInfo
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

  getAccount(): LedgerWalletData {
    const { id } = this.data;

    return {
      ...super.getAccount(),
      type: 'ledger',
      id,
    };
  }

  getSeed(): string {
    throw new Error('Cannot get seed');
  }

  getPrivateKey(): string {
    throw new Error('Cannot get private key');
  }

  async signWavesAuth(data: { publicKey?: string; timestamp?: number }) {
    const publicKey = data.publicKey || this.data.publicKey;
    const timestamp = data.timestamp || Date.now();
    validate.wavesAuth({ publicKey, timestamp });

    const rx = {
      timestamp,
      publicKey,
      address: this.data.address,
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
      publicKey: data.publicKey || this.data.publicKey,
      signature: await this.ledger.signSomeData({ dataBuffer: bytes }),
    };
  }

  async signTx(tx): Promise<string> {
    const defaultChainId = this.data.networkCode.charCodeAt(0);

    let amountPrecision: number, amount2Precision: number;

    if (tx.type === TRANSACTION_TYPE.INVOKE_SCRIPT) {
      const payment: Money[] = tx.data.payment ?? [];
      amountPrecision = payment[0]?.asset.precision || 0;
      amount2Precision = payment[1]?.asset.precision || 0;
    } else {
      amountPrecision = tx.data.amount?.asset?.precision || 0;
      amount2Precision = 0;
    }

    switch (tx.type) {
      case TRANSACTION_TYPE.ISSUE:
      case TRANSACTION_TYPE.TRANSFER:
      case TRANSACTION_TYPE.REISSUE:
      case TRANSACTION_TYPE.BURN:
      case TRANSACTION_TYPE.LEASE:
      case TRANSACTION_TYPE.CANCEL_LEASE:
      case TRANSACTION_TYPE.ALIAS:
      case TRANSACTION_TYPE.MASS_TRANSFER:
      case TRANSACTION_TYPE.DATA:
      case TRANSACTION_TYPE.SET_SCRIPT:
      case TRANSACTION_TYPE.SPONSORSHIP:
      case TRANSACTION_TYPE.SET_ASSET_SCRIPT:
      case TRANSACTION_TYPE.INVOKE_SCRIPT:
      case TRANSACTION_TYPE.UPDATE_ASSET_INFO: {
        const result = fromSignatureAdapterToNode.transaction(
          tx,
          defaultChainId
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
            dataBuffer: makeTxBytes(result),
            dataType: result.type,
            dataVersion: result.version,
          })
        );

        return stringify(result);
      }
      case 1002: {
        const result = fromSignatureAdapterToNode.order(tx);

        result.proofs.push(
          await this.ledger.signOrder({
            amountPrecision,
            feePrecision: 8,
            dataBuffer: binary.serializeOrder(result),
            dataVersion: result.version,
          })
        );

        return stringify(result);
      }
      case 1003: {
        const result = fromSignatureAdapterToNode.cancelOrder(tx);

        result.signature = await this.ledger.signRequest({
          dataBuffer: cancelOrderParamsToBytes(result),
        });

        return stringify(result);
      }
      default:
        throw new Error(`Unexpected tx type: ${tx.type}`);
    }
  }

  async signRequest(request) {
    switch (request.type) {
      case 1000:
        return this.ledger.signRequest({
          dataBuffer: serializeAuthData({
            data: request.data.data,
            host: request.data.host,
          }),
        });
      case 1001:
        return this.ledger.signRequest({
          dataBuffer: concat(
            serializePrimitives.BASE58_STRING(request.data.senderPublicKey),
            serializePrimitives.LONG(request.data.timestamp)
          ),
        });
      default:
        throw new Error(`Unexpected request type: ${request.type}`);
    }
  }
}
