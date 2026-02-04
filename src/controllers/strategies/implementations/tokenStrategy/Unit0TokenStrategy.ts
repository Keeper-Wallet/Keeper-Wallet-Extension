import { Unit0Api } from 'controllers/api/unit0Api';
import { type NetworkName } from 'networks/types';

import {
  type ITokenStrategy,
  type ProcessedToken,
  type TokenProcessResult,
} from '../../interfaces/ITokenStrategy';
import {
  type Unit0TokenAsset,
  type Unit0TokenBalance,
} from '../../interfaces/IUnit0Types';

/**
 * Unit0 Token Strategy Implementation
 * Handles ERC-20 token discovery and processing for Unit0 blockchain
 */
export class Unit0TokenStrategy implements ITokenStrategy {
  private unit0Api: Unit0Api;

  constructor() {
    this.unit0Api = new Unit0Api();
  }

  async fetchTokens(
    address: string,
    network: NetworkName,
  ): Promise<Unit0TokenBalance[]> {
    return this.unit0Api.fetchTokenBalances(address, network);
  }

  async processTokens(
    tokens: Unit0TokenBalance[],
  ): Promise<TokenProcessResult> {
    // Filter to get only ERC-20 tokens
    const erc20Tokens = this.filterTokensByType(tokens, 'ERC-20');

    // Process tokens - use metadata from token object directly (already available from API)
    const processedTokens: ProcessedToken[] = erc20Tokens
      .map(token => {
        const address = token.token?.address_hash ?? token.token?.address;
        const tokenBalance = token.value || '0';

        if (!address) return null;

        // Use metadata directly from token object - no need for extra API call
        const metadata = {
          address,
          name: token.token?.name || '',
          symbol: token.token?.symbol || '',
          decimals: Number(token.token?.decimals) || 18,
          icon_url: token.token?.icon_url || null,
          total_supply: token.token?.total_supply || null,
          holders_count: token.token?.holders_count || null,
          circulating_market_cap: token.token?.circulating_market_cap || null,
          exchange_rate: token.token?.exchange_rate || null,
          volume_24h: token.token?.volume_24h || null,
          type: 'ERC-20',
        };

        return {
          address,
          balance: tokenBalance,
          metadata,
        };
      })
      .filter(Boolean) as ProcessedToken[];

    // Prepare assets for storage
    const assetsToStore: Unit0TokenAsset[] = processedTokens
      .filter(result => result.metadata)
      .map(result => ({
        address: result.address,
        metadata: result.metadata,
      }));

    return {
      processedTokens,
      assetsToStore,
    };
  }

  filterTokensByType(
    tokens: Unit0TokenBalance[],
    tokenType: string,
  ): Unit0TokenBalance[] {
    return tokens.filter(token => token.token?.type === tokenType);
  }

  getBlockchainType(): string {
    return 'unit0';
  }

  canHandle(blockchainType: string): boolean {
    return blockchainType === 'unit0';
  }
}
