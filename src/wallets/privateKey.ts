import {
  base58Decode,
  base58Encode,
  createAddress,
  createPublicKey,
  signBytes,
} from '@keeper-wallet/waves-crypto';
import { type NetworkProfile } from 'networks/types';

import { type WalletAccount, type WalletPrivateDataOfType } from './types';
import { Wallet } from './wallet';

export class PrivateKeyWallet extends Wallet<
  WalletPrivateDataOfType<'privateKey'>
> {
  static async create({
    name,
    network,
    networkCode,
    privateKey,
    id,
  }: {
    name: string;
    network: NetworkProfile;
    networkCode: string;
    privateKey: string;
    id?: string;
  }) {
    const publicKey = await createPublicKey(base58Decode(privateKey));

    return new this({
      accountType: 'waves',
      id:
        id || base58Encode(createAddress(publicKey, networkCode.charCodeAt(0))),
      address: base58Encode(
        createAddress(publicKey, networkCode.charCodeAt(0)),
      ),
      name,
      network,
      networkCode,
      privateKey,
      publicKey: base58Encode(publicKey),
      type: 'privateKey',
    });
  }

  constructor({
    accountType,
    id,
    address,
    name,
    network,
    networkCode,
    privateKey,
    publicKey,
    type,
  }: {
    accountType: 'waves';
    id: string;
    address: string;
    name: string;
    network: NetworkProfile;
    networkCode: string;
    privateKey: string;
    publicKey: string;
    type: 'privateKey';
  }) {
    super({
      accountType,
      id,
      address,
      name,
      network,
      networkCode,
      privateKey,
      publicKey,
      type,
    });
  }

  getAccount(): WalletAccount {
    return {
      accountType: 'waves',
      id: this.data.id || this.data.address,
      address: this.data.address,
      name: this.data.name,
      network: this.data.network,
      networkCode: this.data.networkCode,
      publicKey: this.data.publicKey,
      type: 'privateKey',
      chain: 'waves',
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
