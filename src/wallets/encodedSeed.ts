import { BigNumber } from '@waves/bignumber';
import {
  address,
  base58Decode,
  privateKey,
  publicKey,
  signBytes,
} from '@waves/ts-lib-crypto';
import { customData, wavesAuth } from '@waves/waves-transactions';
import { TCustomData } from '@waves/waves-transactions/dist/requests/custom-data';
import { IWavesAuthParams } from '@waves/waves-transactions/dist/transactions';
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

export interface EncodedSeedWalletInput {
  encodedSeed: string;
  name: string;
  network: NetworkName;
  networkCode: string;
}

export class EncodedSeedWallet extends Wallet<
  WalletPrivateDataOfType<'encodedSeed'>
> {
  constructor({
    encodedSeed,
    name,
    network,
    networkCode,
  }: EncodedSeedWalletInput) {
    const encodedSeedWithoutPrefix = encodedSeed.replace(/^base58:/, '');
    const decodedSeed = base58Decode(encodedSeedWithoutPrefix);

    super({
      address: address(decodedSeed, networkCode),
      encodedSeed: encodedSeedWithoutPrefix,
      name,
      network,
      networkCode,
      publicKey: publicKey(decodedSeed),
      type: 'encodedSeed',
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

  getEncodedSeed() {
    return this.data.encodedSeed;
  }

  getPrivateKey() {
    return privateKey(base58Decode(this.data.encodedSeed));
  }

  private signBytes(bytes: Uint8Array) {
    return signBytes({ privateKey: this.getPrivateKey() }, bytes);
  }

  async signTx(tx: SaTransaction) {
    const result = convertFromSa.transaction(
      tx,
      this.data.networkCode.charCodeAt(0),
      'encodedSeed'
    );

    result.proofs.push(this.signBytes(makeBytes.transaction(result)));

    return stringify(result);
  }

  async signAuth(auth: SaAuth) {
    return this.signBytes(makeBytes.auth(convertFromSa.auth(auth)));
  }

  async signRequest(request: SaRequest) {
    return this.signBytes(makeBytes.request(convertFromSa.request(request)));
  }

  async signOrder(order: SaOrder) {
    const result = convertFromSa.order(
      order,
      this.data.networkCode.charCodeAt(0)
    );

    result.proofs.push(this.signBytes(makeBytes.order(result)));

    return stringify(result);
  }

  async signCancelOrder(cancelOrder: SaCancelOrder) {
    const result = convertFromSa.cancelOrder(cancelOrder);

    result.signature = this.signBytes(makeBytes.cancelOrder(result));

    return stringify(result);
  }

  async signWavesAuth(data: IWavesAuthParams) {
    return wavesAuth(data, { privateKey: this.getPrivateKey() });
  }

  async signCustomData(data: TCustomData) {
    return customData(data, { privateKey: this.getPrivateKey() });
  }
}
