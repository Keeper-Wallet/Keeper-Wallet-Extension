import { type AssetDetail } from 'assets/types';
import { type AssetInfoController } from 'controllers/assetInfo';
import { type NftInfoController } from 'controllers/NftInfoController';
import { type NftAssetDetail } from 'nfts/types';

import { type IAssetInfoStrategy } from '../../interfaces/IAssetInfoStrategy';

/**
 * Waves Asset Info Strategy Implementation
 * Handles asset metadata storage and management for Waves blockchain
 */
export class WavesAssetInfoStrategy implements IAssetInfoStrategy {
  private assetInfoController: AssetInfoController;
  private nftInfoController: NftInfoController;

  constructor(
    assetInfoController: AssetInfoController,
    nftInfoController: NftInfoController,
  ) {
    this.assetInfoController = assetInfoController;
    this.nftInfoController = nftInfoController;
  }

  async storeTokenAssets(): Promise<void> {
    // Not used in Waves - assets are handled differently
    throw new Error('storeTokenAssets not implemented for Waves');
  }

  async storeNftAssets(): Promise<void> {
    // Not used in Waves - NFTs are handled differently
    throw new Error('storeNftAssets not implemented for Waves');
  }

  async storeAllAssets(): Promise<void> {
    // Not used in Waves - assets are handled differently
    throw new Error('storeAllAssets not implemented for Waves');
  }

  async updateNfts(nftData: NftAssetDetail[]): Promise<void> {
    await this.nftInfoController.updateNfts(nftData);
  }

  getAssets(): Record<string, AssetDetail | undefined> {
    return this.assetInfoController.getAssets();
  }

  isMaxAgeExceeded(lastUpdated: number): boolean {
    return this.assetInfoController.isMaxAgeExceeded(lastUpdated);
  }

  async updateAssets(
    assetIds: string[],
    options?: { ignoreCache: boolean },
  ): Promise<void> {
    await this.assetInfoController.updateAssets(assetIds, options);
  }

  getBlockchainType(): string {
    return 'waves';
  }

  canHandle(blockchainType: string): boolean {
    return blockchainType === 'waves';
  }
}
