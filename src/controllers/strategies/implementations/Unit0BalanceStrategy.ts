import { type TransactionFromNode } from '@waves/ts-types';

import { type AssetBalance, type BalancesItem, type Unit0Transfer } from 'balances/types';
import { type NetworkName } from 'networks/types';

import { Unit0Api } from '../../api/unit0Api';
import { AssetInfoController } from '../../assetInfo';
import { NftInfoController } from '../../NftInfoController';
import { type BalanceFetchResult, type IBalanceStrategy } from '../interfaces/IBalanceStrategy';

/**
 * Unit0 Balance Strategy Implementation
 * Handles balance fetching for Unit0 blockchain
 */
export class Unit0BalanceStrategy implements IBalanceStrategy {
  private unit0Api: Unit0Api;
  private assetInfo: AssetInfoController;
  private nftInfo: NftInfoController;

  constructor(assetInfo: AssetInfoController, nftInfo: NftInfoController) {
    this.unit0Api = new Unit0Api();
    this.assetInfo = assetInfo;
    this.nftInfo = nftInfo;
  }

  async fetchBalance(
    address: string,
    network: NetworkName,
    transactions?: TransactionFromNode[] | Unit0Transfer[],
  ): Promise<BalanceFetchResult> {
    try {
      const balance = await this.fetchUnit0Balance(address, network, transactions as Unit0Transfer[]);

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
      const { balance, tokens } = await this.unit0Api.fetchBalanceAndTokens(address, network);
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
    balanceData: any,
    tokens: any[],
    transactions: Unit0Transfer[],
  ): Promise<BalancesItem> {
    // Separate ERC-20 tokens and NFTs (ERC-721 + ERC-1155) from token data
    const erc20Tokens = tokens.filter(
      token => (token as any).token?.type === 'ERC-20',
    );
    const nftTokens = tokens.filter(
      token =>
        (token as any).token?.type === 'ERC-721' || (token as any).token?.type === 'ERC-1155',
    );

    // Convert ERC-721 and ERC-1155 tokens to NFT format with enhanced metadata
    // Use collections endpoint for each NFT contract to get comprehensive data with amounts and token instances
    const nftData = await Promise.all(
      nftTokens.map(async (tokenData: any) => {
        if (!tokenData || !tokenData.token) {
          return null;
        }

        const token = tokenData.token;
        const address = token.address ?? (token as any).address_hash;
        
        
        const baseNftData = {
          id: address,
          assetId: address,
          name: token.name || 'Unknown NFT',
          displayName: token.name || 'Unknown NFT',
          description: `${token.name || 'Unknown NFT'} (${token.symbol || 'NFT'})`,
          quantity: token.value || '1',
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
          rank: parseInt(token.value || '1'),
          rarity_rank: parseInt(token.value || '1'),
        };

        try {
          let collectionData = null;
          let contractInfo = null;
          
          try {
            contractInfo = await this.unit0Api.fetchContractInfo(address, network);
          } catch (error) {
            console.warn(`Failed to fetch contract info for ${address}:`, error);
          }

          try {
            const collectionsResponse = await this.unit0Api.fetchNftInventory(
              address, // Use the NFT contract address
              walletAddress, // User wallet address
              network,
            );

            if (collectionsResponse?.items && collectionsResponse.items.length > 0) {
              collectionData = collectionsResponse.items.find(
                (item: any) =>
                  item.token?.address_hash?.toLowerCase() === address.toLowerCase(),
              );
            }
          } catch (error) {
            console.warn(`Failed to fetch collection data for ${address}:`, error);
          }

          if (
            collectionData &&
            collectionData.token_instances &&
            collectionData.token_instances.length > 0
          ) {
            return collectionData.token_instances.map((tokenInstance: any) => {
              const creatorValue = contractInfo?.creator_address_hash || address;

              const assetData = {
                ...baseNftData,
                ...collectionData,
                issuer: contractInfo?.creator_address_hash ?? address,
                image: collectionData?.metadata?.image ?? collectionData?.image_url ?? collectionData?.animation_url ?? token.icon_url ?? '',
                logo: collectionData?.metadata?.image ?? collectionData?.image_url ?? token.icon_url ?? '',
                icon: collectionData?.metadata?.image ?? collectionData?.image_url ?? token.icon_url ?? '',
                metadata: {
                  ...collectionData?.metadata,
                  image: collectionData?.metadata?.image ?? collectionData?.image_url ?? token.icon_url,
                  animation_url: collectionData?.animation_url,
                  attributes: collectionData?.metadata?.attributes ?? [],
                  token_address: address,
                  token_id: tokenInstance.id,
                  contract_address: address,
                },
                tokenId: tokenInstance.id,
                contractAddress: address,
                rank: tokenInstance?.id ?? parseInt(token.value || '1', 10),
                rarity_rank: tokenInstance?.id ?? parseInt(token.value || '1', 10),
                total_supply: collectionData?.total_supply ?? '1',
                external_url: collectionData?.external_url,
                background_color: collectionData?.background_color,
              };

              return {
                id: address,
                assetId: address,
                name: token.name || 'Unknown NFT',
                displayName: `${token.name || 'Unknown NFT'} ID #${tokenInstance.id}`,
                displayCreator: token.symbol || token.name || 'Unknown NFT',
                creator: creatorValue,
                description: `${token.name || 'Unknown NFT'} #${tokenInstance.id} (${token.symbol || 'NFT'})`,
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
                rank: parseInt(tokenInstance.id) || 1,
                rarity_rank: parseInt(tokenInstance.id) || 1,
              };
            });
          } else {
            return {
              id: address,
              assetId: address,
              name: token.name || 'Unknown NFT',
              displayName: `${token.name || 'Unknown NFT'} ID #${token.value || tokenData.token_id || '1'}`,
              displayCreator: token.symbol || token.name || 'Unknown NFT',
              creator: contractInfo?.creator_address_hash || address,
              description: `${token.name || 'Unknown NFT'} #${token.value || tokenData.token_id || '1'} (${token.symbol || 'NFT'})`,
              quantity: tokenData.value || '1',
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
              // Add collection-specific data if available
              collectionAddress: address,
              tokenId: tokenData.token_id,
              tokenType: token.type || 'ERC-721',
              rank: 1,
              rarity_rank: 1,
            };
          }
        } catch (error) {
          console.warn(`Failed to process NFT collection ${address}`, error);
          return null;
        }
      }),
    );

    const validNftData = nftData.flat().filter(nft => nft !== null);

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

      console.log(metadata, 'metadata');
      return {
        address: address,
        balance: tokenBalance,
        metadata,
      };
    });

