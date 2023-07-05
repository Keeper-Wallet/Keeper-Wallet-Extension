import { base58Decode } from '@keeper-wallet/waves-crypto';
import type { IdentityApi } from 'controllers/IdentityController';
import { type NetworkName } from 'networks/types';

import { type WalletPrivateDataOfType } from './types';
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
    }: {
      address: string;
      name: string;
      network: NetworkName;
      networkCode: string;
      publicKey: string;
      username: string;
      uuid: string;
    },
    identity: IdentityApi,
  ) {
    super({
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

  getAccount() {
    return {
      address: this.data.address,
      name: this.data.name,
      network: this.data.network,
      networkCode: this.data.networkCode,
      publicKey: this.data.publicKey,
      type: this.data.type,
      username: this.data.username,
      uuid: this.data.uuid,
    };
  }

  protected async signBytes(bytes: Uint8Array) {
    const signature = await this.#identity.signBytes(bytes);

    return base58Decode(signature);
  }
}
