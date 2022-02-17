import { BigNumber } from '@waves/bignumber';
import { SeedAdapter, TSignData } from '@waves/signature-adapter';
import { customData, wavesAuth } from '@waves/waves-transactions';
import * as libCrypto from '@waves/ts-lib-crypto';
import * as create from 'parse-json-bignumber';
import { Account, Wallet } from './wallet';
import { convertInvokeListWorkAround } from './utils';

const { stringify } = create({ BigNumber });

export interface SeedWalletInput {
  name: string;
  network: string;
  networkCode: string;
  seed: string;
}

interface SeedWalletData extends Account {
  seed: string;
}

export class SeedWallet extends Wallet<SeedWalletData> {
  private readonly _adapter: SeedAdapter;

  constructor({ name, network, networkCode, seed }: SeedWalletInput) {
    super({
      address: libCrypto.address(seed, networkCode),
      name,
      network,
      networkCode,
      publicKey: libCrypto.publicKey(seed),
      seed,
      type: 'seed',
    });

    this._adapter = new SeedAdapter(seed, networkCode);
  }

  getSeed() {
    return this.data.seed;
  }

  getPrivateKey() {
    return libCrypto.privateKey(this.data.seed);
  }

  async signWavesAuth(data) {
    return wavesAuth(data, this.data.seed);
  }

  async signCustomData(data) {
    return customData(data, this.data.seed);
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
