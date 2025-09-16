import { type TransactionFromNode } from '@waves/ts-types';
import {
  type AssetBalance,
  type BalancesItem,
  type Unit0Transfer,
} from 'balances/types';
import { type NetworkName } from 'networks/types';

import { Unit0Api } from '../../../api/unit0Api';
import { type AssetInfoController } from '../../../assetInfo';
import { type NftInfoController } from '../../../NftInfoController';
import {
  type BalanceFetchResult,
  type IBalanceStrategy,
} from '../../interfaces/IBalanceStrategy';
import type { INftToken } from '../../interfaces/INftStrategy';
import {
  type Unit0Assets,
  type Unit0BalanceResponse,
  type Unit0TokenBalance,
  type Unit0TokenAsset,
} from '../../interfaces/IUnit0Types';
import { Unit0NftStrategy } from '../nftStrategy/Unit0NftStrategy';

/**
 * Unit0 Balance Strategy Implementation
 * Handles balance fetching for Unit0 blockchain
 */
export class Unit0BalanceStrategy implements IBalanceStrategy {
  private unit0Api: Unit0Api;
  private assetInfo: AssetInfoController;
  private nftInfo: NftInfoController;
  private nftStrategy: Unit0NftStrategy;

  constructor(assetInfo: AssetInfoController, nftInfo: NftInfoController) {
    this.unit0Api = new Unit0Api();
    this.assetInfo = assetInfo;
    this.nftInfo = nftInfo;
    this.nftStrategy = new Unit0NftStrategy();
  }

  async fetchBalance(
    address: string,
    network: NetworkName,
    transactions?: TransactionFromNode[] | Unit0Transfer[],
  ): Promise<BalanceFetchResult> {
    try {
      const balance = await this.fetchUnit0Balance(
        address,
        network,
        transactions as Unit0Transfer[],
      );

      return {
        balance,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching Unit0 balance:', error);
      return {
        balance: {
          aliases: [],
          available: '0',
          regular: '0',
          leasedOut: '0',
          network,
          txHistory: [],
          assets: {},
          nfts: [],
        },
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  private async fetchUnit0Balance(
    address: string,
    network: NetworkName,
    transactions?: Unit0Transfer[],
  ): Promise<BalancesItem> {
    try {
      const { balance, tokens } = await this.unit0Api.fetchBalanceAndTokens(
        address,
        network,
      );
      return this.buildUnit0Balance(
        address,
        network,
        balance,
        tokens,
        transactions || [],
      );
    } catch (error) {
      return this.buildUnit0Balance(
        address,
        network,
        { coin_balance: '0' },
        [],
        transactions || [],
      );
    }
  }

  private async buildUnit0Balance(
    walletAddress: string,
    network: NetworkName,
    balanceData: Unit0BalanceResponse,
    tokens: Unit0TokenBalance[],
    transactions: Unit0Transfer[],
  ): Promise<BalancesItem> {
    console.log(tokens, 'tokens');
    // Separate ERC-20 tokens and NFTs (ERC-721 + ERC-1155) from token data
    const erc20Tokens = tokens.filter(token => token.token?.type === 'ERC-20');
    const nftTokens = tokens.filter(
      token =>
        token.token?.type === 'ERC-721' || token.token?.type === 'ERC-1155',
    );

    // Process NFTs using the dedicated NFT strategy
    const { nftData: validNftData, assetsToStore: nftAssetsToStore } =
      await this.nftStrategy.processNfts(
        nftTokens as unknown as INftToken[],
        walletAddress,
        network,
      );
    // console.log(validNftData, 'validNftData')
    // console.log(nftAssetsToStore, 'nftAssetsToStore')

    const unit0AssetBalance: AssetBalance = {
      balance: balanceData.coin_balance || '0',
      sponsorBalance: balanceData.coin_balance || '0',
      minSponsoredAssetFee: null,
    };

    const assets: Record<string, AssetBalance> = {
      unit0: unit0AssetBalance,
    };

    // Add ERC-20 token balances
    const tokenMetadataPromises = erc20Tokens.map(async token => {
      const address = token.token?.address_hash ?? token.token?.address;
      const tokenBalance = token.value || '0';

      if (!address) return null;

      const metadata = await this.unit0Api.fetchTokenMetadata(address, network);

      return {
        address,
        balance: tokenBalance,
        metadata,
      };
    });

    const tokenMetadata = await Promise.all(tokenMetadataPromises);
    const validTokenMetadata = tokenMetadata.filter(Boolean);

    // Prepare ERC-20 token assets for storage
    const assetsToStore: Unit0Assets[] = [];

    for (const result of validTokenMetadata) {
      if (!result) continue;

      // Add balance data
      assets[result.address] = {
        balance: result.balance,
        sponsorBalance: result.balance,
        minSponsoredAssetFee: null,
      };

      // Store metadata in Redux if available
      if (result.metadata) {
        assetsToStore.push({
          address: result.address,
          metadata: result.metadata,
        } as Unit0TokenAsset);
      }
    }

    // Add NFT assets to balance assets
    for (const nft of validNftData) {
      assets[nft.id] = {
        balance: nft.quantity,
        sponsorBalance: nft.quantity,
        minSponsoredAssetFee: null,
      };
    }

    // Add NFT assets to storage list (convert to union type)
    const nftAssetsForStorage: Unit0Assets[] = nftAssetsToStore.map(
      nftAsset => nftAsset as Unit0Assets,
    );
    assetsToStore.push(...nftAssetsForStorage);

    // Store all assets (ERC-20 tokens + NFTs) at once
    for (const assetData of assetsToStore) {
      const address =
        'id' in assetData && assetData.id
          ? `${assetData.address}_${assetData.id}`
          : assetData.address;
      await this.assetInfo.storeUnit0TokenMetadata(
        address,
        assetData.metadata,
        network,
      );
    }
    console.log(validNftData, 'validNftData');

    // Update NFTs using NftInfoController
    if (validNftData.length > 0) {
      await this.nftInfo.updateNfts(validNftData, true);
    }

    return {
      available: balanceData.coin_balance || '0',
      regular: balanceData.coin_balance || '0',
      leasedOut: '0',
      network,
      assets,
      txHistory: transactions, // Include transaction history
      aliases: [], // Unit0 doesn't have aliases like Waves
      nfts: validNftData, // Include NFTs
    };
  }

  getBlockchainType(): string {
    return 'unit0';
  }

  canHandle(blockchainType: string): boolean {
    return blockchainType === 'unit0';
  }
}
