import { Mnemonic } from 'ethers';
import { nanoid } from 'nanoid';

import { getEthereumData, getWavesData, getUnit0Data } from './ed25519';

export interface MultichainAccount {
  accountType: 'multichain';
  id: string;
  name: string;
  accounts: {
    waves: {
      address: string;
      publicKey: string;
    };
    ethereum: {
      address: string;
      publicKey: string;
    };
    unit0: {
      mainnet: {
        address: string;
        publicKey: string;
      };
      testnet: {
        address: string;
        publicKey: string;
      };
    };
  };
}

export async function createMultichainAccount(): Promise<{
  account: MultichainAccount;
  phrase: string;
}> {
  const mnemonic = Mnemonic.fromEntropy(
    // 12 words seed-phrase
    crypto.getRandomValues(new Uint8Array(16)),
  );
  const phrase = mnemonic.phrase;

  const waves = await getWavesData(phrase);
  const ethereum = getEthereumData(phrase);
  const unit0Address = await getUnit0Data(phrase); // Unit0 mainnet chain ID

  return {
    account: {
      accountType: 'multichain',
      id: nanoid(),
      name: '',
      accounts: {
        waves,
        ethereum,
        unit0: {
          mainnet: unit0Address,
          testnet: unit0Address,
        },
      },
    },
    phrase,
  };
}
