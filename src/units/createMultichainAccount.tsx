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
  const unit0Mainnet = await getUnit0Data(phrase, 88811); // Unit0 mainnet chain ID
  const unit0Testnet = await getUnit0Data(phrase, 88817); // Unit0 testnet chain ID

  return {
    account: {
      accountType: 'multichain',
      id: nanoid(),
      name: '',
      accounts: {
        waves,
        ethereum,
        unit0: {
          mainnet: unit0Mainnet,
          testnet: unit0Testnet,
        },
      },
    },
    phrase,
  };
}
