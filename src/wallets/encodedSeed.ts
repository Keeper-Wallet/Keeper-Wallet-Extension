import {
  base58Decode,
  base58Encode,
  createAddress,
  createPrivateKey,
  createPublicKey,
  signBytes,
} from '@keeper-wallet/waves-crypto';
import { type NetworkName } from 'networks/types';

import { type WalletPrivateDataOfType } from './types';
import { Wallet } from './wallet';

export class EncodedSeedWallet extends Wallet<
  WalletPrivateDataOfType<'encodedSeed'>
> {
  static async create({
    encodedSeed,
    name,
    network,
    networkCode,
  }: {
    encodedSeed: string;
    name: string;
    network: NetworkName;
    networkCode: string;
  }) {
    const decodedSeed = base58Decode(encodedSeed.replace(/^base58:/, ''));
    const privateKey = await createPrivateKey(decodedSeed);
    const publicKey = await createPublicKey(privateKey);

    return new this({
      address: base58Encode(
        createAddress(publicKey, networkCode.charCodeAt(0)),
      ),
      encodedSeed: base58Encode(decodedSeed),
      name,
      network,
      networkCode,
      publicKey: base58Encode(publicKey),
    });
  }

  constructor({
    address,
    encodedSeed,
    name,
    network,
    networkCode,
    publicKey,
  }: {
    address: string;
    encodedSeed: string;
    name: string;
    network: NetworkName;
    networkCode: string;
    publicKey: string;
  }) {
    super({
      address,
      encodedSeed,
      name,
      network,
      networkCode,
      publicKey,
      type: 'encodedSeed',
    });
  }

  getAccount() {
    return {
      address: this.data.address,
      name: this.data.name,
      network: this.data.network,
      networkCode: this.data.networkCode,
      publicKey: this.data.publicKey,
      type: this.data.type,
    };
  }

  getEncodedSeed() {
    return this.data.encodedSeed;
  }

  async getPrivateKey() {
    return createPrivateKey(base58Decode(this.data.encodedSeed));
  }

  protected async signBytes(bytes: Uint8Array) {
    const privateKey = await this.getPrivateKey();

    return signBytes(privateKey, bytes);
  }
}
