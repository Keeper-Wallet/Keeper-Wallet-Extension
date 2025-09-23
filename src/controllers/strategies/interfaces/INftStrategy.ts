import { type NetworkName } from 'networks/types';

import { type Unit0NftAsset } from './IUnit0Types';

export interface NftData {
  id: string;
  assetId: string;
  name: string;
  displayName: string;
  displayCreator: string;
  creator: string;
  description: string;
  quantity: string;
  decimals: number;
  reissuable: boolean;
  issuer: string;
  issuerPublicKey: string;
  scripted: boolean;
  minSponsoredAssetFee: null;
  originTransactionId: string;
  issueHeight: number;
  issueTimestamp: number;
  height: number;
  precision: number;
  sender: string;
  timestamp: Date;
  collectionAddress: string;
  tokenId: string;
  tokenType: 'ERC-20' | 'ERC-721' | 'ERC-1155' | undefined;
  rank: number;
  rarity_rank: number;
  image?: string;
  logo?: string;
  icon?: string;
  total_supply?: string;
  external_url?: string;
  background_color?: string;
}
export interface IToken {
  address_hash?: string;
  address?: string;
  circulating_market_cap: number;
  decimals: number;
  exchange_rate: string;
  holders_count: string;
  icon_url: string;
  name: string;
  symbol: string;
  total_supply: number;
  type: string;
  volume_24h: string;
}

export interface INftToken {
  token: IToken;
  token_id: string;
  token_instance: string;
  value: string;
}

export interface NftProcessResult {
  nftData: NftData[];
  assetsToStore: Unit0NftAsset[];
}

export interface INftInventory {
  items: Array<{
    token_instances: Array<{
      animation_url: string | null;
      external_app_url: string | null;
      id: string;
      image_url: string | null;
      is_unique: boolean | null;
      media_type: string | null;
      media_url: string | null;
      metadata: string | null; // TODO: need to check with real data
      owner: string | null;
      thumbnails: string[] | null;
      token: string;
      token_type: string;
      value: string;
    }>;
    token: IToken;
  }>;
}

export interface INftStrategy {
  /**
   * Process NFT tokens and return structured NFT data
   * @param nftTokens - Array of raw NFT token data
   * @param walletAddress - User's wallet address
   * @param network - Network name
   * @returns Promise with processed NFT data and assets to store
   */
  processNfts(
    nftTokens: INftToken[],
    walletAddress: string,
    network: NetworkName,
  ): Promise<NftProcessResult>;

  /**
   * Get the blockchain type this NFT strategy handles
   */
  getBlockchainType(): string;

  /**
   * Check if this strategy can handle the given blockchain type
   */
  canHandle(blockchainType: string): boolean;
}
