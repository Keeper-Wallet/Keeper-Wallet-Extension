import { BigNumber } from '@waves/bignumber';
import { Money } from '@waves/data-entities';
import { ISignData, ISignTxData } from '@waves/ledger/lib/Waves';
import { convert } from '@waves/money-like-to-node';
import {
  AdapterType,
  CustomAdapter,
  IUserApi,
  SIGN_TYPE,
  TSignData,
} from '@waves/signature-adapter';
import { customData, serializeCustomData } from '@waves/waves-transactions';
import { TCustomData } from '@waves/waves-transactions/dist/requests/custom-data';
import * as create from 'parse-json-bignumber';
import { AccountOfType, NetworkName } from 'accounts/types';
import { Wallet } from './wallet';
import { AssetDetail } from 'ui/services/Background';
import { convertInvokeListWorkAround } from './utils';

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
      [SIGN_TYPE.AUTH]: [1],
      [SIGN_TYPE.MATCHER_ORDERS]: [1],
      [SIGN_TYPE.WAVES_CONFIRMATION]: [1],
      [SIGN_TYPE.CREATE_ORDER]: [1, 2, 3],
      [SIGN_TYPE.CANCEL_ORDER]: [1],
      [SIGN_TYPE.COINOMAT_CONFIRMATION]: [1],
      [SIGN_TYPE.ISSUE]: [2],
      [SIGN_TYPE.TRANSFER]: [2],
      [SIGN_TYPE.REISSUE]: [2],
      [SIGN_TYPE.BURN]: [2],
      [SIGN_TYPE.EXCHANGE]: [0, 1, 2],
      [SIGN_TYPE.LEASE]: [2],
      [SIGN_TYPE.CANCEL_LEASING]: [2],
      [SIGN_TYPE.CREATE_ALIAS]: [2],
      [SIGN_TYPE.MASS_TRANSFER]: [1],
      [SIGN_TYPE.DATA]: [1],
      [SIGN_TYPE.SET_SCRIPT]: [1],
      [SIGN_TYPE.SPONSORSHIP]: [1],
      [SIGN_TYPE.SET_ASSET_SCRIPT]: [1],
      [SIGN_TYPE.SCRIPT_INVOCATION]: [1],
      [SIGN_TYPE.UPDATE_ASSET_INFO]: [1],
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

  async signWavesAuth(data) {
    throw new Error('signWavesAuth: Not implemented');
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

    if (tx.type === SIGN_TYPE.SCRIPT_INVOCATION) {
      const payment: Money[] = tx.data.payment ?? [];
      amountPrecision = payment[0]?.asset.precision || 0;
      amount2Precision = payment[1]?.asset.precision || 0;
    } else {
      amountPrecision = (tx.data as any).amount?.asset?.precision || 0;
      amount2Precision = 0;
    }

    const feeAsset = await this.getAssetInfo(data.feeAssetId);
    const feePrecision: number = feeAsset.precision;

    data.proofs.push(
      await this.ledger.signTransaction({
        amountPrecision,
        amount2Precision,
        feePrecision,
        dataBuffer,
        dataType: data.type,
        dataVersion: data.version,
      })
    );

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
