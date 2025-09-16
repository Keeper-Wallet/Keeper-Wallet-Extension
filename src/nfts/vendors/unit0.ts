import { NetworkName } from '../../networks/types';
import { Unit0Api } from '../../controllers/api/unit0Api';
import { type Unit0NftTransfer } from '../../controllers/strategies/interfaces/IUnit0Types';
import {
  type CreateParams,
  type FetchInfoParams,
  type Nft,
  type NftAssetDetail,
  type NftVendor,
  NftVendorId,
} from '../types';

export interface Unit0NftInfo {
  id: string;
  name: string;
  symbol: string;
  contractAddress: string;
  tokenId: string;
  imageUrl?: string;
  animationUrl?: string;
  mediaUrl?: string;
  mediaType?: string;
  vendor: NftVendorId.Unit0;
  metadata?: any;
  // Enhanced metadata fields
  author?: string;
  creator?: string;
  rank?: number;
  rarity_rank?: number;
  attributes?: Array<{ trait_type: string; value: string | number }>;
  external_url?: string;
}

export class Unit0NftVendor implements NftVendor<Unit0NftInfo> {
  readonly id = NftVendorId.Unit0;
  private unit0Api = new Unit0Api();

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

  async fetchInfo(params: FetchInfoParams): Promise<Unit0NftInfo[]> {
    const { nfts } = params;
    const nftInfos: Unit0NftInfo[] = [];

    // Group NFTs by network to minimize API calls
    const nftsByNetwork = nfts.reduce(
      (acc, nft) => {
        // Determine network from asset issuer or other metadata
        const network = this.determineNetwork(nft);
        if (!acc[network]) {
          acc[network] = [];
        }
        acc[network].push(nft);
        return acc;
      },
      {} as Record<NetworkName, NftAssetDetail[]>,
    );

    // Fetch NFT data for each network
    for (const [network, networkNfts] of Object.entries(nftsByNetwork)) {
      try {
        // For Unit0, we need to fetch NFT transfers to get owned tokens
        const transfers = await this.unit0Api.fetchNfts(
          '',
          network as NetworkName,
        );

        for (const nft of networkNfts) {
          const nftInfo = await this.createNftInfo(
            nft,
            transfers,
            network as NetworkName,
          );
          if (nftInfo) {
            nftInfos.push(nftInfo);
          }
        }
      } catch (error) {
        console.warn(
          `Failed to fetch Unit0 NFTs for network ${network}:`,
          error,
        );
      }
    }

    return nftInfos;
  }

  create(params: CreateParams<Unit0NftInfo>): Nft {
    const { asset, info, networkCode } = params;
    // Try to get creator from info object (which should contain contract address)
    const creator =
      (info as any)?.creator_address_hash ||
      (info as any)?.creator ||
      (asset as any).creator ||
      asset.issuer;

    return {
      id: asset.id,
      assetId: info.assetId,
      name: asset.description,
      tokenId: info.tokenId,
      displayName: asset.displayName || info?.name,
      description: asset.description,
      creator: creator,
      displayCreator: `${info?.name} (${asset?.displayCreator})`,
      creatorUrl: creator
        ? networkCode === '88817'
          ? `https://explorer-testnet.unit0.dev/address/${creator}`
          : `https://explorer.unit0.dev/address/${creator}`
        : undefined,
      foreground: info?.imageUrl || info?.mediaUrl,
      background:
        info?.mediaType === 'video' ? { backgroundColor: '#000' } : undefined,
      tokenType: (asset as any).tokenType,
      vendor: NftVendorId.Unit0,
      marketplaceUrl: this.getMarketplaceUrl(
        info.assetId,
        info.tokenId,
        networkCode,
      ),
    };
  }

  private determineNetwork(nft: NftAssetDetail): NetworkName {
    // For now, assume mainnet. In a real implementation, you might
    // determine this from the asset metadata or other context
    return NetworkName.Mainnet;
  }

  private async createNftInfo(
    nft: NftAssetDetail,
    transfers: Unit0NftTransfer[],
    network: NetworkName,
  ): Promise<Unit0NftInfo | null> {
    try {
      // Find relevant transfer for this NFT
      const transfer = transfers.find(
        t => t.token.address.toLowerCase() === nft.assetId.toLowerCase(),
      );

      if (!transfer) {
        return null;
      }

      const tokenInstance = transfer.total.token_instance;

      // Fetch additional metadata if needed
      let metadata = null;
      if (!tokenInstance.metadata) {
        try {
          metadata = await this.unit0Api.fetchNftMetadata(
            transfer.token.address,
            transfer.total.token_id,
            network,
          );
        } catch (error) {
          console.warn('Failed to fetch additional NFT metadata:', error);
        }
      }

      return {
        id: transfer.token.address,
        name: transfer.token.name,
        symbol: transfer.token.symbol,
        contractAddress: transfer.token.address,
        tokenId: transfer.total.token_id,
        imageUrl: tokenInstance.image_url || metadata?.image_url || undefined,
        animationUrl:
          tokenInstance.animation_url || metadata?.animation_url || undefined,
        mediaUrl: tokenInstance.media_url || metadata?.media_url || undefined,
        mediaType:
          tokenInstance.media_type || metadata?.media_type || undefined,
        vendor: NftVendorId.Unit0,
        metadata: tokenInstance.metadata || metadata?.metadata,
        // Enhanced metadata fields from nested metadata objects
        author:
          (tokenInstance.metadata as any)?.author ||
          (metadata?.metadata as any)?.author,
        creator:
          (tokenInstance.metadata as any)?.creator ||
          (metadata?.metadata as any)?.creator,
        rank:
          (tokenInstance.metadata as any)?.rank ||
          (metadata?.metadata as any)?.rank ||
          parseInt(transfer.total.token_id),
        rarity_rank:
          (tokenInstance.metadata as any)?.rarity_rank ||
          (metadata?.metadata as any)?.rarity_rank ||
          parseInt(transfer.total.token_id),
        attributes:
          (tokenInstance.metadata as any)?.attributes ||
          (metadata?.metadata as any)?.attributes,
        external_url:
          tokenInstance.external_app_url ||
          (metadata?.metadata as any)?.external_url,
      };
    } catch (error) {
      console.warn('Failed to create Unit0 NFT info:', error);
      return null;
    }
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
