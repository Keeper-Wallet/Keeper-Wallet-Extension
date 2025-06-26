import { base58Decode } from '@keeper-wallet/waves-crypto';
import type { IdentityApi } from 'controllers/IdentityController';
import { type NetworkProfile } from 'networks/types';

import { type WalletAccount, type WalletPrivateDataOfType } from './types';
import { Wallet } from './wallet';

export class WxWallet extends Wallet<WalletPrivateDataOfType<'wx'>> {
  #identity: IdentityApi;

  constructor(
    {
      address,
      name,
      network,
      networkCode,
      publicKey,
      username,
      uuid,
      id,
    }: {
      address: string;
      name: string;
      network: NetworkProfile;
      networkCode: string;
      publicKey: string;
      username: string;
      uuid: string;
      id?: string;
    },
    identity: IdentityApi,
  ) {
    super({
      accountType: 'waves',
      id: id || address,
      address,
      name,
      network,
      networkCode,
      publicKey,
      uuid,
      username,
      type: 'wx',
    });

    this.#identity = identity;
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
      type: 'wx',
      uuid: this.data.uuid,
      username: this.data.username,
      chain: 'waves',
    };
  }

  protected async signBytes(bytes: Uint8Array) {
    const signature = await this.#identity.signBytes(bytes);

    return base58Decode(signature);
  }
}
