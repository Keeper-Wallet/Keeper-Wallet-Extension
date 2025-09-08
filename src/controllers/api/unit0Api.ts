import { NetworkName } from '../../networks/types';
import { type TransactionFromNode, TRANSACTION_TYPE } from '@waves/ts-types';

export interface Unit0BalanceResponse {
  coin_balance: string;
  exchange_rate?: string;
}

export interface Unit0TokenBalance {
  token_id: string;
  balance: string;
  token?: {
    address: string;
    name?: string;
    symbol?: string;
    decimals?: number;
  };
  value?: string;
}

export interface Unit0Transaction {
  hash: string;
  block_number: number;
  timestamp: string;
  from: {
    hash: string;
    name?: string | null;
    is_contract: boolean;
  };
  to: {
    hash: string;
    name?: string | null;
    is_contract: boolean;
  };
  value: string;
  gas_used: string;
  gas_limit: string;
  gas_price: string;
  fee: {
    type: string;
    value: string;
  };
  status: string;
  type: number;
  nonce: number;
  method?: string | null;
  transaction_types?: string[];
}

export interface Unit0TokenInstance {
  animation_url: string | null;
  external_app_url: string | null;
  id: string;
  image_url: string | null;
  is_unique: boolean | null;
  media_type: string | null;
  media_url: string | null;
  metadata: any | null;
  owner: any | null;
  thumbnails: any | null;
  token: {
    address: string;
    address_hash: string;
    circulating_market_cap: string | null;
    decimals: number | null;
    exchange_rate: string | null;
    holders: string;
    holders_count: string;
    icon_url: string | null;
    name: string;
    symbol: string;
    total_supply: string | null;
    type: string;
    volume_24h: string | null;
  };
}

export interface Unit0NftMetadata {
  name?: string;
  description?: string;
  image?: string;
  animation_url?: string;
  external_url?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  author?: string;
  creator?: string;
  rank?: number;
  rarity_rank?: number;
}

export interface Unit0NftTransfer {
  block_hash: string;
  block_number: number;
  from: {
    hash: string;
    name: string | null;
  };
  to: {
    hash: string;
    name: string | null;
  };
  log_index: number;
  method: string;
  timestamp: string;
  token: {
    address: string;
    address_hash: string;
    name: string;
    symbol: string;
    type: string;
  };
  total: {
    token_id: string;
    token_instance: Unit0TokenInstance;
  };
  transaction_hash: string;
  type: string;
}

export interface Unit0NftResponse {
  items: Unit0NftTransfer[];
  next_page_params: any | null;
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
    const mockAddress =
      network === NetworkName.Testnet
        ? '0xE860EA6CF834Ca574A364e6B1Dc10A27102CaF84'
        : '0xCaf68F88a7262A66dAf6c361d1824bf8A3E4b5DD';
    const response = await fetch(`${baseUrl}${mockAddress}`);

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
    const mockAddress =
      network === NetworkName.Testnet
        ? '0xE860EA6CF834Ca574A364e6B1Dc10A27102CaF84'
        : '0xCaf68F88a7262A66dAf6c361d1824bf8A3E4b5DD';

    const response = await fetch(`${baseUrl}${mockAddress}/tokens?type=ERC-20`);

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
    const mockAddress =
      network === NetworkName.Testnet
        ? '0xE860EA6CF834Ca574A364e6B1Dc10A27102CaF84'
        : '0xCaf68F88a7262A66dAf6c361d1824bf8A3E4b5DD';

    const response = await fetch(
      `${baseUrl}${mockAddress}/tokens?type=ERC-721`,
    );

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
    const mockAddress =
      network === NetworkName.Testnet
        ? '0xE860EA6CF834Ca574A364e6B1Dc10A27102CaF84'
        : '0xCaf68F88a7262A66dAf6c361d1824bf8A3E4b5DD';

    const response = await fetch(
      `${baseUrl}${mockAddress}/tokens?type=ERC-1155`,
    );

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

