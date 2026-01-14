import { base58Encode, utf8Encode } from '@keeper-wallet/waves-crypto';
import { type MessageTx } from 'messages/types';

import { type WalletAccount, type WalletPrivateData } from './types';

export abstract class Wallet<TData extends WalletPrivateData> {
  readonly data;

  constructor(data: TData) {
    this.data = data;
  }

  abstract getAccount(): WalletAccount;

  protected abstract signBytes(bytes: Uint8Array): Promise<Uint8Array>;

  signAuth(bytes: Uint8Array) {
    return this.signBytes(bytes);
  }

  signCancelOrder(bytes: Uint8Array) {
    return this.signBytes(bytes);
  }

  signCustomData(bytes: Uint8Array) {
    return this.signBytes(bytes);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  signOrder(bytes: Uint8Array, _version: 1 | 2 | 3 | 4) {
    return this.signBytes(bytes);
  }

  signRequest(bytes: Uint8Array) {
    return this.signBytes(bytes);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  signTx(bytes: Uint8Array, _tx: MessageTx) {
    return this.signBytes(bytes);
  }

  signWavesAuth(bytes: Uint8Array) {
    return this.signBytes(bytes);
  }

  /**
   * Sign Unit0 (Ethereum) transaction
   * Override this method in wallet implementations that support Unit0
   */
  async signUnit0Transaction(txData: {
    to: string;
    value: string;
    gasLimit: string;
    gasPrice: string;
    nonce: number;
    data?: string;
    chainId: number;
  }): Promise<string> {
    // Avoid unused parameter warning
    void txData;
    throw new Error(
      'Unit0 transaction signing not supported for this wallet type',
    );
  }

  /**
   * Sign Unit0 (Ethereum) custom data/message
   * Override this method in wallet implementations that support Unit0
   */
  async signUnit0CustomData(message: string | Uint8Array): Promise<string> {
    void message;
    throw new Error(
      'Unit0 custom data signing not supported for this wallet type',
    );
  }

  getSeed(): string {
    throw new Error('Cannot get seed');
  }

  getEncodedSeed() {
    return base58Encode(utf8Encode(this.getSeed()));
  }

  getPrivateKey(): Promise<Uint8Array> {
    throw new Error('Cannot get private key');
  }
}
