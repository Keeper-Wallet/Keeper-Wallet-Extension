import { type NetworkProfile } from 'networks/types';
import { Wallet } from 'wallets/wallet';

import { type WalletAccount, type WalletPrivateDataOfType } from './types';

export class DebugWallet extends Wallet<WalletPrivateDataOfType<'debug'>> {
  constructor({
    address,
    name,
    network,
    networkCode,
    id,
  }: {
    address: string;
    name: string;
    network: NetworkProfile;
    networkCode: string;
    id?: string;
  }) {
    super({
      accountType: 'waves',
      id: id || address,
      address,
      name,
      network,
      networkCode,
      publicKey: '',
      type: 'debug',
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
      type: 'debug',
      chain: 'waves',
    };
  }

  protected async signBytes(): Promise<Uint8Array> {
    throw new Error('Debug account cannot be used to sign anything');
  }
}
