import { Unit0Api } from 'controllers/api/unit0Api';
import { type NetworkName } from 'networks/types';
import { NftVendorId } from 'nfts/types';

import {
  type INftInventory,
  type INftStrategy,
  type INftToken,
  type NftData,
  type NftProcessResult,
} from '../../interfaces/INftStrategy';

/**
 * Unit0 NFT Strategy Implementation
 * Handles NFT processing for Unit0 blockchain (ERC-721 and ERC-1155)
 */
export class Unit0NftStrategy implements INftStrategy {
  private unit0Api: Unit0Api;

  constructor() {
    this.unit0Api = new Unit0Api();
  }

  async processNfts(
    nftTokens: INftToken[],
    walletAddress: string,
    network: NetworkName,
  ): Promise<NftProcessResult> {
    // Convert ERC-721 and ERC-1155 tokens to NFT format with enhanced metadata
    // Use collections endpoint for each NFT contract to get comprehensive data with amounts and token instances
    const nftData = await Promise.all(
      nftTokens.map(async tokenData => {
        if (!tokenData || !tokenData.token) {
          return null;
        }

        const token = tokenData.token;
        const address = token.address_hash ?? token.address;

        let collectionData;
        const contractInfo = await this.unit0Api.fetchContractInfo(
          address as string,
          network,
        );

        const collectionsResponse: INftInventory =
          await this.unit0Api.fetchNftInventory(
            address as string, // Use the NFT contract address
            walletAddress, // User wallet address
            network,
          );

        if (
          collectionsResponse?.items &&
          collectionsResponse.items.length > 0
        ) {
          collectionData = collectionsResponse.items.find(
            item =>
              item.token?.address_hash?.toLowerCase() ===
              address?.toLowerCase(),
          );
        }

        return collectionData?.token_instances.map(tokenInstance => {
          const creatorValue = contractInfo?.creator_address_hash || address;
          return {
            id: address,
            assetId: address,
            name: token.name || 'Unknown NFT',
            displayName: `${token.name || 'Unknown NFT'} ID #${
              tokenInstance.id
            }`,
            displayCreator: token.symbol || token.name || 'Unknown NFT',
            creator: creatorValue,
            description: `${token.name || 'Unknown NFT'} #${
              tokenInstance.id
            } (${token.symbol || 'NFT'})`,
            quantity: tokenInstance.value || '1',
            decimals: 0,
            reissuable: false,
            issuer: address,
            issuerPublicKey: '',
            scripted: false,
            minSponsoredAssetFee: null,
            originTransactionId: '',
            issueHeight: 0,
            issueTimestamp: Date.now(),
            height: 0,
            precision: 0,
            sender: address,
            timestamp: new Date(),
            // Add individual token data
            collectionAddress: address,
            tokenId: tokenInstance.id,
            tokenType: token.type,
            rank: tokenInstance.id || 1,
            rarity_rank: tokenInstance.id || 1,
            metadata: tokenInstance.metadata,
            image: tokenInstance?.image_url ?? tokenInstance?.animation_url,
            total_supply: token.total_supply,
            external_url: tokenInstance?.external_app_url,
            vendor: NftVendorId.Unit0,
          };
        });
      }),
    );

    const validNftData = nftData
      .flat()
      .filter(nft => nft !== null) as unknown as NftData[];

    // Convert NFT objects to AssetDetail format with creator field preserved
    const nftAssets = validNftData.map(nft => ({
      ...nft,
      // Ensure AssetDetail compatibility
      quantity: nft.quantity,
      tokenId: nft.rank,
      precision: nft.precision || 0,
      reissuable: nft.reissuable || false,
      height: nft.height || 0,
      timestamp: nft.timestamp || new Date(),
      issuer: nft.issuer || nft.id,
      sender: nft.sender || nft.id,
      description: nft.description || '',
      displayName: nft.displayName || nft.name,
      // Preserve creator field for AssetDetail
      creator: nft.creator,
    }));

    // Prepare NFT assets for storage
    const assetsToStore = nftAssets.map(nft => ({
      address: nft.id,
      id: nft.rank.toString(),
      metadata: {
        name: nft.displayName || nft.name,
        issuer: nft.creator,
        rank: nft.rank,
        symbol: (nft.displayName || nft.name || nft.id).slice(0, 8),
        decimals: 0,
      },
    }));
    return {
      nftData: validNftData,
      assetsToStore,
    };
  }

  getBlockchainType(): string {
    return 'unit0';
  }

  canHandle(blockchainType: string): boolean {
    return blockchainType === 'unit0';
  }
}
