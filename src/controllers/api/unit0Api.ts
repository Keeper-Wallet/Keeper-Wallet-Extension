import { ethers } from 'ethers';

import { NetworkName } from '../../networks/types';
import {
  type Unit0BalanceResponse,
  type Unit0TokenBalance,
  type Unit0TokenDetailsResponse,
  type Unit0TokenMetadata,
} from '../strategies/interfaces/IUnit0Types';

// ERC-721 ABI fragment for safeTransferFrom
const ERC721_ABI = [
  'function safeTransferFrom(address from, address to, uint256 tokenId)',
];

// ERC-1155 ABI fragment for safeTransferFrom
const ERC1155_ABI = [
  'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)',
];

export interface NftTransferParams {
  /** NFT contract address */
  contractAddress: string;
  /** Sender's address */
  from: string;
  /** Recipient's address */
  to: string;
  /** Token ID to transfer */
  tokenId: string;
  /** Amount to transfer (only for ERC-1155, defaults to 1) */
  amount?: string;
  /** Token type: 'ERC-721' or 'ERC-1155' */
  tokenType: 'ERC-721' | 'ERC-1155';
}

export interface NftTransactionData {
  /** Transaction data (encoded function call) */
  data: string;
  /** Destination address (NFT contract) */
  to: string;
  /** Value in wei (always '0x0' for NFT transfers) */
  value: string;
  /** Sender address */
  from: string;
  /** Estimated gas limit */
  gasLimit?: string;
  /** Gas price */
  gasPrice?: string;
  /** Nonce */
  nonce?: number;
}

/**
 * Unit0 token price data from the price API
 */
export interface Unit0PriceData {
  /** Token price in USD */
  price_usd: number;
  /** Token symbol */
  symbol: string;
  /** Unix timestamp of last price update */
  last_update: number;
  /** Token decimal places (optional, may not be present for native tokens) */
  decimals?: number;
}

/**
 * Map of token addresses to their price data
 * Keys are lowercase token addresses
 */
export type Unit0PricesMap = Record<string, Unit0PriceData>;

// const DATA_SERVICE_URL = 'https://api.keeper-wallet.app';
const DATA_SERVICE_URL = 'http://127.0.0.1:8000';

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

  /**
   * Build NFT transfer transaction data
   * @param params - NFT transfer parameters
   * @returns Encoded transaction data for NFT transfer
   */
  buildNftTransferData(params: NftTransferParams): string {
    const { from, to, tokenId, amount, tokenType } = params;

    if (tokenType === 'ERC-721') {
      // ERC-721: safeTransferFrom(address from, address to, uint256 tokenId)
      const iface = new ethers.Interface(ERC721_ABI);
      return iface.encodeFunctionData('safeTransferFrom', [from, to, tokenId]);
    } else if (tokenType === 'ERC-1155') {
      // ERC-1155: safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)
      const iface = new ethers.Interface(ERC1155_ABI);
      const transferAmount = amount || '1';
      // Empty bytes data (0x) - no additional data needed for simple transfers
      return iface.encodeFunctionData('safeTransferFrom', [
        from,
        to,
        tokenId,
        transferAmount,
        '0x',
      ]);
    } else {
      throw new Error(`Unsupported token type: ${tokenType}`);
    }
  }

  /**
   * Build complete NFT transfer transaction with gas estimation
   * @param params - NFT transfer parameters
   * @param network - The network
   * @returns Transaction data ready for signing
   */
  async buildNftTransferTransaction(
    params: NftTransferParams,
    network: NetworkName = NetworkName.Mainnet,
  ): Promise<NftTransactionData> {
    const { contractAddress, from, to, tokenId, tokenType, amount } = params;

    // Validate addresses
    if (!ethers.isAddress(from)) {
      throw new Error(`Invalid sender address: ${from}`);
    }
    if (!ethers.isAddress(to)) {
      throw new Error(`Invalid recipient address: ${to}`);
    }
    if (!ethers.isAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`);
    }

    // Validate token ID
    try {
      BigInt(tokenId);
    } catch {
      throw new Error(`Invalid token ID: ${tokenId}`);
    }

    // Validate amount for ERC-1155
    if (tokenType === 'ERC-1155' && amount) {
      try {
        const amountBigInt = BigInt(amount);
        if (amountBigInt <= 0n) {
          throw new Error('Amount must be greater than 0');
        }
      } catch {
        throw new Error(`Invalid amount: ${amount}`);
      }
    }

    // Build transaction data
    const data = this.buildNftTransferData(params);

    // Get current nonce
    const nonce = await this.getTransactionCount(from, network);

    // Get current gas price
    const gasPrice = await this.getGasPrice(network);

    // Estimate gas
    const estimatedGas = await this.estimateGas(
      {
        from,
        to: contractAddress,
        value: '0x0',
        data,
        gasPrice,
      },
      network,
    );

    // Add 20% buffer to gas estimate for safety
    const gasLimit = `0x${Math.floor(parseInt(estimatedGas, 16) * 1.2).toString(
      16,
    )}`;

    return {
      data,
      to: contractAddress,
      value: '0x0',
      from,
      gasLimit,
      gasPrice,
      nonce,
    };
  }

  /**
   * Estimate gas for NFT transfer
   * @param params - NFT transfer parameters
   * @param network - The network
   * @returns Estimated gas limit with 20% buffer
   */
  async estimateNftTransferGas(
    params: NftTransferParams,
    network: NetworkName = NetworkName.Mainnet,
  ): Promise<{ gasLimit: string; gasPrice: string; totalCost: string }> {
    const { contractAddress, from } = params;

    const data = this.buildNftTransferData(params);
    const gasPrice = await this.getGasPrice(network);

    const estimatedGas = await this.estimateGas(
      {
        from,
        to: contractAddress,
        value: '0x0',
        data,
        gasPrice,
      },
      network,
    );

    // Add 20% buffer
    const gasLimitWithBuffer = Math.floor(parseInt(estimatedGas, 16) * 1.2);
    const gasLimit = `0x${gasLimitWithBuffer.toString(16)}`;

    // Calculate total cost in wei
    const totalCostWei =
      BigInt(gasLimitWithBuffer) * BigInt(parseInt(gasPrice, 16));
    const totalCost = `0x${totalCostWei.toString(16)}`;

    return {
      gasLimit,
      gasPrice,
      totalCost,
    };
  }

  /**
   * Fetch prices for multiple token IDs
   * @param ids - Array of token IDs ("UNIT0" for native, contract addresses for ERC-20)
   * @returns Map of IDs to price data (only includes tokens with available prices)
   */
  async fetchPricesByIds(ids: string[]): Promise<Unit0PricesMap> {
    if (ids.length === 0) {
      return {};
    }

    const response = await fetch(
      new URL('/api/v1/unit0/rates', DATA_SERVICE_URL),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Unit0 prices: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }
}
