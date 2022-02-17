import { BigNumber } from '@waves/bignumber';
import { SeedAdapter, TSignData } from '@waves/signature-adapter';
import { customData, wavesAuth } from '@waves/waves-transactions';
import * as libCrypto from '@waves/ts-lib-crypto';
import * as create from 'parse-json-bignumber';
import { Account, NetworkName } from 'accounts/types';
import { Wallet } from './wallet';
import { convertInvokeListWorkAround } from './utils';

const { stringify } = create({ BigNumber });

export interface EncodedSeedWalletInput {
  encodedSeed: string;
  name: string;
  network: NetworkName;
  networkCode: string;
}

interface EncodedSeedWalletData extends Account {
  encodedSeed: string;
}

export class EncodedSeedWallet extends Wallet<EncodedSeedWalletData> {
  private readonly _adapter: SeedAdapter;

  constructor({
    encodedSeed,
    name,
    network,
    networkCode,
  }: EncodedSeedWalletInput) {
    const decodedSeed = libCrypto.base58Decode(encodedSeed);

    super({
      address: libCrypto.address(decodedSeed, networkCode),
      encodedSeed,
      name,
      network,
      networkCode,
      publicKey: libCrypto.publicKey(decodedSeed),
      type: 'encodedSeed',
    });

    this._adapter = new SeedAdapter(`base58:${encodedSeed}`, networkCode);
  }

  getSeed(): string {
    throw new Error('Cannot get seed');
  }

  getEncodedSeed() {
    return this.data.encodedSeed;
  }

  getPrivateKey() {
    return libCrypto.privateKey(libCrypto.base58Decode(this.data.encodedSeed));
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
