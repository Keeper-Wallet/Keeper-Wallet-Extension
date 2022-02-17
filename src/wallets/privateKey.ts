import { BigNumber } from '@waves/bignumber';
import { TSignData, PrivateKeyAdapter } from '@waves/signature-adapter';
import { customData, wavesAuth } from '@waves/waves-transactions';
import * as libCrypto from '@waves/ts-lib-crypto';
import * as create from 'parse-json-bignumber';
import { Account, Wallet } from './wallet';
import { convertInvokeListWorkAround } from './utils';

const { stringify } = create({ BigNumber });

export interface PrivateKeyWalletInput {
  name: string;
  network: string;
  networkCode: string;
  privateKey: string;
}

interface PrivateKeyWalletData extends Account {
  privateKey: string;
}

export class PrivateKeyWallet extends Wallet<PrivateKeyWalletData> {
  private readonly _adapter: PrivateKeyAdapter;

  constructor({
    name,
    network,
    networkCode,
    privateKey,
  }: PrivateKeyWalletInput) {
    const publicKey = libCrypto.publicKey({ privateKey });

    super({
      address: libCrypto.address({ publicKey }, networkCode),
      name,
      network,
      networkCode,
      privateKey,
      publicKey,
      type: 'privateKey',
    });

    this._adapter = new PrivateKeyAdapter(privateKey, networkCode);
  }

  getSeed(): string {
    throw new Error('Cannot get seed');
  }

  getPrivateKey() {
    return this.data.privateKey;
  }

  async signWavesAuth(data) {
    return wavesAuth(data, { privateKey: this.getPrivateKey() });
  }

  async signCustomData(data) {
    return customData(data, { privateKey: this.getPrivateKey() });
  }

  async signTx(tx: TSignData) {
    const signable = this._adapter.makeSignable(tx);
    const data = await signable.getDataForApi();

    convertInvokeListWorkAround(data);

    return stringify(data);
  }

  signBytes(bytes: number[]) {
    return this._adapter.signData(Uint8Array.from(bytes));
  }

  signRequest(request: TSignData) {
    const signable = this._adapter.makeSignable(request);
    return signable.getSignature();
  }
}
