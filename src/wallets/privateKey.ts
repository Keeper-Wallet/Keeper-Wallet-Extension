import { BigNumber } from '@waves/bignumber';
import { binary, serializePrimitives } from '@waves/marshall';
import { address, concat, publicKey, signBytes } from '@waves/ts-lib-crypto';
import { customData, makeTxBytes, wavesAuth } from '@waves/waves-transactions';
import { serializeAuthData } from '@waves/waves-transactions/dist/requests/auth';
import { cancelOrderParamsToBytes } from '@waves/waves-transactions/dist/requests/cancel-order';
import * as create from 'parse-json-bignumber';
import { AccountOfType, NetworkName } from 'accounts/types';
import { fromSignatureAdapterToNode } from 'transactions/utils';
import { Wallet } from './wallet';

const { stringify } = create({ BigNumber });

export interface PrivateKeyWalletInput {
  name: string;
  network: NetworkName;
  networkCode: string;
  privateKey: string;
}

type PrivateKeyWalletData = AccountOfType<'privateKey'> & {
  privateKey: string;
};

export class PrivateKeyWallet extends Wallet<PrivateKeyWalletData> {
  constructor({
    name,
    network,
    networkCode,
    privateKey,
  }: PrivateKeyWalletInput) {
    const publicKeyValue = publicKey({ privateKey });

    super({
      address: address({ publicKey: publicKeyValue }, networkCode),
      name,
      network,
      networkCode,
      privateKey,
      publicKey: publicKeyValue,
      type: 'privateKey',
    });
  }

  getSeed(): string {
    throw new Error('Cannot get seed');
  }

  getPrivateKey() {
    return this.data.privateKey;
  }

  private signBytes(bytes: Uint8Array) {
    return signBytes({ privateKey: this.getPrivateKey() }, bytes);
  }

  async signWavesAuth(data) {
    return wavesAuth(data, { privateKey: this.getPrivateKey() });
  }

  async signCustomData(data) {
    return customData(data, { privateKey: this.getPrivateKey() });
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
