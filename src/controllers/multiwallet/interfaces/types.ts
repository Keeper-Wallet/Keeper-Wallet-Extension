import { type NetworkName } from '../../../networks/types';
import {
  type BlockchainType,
  type MultiWallet,
  type WalletItem,
} from '../../../services/types';

/**
 * Multi-Wallet Creation Input Types
 */
export type CreateMultiWalletInput = {
  name: string;
  blockchains: BlockchainType[];
  networks: Partial<Record<BlockchainType, NetworkName[]>>;
} & (
  | { type: 'seed'; seed: string; isSupportMultiBlockchain?: boolean }
  | { type: 'privateKey'; privateKey: string }
  | { type: 'ledger'; id: number; publicKey: string; address: string }
  | { type: 'debug'; address: string; unit0Address?: string }
  | {
      type: 'wx';
      uuid: string;
      username: string;
      publicKey: string;
      address: string;
    }
  | { type: 'encodedSeed'; encodedSeed: string }
);

/**
 * Waves Network Data Structure
 */
export interface WavesNetworkData {
  publicKey: string;
  networks: {
    mainnet: WalletItem;
    testnet: WalletItem;
    stagenet?: WalletItem;
    custom?: WalletItem;
  };
}

/**
 * Unit0 Network Data Structure
 * EVM-compatible blockchain data
 * Must match MultiWallet.coins.unit0 structure exactly
 */
export interface Unit0NetworkData {
  publicKey?: string;
  networks: {
    mainnet: WalletItem;
    testnet: WalletItem;
  };
}

/**
 * Wallet Authentication Data
 */
export interface WalletAuthData {
  seed?: string;
  privateKey?: string;
  ledgerId?: number;
  wxUuid?: string;
  wxUsername?: string;
  encodedSeed?: string;
}

/**
 * Strategy Creation Result
 */
export interface MultiWalletCreationResult {
  success: boolean;
  wallet?: MultiWallet;
  error?: Error;
}

/**
 * Strategy Validation Result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