    const tokenMetadata = await Promise.all(tokenMetadataPromises);
    const validTokenMetadata = tokenMetadata.filter(Boolean);

    // Prepare all assets for storage (ERC-20 tokens + NFTs)
    const assetsToStore = [];

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
        });
      }
    }

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

    // Add NFT assets to storage list
    for (const nft of nftAssets) {
      assets[nft.id] = {
        balance: nft.quantity,
        sponsorBalance: nft.quantity,
        minSponsoredAssetFee: null,
      };

      // Add NFT metadata for storage
      assetsToStore.push({
        address: nft.id,
        id: nft.rank,
        metadata: {
          name: nft.displayName || nft.name,
          issuer: nft.creator,
          rank: nft.rank,
          symbol: (nft.displayName || nft.name || nft.id).slice(0, 8),
          decimals: 0,
        },
      });
    }

    // Store all assets (ERC-20 tokens + NFTs) at once
    for (const assetData of assetsToStore) {
      const address = assetData.id
        ? `${assetData.address}_${assetData.id}`
        : assetData.address;
      await this.assetInfo.storeUnit0TokenMetadata(
        address,
        assetData.metadata,
        network,
      );
    }

    // Update NFTs using NftInfoController
    if (nftAssets.length > 0) {
      await this.nftInfo.updateNfts(nftAssets as any[], true);
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
