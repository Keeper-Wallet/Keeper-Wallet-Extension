import { BigNumber } from '@waves/bignumber';
import { Account, NetworkName } from 'accounts/types';
import { Wallet } from './wallet';
import { TSignData } from '@waves/signature-adapter';
import * as create from 'parse-json-bignumber';
import { convertInvokeListWorkAround } from './utils';
import { InfoAdapter } from 'controllers/MessageController';
import { convert } from '@waves/money-like-to-node';
import { IdentityApi } from '../controllers/IdentityController';

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

  serialize(): WxWalletData {
    return super.serialize();
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

  async signWavesAuth(data) {
    // todo
    throw new Error('Not implemented yet');
  }

  async signCustomData(data) {
    // todo
    throw new Error('Not implemented yet');
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
    return this.signTx(request);
  }
}
