import {
  base58Decode,
  base58Encode,
  createSharedKey,
  decryptMessage,
  encryptMessage,
  utf8Encode,
} from '@keeper-wallet/waves-crypto';
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

  getSeed(): string {
    throw new Error('Cannot get seed');
  }

  getEncodedSeed() {
    return base58Encode(utf8Encode(this.getSeed()));
  }

  getPrivateKey(): Promise<Uint8Array> {
    throw new Error('Cannot get private key');
  }

  async createSharedKey(publicKey: string, prefix: string) {
    const privateKey = await this.getPrivateKey();

    return createSharedKey(
      privateKey,
      base58Decode(publicKey),
      utf8Encode(`${prefix || ''}waves`)
    );
  }

  async encryptMessage(
    message: string,
    publicKey: string,
    prefix = 'waveskeeper'
  ) {
    const sharedKey = await this.createSharedKey(publicKey, prefix);

    const encryptedMessage = await encryptMessage(
      sharedKey,
      utf8Encode(message)
    );

    return base58Encode(encryptedMessage);
  }

  async decryptMessage(
    message: string,
    publicKey: string,
    prefix = 'waveskeeper'
  ) {
    const sharedKey = await this.createSharedKey(publicKey, prefix);

    const decryptedMessage = await decryptMessage(
      sharedKey,
      base58Decode(message)
    );

    return base58Encode(decryptedMessage);
  }
}
