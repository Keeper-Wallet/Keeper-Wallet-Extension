import { NETWORK_CONFIGS } from '../../networks/config';
import { NetworkName } from '../../networks/types';

export interface Unit0BalanceResponse {
  coin_balance: string;
  exchange_rate?: string;
}

export interface Unit0TokenBalance {
  token_id: string;
  balance: string;
}

export class Unit0Api {
  private getBaseUrl(network: NetworkName): string {
    const unit0Config = NETWORK_CONFIGS['unit0-mainnet'];
    const unit0TestnetConfig = NETWORK_CONFIGS['unit0-testnet'];
    
    if (network === NetworkName.Testnet && unit0TestnetConfig) {
      return unit0TestnetConfig.params.explorerUrl || 'https://explorer-testnet.unit0.dev/api/v2/addresses/';
    }
    
    return unit0Config?.params.explorerUrl 
      ? `${unit0Config.params.explorerUrl}api/v2/addresses/`
      : 'https://explorer.unit0.dev/api/v2/addresses/';
  }

  async fetchBalance(address: string, network: NetworkName = NetworkName.Mainnet): Promise<Unit0BalanceResponse> {
    const baseUrl = this.getBaseUrl(network);
    const response = await fetch(`${baseUrl}${address}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch unit0 balance: ${response.status}`);
    }
    
    return response.json();
  }

  async fetchTokenBalances(address: string, network: NetworkName = NetworkName.Mainnet): Promise<Unit0TokenBalance[]> {
    const baseUrl = this.getBaseUrl(network);
    const response = await fetch(`${baseUrl}${address}/token-balances`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch unit0 token balances: ${response.status}`);
    }
    
    const tokens = await response.json();
    return Array.isArray(tokens) ? tokens : [];
  }

  async fetchBalanceAndTokens(address: string, network: NetworkName = NetworkName.Mainnet): Promise<{
    balance: Unit0BalanceResponse;
    tokens: Unit0TokenBalance[];
  }> {
    const [balance, tokens] = await Promise.all([
      this.fetchBalance(address, network),
      this.fetchTokenBalances(address, network)
    ]);

    return { balance, tokens };
  }
} 