  async fetchTransactionHistory(
    address: string,
    network: NetworkName = NetworkName.Mainnet,
    limit: number = 100,
  ): Promise<Unit0Transaction[]> {
    const baseUrl = this.getBaseUrl(network);
    const mockAddress =
      network === NetworkName.Testnet
        ? '0xE860EA6CF834Ca574A364e6B1Dc10A27102CaF84'
        : '0xCaf68F88a7262A66dAf6c361d1824bf8A3E4b5DD';

    const response = await fetch(
      `${baseUrl}${mockAddress}/token-transfers?type=&limit=${limit}`,
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch unit0 transaction history: ${response.status}`,
      );
    }

    const data = await response.json();
    return Array.isArray(data.items) ? data.items : [];
  }

  async fetchNfts(
    address: string,
    network: NetworkName = NetworkName.Mainnet,
  ): Promise<Unit0NftTransfer[]> {
    const baseUrl = this.getBaseUrl(network);
    const mockAddress =
      network === NetworkName.Testnet
        ? '0xE860EA6CF834Ca574A364e6B1Dc10A27102CaF84'
        : '0xCaf68F88a7262A66dAf6c361d1824bf8A3E4b5DD';

    const response = await fetch(
      `${baseUrl}${mockAddress}/token-transfers?type=ERC-721`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch unit0 NFTs: ${response.status}`);
    }

    const data: Unit0NftResponse = await response.json();
    return Array.isArray(data.items) ? data.items : [];
  }

  async fetchNftMetadata(
    contractAddress: string,
    tokenId: string,
    network: NetworkName = NetworkName.Mainnet,
  ): Promise<Unit0TokenInstance | null> {
    const baseUrl = this.getBaseUrl(network);
    const url = `${baseUrl.replace(
      '/addresses/',
      '/tokens/',
    )}${contractAddress}/instances/${tokenId}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        return null;
      }

      return response.json();
    } catch (error) {
      console.warn(
        `Failed to fetch NFT metadata for ${contractAddress}:${tokenId}`,
        error,
      );
      return null;
    }
  }

  async fetchNftInventory(
    contractAddress: string,
    holderAddress: string,
    network: NetworkName,
  ) {
    const baseUrl = this.getBaseUrl(network);

    // Use mocked addresses for consistent testing
    const mockAddress =
      network === NetworkName.Testnet
        ? '0xE860EA6CF834Ca574A364e6B1Dc10A27102CaF84'
        : '0xCaf68F88a7262A66dAf6c361d1824bf8A3E4b5DD';

    // Use the nft/collections endpoint to get inventory data
    const url = `${baseUrl}${mockAddress}/nft/collections?type=`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching NFT inventory:', error);
      throw error;
    }
  }

  async fetchContractInfo(contractAddress: string, network: NetworkName) {
    const baseUrl = this.getBaseUrl(network);
    const url = `${baseUrl}${contractAddress}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching contract info:', error);
      throw error;
    }
  }

  // Convert Unit0 transaction to Waves-compatible format for history display
  convertToWavesTransaction(
    unit0Tx: Unit0NftTransfer,
    address: string,
  ): TransactionFromNode {
    const timestamp = new Date(unit0Tx.timestamp).getTime();

    const sender =
      unit0Tx.from?.hash || '0x0000000000000000000000000000000000000000';
    const recipient =
      unit0Tx.to?.hash || '0x0000000000000000000000000000000000000000';

    // Determine transaction direction for better UI handling
    const isSender = sender.toLowerCase() === address.toLowerCase();
    const isRecipient = recipient.toLowerCase() === address.toLowerCase();

    let direction: string;
    if (isRecipient && !isSender) {
      direction = 'incoming';
    } else if (isSender && !isRecipient) {
      direction = 'outgoing';
    } else if (isSender && isRecipient) {
      direction = 'self';
    } else {
      // Fallback case - shouldn't normally happen
      direction = 'outgoing';
    }

    return {
      id: unit0Tx.transaction_hash,
      type: TRANSACTION_TYPE.ETHEREUM,
      timestamp,
      height: unit0Tx.block_number,
      sender,
      fee: '0', // Token transfers don't have direct fee info in this API
      payload: {
        type: 'transfer',
        amount: unit0Tx.total.value || '0',
        asset: unit0Tx.token.address, // Use token contract address as asset ID
        to: recipient,
        direction,
        tokenSymbol: unit0Tx.token.symbol,
        tokenName: unit0Tx.token.name,
        tokenDecimals: unit0Tx.token.decimals,
        fromName: unit0Tx.from?.name,
        toName: unit0Tx.to?.name,
      },
    } as TransactionFromNode;
  }
}
