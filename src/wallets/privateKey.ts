import {
  base58Decode,
  base58Encode,
  createAddress,
  createPublicKey,
  signBytes,
} from '@keeper-wallet/waves-crypto';
import { type NetworkName } from 'networks/types';

import { type WalletPrivateDataOfType } from './types';
import { Wallet } from './wallet';

export class PrivateKeyWallet extends Wallet<
  WalletPrivateDataOfType<'privateKey'>
> {
  static async create({
    name,
    network,
    networkCode,
    privateKey,
  }: {
    name: string;
    network: NetworkName;
    networkCode: string;
    privateKey: string;
  }) {
    const publicKey = await createPublicKey(base58Decode(privateKey));

    return new this({
      address: base58Encode(
        createAddress(publicKey, networkCode.charCodeAt(0)),
      ),
      name,
      network,
      networkCode,
      privateKey,
      publicKey: base58Encode(publicKey),
    });
  }

  constructor({
    address,
    name,
    network,
    networkCode,
    privateKey,
    publicKey,
  }: {
    address: string;
    name: string;
    network: NetworkName;
    networkCode: string;
    privateKey: string;
    publicKey: string;
  }) {
    super({
      address,
      name,
      network,
      networkCode,
      privateKey,
      publicKey,
      type: 'privateKey',
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

  async getPrivateKey() {
    return base58Decode(this.data.privateKey);
  }

  protected async signBytes(bytes: Uint8Array) {
    const privateKey = await this.getPrivateKey();

    return signBytes(privateKey, bytes);
  }
}
