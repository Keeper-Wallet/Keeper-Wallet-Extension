import { BigNumber } from '@waves/bignumber';
import { Account, NetworkName } from 'accounts/types';
import { Wallet } from './wallet';
import { TSignData } from '@waves/signature-adapter';
import * as create from 'parse-json-bignumber';
import { convertInvokeListWorkAround } from './utils';
import { InfoAdapter } from 'controllers/MessageController';
import { convert } from '@waves/money-like-to-node';
import { IdentityApi } from 'controllers/IdentityController';
import { validate } from '@waves/waves-transactions/dist/validators';
import { serializeWavesAuthData } from '@waves/waves-transactions/dist/requests/wavesAuth';
import { serializeCustomData } from '@waves/waves-transactions/dist/requests/custom-data';
import { base58Encode, blake2b } from '@waves/ts-lib-crypto';

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

interface WxWalletData extends Account {
  publicKey: string;
  address: string;
  uuid: string;
  username: string;
}

export class WxWallet extends Wallet<WxWalletData> {
  private readonly _adapter: InfoAdapter;
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

    this._adapter = new InfoAdapter(this.data);
    this.identity = identity;
  }

  getAccount(): WxWalletData {
    return {
      uuid: this.data.uuid,
      username: this.data.username,
      ...super.getAccount(),
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

  async signTx(tx: TSignData): Promise<string> {
    const signable = this._adapter.makeSignable(tx);
    const bytes = await signable.getBytes();

    const signData = await signable.getSignData();

    signData.proofs.push(await this.signBytes(bytes));

    const data = convert(signData, (item: any) => new BigNumber(item));
    convertInvokeListWorkAround(data);

    return stringify(data);
  }

  async signBytes(bytes: Array<number> | Uint8Array): Promise<string> {
    return this.identity.signBytes(bytes);
  }

  async signRequest(request: TSignData): Promise<string> {
    const signable = this._adapter.makeSignable(request);
    const bytes = await signable.getBytes();

    return this.signBytes(bytes);
  }
}
