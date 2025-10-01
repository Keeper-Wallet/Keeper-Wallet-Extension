import { type Unit0Transfer } from 'balances/types';
import {
  type Unit0BalanceResponse,
  type Unit0NftResponse,
  type Unit0NftTransfer,
  type Unit0TokenBalance,
  type Unit0TokenDetailsResponse,
  type Unit0TokenInstance,
  type Unit0TokenMetadata,
} from '../strategies/interfaces/IUnit0Types';

import { NetworkName } from '../../networks/types';

export class Unit0Api {
  private getBaseUrl(network: NetworkName): string {
    if (network === NetworkName.Testnet || network === NetworkName.Stagenet) {
      return 'https://explorer-testnet.unit0.dev/api/v2/addresses/';
    }
    return 'https://explorer.unit0.dev/api/v2/addresses/';
  }

  private getTokenBaseUrl(network: NetworkName): string {
    if (network === NetworkName.Testnet || network === NetworkName.Stagenet) {
      return 'https://explorer-testnet.unit0.dev/api/v2/tokens/';
    }
    return 'https://explorer.unit0.dev/api/v2/addresses/';
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

    const response = await fetch(
      `${baseUrl}${address}/tokens?type=ERC-721`,
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

    const response = await fetch(
      `${baseUrl}${address}/tokens?type=ERC-1155`,
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


  async fetchNfts(
    address: string,
    network: NetworkName = NetworkName.Mainnet,
  ): Promise<Unit0NftTransfer[]> {
    const baseUrl = this.getBaseUrl(network);

    const response = await fetch(
      `${baseUrl}${address}/token-transfers?type=ERC-721`,
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
      return null;
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

  convertUnit0ToTransaction(
    unit0Tx: Unit0NftTransfer,
    address: string,
  ): Unit0Transfer {
    const sender = unit0Tx.from?.hash;
    const recipient = unit0Tx.to?.hash;

    const isIncoming = recipient === address;
    const isOutgoing = sender === address;

    const timestamp = new Date(unit0Tx.timestamp).getTime();

    const assetId =
      unit0Tx.token.hash ?? unit0Tx.token.address_hash ?? unit0Tx.token.address;
    return {
      id: unit0Tx.transaction_hash,
      sender,
      type: 18 as any,
      fee: '0', // TODO: we need to do another request for getting fee of transaction
      payload: {
        type: 'transfer' as const,
        height: unit0Tx.block_number,
        timestamp,
        sender,
        recipient,
        amount: unit0Tx.total.value || '0',
        asset: assetId, // Use token contract address as asset ID
        tokenSymbol: unit0Tx.token.symbol,
        tokenName: unit0Tx.token.name,
        tokenDecimals: unit0Tx.token.decimals,
        fromName: unit0Tx.from?.name,
        toName: unit0Tx.to?.name,
        isIncoming,
        isOutgoing,
      },
    };
  }
}
