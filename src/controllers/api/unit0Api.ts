import { NetworkName } from '../../networks/types';
import {
  type Unit0BalanceResponse,
  type Unit0TokenBalance,
  type Unit0TokenDetailsResponse,
  type Unit0TokenMetadata,
} from '../strategies/interfaces/IUnit0Types';

export class Unit0Api {
  private getBaseUrl(network: NetworkName): string {
    if (network === NetworkName.Testnet) {
      return 'https://explorer-testnet.unit0.dev/api/v2/addresses/';
    }
    return 'https://explorer.unit0.dev/api/v2/addresses/';
  }

  private getTokenBaseUrl(network: NetworkName): string {
    if (network === NetworkName.Testnet) {
      return 'https://explorer-testnet.unit0.dev/api/v2/tokens/';
    }
    return 'https://explorer.unit0.dev/api/v2/tokens/';
  }

  private getRpcUrl(network: NetworkName): string {
    if (network === NetworkName.Testnet) {
      return 'https://rpc-testnet.unit0.dev';
    }
    return 'https://rpc.unit0.dev';
  }

  async fetchBalance(
    address: string,
    network: NetworkName = NetworkName.Mainnet,
  ): Promise<Unit0BalanceResponse> {
    const baseUrl = this.getBaseUrl(network);
    const response = await fetch(`${baseUrl}${address}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch unit0 balance: ${response.status}`);
    }

