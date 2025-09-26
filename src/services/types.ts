import { NetworkName } from '../networks/types';

/**
 * MultiWallet represents a single wallet with addresses on multiple networks.
 * It contains a nested structure organized by blockchain type and network.
 */
export interface WalletItem {
  address: string;
  networkCode: string;
}

export interface MultiWallet {
  id: string; // Unique identifier for the MultiWallet
  name: string; // User-friendly name
  type: string; // 'seed', 'privateKey', 'ledger', etc.
  createdAt: number; // Timestamp for sorting and tracking
  lastUsed?: number;
  // Authentication data - stored securely
  seed?: string; // Optional seed phrase (for seed wallets)
  privateKey?: string; // Optional private key (for privateKey wallets)

  // Nested structure for different blockchains
  coins: {
    // Waves blockchain networks
    waves: {
      publicKey?: string;
      networks: {
        mainnet: WalletItem;
        testnet: WalletItem;
        stagenet?: WalletItem;
        custom?: WalletItem;
      };
    };

    // Unit0 blockchain (EVM-compatible)
    unit0?: {
      publicKey?: string;
      networks: {
        mainnet: WalletItem;
        testnet: WalletItem;
      };
    };
  };
}

/**
 * Network identifiers
 */
export type BlockchainType = 'waves' | 'unit0';
export type NetworkType = 'mainnet' | 'testnet' | 'stagenet';

/**
 * Network address data structure
 */
export interface NetworkAddressData {
  address: string;
  publicKey: string;
  networkCode: string;
}

/**
 * EVM-compatible network address data (extends the base type)
 */
export interface EVMNetworkAddressData extends NetworkAddressData {
  ethereumAddress: string;
}

/**
 * Helper type to access network data based on blockchain type
 */
export type MultiWalletNetworkData<
  T extends BlockchainType,
  N extends NetworkType,
> = T extends 'waves' ? NetworkAddressData : EVMNetworkAddressData;

/**
 * Network code mapping constants
 */
export const NETWORK_CODES = {
  waves: {
    mainnet: 'W',
    testnet: 'T',
    stagenet: 'S',
  },
  unit0: {
    mainnet: '88811',
    testnet: '88817',
  },
};

/**
 * Network name to blockchain/network type mapping
 */
export const NETWORK_NAME_MAP: Record<
  NetworkName,
  { blockchain: BlockchainType; network: NetworkType }
> = {
  [NetworkName.Mainnet]: { blockchain: 'waves', network: 'mainnet' },
  [NetworkName.Testnet]: { blockchain: 'waves', network: 'testnet' },
  [NetworkName.Stagenet]: { blockchain: 'waves', network: 'stagenet' },
  [NetworkName.Custom]: { blockchain: 'waves', network: 'mainnet' }, // Default to mainnet for custom
};
