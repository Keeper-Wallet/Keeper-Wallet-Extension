import {
  base58Encode,
  createAddress,
  createPrivateKey,
  createPublicKey,
  signBytes,
  utf8Encode,
} from '@keeper-wallet/waves-crypto';
import { Wallet as EthWallet, Transaction } from 'ethers';
import { type NetworkName } from 'networks/types';

import { type WalletPrivateDataOfType } from './types';
import { Wallet } from './wallet';

export class SeedWallet extends Wallet<WalletPrivateDataOfType<'seed'>> {
  static async create({
    name,
    network,
    networkCode,
    seed,
    ethereumAddress,
  }: {
    name: string;
    network: NetworkName;
    networkCode: string;
    seed: string;
    ethereumAddress?: string;
  }) {
    const privateKey = await createPrivateKey(utf8Encode(seed));
    const publicKey = await createPublicKey(privateKey);

    const walletData = {
      address: base58Encode(
        createAddress(publicKey, networkCode.charCodeAt(0)),
      ),
      name,
      network,
      networkCode,
      publicKey: base58Encode(publicKey),
      seed,
      ethereumAddress,
    };
    
    return new this(walletData);
  }

  constructor({
    address,
    name,
    network,
    networkCode,
    publicKey,
    seed,
    ethereumAddress,
  }: {
    address: string;
    name: string;
    network: NetworkName;
    networkCode: string;
    publicKey: string;
    seed: string;
    ethereumAddress?: string;
  }) {
    super({
      address,
      name,
      network,
      networkCode,
      publicKey,
      seed,
      ethereumAddress,
      type: 'seed',
    });
  }

  getAccount() {
    return {
      address: this.data.address,
      name: this.data.name,
      network: this.data.network,
      networkCode: this.data.networkCode,
      publicKey: this.data.publicKey,
      type: this.data.type,
      ethereumAddress: this.data.ethereumAddress,
    };
  }

  getSeed() {
    return this.data.seed;
  }

  async getPrivateKey() {
    return createPrivateKey(utf8Encode(this.getSeed()));
  }

  protected async signBytes(bytes: Uint8Array) {
    const privateKey = await this.getPrivateKey();

    return signBytes(privateKey, bytes);
  }

  /**
   * Sign Unit0 (Ethereum) transaction using seed phrase
   */
  async signUnit0Transaction(txData: {
    to: string;
    value: string;
    gasLimit: string;
    gasPrice: string;
    nonce: number;
    data?: string;
    chainId: number;
  }): Promise<string> {
    // Derive Ethereum wallet from seed phrase using default path
    // This matches MetaMask and Trust Wallet behavior
    const derivedWallet = EthWallet.fromPhrase(this.getSeed());

    // Build transaction
    const tx = Transaction.from({
      to: txData.to,
      value: txData.value,
      gasLimit: txData.gasLimit,
      gasPrice: txData.gasPrice,
      nonce: txData.nonce,
      data: txData.data || '0x',
      chainId: txData.chainId,
    });

    // Sign transaction
    const signedTx = await derivedWallet.signTransaction(tx);

    return signedTx;
  }
}
