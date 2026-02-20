import { type AssetInfoController } from 'controllers/assetInfo';
import { type NftInfoController } from 'controllers/NftInfoController';
import { type NftAssetDetail } from 'nfts/types';

import { type IAssetInfoStrategy } from '../../interfaces/IAssetInfoStrategy';
import {
  type Unit0Assets,
  type Unit0NftAsset,
  type Unit0TokenAsset,
} from '../../interfaces/IUnit0Types';

/**
 * Unit0 Asset Info Strategy Implementation
 * Handles asset metadata storage and management for Unit0 blockchain
 */
export class Unit0AssetInfoStrategy implements IAssetInfoStrategy {
  private assetInfo: AssetInfoController;
  private nftInfo: NftInfoController;

  constructor(assetInfo: AssetInfoController, nftInfo: NftInfoController) {
    this.assetInfo = assetInfo;
    this.nftInfo = nftInfo;
  }

  async storeTokenAssets(assets: Unit0Assets[]): Promise<void> {
    // Filter only token assets (without 'id' property)
    const tokenAssets = assets.filter(
      (asset): asset is Unit0TokenAsset => !('id' in asset),
    );

    for (const assetData of tokenAssets) {
      await this.assetInfo.storeUnit0TokenMetadata(
        assetData.address,
        assetData.metadata,
      );
    }
  }

  async storeNftAssets(assets: Unit0Assets[]): Promise<void> {
    // Filter only NFT assets (with 'id' property)
    const nftAssets = assets.filter(
      (asset): asset is Unit0NftAsset => 'id' in asset,
    );

    for (const assetData of nftAssets) {
      const address = `${assetData.address}_${assetData.id}`;
      await this.assetInfo.storeUnit0TokenMetadata(address, assetData.metadata);
    }
  }

  async storeAllAssets(assets: Unit0Assets[]): Promise<void> {
    // Store all assets (tokens + NFTs) at once
    for (const assetData of assets) {
      const address =
        'id' in assetData && (assetData as Unit0NftAsset).id
          ? `${assetData.address}_${(assetData as Unit0NftAsset).id}`
          : assetData.address;

      await this.assetInfo.storeUnit0TokenMetadata(address, assetData.metadata);
    }
  }

  /**
   * Update NFTs using NftInfoController
   * @param nftData - Array of NFT asset details
   */
  async updateNfts(nftData: NftAssetDetail[]): Promise<void> {
    if (nftData.length > 0) {
      await this.nftInfo.updateNfts(nftData, true);
    }
  }

  getBlockchainType(): string {
    return 'unit0';
  }

  canHandle(blockchainType: string): boolean {
    return blockchainType === 'unit0';
  }
}
