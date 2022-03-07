import { BigNumber } from '@waves/bignumber';
import { Money } from '@waves/data-entities';
import { ISignTxData } from '@waves/ledger/lib/Waves';
import { SIGN_TYPE, TSignData } from '@waves/signature-adapter';
import * as create from 'parse-json-bignumber';
import { Account, NetworkName } from 'accounts/types';
import { InfoAdapter } from 'controllers/MessageController';
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

interface LedgerWalletData extends Account {
  id: number;
}

export interface LedgerApi {
  signTransaction: (data: ISignTxData) => Promise<string>;
}

export class LedgerWallet extends Wallet<LedgerWalletData> {
  private readonly _adapter: InfoAdapter;
  private readonly ledger: LedgerApi;

  constructor(
    { address, id, name, network, networkCode, publicKey }: LedgerWalletInput,
    ledger: LedgerApi
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

    this._adapter = new InfoAdapter(this.data);
    this.ledger = ledger;
  }

  getSeed(): string {
    throw new Error('Cannot get seed');
  }

  getPrivateKey(): string {
    throw new Error('Cannot get private key');
  }

  async signWavesAuth(data) {
    throw new Error('Not implemented');
  }

  async signCustomData(data) {
    throw new Error('Not implemented');
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

    let feePrecision: number = data.fee?.asset?.precision || 0;

    console.log({ amountPrecision, amount2Precision, feePrecision, data });

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

    return stringify(data);
  }

  signBytes(bytes: number[]) {
    throw new Error('Not implemented');
  }

  signRequest(request: TSignData) {
    throw new Error('Not implemented');
  }
}
