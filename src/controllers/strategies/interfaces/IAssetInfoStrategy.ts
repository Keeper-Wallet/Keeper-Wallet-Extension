import { type AssetDetail } from 'assets/types';
import { type NetworkName } from 'networks/types';
import { type NftAssetDetail } from 'nfts/types';

import { type Unit0Assets } from './IUnit0Types';

/**
 * Asset Info Strategy Interface
 * Handles asset metadata storage and management for different blockchains
 */
export interface IAssetInfoStrategy {
  /**
   * Store token assets metadata
   * @param assets - Array of assets to store
   * @param network - The network name
   * @returns Promise that resolves when storage is complete
   */
  storeTokenAssets(assets: Unit0Assets[], network: NetworkName): Promise<void>;

  /**
   * Store NFT assets metadata
   * @param assets - Array of NFT assets to store
   * @param network - The network name
   * @returns Promise that resolves when storage is complete
   */
  storeNftAssets(assets: Unit0Assets[], network: NetworkName): Promise<void>;

  /**
   * Store all assets metadata (tokens + NFTs)
   * @param assets - Array of all assets to store
   * @param network - The network name
   * @returns Promise that resolves when storage is complete
   */
  storeAllAssets(assets: Unit0Assets[]): Promise<void>;

  /**
   * Update NFTs using NftInfoController
   * @param nftData - Array of NFT asset details
   * @returns Promise that resolves when update is complete
   */
  updateNfts(nftData: NftAssetDetail[]): Promise<void>;

  /**
   * Get all assets (Waves-specific)
   * @returns Record of asset information
   */
  getAssets?(): Record<string, AssetDetail | undefined>;

  /**
   * Check if asset max age is exceeded (Waves-specific)
   * @param lastUpdated - Last updated timestamp
   * @returns True if max age is exceeded
   */
  isMaxAgeExceeded?(lastUpdated: number): boolean;

  /**
   * Update assets metadata (Waves-specific)
   * @param assetIds - Array of asset IDs to update
   * @param options - Update options
   * @returns Promise that resolves when update is complete
   */
  updateAssets?(
    assetIds: string[],
    options?: { ignoreCache: boolean },
  ): Promise<void>;

  /**
   * Get the blockchain type this strategy handles
   * @returns The blockchain type identifier
   */
  getBlockchainType(): string;

  /**
   * Check if this strategy can handle the given blockchain type
   * @param blockchainType - The blockchain type to check
   * @returns True if this strategy can handle the blockchain type
   */
  canHandle(blockchainType: string): boolean;
}
