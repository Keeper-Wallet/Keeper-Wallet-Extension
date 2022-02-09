import { getAdapterByType } from '@waves/signature-adapter';
import { libs as transactionsLibs } from '@waves/waves-transactions';
import { waves } from '../controllers/wavesTransactionsController';
import { BigNumber } from '@waves/bignumber';
import create from 'parse-json-bignumber';

const { messageEncrypt, messageDecrypt, sharedKey, base58Encode } =
  transactionsLibs.crypto;
const { stringify } = create({ BigNumber });

export class Wallet {
  /**
   * user
   * @type {
   * {
   *  address: string,
   *  seed: string,
   *  networkCode: string,
   *  name: string,
   *  publicKey: string,
   *  type: string,
   *  network: string
   *  }
   *}
   */
  user = null;

  constructor(user) {
    if (!user) throw new Error('user required');
    this.user = user;
  }

  get _adapter() {
    const Adapter = getAdapterByType(this.user.type);

    Adapter.initOptions({ networkCode: this.user.networkCode.charCodeAt(0) });

    //Todo: temporary for seed
    let params = this.user;
    if (this.user.type === 'seed') {
      params = this.user.seed;
    }

    return new Adapter(params);
  }

  isMyNetwork(network) {
    return network === this.user.network;
  }

  getAccount() {
    let account = Object.assign({}, this.user);
    delete account['id'];
    delete account['seed'];
    return account;
  }

  serialize() {
    return this.user;
  }

  getSecret() {
    return this.user.seed;
  }

  async encryptMessage(message, publicKey, prefix = 'waveskeeper') {
    const privateKey = await this._adapter.getPrivateKey();
    const shKey = sharedKey(privateKey, publicKey, prefix);
    return base58Encode(messageEncrypt(shKey, message, prefix || undefined));
  }

  async decryptMessage(message, publicKey, prefix = 'waveskeeper') {
    const privateKey = await this._adapter.getPrivateKey();
    const shKey = sharedKey(privateKey, publicKey, prefix);
    try {
      return messageDecrypt(shKey, message, prefix || undefined);
    } catch (e) {
      throw new Error('message is invalid');
    }
  }

  async getKEK(publicKey, prefix) {
    prefix = (prefix || '') + 'waves';
    const privateKey = await this._adapter.getPrivateKey();
    return base58Encode(sharedKey(privateKey, publicKey, prefix));
  }

  async signWaves(type, data) {
    return waves[type](data, this.user);
  }

  async signTx(tx) {
    const signable = this._adapter.makeSignable(tx);
    const data = await signable.getDataForApi();

    // This workaround will not be needed once money-like-to-node starts
    // converting lists of integers here.
    // See https://github.com/wavesplatform/money-like-to-node/blob/939dbd5bfa132e6f77b4acbe9a08888cae642f4f/src/converters/index.ts#L127-L138
    if (data.type === 16 && data.call && data.call.args) {
      data.call.args.forEach(arg => {
        if (arg.type === 'list') {
          arg.value.forEach(item => {
            if (item.type === 'integer') {
              item.value = new BigNumber(item.value);
            }
          });
        }
      });
    }

    return stringify(data);
  }

  async signBytes(bytes) {
    return await this._adapter.signData(Uint8Array.from(bytes));
  }

  async signRequest(request) {
    const signable = this._adapter.makeSignable(request);
    return await signable.getSignature();
  }
}
