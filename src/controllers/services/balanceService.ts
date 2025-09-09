import { type AssetBalance, type BalancesItem } from '../../balances/types';
import { NetworkName } from '../../networks/types';
import { MAX_TX_HISTORY_ITEMS } from '../../constants';
import {
  Unit0Api,
  type Unit0BalanceResponse,
  type Unit0TokenBalance,
  type Unit0Transaction,
} from '../api/unit0Api';

export class BalanceService {
  private unit0Api: Unit0Api;

  constructor() {
    this.unit0Api = new Unit0Api();
  }

  async buildUnit0Balance(
    address: string,
    network: NetworkName,
    data?: Unit0BalanceResponse,
    tokens?: Unit0TokenBalance[],
    transactions?: Unit0Transaction[],
  ): Promise<BalancesItem> {
    const balanceData =
      data || (await this.unit0Api.fetchBalance(address, network));
    const tokenData =
      tokens || (await this.unit0Api.fetchTokenBalances(address, network));
    const txData =
      transactions ||
      (await this.unit0Api.fetchTransactionHistory(
        address,
        network,
        MAX_TX_HISTORY_ITEMS,
      ));

    // Separate ERC-20 tokens and NFTs (ERC-721 + ERC-1155) from token data
    const erc20Tokens = tokenData.filter(
      token => token.token?.type === 'ERC-20',
    );
    const nftTokens = tokenData.filter(
      token =>
        token.token?.type === 'ERC-721' || token.token?.type === 'ERC-1155',
    );

    // Convert ERC-721 and ERC-1155 tokens to NFT format with enhanced metadata
    // Use collections endpoint for each NFT contract to get comprehensive data with amounts and token instances
    const nftData = await Promise.all(
      nftTokens.map(async (tokenData: any) => {
        if (!tokenData || !tokenData.token) {
          return null;
        }

        const token = tokenData.token;

        try {
          // Fetch detailed collection data for this specific NFT contract
          let collectionData = null;
          let contractInfo = null;

          // Fetch contract info to get creator address
          try {
            contractInfo = await this.unit0Api.fetchContractInfo(
              token.address,
              network,
            );
          } catch (error) {
            console.warn(
              `Failed to fetch contract info for ${token.address}:`,
              error,
            );
          }

          try {
            const collectionsResponse = await this.unit0Api.fetchNftInventory(
              token.address, // Use the NFT contract address
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
                  item.token?.address?.toLowerCase() ===
                  token.address.toLowerCase(),
              );
            }
          } catch (error) {
            console.warn(
              `Failed to fetch collection data for ${token.address}:`,
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
                contractInfo?.creator_address_hash || token.address;

              return {
                id: token.address,
                assetId: token.address,
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
                issuer: token.address,
                issuerPublicKey: '',
                scripted: false,
                minSponsoredAssetFee: null,
                originTransactionId: '',
                issueHeight: 0,
                issueTimestamp: Date.now(),
                height: 0,
                precision: 0,
                sender: token.address,
                timestamp: new Date(),
                // Add individual token data
                collectionAddress: token.address,
                tokenId: tokenInstance.id,
                tokenType: token.type,
                rank: parseInt(tokenInstance.id) || 1,
                rarity_rank: parseInt(tokenInstance.id) || 1,
              };
            });
          } else {
            // Fallback: Create single NFT entry using basic token data
            return {
              id: token.address,
              assetId: token.address,
              name: token.name || 'Unknown NFT',
              displayName: `${token.name || 'Unknown NFT'} ID #${
                tokenData.token_id
              }`,
              displayCreator: token.symbol || token.name || 'Unknown NFT',
              creator: contractInfo?.creator_address_hash || token.address,
              description: `${token.name || 'Unknown NFT'} (${
                token.symbol || 'NFT'
              })`,
              quantity: collectionData?.amount || tokenData.value || '1',
              decimals: 0,
              reissuable: false,
              issuer: token.address,
              issuerPublicKey: '',
              scripted: false,
              minSponsoredAssetFee: null,
              originTransactionId: '',
              issueHeight: 0,
              issueTimestamp: Date.now(),
              height: 0,
              precision: 0,
              sender: token.address,
              timestamp: new Date(),
              // Add collection-specific data if available
              collectionAddress: token.address,
              tokenId: tokenData.token_id,
              tokenType: token.type || 'ERC-721',
              rank: 1,
              rarity_rank: 1,
            };
          }
        } catch (error) {
          console.warn(
            `Failed to process NFT collection ${token.address}`,
            error,
          );
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

    // Add ERC-20 token balances
    for (const token of erc20Tokens) {
      const tokenAddress = token.token?.address;
      const tokenBalance = token.value || '0';

      if (tokenAddress) {
        assets[tokenAddress] = {
          balance: tokenBalance,
          sponsorBalance: tokenBalance,
          minSponsoredAssetFee: null,
        };
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

    // Add NFT assets to the assets object so they can be found by nftInfo.tsx
    for (const nft of nftAssets) {
      assets[nft.id] = {
        balance: nft.quantity,
        sponsorBalance: nft.quantity,
        minSponsoredAssetFee: null,
      };
    }

    // Convert Unit0 transactions to Waves-compatible format
    // Use the same mock address that was used to fetch the transactions
    const mockAddress =
      network === NetworkName.Testnet || network === NetworkName.Stagenet
        ? '0xE860EA6CF834Ca574A364e6B1Dc10A27102CaF84'
        : '0xCaf68F88a7262A66dAf6c361d1824bf8A3E4b5DD';

    const txHistory = txData.map(tx =>
      this.unit0Api.convertToWavesTransaction(tx, mockAddress),
    );

    return {
      available: balanceData.coin_balance || '0',
      regular: balanceData.coin_balance || '0',
      leasedOut: '0',
      network,
      assets,
      txHistory, // Include transaction history
      aliases: [], // Unit0 doesn't have aliases like Waves
      nfts: validNftData, // Include NFTs
    };
  }

  async fetchUnit0Balance(
    address: string,
    network: NetworkName,
  ): Promise<BalancesItem> {
    try {
      const [{ balance, tokens }, transactions] = await Promise.all([
        this.unit0Api.fetchBalanceAndTokens(address, network),
        this.unit0Api.fetchTransactionHistory(
          address,
          network,
          MAX_TX_HISTORY_ITEMS,
        ),
      ]);
      return this.buildUnit0Balance(
        address,
        network,
        balance,
        tokens,
        transactions,
      );
    } catch (error) {
      console.error('Error fetching Unit0 balance and transactions:', error);
      return this.buildUnit0Balance(
        address,
        network,
        { coin_balance: '0' },
        [],
        [],
      );
    }
  }

  isUnit0Network(blockchainType: string): boolean {
    const result = blockchainType === 'unit0';
    return result;
  }
}
