import {
  base58Decode,
  base58Encode,
  createAddress,
  createPrivateKey,
  createPublicKey,
  signBytes,
} from '@keeper-wallet/waves-crypto';
import { type NetworkProfile } from 'networks/types';

import { type WalletAccount, type WalletPrivateDataOfType } from './types';
import { Wallet } from './wallet';

export class EncodedSeedWallet extends Wallet<
  WalletPrivateDataOfType<'encodedSeed'>
> {
  static async create({
    encodedSeed,
    name,
    network,
    networkCode,
    id,
  }: {
    encodedSeed: string;
    name: string;
    network: NetworkProfile;
    networkCode: string;
    id?: string;
  }) {
    const decodedSeed = base58Decode(encodedSeed.replace(/^base58:/, ''));
    const privateKey = await createPrivateKey(decodedSeed);
    const publicKey = await createPublicKey(privateKey);

    return new this({
      accountType: 'waves',
      id:
        id || base58Encode(createAddress(publicKey, networkCode.charCodeAt(0))),
      address: base58Encode(
        createAddress(publicKey, networkCode.charCodeAt(0)),
      ),
      encodedSeed: base58Encode(decodedSeed),
      name,
      network,
      networkCode,
      publicKey: base58Encode(publicKey),
      type: 'encodedSeed',
    });
  }

  constructor({
    accountType,
    id,
    address,
    encodedSeed,
    name,
    network,
    networkCode,
    publicKey,
    type,
  }: {
    accountType: 'waves';
    id: string;
    address: string;
    encodedSeed: string;
    name: string;
    network: NetworkProfile;
    networkCode: string;
    publicKey: string;
    type: 'encodedSeed';
  }) {
    super({
      accountType,
      id,
      address,
      encodedSeed,
      name,
      network,
      networkCode,
      publicKey,
      type,
    });
  }

  getAccount(): WalletAccount {
    return {
      accountType: 'waves',
      id: this.data.id,
      address: this.data.address,
      name: this.data.name,
      network: this.data.network,
      networkCode: this.data.networkCode,
      publicKey: this.data.publicKey,
      type: 'encodedSeed',
      chain: 'waves',
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
