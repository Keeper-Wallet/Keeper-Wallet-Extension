import { BigNumber } from '@waves/bignumber';
import { Money } from '@waves/data-entities';
import {
  ISignData,
  ISignOrderData,
  ISignTxData,
} from '@waves/ledger/lib/Waves';
import { convert } from '@waves/money-like-to-node';
import {
  AdapterType,
  CustomAdapter,
  IUserApi,
  TSignData,
} from '@waves/signature-adapter';
import { base58Encode, blake2b } from '@waves/ts-lib-crypto';
import { customData, serializeCustomData } from '@waves/waves-transactions';
import { serializeWavesAuthData } from '@waves/waves-transactions/dist/requests/wavesAuth';
import { validate } from '@waves/waves-transactions/dist/validators';
import { TCustomData } from '@waves/waves-transactions/dist/requests/custom-data';
import * as create from 'parse-json-bignumber';
import { AccountOfType, NetworkName } from 'accounts/types';
import { Wallet } from './wallet';
import { AssetDetail } from 'ui/services/Background';
import { convertInvokeListWorkAround } from './utils';
import { TRANSACTION_TYPE } from '@waves/ts-types';

const txVersions = {
  [TRANSACTION_TYPE.ISSUE]: [2],
  [TRANSACTION_TYPE.TRANSFER]: [2],
  [TRANSACTION_TYPE.REISSUE]: [2],
  [TRANSACTION_TYPE.BURN]: [2],
  [TRANSACTION_TYPE.EXCHANGE]: [0, 1, 2],
  [TRANSACTION_TYPE.LEASE]: [2],
  [TRANSACTION_TYPE.CANCEL_LEASE]: [2],
  [TRANSACTION_TYPE.ALIAS]: [2],
  [TRANSACTION_TYPE.MASS_TRANSFER]: [1],
  [TRANSACTION_TYPE.DATA]: [1],
  [TRANSACTION_TYPE.SET_SCRIPT]: [1],
  [TRANSACTION_TYPE.SPONSORSHIP]: [1],
  [TRANSACTION_TYPE.SET_ASSET_SCRIPT]: [1],
  [TRANSACTION_TYPE.INVOKE_SCRIPT]: [1],
  [TRANSACTION_TYPE.UPDATE_ASSET_INFO]: [1],
  1000: [1],
  1001: [1],
  1002: [1, 2, 3],
  1003: [1],
};

class LedgerInfoAdapter extends CustomAdapter<IUserApi> {
  constructor(account: AccountOfType<'ledger'>) {
    super({
      type: AdapterType.Custom,
      isAvailable: () => true,
      getAddress: () => account.address,
      getPublicKey: () => account.publicKey,
    });

    this._code = account.networkCode.charCodeAt(0);
  }

  getSignVersions() {
    return {
      ...txVersions,
      1004: [1],
      1005: [1],
    };
  }
}

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
  private readonly _adapter: LedgerInfoAdapter;
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

    this._adapter = new LedgerInfoAdapter(this.data);
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
      hash: '',
      signature: '',
      timestamp,
      publicKey,
      address: this.data.address,
    };

    const dataBuffer = serializeWavesAuthData(rx);

    rx.signature = await this.ledger.signSomeData({ dataBuffer });
    rx.hash = base58Encode(blake2b(dataBuffer));

    return rx;
  }

  async signCustomData(data: TCustomData) {
    const dataBuffer = serializeCustomData(data);

    return {
      ...customData(data),
      publicKey: data.publicKey || this.data.publicKey,
      signature: await this.ledger.signSomeData({ dataBuffer }),
    };
  }

  async signTx(tx: TSignData) {
    const signable = this._adapter.makeSignable(tx);

    const [dataBuffer, data] = await Promise.all([
      signable.getBytes(),
      signable.getSignData(),
    ]);

    let amountPrecision: number, amount2Precision: number;

    if (tx.type === TRANSACTION_TYPE.INVOKE_SCRIPT) {
      const payment: Money[] = (tx.data as any).payment ?? [];
      amountPrecision = payment[0]?.asset.precision || 0;
      amount2Precision = payment[1]?.asset.precision || 0;
    } else {
      amountPrecision = (tx as any).data.amount?.asset?.precision || 0;
      amount2Precision = 0;
    }

    const feeAsset = await this.getAssetInfo(data.feeAssetId);
    const feePrecision: number = feeAsset.precision;

    const signature =
      tx.type === 1002
        ? await this.ledger.signOrder({
            amountPrecision,
            feePrecision,
            dataBuffer,
            dataVersion: data.version,
          })
        : await this.ledger.signTransaction({
            amountPrecision,
            amount2Precision,
            feePrecision,
            dataBuffer,
            dataType: data.type,
            dataVersion: data.version,
          });

    data.proofs.push(signature);

    convertInvokeListWorkAround(data);

    return stringify(convert(data, (item: any) => new BigNumber(item)));
  }

  signBytes(bytes: number[]) {
    return this.ledger.signSomeData({ dataBuffer: new Uint8Array(bytes) });
  }

  async signRequest(request: TSignData) {
    const signable = this._adapter.makeSignable(request);
    const dataBuffer = await signable.getBytes();

    return this.ledger.signRequest({ dataBuffer });
  }
}
