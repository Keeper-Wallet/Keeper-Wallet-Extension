import { getDataServiceUrl } from 'config/env';
import { ethers } from 'ethers';

import { NetworkName } from '../../networks/types';
import {
  type Unit0BalanceResponse,
  type Unit0TokenBalance,
} from '../strategies/interfaces/IUnit0Types';

interface TransactionReceipt {
  blockHash: string;
  blockNumber: string;
  contractAddress: string | null;
  cumulativeGasUsed: string;
  from: string;
  gasUsed: string;
  logs: Array<{
    address: string;
    topics: string[];
    data: string;
    blockNumber: string;
    transactionHash: string;
    transactionIndex: string;
    blockHash: string;
    logIndex: string;
    removed: boolean;
  }>;
  logsBloom: string;
  status: string;
  to: string;
  transactionHash: string;
  transactionIndex: string;
  type: string;
}

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

/**
 * Pagination parameters returned by Blockscout API
 */
interface PaginationParams {
  id?: number;
  type?: string;
  value?: string;
  fiat_value?: string | null;
  items_count?: number;
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

const DATA_SERVICE_URL = getDataServiceUrl();

export class Unit0Api {
  // In-flight request caches to prevent duplicate concurrent HTTP calls
  private balanceRequests = new Map<string, Promise<Unit0BalanceResponse>>();
  private tokenBalanceRequests = new Map<
    string,
    Promise<Unit0TokenBalance[]>
  >();

  private getRequestKey(address: string, network: NetworkName): string {
    return `${network}:${address.toLowerCase()}`;
  }
  private getBaseUrl(network: NetworkName): string {
    if (network === NetworkName.Testnet) {
      return 'https://explorer-testnet.unit0.dev/api/v2/addresses/';
    }
    return 'https://explorer.unit0.dev/api/v2/addresses/';
  }

  private getExplorerApiBaseUrl(network: NetworkName): string {
    if (network === NetworkName.Testnet) {
      return 'https://explorer-testnet.unit0.dev/api';
    }

    // Default to mainnet explorer API for all other networks
    return 'https://explorer.unit0.dev/api';
  }

  getRpcUrl(network: NetworkName): string {
    if (network === NetworkName.Testnet) {
      return 'https://rpc-testnet.unit0.dev';
    }
    return 'https://rpc.unit0.dev';
  }

  async fetchBalance(
    address: string,
    network: NetworkName = NetworkName.Mainnet,
  ): Promise<Unit0BalanceResponse> {
    const key = this.getRequestKey(address, network);
    const existingRequest = this.balanceRequests.get(key);
    if (existingRequest) {
      return existingRequest;
    }

    const requestPromise = (async () => {
      const baseUrl = this.getBaseUrl(network);
      const response = await fetch(`${baseUrl}${address}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch unit0 balance: ${response.status}`);
      }

      return (await response.json()) as Unit0BalanceResponse;
    })();

    this.balanceRequests.set(key, requestPromise);

    try {
      return await requestPromise;
    } finally {
      this.balanceRequests.delete(key);
    }
  }

