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
    if (network === NetworkName.Testnet || network === NetworkName.Stagenet) {
      return 'https://explorer-testnet.unit0.dev/api/v2/addresses/';
    }
    return 'https://explorer.unit0.dev/api/v2/addresses/';
  }

  async fetchBalance(
    address: string,
    network: NetworkName = NetworkName.Mainnet,
  ): Promise<Unit0BalanceResponse> {
    const baseUrl = this.getBaseUrl(network);

    console.log(network, 'network');
    const mockAddress =
      network === NetworkName.Testnet
        ? '0xE860EA6CF834Ca574A364e6B1Dc10A27102CaF84'
        : '0xA18Ea8fE573189e35bb4321adf04F0428d6C1612';
    const response = await fetch(`${baseUrl}${mockAddress}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch unit0 balance: ${response.status}`);
    }

    return response.json();
  }

  async fetchTokenBalances(
    address: string,
    network: NetworkName = NetworkName.Mainnet,
  ): Promise<Unit0TokenBalance[]> {
    const baseUrl = this.getBaseUrl(network);
    const mockAddress =
      network === NetworkName.Testnet
        ? '0xE860EA6CF834Ca574A364e6B1Dc10A27102CaF84'
        : '0xA18Ea8fE573189e35bb4321adf04F0428d6C1612';
    const response = await fetch(`${baseUrl}${mockAddress}/token-balances`);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch unit0 token balances: ${response.status}`,
      );
    }

    const tokens = await response.json();
    return Array.isArray(tokens) ? tokens : [];
  }

  async fetchBalanceAndTokens(
    address: string,
    network: NetworkName = NetworkName.Mainnet,
  ): Promise<{
    balance: Unit0BalanceResponse;
    tokens: Unit0TokenBalance[];
  }> {
    const [balance, tokens] = await Promise.all([
      this.fetchBalance(address, network),
      this.fetchTokenBalances(address, network),
    ]);

    return { balance, tokens };
  }
}
