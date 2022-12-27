import { NetworkName } from 'networks/types';
import { Wallet } from 'wallets/wallet';

import { WalletPrivateDataOfType } from './types';

export class DebugWallet extends Wallet<WalletPrivateDataOfType<'debug'>> {
  constructor({
    address,
    name,
    network,
    networkCode,
  }: {
    address: string;
    name: string;
    network: NetworkName;
    networkCode: string;
  }) {
    super({
      address,
      name,
      network,
      networkCode,
      publicKey: '',
      type: 'debug',
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

  protected async signBytes(): Promise<Uint8Array> {
    throw new Error('Debug account cannot be used to sign anything');
  }
}
