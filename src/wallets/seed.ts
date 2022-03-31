import { BigNumber } from '@waves/bignumber';
import { binary, serializePrimitives } from '@waves/marshall';
import { concat } from '@waves/ts-lib-crypto';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import { customData, makeTxBytes, wavesAuth } from '@waves/waves-transactions';
import { cancelOrderParamsToBytes } from '@waves/waves-transactions/dist/requests/cancel-order';
import {
  address,
  privateKey,
  publicKey,
  signBytes,
} from '@waves/ts-lib-crypto';
import * as create from 'parse-json-bignumber';
import { AccountOfType, NetworkName } from 'accounts/types';
import { fromSignatureAdapterToNode } from 'transactions/utils';
import { Wallet } from './wallet';
import { serializeAuthData } from '@waves/waves-transactions/dist/requests/auth';

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

  async signWavesAuth(data) {
    return wavesAuth(data, this.getSeed());
  }

  async signCustomData(data) {
    return customData(data, this.getSeed());
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

        result.proofs.push(signBytes(this.data.seed, makeTxBytes(result)));

        return stringify(result);
      }
      case 1002: {
        const result = fromSignatureAdapterToNode.order(tx);

        result.proofs.push(
          signBytes(this.data.seed, binary.serializeOrder(result))
        );

        return stringify(result);
      }
      case 1003: {
        const result = fromSignatureAdapterToNode.cancelOrder(tx);

        result.signature = signBytes(
          this.data.seed,
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
          this.data.seed,
          serializeAuthData({
            data: request.data.data,
            host: request.data.host,
          })
        );
      case 1001:
        return signBytes(
          this.data.seed,
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