    return response.json();
  }

  async fetchERC20Tokens(
    address: string,
    network: NetworkName = NetworkName.Mainnet,
  ): Promise<Unit0TokenBalance[]> {
    const baseUrl = this.getBaseUrl(network);

    const response = await fetch(`${baseUrl}${address}/tokens?type=ERC-20`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ERC-20 tokens: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data.items) ? data.items : [];
  }

  async fetchERC721Tokens(
    address: string,
    network: NetworkName = NetworkName.Mainnet,
  ): Promise<Unit0TokenBalance[]> {
    const baseUrl = this.getBaseUrl(network);

    const response = await fetch(`${baseUrl}${address}/tokens?type=ERC-721`);

    if (!response.ok) {
      throw new Error(`Failed to fetch ERC-721 tokens: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data.items) ? data.items : [];
  }

  async fetchERC1155Tokens(
    address: string,
    network: NetworkName = NetworkName.Mainnet,
  ): Promise<Unit0TokenBalance[]> {
    const baseUrl = this.getBaseUrl(network);

    const response = await fetch(`${baseUrl}${address}/tokens?type=ERC-1155`);

    if (!response.ok) {
      throw new Error(`Failed to fetch ERC-1155 tokens: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data.items) ? data.items : [];
  }

  async fetchTokenBalances(
    address: string,
    network: NetworkName = NetworkName.Mainnet,
  ): Promise<Unit0TokenBalance[]> {
    // Fetch all token types and combine them
    const [erc20Tokens, erc721Tokens, erc1155Tokens] = await Promise.all([
      this.fetchERC20Tokens(address, network),
      this.fetchERC721Tokens(address, network),
      this.fetchERC1155Tokens(address, network),
    ]);

    return [...erc20Tokens, ...erc721Tokens, ...erc1155Tokens];
  }

  async fetchNftInventory(
    contractAddress: string,
    holderAddress: string,
    network: NetworkName,
  ) {
    const baseUrl = this.getBaseUrl(network);

    const url = `${baseUrl}${holderAddress}/nft/collections?type=`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  async fetchContractInfo(contractAddress: string, network: NetworkName) {
    const baseUrl = this.getBaseUrl(network);
    const url = `${baseUrl}${contractAddress}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  async fetchTokenMetadata(
    contractAddress: string,
    network: NetworkName = NetworkName.Mainnet,
  ): Promise<Unit0TokenMetadata | null> {
    const baseUrl = this.getTokenBaseUrl(network);
    const response = await fetch(`${baseUrl}${contractAddress}`);

    if (!response.ok) {
      return null;
    }

    const tokenDetails: Unit0TokenDetailsResponse = await response.json();

    return {
      address: (tokenDetails.address ?? tokenDetails.hash) as string,
      name: tokenDetails.name,
      symbol: tokenDetails.symbol,
      decimals: Number(tokenDetails.decimals) || 18,
      icon_url: tokenDetails.icon_url,
      total_supply: tokenDetails.total_supply,
      holders_count: tokenDetails.holders_count,
      circulating_market_cap: tokenDetails.circulating_market_cap,
      exchange_rate: tokenDetails.exchange_rate,
      volume_24h: tokenDetails.volume_24h,
    };
  }

  /**
   * Send a signed transaction to the blockchain
   * @param signedTx - The signed transaction hex string (with 0x prefix)
   * @param network - The network to broadcast to
   * @returns Transaction hash
   */
  async sendRawTransaction(
    signedTx: string,
    network: NetworkName = NetworkName.Mainnet,
  ): Promise<string> {
    const rpcUrl = this.getRpcUrl(network);

    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_sendRawTransaction',
        params: [signedTx],
        id: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to broadcast transaction: ${response.status}`);
    }

    const result = await response.json();

    if (result.error) {
      throw new Error(
        `RPC error: ${result.error.message || JSON.stringify(result.error)}`,
      );
    }

    return result.result;
  }

  /**
   * Get transaction receipt (to confirm transaction was mined)
   * @param txHash - Transaction hash
   * @param network - The network
   * @returns Transaction receipt or null if not yet mined
   */
  async getTransactionReceipt(
    txHash: string,
    network: NetworkName = NetworkName.Mainnet,
  ): Promise<any> {
    const rpcUrl = this.getRpcUrl(network);

    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionReceipt',
        params: [txHash],
        id: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch transaction receipt: ${response.status}`,
      );
    }

    const result = await response.json();

    if (result.error) {
      throw new Error(
        `RPC error: ${result.error.message || JSON.stringify(result.error)}`,
      );
    }

    return result.result;
  }

  /**
   * Get current transaction count (nonce) for an address
   * @param address - Ethereum address
   * @param network - The network
   * @returns Transaction count (nonce)
   */
  async getTransactionCount(
    address: string,
    network: NetworkName = NetworkName.Mainnet,
  ): Promise<number> {
    const rpcUrl = this.getRpcUrl(network);

    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionCount',
        params: [address, 'latest'],
        id: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch transaction count: ${response.status}`);
    }

    const result = await response.json();

    if (result.error) {
      throw new Error(
        `RPC error: ${result.error.message || JSON.stringify(result.error)}`,
      );
    }

    return parseInt(result.result, 16);
  }

  /**
   * Get current gas price
   * @param network - The network
   * @returns Gas price in wei (as hex string)
   */
  async getGasPrice(
    network: NetworkName = NetworkName.Mainnet,
  ): Promise<string> {
    const rpcUrl = this.getRpcUrl(network);

    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_gasPrice',
        params: [],
        id: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch gas price: ${response.status}`);
    }

    const result = await response.json();

    if (result.error) {
      throw new Error(
        `RPC error: ${result.error.message || JSON.stringify(result.error)}`,
      );
    }

    return result.result;
  }

  /**
   * Estimate gas for a transaction
   * @param transaction - Transaction parameters
   * @param network - The network
   * @returns Estimated gas limit (as hex string)
   */
  async estimateGas(
    transaction: {
      from: string;
      to: string;
      value?: string;
      data?: string;
      gasPrice?: string;
    },
    network: NetworkName = NetworkName.Mainnet,
  ): Promise<string> {
    const rpcUrl = this.getRpcUrl(network);

    // Build transaction object for estimation
    const txParams: Record<string, string> = {
      from: transaction.from,
      to: transaction.to,
    };

    if (transaction.value) {
      txParams.value = transaction.value;
    }

    if (transaction.data) {
      txParams.data = transaction.data;
    }

    if (transaction.gasPrice) {
      txParams.gasPrice = transaction.gasPrice;
    }

    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_estimateGas',
        params: [txParams],
        id: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to estimate gas: ${response.status}`);
    }

    const result = await response.json();

    if (result.error) {
      throw new Error(
        `RPC error: ${result.error.message || JSON.stringify(result.error)}`,
      );
    }

    return result.result;
  }
}
