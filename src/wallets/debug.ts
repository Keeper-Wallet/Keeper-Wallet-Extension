import { TSignedData } from '@waves/waves-transactions/dist/requests/custom-data';
import { IWavesAuth } from '@waves/waves-transactions/dist/transactions';
import { NetworkName } from 'networks/types';
import { Wallet } from 'wallets/wallet';
import { WalletPrivateDataOfType } from './types';

export interface DebugWalletInput {
  address: string;
  name: string;
  network: NetworkName;
  networkCode: string;
}

export class DebugWallet extends Wallet<WalletPrivateDataOfType<'debug'>> {
  constructor({ address, name, network, networkCode }: DebugWalletInput) {
    super({
      address,
      name,
      network,
      networkCode,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      publicKey: null as any,
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

  getSeed(): string {
    throw new Error('Cannot get seed');
  }

  getPrivateKey(): string {
    throw new Error('Cannot get private key');
  }

  async encryptMessage(): Promise<string> {
    throw new Error('Unable to encrypt message with this account type');
  }

  async decryptMessage(): Promise<string> {
    throw new Error('Unable to decrypt message with this account type');
  }

  async signTx(): Promise<string> {
    throw new Error('Unable to sign transaction with this account type');
  }
  async signAuth(): Promise<string> {
    throw new Error('Unable to sign auth with this account type');
  }
  async signRequest(): Promise<string> {
    throw new Error('Unable to sign request with this account type');
  }
  async signOrder(): Promise<string> {
    throw new Error('Unable to sign order with this account type');
  }
  async signCancelOrder(): Promise<string> {
    throw new Error('Unable to sign cancel order with this account type');
  }
  async signWavesAuth(): Promise<IWavesAuth> {
    throw new Error('Unable to sign waves auth with this account type');
  }
  async signCustomData(): Promise<TSignedData> {
    throw new Error('Unable to sign custom data with this account type');
  }
}
