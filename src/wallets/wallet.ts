import {
  base58Encode,
  messageDecrypt,
  messageEncrypt,
  sharedKey,
} from '@waves/ts-lib-crypto';
import {
  TCustomData,
  TSignedData,
} from '@waves/waves-transactions/dist/requests/custom-data';
import {
  IWavesAuth,
  IWavesAuthParams,
} from '@waves/waves-transactions/dist/transactions';
import { Account } from 'accounts/types';
import {
  SaAuth,
  SaCancelOrder,
  SaOrder,
  SaRequest,
  SaTransaction,
} from 'transactions/utils';

export abstract class Wallet<TData extends Account> {
  readonly data: TData;

  constructor(data: TData) {
    this.data = data;
  }

  abstract getSeed(): string;
  abstract getPrivateKey(): string;

  getEncodedSeed() {
    return base58Encode(this.getSeed());
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

  serialize() {
    return this.data;
  }

  async encryptMessage(message, publicKey, prefix = 'waveskeeper') {
    const privateKey = this.getPrivateKey();
    const shKey = sharedKey(privateKey, publicKey, prefix);
    return base58Encode(messageEncrypt(shKey, message));
  }

  async decryptMessage(message, publicKey, prefix = 'waveskeeper') {
    const privateKey = this.getPrivateKey();
    const shKey = sharedKey(privateKey, publicKey, prefix);
    try {
      return messageDecrypt(shKey, message);
    } catch (e) {
      throw new Error('message is invalid');
    }
  }

  async getKEK(publicKey, prefix) {
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
