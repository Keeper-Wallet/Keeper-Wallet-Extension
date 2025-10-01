import { type NetworkName } from '../../../networks/types';
import {
  type CreateMultiWalletInput,
  type Unit0NetworkData,
  type ValidationResult,
  type WalletAuthData,
  type WavesNetworkData,
} from './types';

/**
 * MultiWallet Creation Strategy Interface
 *
 * Following the established strategy pattern from existing interfaces:
 * - IBalanceStrategy, IAssetInfoStrategy, etc.
 * - Consistent method signatures and naming conventions
 * - React-friendly with async operations and error handling
 */
export interface IMultiWalletCreationStrategy {
  /**
   * Create Waves addresses for specified networks
   * @param networks - Array of NetworkName values for Waves blockchain
   * @returns Promise resolving to Waves network data structure
   */
  createWavesAddresses(networks: NetworkName[]): Promise<WavesNetworkData>;

  /**
   * Create Unit0 addresses for specified networks
   * @param networks - Array of NetworkName values for Unit0 blockchain
   * @returns Promise resolving to Unit0 network data structure
   */
  createUnit0Addresses(networks: NetworkName[]): Promise<Unit0NetworkData>;

  /**
   * Get authentication data to store in MultiWallet
   * Returns the sensitive data (seed, private key, etc.) for secure storage
   * @returns Wallet authentication data object
   */
  getAuthData(): WalletAuthData;

  /**
   * Validate if this strategy can handle the input
   * React components can use this for form validation
   * @param input - The wallet creation input to validate
   * @returns Validation result with detailed error messages
   */
  validateInput(input: CreateMultiWalletInput): ValidationResult;

  /**
   * Check if this strategy can handle the input (simple boolean check)
   * Used by factory for strategy selection
   * @param input - The wallet creation input to check
   * @returns True if this strategy can handle the input
   */
  canHandle(input: CreateMultiWalletInput): boolean;

  /**
   * Get wallet type identifier
   * Following existing pattern from other strategies
   * @returns The wallet type string (matches CreateWalletInput.type)
   */
  getWalletType(): string;

  /**
   * Get the blockchain type this strategy handles
   * Following the established pattern from IBalanceStrategy, etc.
   * @returns The blockchain type identifier
   */
  getBlockchainType(): string;

  /**
   * Check if this strategy supports a specific blockchain
   * For multi-blockchain strategies
   * @param blockchainType - The blockchain type to check
   * @returns True if this strategy supports the blockchain
   */
  supportsBlockchain(blockchainType: string): boolean;
}
