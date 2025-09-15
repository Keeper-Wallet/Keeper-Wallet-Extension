import { type AssetBalance, type BalancesItem } from '../../balances/types';
import { NetworkName } from '../../networks/types';
import { Unit0Api } from '../api/unit0Api';
import {
  type Unit0BalanceResponse,
  type Unit0TokenBalance,
} from '../../unit0/types';
import { AssetInfoController } from '../assetInfo';

export class BalanceService {
  private unit0Api: Unit0Api;
  private assetInfo: AssetInfoController;

  constructor(assetInfo: AssetInfoController) {
    this.unit0Api = new Unit0Api();
    this.assetInfo = assetInfo;
  }

  async buildUnit0Balance(
    address: string,
    network: NetworkName,
    data?: Unit0BalanceResponse,
    tokens?: Unit0TokenBalance[],
    transactions?: any[],
  ): Promise<BalancesItem> {
    const balanceData =
      data || (await this.unit0Api.fetchBalance(address, network));
    const tokenData =
      tokens || (await this.unit0Api.fetchTokenBalances(address, network));
    const txData = transactions || [];

    // Separate ERC-20 tokens and NFTs (ERC-721 + ERC-1155) from token data
    const erc20Tokens = tokenData.filter(
      token => (token as any).token?.type === 'ERC-20',
    );
    const nftTokens = tokenData.filter(
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
        // Base NFT data structure for Unit0 tokens
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
          // Fetch detailed collection data for this specific NFT contract
          let collectionData = null;
          let contractInfo = null;
          // Fetch contract info to get creator address
          try {
            contractInfo = await this.unit0Api.fetchContractInfo(
              address,
              network,
            );
          } catch (error) {
            console.warn(
              `Failed to fetch contract info for ${address}:`,
              error,
            );
          }

          try {
            const collectionsResponse = await this.unit0Api.fetchNftInventory(
              address, // Use the NFT contract address
              address, // User wallet address
              network,
            );

            if (
              collectionsResponse?.items &&
              collectionsResponse.items.length > 0
            ) {
              // Find the collection data for this specific token address
              collectionData = collectionsResponse.items.find(
                (item: any) =>
                  item.token?.address_hash?.toLowerCase() ===
                  address.toLowerCase(),
              );
            }
          } catch (error) {
            console.warn(
              `Failed to fetch collection data for ${address}:`,
              error,
            );
          }

          // Create individual NFT entries for each token_instance
          if (
            collectionData &&
            collectionData.token_instances &&
            collectionData.token_instances.length > 0
          ) {
            // Create separate NFT for each token instance
            return collectionData.token_instances.map((tokenInstance: any) => {
              const creatorValue =
                contractInfo?.creator_address_hash || address;

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
                  token_id: collectionData?.token?.id ?? token.value,
                  contract_address: address,
                },
                tokenId: collectionData?.token?.id ?? token.value,
                contractAddress: address,
                rank: collectionData?.rarity_rank ?? parseInt(token.value || '1', 10),
                rarity_rank: collectionData?.rarity_rank ?? parseInt(token.value || '1', 10),
                total_supply: collectionData?.total_supply ?? '1',
                external_url: collectionData?.external_url,
                background_color: collectionData?.background_color,
              };

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
                rank: parseInt(tokenInstance.id) || 1,
                rarity_rank: parseInt(tokenInstance.id) || 1,
                ...assetData,
              };
            });
          } else {
            // Fallback: Create single NFT entry using basic token data
            return {
              id: address,
              assetId: address,
              name: token.name || 'Unknown NFT',
              displayName: `${token.name || 'Unknown NFT'} ID #${
                tokenData.token_id
              }`,
              displayCreator: token.symbol || token.name || 'Unknown NFT',
              creator: contractInfo?.creator_address_hash || address,
              description: `${token.name || 'Unknown NFT'} (${
                token.symbol || 'NFT'
              })`,
              quantity: collectionData?.amount || tokenData.value || '1',
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

    // Flatten the array since some entries might return arrays of NFTs
    const validNftData = nftData.flat().filter(nft => nft !== null);

    const unit0AssetBalance: AssetBalance = {
      balance: balanceData.coin_balance || '0',
      sponsorBalance: balanceData.coin_balance || '0',
      minSponsoredAssetFee: null,
    };

    const assets: Record<string, AssetBalance> = {
      unit0: unit0AssetBalance,
    };

    // Add ERC-20 token balances with dynamic metadata
    const tokenMetadataPromises = erc20Tokens.map(async token => {
      const tokenAddress = token.token?.address_hash ?? token.token?.address;
      const tokenBalance = token.value || '0';

      if (!tokenAddress) return null;

      // Fetch token metadata from Unit0 explorer
      const metadata = await this.unit0Api.fetchTokenMetadata(
        tokenAddress,
        network,
      );

      return {
        address: tokenAddress,
        balance: tokenBalance,
        metadata,
      };
    });

    const tokenResults = await Promise.all(tokenMetadataPromises);

    // Prepare all assets for storage (ERC-20 tokens + NFTs)
    const assetsToStore = [];

    for (const result of tokenResults) {
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

    // txHistory is now passed directly as txData

    return {
      available: balanceData.coin_balance || '0',
      regular: balanceData.coin_balance || '0',
      leasedOut: '0',
      network,
      assets,
      txHistory: txData, // Include transaction history
      aliases: [], // Unit0 doesn't have aliases like Waves
      nfts: validNftData, // Include NFTs
    };
  }

  async fetchUnit0Balance(
    address: string,
    network: NetworkName,
    transactions?: any[],
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

  isUnit0Network(blockchainType: string): boolean {
    const result = blockchainType === 'unit0';
    return result;
  }
}
