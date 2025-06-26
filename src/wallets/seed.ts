import {
  base58Encode,
  createAddress,
  createPrivateKey,
  createPublicKey,
  signBytes,
  utf8Encode,
} from '@keeper-wallet/waves-crypto';
import { nanoid } from 'nanoid';
import { type NetworkProfile } from 'networks/types';

import { type WalletAccount, type WalletPrivateDataOfType } from './types';
import { Wallet } from './wallet';

export class SeedWallet extends Wallet<WalletPrivateDataOfType<'seed'>> {
  static async create({
    name,
    network,
    networkCode,
    seed,
    id,
  }: {
    name: string;
    network: NetworkProfile;
    networkCode: string;
    seed: string;
    id?: string;
  }) {
    const privateKey = await createPrivateKey(utf8Encode(seed));
    const publicKey = await createPublicKey(privateKey);

    return new this({
      accountType: 'waves',
      id: id || nanoid(),
      address: base58Encode(
        createAddress(publicKey, networkCode.charCodeAt(0)),
      ),
      name,
      network,
      networkCode,
      publicKey: base58Encode(publicKey),
      seed,
      type: 'seed',
    });
  }

  constructor({
    accountType,
    id,
    address,
    name,
    network,
    networkCode,
    publicKey,
    seed,
    type,
  }: {
    accountType: 'waves';
    id: string;
    address: string;
    name: string;
    network: NetworkProfile;
    networkCode: string;
    publicKey: string;
    seed: string;
    type: 'seed';
  }) {
    super({
      accountType,
      id,
      address,
      name,
      network,
      networkCode,
      publicKey,
      seed,
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
      type: 'seed',
      chain: 'waves',
    };
  }

  getSeed() {
    return this.data.seed;
  }

  async getPrivateKey() {
    return createPrivateKey(utf8Encode(this.getSeed()));
  }

  protected async signBytes(bytes: Uint8Array) {
    const privateKey = await this.getPrivateKey();

    return signBytes(privateKey, bytes);
  }
}
