import { BigNumber } from '@waves/bignumber';
import { binary, serializePrimitives } from '@waves/marshall';
import { address, concat, publicKey, signBytes } from '@waves/ts-lib-crypto';
import { TRANSACTION_TYPE } from '@waves/ts-types';
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

  async signWavesAuth(data) {
    return wavesAuth(data, { privateKey: this.getPrivateKey() });
  }

  async signCustomData(data) {
    return customData(data, { privateKey: this.getPrivateKey() });
  }

  async signTx(tx) {
    const defaultChainId = this.data.networkCode.charCodeAt(0);

    switch (tx.type) {
      case TRANSACTION_TYPE.ISSUE:
      case TRANSACTION_TYPE.TRANSFER:
      case TRANSACTION_TYPE.REISSUE:
      case TRANSACTION_TYPE.BURN:
      case TRANSACTION_TYPE.LEASE:
      case TRANSACTION_TYPE.CANCEL_LEASE:
      case TRANSACTION_TYPE.ALIAS:
      case TRANSACTION_TYPE.MASS_TRANSFER:
      case TRANSACTION_TYPE.DATA:
      case TRANSACTION_TYPE.SET_SCRIPT:
      case TRANSACTION_TYPE.SPONSORSHIP:
      case TRANSACTION_TYPE.SET_ASSET_SCRIPT:
      case TRANSACTION_TYPE.INVOKE_SCRIPT:
      case TRANSACTION_TYPE.UPDATE_ASSET_INFO: {
        const result = fromSignatureAdapterToNode.transaction(
          tx,
          defaultChainId
        );

        result.proofs.push(
          signBytes({ privateKey: this.getPrivateKey() }, makeTxBytes(result))
        );

        return stringify(result);
      }
      case 1002: {
        const result = fromSignatureAdapterToNode.order(tx);

        result.proofs.push(
          signBytes(
            { privateKey: this.getPrivateKey() },
            binary.serializeOrder(result)
          )
        );

        return stringify(result);
      }
      case 1003: {
        const result = fromSignatureAdapterToNode.cancelOrder(tx);

        result.signature = signBytes(
          { privateKey: this.getPrivateKey() },
          cancelOrderParamsToBytes(result)
        );

        return stringify(result);
      }
      default:
        throw new Error(`Unexpected tx type: ${tx.type}`);
    }
  }

  signRequest(request) {
    switch (request.type) {
      case 1000:
        return signBytes(
          { privateKey: this.getPrivateKey() },
          serializeAuthData({
            data: request.data.data,
            host: request.data.host,
          })
        );
      case 1001:
        return signBytes(
          { privateKey: this.getPrivateKey() },
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
