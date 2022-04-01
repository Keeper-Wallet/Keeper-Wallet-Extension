import { BigNumber } from '@waves/bignumber';
import { binary, serializePrimitives } from '@waves/marshall';
import { base58Encode, blake2b, concat } from '@waves/ts-lib-crypto';
import { makeTxBytes } from '@waves/waves-transactions';
import { serializeAuthData } from '@waves/waves-transactions/dist/requests/auth';
import { cancelOrderParamsToBytes } from '@waves/waves-transactions/dist/requests/cancel-order';
import {
  serializeCustomData,
  TCustomData,
} from '@waves/waves-transactions/dist/requests/custom-data';
import { serializeWavesAuthData } from '@waves/waves-transactions/dist/requests/wavesAuth';
import { IWavesAuthParams } from '@waves/waves-transactions/dist/transactions';
import { validate } from '@waves/waves-transactions/dist/validators';
import * as create from 'parse-json-bignumber';
import { AccountOfType, NetworkName } from 'accounts/types';
import { IdentityApi } from 'controllers/IdentityController';
import {
  fromSignatureAdapterToNode,
  SaAuth,
  SaCancelOrder,
  SaOrder,
  SaRequest,
  SaTransaction,
} from 'transactions/utils';
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

  async encryptMessage(): Promise<string> {
    throw new Error('Unable to encrypt message with this account type');
  }

  async decryptMessage(): Promise<string> {
    throw new Error('Unable to decrypt message with this account type');
  }

  private async signBytes(bytes: Array<number> | Uint8Array): Promise<string> {
    return this.identity.signBytes(bytes);
  }

  async signTx(tx: SaTransaction): Promise<string> {
    const result = fromSignatureAdapterToNode.transaction(
      tx,
      this.data.networkCode.charCodeAt(0)
    );

    result.proofs.push(await this.signBytes(makeTxBytes(result)));

    return stringify(result);
  }

  async signAuth(auth: SaAuth): Promise<string> {
    return this.signBytes(
      serializeAuthData({
        data: auth.data.data,
        host: auth.data.host,
      })
    );
  }

  async signRequest(request: SaRequest): Promise<string> {
    return this.signBytes(
      concat(
        serializePrimitives.BASE58_STRING(request.data.senderPublicKey),
        serializePrimitives.LONG(request.data.timestamp)
      )
    );
  }

  async signOrder(order: SaOrder): Promise<string> {
    const result = fromSignatureAdapterToNode.order(order);

    result.proofs.push(await this.signBytes(binary.serializeOrder(result)));

    return stringify(result);
  }

  async signCancelOrder(cancelOrder: SaCancelOrder): Promise<string> {
    const result = fromSignatureAdapterToNode.cancelOrder(cancelOrder);

    result.signature = await this.signBytes(cancelOrderParamsToBytes(result));

    return stringify(result);
  }

  async signWavesAuth(data: IWavesAuthParams) {
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

  async signCustomData(data: TCustomData) {
    validate.customData(data);

    const bytes = serializeCustomData(data);
    const hash = base58Encode(blake2b(bytes));
    const publicKey = data.publicKey
      ? data.publicKey
      : this.getAccount().publicKey;
    const signature = await this.signBytes(bytes);

    return { ...data, hash, publicKey, signature };
  }
}
