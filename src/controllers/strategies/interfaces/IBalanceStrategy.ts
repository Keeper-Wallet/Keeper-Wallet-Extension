import { type TransactionFromNode } from '@waves/ts-types';
import { type BalancesItem, type Unit0Transfer } from 'balances/types';
import { type NetworkName } from 'networks/types';

/**
 * Balance Strategy Result interface
 */
export interface BalanceFetchResult {
  balance: BalancesItem;
  success: boolean;
  error?: Error;
}

/**
 * Callback for incremental balance updates during fetching
 */
export type BalanceUpdateCallback = (balance: BalancesItem) => void;

/**
 * Balance Strategy Interface
 * Defines the contract for blockchain-specific balance fetching strategies
 */
export interface IBalanceStrategy {
  /**
   * Fetch complete balance information for an address
   * @param address - The wallet address
   * @param network - The network name
   * @param transactions - Optional pre-fetched transactions to avoid duplicate API calls
   * @param onUpdate - Optional callback for incremental balance updates (streaming)
   * @returns Promise resolving to balance fetch result
   */
  fetchBalance(
    address: string,
    network: NetworkName,
    transactions?: TransactionFromNode[] | Unit0Transfer[],
    onUpdate?: BalanceUpdateCallback,
  ): Promise<BalanceFetchResult>;

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
