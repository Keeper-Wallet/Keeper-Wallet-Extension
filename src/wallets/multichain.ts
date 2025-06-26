import {
    base58Decode,
    signBytes as signBytesWaves,
} from '@keeper-wallet/waves-crypto';
import { Wallet as EthersWallet } from 'ethers';
import { type Network } from 'networks/types';
import { createPrivateKeyMultichain } from 'units/ed25519';

import { type WalletAccount, type WalletPrivateData } from './types';
import { Wallet } from './wallet';

export class MultichainWallet extends Wallet<
  Extract<WalletPrivateData, { accountType: 'multichain' }>
> {
  constructor(data: Extract<WalletPrivateData, { accountType: 'multichain' }>) {
    super(data);
  }

  getAccount(): WalletAccount {
    const { seed, ...publicData } = this.data;
    return publicData;
  }

  getSeed(): string {
    if (this.data.accountType === 'multichain') return this.data.seed;
    throw new Error('Not a multichain wallet');
  }

  async getPrivateKey(chain: Network = 'waves'): Promise<Uint8Array> {
    const seed = this.getSeed();
    if (chain === 'waves' || chain === 'unit0') {
      return createPrivateKeyMultichain(seed);
    } else if (chain === 'ethereum') {
      const wallet = EthersWallet.fromPhrase(seed);
      return base58Decode(wallet.privateKey.slice(2)); // remove '0x' prefix
    }
    throw new Error(`Unsupported chain: ${chain}`);
  }

  protected async signBytes(
    bytes: Uint8Array,
    chain: Network = 'waves',
  ): Promise<Uint8Array> {
    const privateKey = await this.getPrivateKey(chain);
    if (chain === 'waves' || chain === 'unit0') {
      return signBytesWaves(privateKey, bytes);
    }
    throw new Error(`Signing not implemented for chain: ${chain}`);
  }
}
