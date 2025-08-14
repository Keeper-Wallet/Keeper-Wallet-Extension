import { Mnemonic } from 'ethers';
import { nanoid } from 'nanoid';

import { CHAIN_IDS } from '../constants';
import { NetworkName } from '../networks/types';
import { getEthereumData, getWavesData, getUnit0Data } from './ed25519';

export interface MultichainAccount {
  accountType: 'multichain';
  id: string;
  name: string;
  accounts: {
    waves: {
      publicKey: string;
      networks: {
        mainnet: { address: string; networkCode: string };
        testnet: { address: string; networkCode: string };
        stagenet: { address: string; networkCode: string };
      };
    };
    ethereum: {
      address: string;
      publicKey: string;
    };
    unit0: {
      publicKey: string;
      networks: {
        mainnet: { address: string; networkCode: string };
        testnet: { address: string; networkCode: string };
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

  try {
    // Generate Waves addresses for all networks
    const wavesMainnet = await getWavesData(phrase, CHAIN_IDS[NetworkName.Mainnet]);
    const wavesTestnet = await getWavesData(phrase, CHAIN_IDS[NetworkName.Testnet]);
    const wavesStagenet = await getWavesData(phrase, CHAIN_IDS[NetworkName.Stagenet]);
    
    // Check for empty address/publicKey in Waves data
    if (!wavesMainnet.address || !wavesMainnet.publicKey) {
      throw new Error('Failed to generate Waves mainnet address');
    }
    
    if (!wavesTestnet.address || !wavesTestnet.publicKey) {
      throw new Error('Failed to generate Waves testnet address');
    }
    
    if (!wavesStagenet.address || !wavesStagenet.publicKey) {
      throw new Error('Failed to generate Waves stagenet address');
    }

    // Generate Ethereum address data
    const ethereum = getEthereumData(phrase);
    if (!ethereum.address || !ethereum.publicKey) {
      throw new Error('Failed to generate Ethereum address');
    }

    // Generate Unit0 address data
    const unit0Data = await getUnit0Data(phrase);
    if (!unit0Data.address || !unit0Data.publicKey) {
      throw new Error('Failed to generate Unit0 address');
    }

    // Create a structured MultiWallet account
    return {
      account: {
        accountType: 'multichain',
        id: nanoid(),
        name: '',
        accounts: {
          waves: {
            publicKey: wavesMainnet.publicKey,
            networks: {
              mainnet: {
                address: wavesMainnet.address,
                networkCode: 'W' // NetworkName.Mainnet networkCode
              },
              testnet: {
                address: wavesTestnet.address,
                networkCode: 'T' // NetworkName.Testnet networkCode
              },
              stagenet: {
                address: wavesStagenet.address,
                networkCode: 'S' // NetworkName.Stagenet networkCode
              },
            },
          },
          ethereum: {
            publicKey: ethereum.publicKey,
            address: ethereum.address,
          },
          unit0: {
            publicKey: unit0Data.publicKey,
            networks: {
              mainnet: {
                address: unit0Data.address,
                networkCode: '88811' // Unit0 mainnet network code
              },
              testnet: {
                address: unit0Data.address, // Using same address for both networks for now
                networkCode: '88817' // Unit0 testnet network code
              },
            }
          },
        },
      },
      phrase,
    };
  } catch (error) {
    console.error('Failed to create multichain account:', error);
    throw error;
  }
}
