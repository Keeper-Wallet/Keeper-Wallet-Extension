import {
  base58Encode,
  messageDecrypt,
  messageEncrypt,
  sharedKey,
  TBinaryIn,
} from '@waves/ts-lib-crypto';
import {
  TCustomData,
  TSignedData,
} from '@waves/waves-transactions/dist/requests/custom-data';
import {
  IWavesAuth,
  IWavesAuthParams,
} from '@waves/waves-transactions/dist/transactions';
import {
  SaAuth,
  SaCancelOrder,
  SaOrder,
  SaRequest,
  SaTransaction,
} from 'transactions/utils';
import { WalletAccount, WalletPrivateData } from './types';

export abstract class Wallet<TData extends WalletPrivateData> {
  readonly data;

  constructor(data: TData) {
    this.data = data;
  }

  abstract getAccount(): WalletAccount;
  abstract getSeed(): string;
  abstract getPrivateKey(): string;

  getEncodedSeed() {
    return base58Encode(this.getSeed());
  }

  serialize() {
    return this.data;
  }

  async encryptMessage(
    message: string,
    publicKey: TBinaryIn,
    prefix = 'waveskeeper'
  ) {
    const privateKey = this.getPrivateKey();
    const shKey = sharedKey(privateKey, publicKey, prefix);
    return base58Encode(messageEncrypt(shKey, message));
  }

  async decryptMessage(
    message: TBinaryIn,
    publicKey: TBinaryIn,
    prefix = 'waveskeeper'
  ) {
    const privateKey = this.getPrivateKey();
    const shKey = sharedKey(privateKey, publicKey, prefix);
    try {
      return messageDecrypt(shKey, message);
    } catch (e) {
      throw new Error('message is invalid');
    }
  }

  async getKEK(publicKey: TBinaryIn, prefix: string) {
    const privateKey = this.getPrivateKey();

    return base58Encode(
      sharedKey(privateKey, publicKey, (prefix || '') + 'waves')
    );
  }
  abstract signTx(tx: SaTransaction): Promise<string>;
  abstract signAuth(auth: SaAuth): Promise<string>;
  abstract signRequest(auth: SaRequest): Promise<string>;
  abstract signOrder(auth: SaOrder): Promise<string>;
  abstract signCancelOrder(auth: SaCancelOrder): Promise<string>;
  abstract signWavesAuth(data: IWavesAuthParams): Promise<IWavesAuth>;
  abstract signCustomData(data: TCustomData): Promise<TSignedData>;
}
