import { BigNumber } from '@waves/bignumber';
import { binary, serializePrimitives } from '@waves/marshall';
import { base58Encode, blake2b, concat } from '@waves/ts-lib-crypto';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import { makeTxBytes } from '@waves/waves-transactions';
import { serializeAuthData } from '@waves/waves-transactions/dist/requests/auth';
import { cancelOrderParamsToBytes } from '@waves/waves-transactions/dist/requests/cancel-order';
import { serializeCustomData } from '@waves/waves-transactions/dist/requests/custom-data';
import { serializeWavesAuthData } from '@waves/waves-transactions/dist/requests/wavesAuth';
import { validate } from '@waves/waves-transactions/dist/validators';
import * as create from 'parse-json-bignumber';
import { AccountOfType, NetworkName } from 'accounts/types';
import { IdentityApi } from 'controllers/IdentityController';
import { fromSignatureAdapterToNode } from 'transactions/utils';
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

type WxWalletData = AccountOfType<'wx'> & {
  publicKey: string;
  address: string;
  uuid: string;
  username: string;
};

export class WxWallet extends Wallet<WxWalletData> {
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

  getAccount(): WxWalletData {
    return {
      ...super.getAccount(),
      type: 'wx',
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

  async encryptMessage(
    message,
    publicKey,
    prefix = 'waveskeeper'
  ): Promise<string> {
    throw new Error('Unable to encrypt message with this account type');
  }

  async decryptMessage(
    message,
    publicKey,
    prefix = 'waveskeeper'
  ): Promise<string> {
    throw new Error('Unable to decrypt message with this account type');
  }

  async signWavesAuth(data) {
    const account = this.getAccount();
    const publicKey = data.publicKey || account.publicKey;
    const timestamp = data.timestamp || Date.now();
    validate.wavesAuth({ publicKey, timestamp });

    let rx = {
      hash: '',
      signature: '',
      timestamp,
      publicKey,
      address: account.address,
    };

    const bytes = serializeWavesAuthData(rx);

    rx.signature = await this.signBytes(bytes);
    rx.hash = base58Encode(blake2b(Uint8Array.from(bytes)));

    return rx;
  }

  async signCustomData(data) {
    validate.customData(data);

    const bytes = serializeCustomData(data);
    const hash = base58Encode(blake2b(bytes));
    const publicKey = data.publicKey
      ? data.publicKey
      : this.getAccount().publicKey;
    const signature = await this.signBytes(bytes);

    return { ...data, hash, publicKey, signature };
  }

  async signTx(tx): Promise<string> {
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

        result.proofs.push(await this.signBytes(makeTxBytes(result)));

        return stringify(result);
      }
      case 1002: {
        const result = fromSignatureAdapterToNode.order(tx);

        result.proofs.push(await this.signBytes(binary.serializeOrder(result)));

        return stringify(result);
      }
      case 1003: {
        const result = fromSignatureAdapterToNode.cancelOrder(tx);

        result.signature = await this.signBytes(
          cancelOrderParamsToBytes(result)
        );

        return stringify(result);
      }
      default:
        throw new Error(`Unexpected tx type: ${tx.type}`);
    }
  }

  async signBytes(bytes: Array<number> | Uint8Array): Promise<string> {
    return this.identity.signBytes(bytes);
  }

  async signRequest(request): Promise<string> {
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
