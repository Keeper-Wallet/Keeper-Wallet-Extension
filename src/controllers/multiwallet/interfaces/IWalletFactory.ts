import {
  type CreateMultiWalletInput,
  type MultiWalletCreationResult,
  type ValidationResult,
} from './types';

/**
 * Wallet Factory Interface
 */
export interface IWalletFactory {
  /**
   * Create a new wallet using appropriate strategy
   * Supports single or multiple blockchains
   * @param input - The wallet creation input parameters
   * @returns Promise resolving to creation result with success/error states
   */
  createWallet(
    input: CreateMultiWalletInput,
  ): Promise<MultiWalletCreationResult>;

  /**
   * Validate input before creation
   * @param input - The wallet creation input to validate
   * @returns Validation result with detailed feedback
   */
  validateInput(input: CreateMultiWalletInput): ValidationResult;

  /**
   * Get list of supported wallet types
   * @returns Array of supported wallet type strings
   */
  supportedWalletTypes(): string[];

  /**
   * Get supported blockchains for a specific wallet type
   * @param walletType - The wallet type to check
   * @returns Array of supported blockchain types
   */
  getSupportedBlockchains(walletType: string): string[];

  /**
   * Check if a wallet type supports multi-blockchain creation
   * @param walletType - The wallet type to check
   * @returns True if multi-blockchain is supported
   */
  supportsMultiBlockchain(walletType: string): boolean;

  /**
   * Get available networks for a blockchain type
   * @param blockchainType - The blockchain type
   * @returns Array of available network names
   */
  getAvailableNetworks(blockchainType: string): string[];
}
