import {
  type CreateParams,
  type Nft,
  type NftAssetDetail,
  type NftVendor,
  NftVendorId,
} from '../types';

interface Unit0NftMetadata {
  name?: string;
  description?: string;
  image?: string;
  animation_url?: string;
  external_url?: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
  background_color?: string;
  youtube_url?: string;
  [key: string]: unknown;
}

export interface Unit0NftInfo {
  id: string;
  name: string;
  symbol: string;
  contractAddress: string;
  tokenId: string;
  assetId: string;
  imageUrl?: string;
  animationUrl?: string;
  mediaUrl?: string;
  mediaType?: string;
  vendor: NftVendorId.Unit0;
  metadata?: Unit0NftMetadata;
  // Enhanced metadata fields
  author?: string;
  creator?: string;
  creator_address_hash?: string;
  rank?: number;
  rarity_rank?: number;
  attributes?: Array<{ trait_type: string; value: string | number }>;
  external_url?: string;
  tokenType?: string;
}

export class Unit0NftVendor implements NftVendor<Unit0NftInfo> {
  readonly id = NftVendorId.Unit0;

  is(nft: NftAssetDetail): boolean {
    // Unit0 NFTs are identified by contract address format (0x...)
    // and should be ERC-721 tokens
    return (
      nft.assetId.startsWith('0x') &&
      nft.quantity === '1' &&
      !nft.reissuable &&
      nft.decimals === 0
    );
  }

  create(params: CreateParams<Unit0NftInfo>): Nft {
    const { asset, info, networkCode } = params;
    // Try to get creator from info object (which should contain contract address)
    const creator =
      info?.creator_address_hash ||
      info?.creator ||
      asset.creator ||
      asset.issuer;

    return {
      id: asset.id,
      assetId: info.assetId,
      name: asset.description,
      tokenId: info.tokenId,
      displayName: asset.displayName || info?.name,
      description: asset.description,
      creator,
      displayCreator: `${info?.name} (${asset?.displayCreator})`,
      creatorUrl: creator
        ? networkCode === '88817'
          ? `https://explorer-testnet.unit0.dev/address/${creator}`
          : `https://explorer.unit0.dev/address/${creator}`
        : undefined,
      foreground: info?.imageUrl || info?.mediaUrl,
      background:
        info?.mediaType === 'video' ? { backgroundColor: '#000' } : undefined,
      tokenType: asset.tokenType,
      vendor: NftVendorId.Unit0,
      marketplaceUrl: this.getMarketplaceUrl(
        info.assetId,
        info.tokenId,
        networkCode,
      ),
    };
  }

  private getMarketplaceUrl(
    contractAddress?: string,
    tokenId?: string,
    networkCode?: string,
  ): string | undefined {
    if (!contractAddress || !tokenId) {
      return undefined;
    }

    // Unit0 explorer URL format
    const baseUrl =
      networkCode === '88817'
        ? 'https://explorer-testnet.unit0.dev'
        : 'https://explorer.unit0.dev';
    return `${baseUrl}/token/${contractAddress}/instance/${tokenId}`;
  }
}