  /**
   * Fetch native balances for multiple addresses using the Blockscout-style explorer API.
   *
   * Uses the `?module=account&action=balancemulti` endpoint described in
   * https://explorer.unit0.dev/api-docs. This endpoint accepts up to 20
   * comma-separated addresses at once and returns an array of results.
   */
  async fetchBalancesMulti(
    addresses: string[],
    network: NetworkName = NetworkName.Mainnet,
  ): Promise<
    Array<{
      address: string;
      balance: string;
      stale?: boolean;
    }>
  > {
    if (addresses.length === 0) {
      return [];
    }

    const baseUrl = this.getExplorerApiBaseUrl(network);
    const url = new URL(baseUrl);

    url.searchParams.set('module', 'account');
    url.searchParams.set('action', 'balancemulti');
    url.searchParams.set('address', addresses.join(','));

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Unit0 multi balances: ${response.status} ${response.statusText}`,
      );
    }

    const json = (await response.json()) as {
      status?: string;
      message?: string;
      result?: Array<{
        account?: string;
        address?: string;
        addressHash?: string;
        balance?: string;
        stale?: boolean;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
      }>;
    };

    if (!Array.isArray(json.result)) {
      throw new Error(
        `Unexpected Unit0 multi-balance response format: ${JSON.stringify(
          json,
        )}`,
      );
    }

    return json.result
      .filter(item => typeof item.balance === 'string')
      .map(item => {
        const addr = (
          item.account ||
          item.address ||
          item.addressHash ||
          ''
        ).toString();

        return {
          address: addr,
          // Blockscout returns balance as string (wei-like integer)
          balance: item.balance as string,
          stale: item.stale,
        };
      });
  }

  async *fetchERC20TokensStream(
    address: string,
    network: NetworkName = NetworkName.Mainnet,
  ): AsyncGenerator<Unit0TokenBalance[]> {
    const baseUrl = this.getBaseUrl(network);
    let nextPageParams: PaginationParams | null = null;

    do {
      let url = `${baseUrl}${address}/tokens?type=ERC-20`;

      if (nextPageParams) {
        if (nextPageParams.id) url += `&id=${nextPageParams.id}`;
        if (nextPageParams.value) url += `&value=${nextPageParams.value}`;
        if (nextPageParams.fiat_value !== undefined)
          url += `&fiat_value=${nextPageParams.fiat_value}`;
        if (nextPageParams.items_count)
          url += `&items_count=${nextPageParams.items_count}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ERC-20 tokens: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data.items)) {
        yield data.items;
      }

      nextPageParams = data.next_page_params;

      if (nextPageParams !== null) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } while (nextPageParams !== null);
  }

  async fetchERC20Tokens(
    address: string,
    network: NetworkName = NetworkName.Mainnet,
  ): Promise<Unit0TokenBalance[]> {
    const baseUrl = this.getBaseUrl(network);
    let allTokens: Unit0TokenBalance[] = [];
    let nextPageParams: PaginationParams | null = null;

    do {
      // Build URL
      let url = `${baseUrl}${address}/tokens?type=ERC-20`;

      if (nextPageParams) {
        // Add all pagination params from next_page_params
        if (nextPageParams.id) url += `&id=${nextPageParams.id}`;
        if (nextPageParams.value) url += `&value=${nextPageParams.value}`;
        if (nextPageParams.fiat_value !== undefined)
          url += `&fiat_value=${nextPageParams.fiat_value}`;
        if (nextPageParams.items_count)
          url += `&items_count=${nextPageParams.items_count}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ERC-20 tokens: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data.items)) {
        allTokens = allTokens.concat(data.items);
      }

      nextPageParams = data.next_page_params;

      if (nextPageParams !== null) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } while (nextPageParams !== null);

    return allTokens;
  }

  async *fetchERC721TokensStream(
    address: string,
    network: NetworkName = NetworkName.Mainnet,
  ): AsyncGenerator<Unit0TokenBalance[]> {
    const baseUrl = this.getBaseUrl(network);
    let nextPageParams: PaginationParams | null = null;

    do {
      // Build URL
      let url = `${baseUrl}${address}/tokens?type=ERC-721`;

      if (nextPageParams) {
        if (nextPageParams.id) url += `&id=${nextPageParams.id}`;
        if (nextPageParams.value) url += `&value=${nextPageParams.value}`;
        if (nextPageParams.fiat_value !== undefined)
          url += `&fiat_value=${nextPageParams.fiat_value}`;
        if (nextPageParams.items_count)
          url += `&items_count=${nextPageParams.items_count}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ERC-721 tokens: ${response.status}`);
      }

      const data = await response.json();

      // Yield current page immediately
      if (Array.isArray(data.items)) {
        yield data.items;
      }

      nextPageParams = data.next_page_params;

      if (nextPageParams !== null) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } while (nextPageParams !== null);
  }

  async fetchERC721Tokens(
    address: string,
    network: NetworkName = NetworkName.Mainnet,
  ): Promise<Unit0TokenBalance[]> {
    const baseUrl = this.getBaseUrl(network);
    let allTokens: Unit0TokenBalance[] = [];
    let nextPageParams: PaginationParams | null = null;

    do {
      // Build URL
      let url = `${baseUrl}${address}/tokens?type=ERC-721`;

      if (nextPageParams) {
        // Add all pagination params from next_page_params
        if (nextPageParams.id) url += `&id=${nextPageParams.id}`;
        if (nextPageParams.value) url += `&value=${nextPageParams.value}`;
        if (nextPageParams.fiat_value !== undefined)
          url += `&fiat_value=${nextPageParams.fiat_value}`;
        if (nextPageParams.items_count)
          url += `&items_count=${nextPageParams.items_count}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ERC-721 tokens: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data.items)) {
        allTokens = allTokens.concat(data.items);
      }

      nextPageParams = data.next_page_params;

      if (nextPageParams !== null) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } while (nextPageParams !== null);

    return allTokens;
  }

  async *fetchERC1155TokensStream(
    address: string,
    network: NetworkName = NetworkName.Mainnet,
  ): AsyncGenerator<Unit0TokenBalance[]> {
    const baseUrl = this.getBaseUrl(network);
    let nextPageParams: PaginationParams | null = null;

    do {
      // Build URL
      let url = `${baseUrl}${address}/tokens?type=ERC-1155`;

      if (nextPageParams) {
        if (nextPageParams.id) url += `&id=${nextPageParams.id}`;
        if (nextPageParams.value) url += `&value=${nextPageParams.value}`;
        if (nextPageParams.fiat_value !== undefined)
          url += `&fiat_value=${nextPageParams.fiat_value}`;
        if (nextPageParams.items_count)
          url += `&items_count=${nextPageParams.items_count}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ERC-1155 tokens: ${response.status}`);
      }

      const data = await response.json();

      // Yield current page immediately
      if (Array.isArray(data.items)) {
        yield data.items;
      }

      nextPageParams = data.next_page_params;

      if (nextPageParams !== null) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } while (nextPageParams !== null);
  }

  async fetchERC1155Tokens(
    address: string,
    network: NetworkName = NetworkName.Mainnet,
  ): Promise<Unit0TokenBalance[]> {
    const baseUrl = this.getBaseUrl(network);
    let allTokens: Unit0TokenBalance[] = [];
    let nextPageParams: PaginationParams | null = null;

    do {
      // Build URL
      let url = `${baseUrl}${address}/tokens?type=ERC-1155`;

      if (nextPageParams) {
        // Add all pagination params from next_page_params
        if (nextPageParams.id) url += `&id=${nextPageParams.id}`;
        if (nextPageParams.value) url += `&value=${nextPageParams.value}`;
        if (nextPageParams.fiat_value !== undefined)
          url += `&fiat_value=${nextPageParams.fiat_value}`;
        if (nextPageParams.items_count)
          url += `&items_count=${nextPageParams.items_count}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ERC-1155 tokens: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data.items)) {
        allTokens = allTokens.concat(data.items);
      }

      nextPageParams = data.next_page_params;
      if (nextPageParams !== null) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } while (nextPageParams !== null);

    return allTokens;
  }

  async fetchTokenBalances(
    address: string,
    network: NetworkName = NetworkName.Mainnet,
  ): Promise<Unit0TokenBalance[]> {
    const key = this.getRequestKey(address, network);
    const existingRequest = this.tokenBalanceRequests.get(key);
    if (existingRequest) {
      return existingRequest;
    }

    const requestPromise = (async () => {
      // Fetch all token types and combine them
      const [erc20Tokens, erc721Tokens, erc1155Tokens] = await Promise.all([
        this.fetchERC20Tokens(address, network),
        this.fetchERC721Tokens(address, network),
        this.fetchERC1155Tokens(address, network),
      ]);

      return [
        ...erc20Tokens,
        ...erc721Tokens,
        ...erc1155Tokens,
      ] as Unit0TokenBalance[];
    })();

    this.tokenBalanceRequests.set(key, requestPromise);

    try {
      return await requestPromise;
    } finally {
      this.tokenBalanceRequests.delete(key);
    }
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
  ): Promise<TransactionReceipt | null> {
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
