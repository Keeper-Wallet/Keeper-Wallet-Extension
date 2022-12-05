import { BigNumber } from '@waves/bignumber';
import { base58Encode, blake2b } from '@waves/ts-lib-crypto';
import {
  customData,
  serializeCustomData,
  TCustomData,
} from '@waves/waves-transactions/dist/requests/custom-data';
import { serializeWavesAuthData } from '@waves/waves-transactions/dist/requests/wavesAuth';
import { IWavesAuthParams } from '@waves/waves-transactions/dist/transactions';
import { validate } from '@waves/waves-transactions/dist/validators';
import type { IdentityApi } from 'controllers/IdentityController';
import { NetworkName } from 'networks/types';
import * as create from 'parse-json-bignumber';
import {
  convertFromSa,
  makeBytes,
  SaAuth,
  SaCancelOrder,
  SaOrder,
  SaRequest,
  SaTransaction,
} from 'transactions/utils';

import { WalletPrivateDataOfType } from './types';
import { Wallet } from './wallet';

const { stringify } = create({ BigNumber });

export interface WxWalletInput {
  name: string;
  network: NetworkName;
  networkCode: string;
  publicKey: string;
  address: string;
  uuid: string;
  username: string;
}

export class WxWallet extends Wallet<WalletPrivateDataOfType<'wx'>> {
  private identity: IdentityApi;

  constructor(
    {
      name,
      network,
      networkCode,
      publicKey,
      address,
      uuid,
      username,
    }: WxWalletInput,
    identity: IdentityApi
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

    this.identity = identity;
  }

  getAccount() {
    return {
      address: this.data.address,
      name: this.data.name,
      network: this.data.network,
      networkCode: this.data.networkCode,
      publicKey: this.data.publicKey,
      type: this.data.type,
      uuid: this.data.uuid,
      username: this.data.username,
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

  private async signBytes(bytes: number[] | Uint8Array): Promise<string> {
    return this.identity.signBytes(bytes);
  }

  async signTx(tx: SaTransaction): Promise<string> {
    const result = convertFromSa.transaction(
      tx,
      this.data.networkCode.charCodeAt(0),
      'wx'
    );

    result.proofs.push(await this.signBytes(makeBytes.transaction(result)));

    return stringify(result);
  }

  async signAuth(auth: SaAuth): Promise<string> {
    return this.signBytes(makeBytes.auth(convertFromSa.auth(auth)));
  }

  async signRequest(request: SaRequest): Promise<string> {
    return this.signBytes(makeBytes.request(convertFromSa.request(request)));
  }

  async signOrder(order: SaOrder): Promise<string> {
    const result = convertFromSa.order(
      order,
      this.data.networkCode.charCodeAt(0)
    );

    result.proofs.push(await this.signBytes(makeBytes.order(result)));

    return stringify(result);
  }

  async signCancelOrder(cancelOrder: SaCancelOrder): Promise<string> {
    const result = convertFromSa.cancelOrder(cancelOrder);

    result.signature = await this.signBytes(makeBytes.cancelOrder(result));

    return stringify(result);
  }

  async signWavesAuth(data: IWavesAuthParams) {
    const account = this.getAccount();
    const publicKey = data.publicKey || account.publicKey;
    const timestamp = data.timestamp || Date.now();
    validate.wavesAuth({ publicKey, timestamp });

    const rx = {
      timestamp,
      publicKey,
      address: account.address,
    };

    const bytes = serializeWavesAuthData(rx);

    return {
      ...rx,
      hash: base58Encode(blake2b(Uint8Array.from(bytes))),
      signature: await this.signBytes(bytes),
    };
  }

  async signCustomData(data: TCustomData) {
    const bytes = serializeCustomData(data);

    return {
      ...customData(data),
      publicKey: data.publicKey || this.getAccount().publicKey,
      signature: await this.signBytes(bytes),
    };
  }
}
