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

    // Separate ERC-20 tokens and ERC-721 NFTs from token data
    const erc20Tokens = tokenData.filter(
      token => token.token?.type === 'ERC-20',
    );
    const erc721Tokens = tokenData.filter(
      token => token.token?.type === 'ERC-721',
    );

    // Convert ERC-721 tokens to NFT format with enhanced metadata
    const nftData = await Promise.all(
      erc721Tokens.map(async token => {
        if (!token.token) {
          return null;
        }

        const baseNft = {
          id: token.token.address,
          assetId: token.token.address,
          name: token.token.name || 'Unknown NFT',
          displayName: token.token.name || 'Unknown NFT',
          description: `${token.token.name || 'Unknown NFT'} (${token.token.symbol || 'NFT'})`,
          quantity: token.value || '1',
          decimals: 0,
          reissuable: false,
          issuer: token.token.address,
          issuerPublicKey: '',
          scripted: false,
          minSponsoredAssetFee: null,
          originTransactionId: '',
          issueHeight: 0,
          issueTimestamp: Date.now(),
          height: 0,
          precision: 0,
          sender: token.token.address,
          timestamp: new Date(),
          // Add tokenId for rank display
          rank: parseInt(token.value || '1'),
          rarity_rank: parseInt(token.value || '1'),
        };

        // Try to fetch enhanced metadata from Unit0's indexed API only
        try {
          const tokenId = token.value || '1';
          
          // Use Unit0's indexed API for cached metadata
          const unit0Metadata = await this.unit0Api.fetchNftMetadata(
            token.token.address,
            tokenId,
            network,
          );

          if (unit0Metadata && unit0Metadata.metadata) {
            const meta = unit0Metadata.metadata;
            return {
              ...baseNft,
              name: meta.name || baseNft.name,
              displayName: meta.name || baseNft.displayName,
              description: meta.description || baseNft.description,
              author: meta.author,
              creator: meta.creator,
              rank: meta.rank,
              rarity_rank: meta.rarity_rank || meta.rank,
              image_url: meta.image,
              animation_url: meta.animation_url,
              external_url: meta.external_url,
              attributes: meta.attributes,
            };
          }
        } catch (error) {
          console.warn(
            `Failed to fetch metadata for NFT ${token.token.address}:${token.value}`,
            error,
          );
        }

        return baseNft;
      }),
    );

    // Filter out null values from failed token processing
    const validNftData = nftData.filter(nft => nft !== null);
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

    // Add NFT assets to the assets object so they can be found by nftInfo.tsx
    for (const nft of validNftData) {
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
