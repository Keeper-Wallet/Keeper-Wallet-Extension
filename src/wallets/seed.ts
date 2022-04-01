import { BigNumber } from '@waves/bignumber';
import { binary, serializePrimitives } from '@waves/marshall';
import {
  address,
  concat,
  privateKey,
  publicKey,
  signBytes,
} from '@waves/ts-lib-crypto';
import { customData, makeTxBytes, wavesAuth } from '@waves/waves-transactions';
import { serializeAuthData } from '@waves/waves-transactions/dist/requests/auth';
import { cancelOrderParamsToBytes } from '@waves/waves-transactions/dist/requests/cancel-order';
import * as create from 'parse-json-bignumber';
import { AccountOfType, NetworkName } from 'accounts/types';
import { fromSignatureAdapterToNode } from 'transactions/utils';
import { Wallet } from './wallet';

const { stringify } = create({ BigNumber });

export interface SeedWalletInput {
  name: string;
  network: NetworkName;
  networkCode: string;
  seed: string;
}

type SeedWalletData = AccountOfType<'seed'> & {
  seed: string;
};

export class SeedWallet extends Wallet<SeedWalletData> {
  constructor({ name, network, networkCode, seed }: SeedWalletInput) {
    super({
      address: address(seed, networkCode),
      name,
      network,
      networkCode,
      publicKey: publicKey(seed),
      seed,
      type: 'seed',
    });
  }

  getSeed() {
    return this.data.seed;
  }

  getPrivateKey() {
    return privateKey(this.getSeed());
  }

  private signBytes(bytes: Uint8Array) {
    return signBytes(this.data.seed, bytes);
  }

  async signWavesAuth(data) {
    return wavesAuth(data, this.getSeed());
  }

  async signCustomData(data) {
    return customData(data, this.getSeed());
  }

  async signTx(tx) {
    const result = fromSignatureAdapterToNode.transaction(
      tx,
      this.data.networkCode.charCodeAt(0)
    );

    result.proofs.push(this.signBytes(makeTxBytes(result)));

    return stringify(result);
  }

  async signOrder(order) {
    const result = fromSignatureAdapterToNode.order(order);

    result.proofs.push(this.signBytes(binary.serializeOrder(result)));

    return stringify(result);
  }

  async signCancelOrder(cancelOrder) {
    const result = fromSignatureAdapterToNode.cancelOrder(cancelOrder);

    result.signature = this.signBytes(cancelOrderParamsToBytes(result));

    return stringify(result);
  }

  signRequest(request) {
    switch (request.type) {
      case 1000:
        return this.signBytes(
          serializeAuthData({
            data: request.data.data,
            host: request.data.host,
          })
        );
      case 1001:
        return this.signBytes(
          concat(
            serializePrimitives.BASE58_STRING(request.data.senderPublicKey),
            serializePrimitives.LONG(request.data.timestamp)
          )
        );
      default:
        throw new Error(`Unexpected request type: ${request.type}`);
    }
  }
}
