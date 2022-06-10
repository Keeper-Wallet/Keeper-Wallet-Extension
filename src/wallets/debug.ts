import { AccountOfType, NetworkName } from 'accounts/types';
import { Wallet } from 'wallets/wallet';

export interface DebugWalletInput {
  address: string;
  name: string;
  network: NetworkName;
  networkCode: string;
}

type TestWalletData = AccountOfType<'debug'> & {
  address: string;
};

export class DebugWallet extends Wallet<TestWalletData> {
  constructor({ address, name, network, networkCode }: DebugWalletInput) {
    super({
      address,
      name,
      network,
      networkCode,
      publicKey: null,
      type: 'debug',
    });
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
}
