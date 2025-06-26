import { Mnemonic } from 'ethers';
import { nanoid } from 'nanoid';
import { type WalletAccount } from 'wallets/types';

import { getEthereumData, getWavesData } from './ed25519';

type MultichainWalletAccount = Extract<
  WalletAccount,
  { accountType: 'multichain' }
>;

export async function createMultichainAccount(): Promise<{
  account: MultichainWalletAccount;
  phrase: string;
}> {
  const mnemonic = Mnemonic.fromEntropy(
    // 12 words seed-phrase
    crypto.getRandomValues(new Uint8Array(16)),
  );
  const phrase = mnemonic.phrase;

  const waves = await getWavesData(phrase);
  const ethereum = getEthereumData(phrase);
  return {
    account: {
      accountType: 'multichain',
      id: nanoid(),
      name: '',
      accounts: {
        waves,
        ethereum,
      },
    },
    phrase,
  };
}
