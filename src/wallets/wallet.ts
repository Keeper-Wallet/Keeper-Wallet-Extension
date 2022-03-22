import { SIGN_TYPE } from '@waves/signature-adapter';
import {
  base58Encode,
  messageDecrypt,
  messageEncrypt,
  sharedKey,
} from '@waves/ts-lib-crypto';
import { Account } from 'accounts/types';

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

  getTxVersions() {
    return {
      [SIGN_TYPE.ISSUE]: [3, 2],
      [SIGN_TYPE.TRANSFER]: [3, 2],
      [SIGN_TYPE.REISSUE]: [3, 2],
      [SIGN_TYPE.BURN]: [3, 2],
      [SIGN_TYPE.EXCHANGE]: [0, 1, 3, 2],
      [SIGN_TYPE.LEASE]: [3, 2],
      [SIGN_TYPE.CANCEL_LEASING]: [3, 2],
      [SIGN_TYPE.CREATE_ALIAS]: [3, 2],
      [SIGN_TYPE.MASS_TRANSFER]: [2, 1],
      [SIGN_TYPE.DATA]: [2, 1],
      [SIGN_TYPE.SET_SCRIPT]: [2, 1],
      [SIGN_TYPE.SPONSORSHIP]: [2, 1],
      [SIGN_TYPE.SET_ASSET_SCRIPT]: [2, 1],
      [SIGN_TYPE.SCRIPT_INVOCATION]: [2, 1],
      [SIGN_TYPE.UPDATE_ASSET_INFO]: [1],
      [SIGN_TYPE.AUTH]: [1],
      [SIGN_TYPE.MATCHER_ORDERS]: [1],
      [SIGN_TYPE.CREATE_ORDER]: [1, 2, 3],
      [SIGN_TYPE.CANCEL_ORDER]: [0, 1],
      [SIGN_TYPE.COINOMAT_CONFIRMATION]: [1],
      [SIGN_TYPE.WAVES_CONFIRMATION]: [1],
    };
  }
}
