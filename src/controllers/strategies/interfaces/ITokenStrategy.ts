import { type NetworkName } from 'networks/types';

import { type Unit0TokenAsset, type Unit0TokenBalance } from './IUnit0Types';

export interface TokenProcessResult {
  processedTokens: ProcessedToken[];
  assetsToStore: Unit0TokenAsset[];
}

export interface ProcessedToken {
  address: string;
  balance: string;
  metadata: TokenMetadata;
}

export interface TokenMetadata {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  icon_url: string | null;
  total_supply: string | null;
  holders_count: string;
  circulating_market_cap: string | null;
  exchange_rate: string | null;
  volume_24h: string | null;
}

/**
 * Token Strategy Interface
 * Handles token discovery, processing, and metadata fetching for different blockchains
 */
export interface ITokenStrategy {
  /**
   * Fetch tokens for a given address
   * @param address - The wallet address
   * @param network - The network name
   * @returns Promise resolving to array of token balances
   */
  fetchTokens(
    address: string,
    network: NetworkName,
  ): Promise<Unit0TokenBalance[]>;

  /**
   * Process tokens into structured format with metadata
   * @param tokens - Raw token balance data
   * @param network - The network name
   * @returns Promise resolving to processed tokens and storage assets
   */
  processTokens(
    tokens: Unit0TokenBalance[],
    network: NetworkName,
  ): Promise<TokenProcessResult>;

  /**
   * Filter tokens by type (ERC-20, ERC-721, ERC-1155)
   * @param tokens - Array of token balances
   * @param tokenType - The token type to filter for
   * @returns Filtered array of tokens
   */
  filterTokensByType(
    tokens: Unit0TokenBalance[],
    tokenType: string,
  ): Unit0TokenBalance[];

  /**
   * Get the blockchain type this strategy handles
   * @returns The blockchain type identifier
   */
  getBlockchainType(): string;

  /**
   * Check if this strategy can handle the given blockchain type
   * @param blockchainType - The blockchain type to check
   * @returns True if this strategy can handle the blockchain type
   */
  canHandle(blockchainType: string): boolean;
}
