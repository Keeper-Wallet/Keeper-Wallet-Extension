import { type TransactionFromNode } from '@waves/ts-types';
import {
  type AssetBalance,
  type BalancesItem,
  type Unit0Transfer,
} from 'balances/types';
import { Unit0Api } from 'controllers/api/unit0Api';
import { type NetworkName } from 'networks/types';
import { type NftAssetDetail } from 'nfts/types';

import { type IAssetInfoStrategy } from '../../interfaces/IAssetInfoStrategy';
import {
  type BalanceFetchResult,
  type IBalanceStrategy,
} from '../../interfaces/IBalanceStrategy';
import type { INftToken } from '../../interfaces/INftStrategy';
import {
  type Unit0Assets,
  type Unit0BalanceResponse,
  type Unit0TokenBalance,
} from '../../interfaces/IUnit0Types';
import { Unit0NftStrategy } from '../nftStrategy/Unit0NftStrategy';
import { Unit0TokenStrategy } from '../tokenStrategy/Unit0TokenStrategy';

/**
 * Callback for incremental balance updates
 */
export type BalanceUpdateCallback = (balance: BalancesItem) => void;

/**
 * Unit0 Balance Strategy Implementation
 * Handles balance fetching for Unit0 blockchain
 */
export class Unit0BalanceStrategy implements IBalanceStrategy {
  private unit0Api: Unit0Api;
  private assetInfoStrategy: IAssetInfoStrategy;
  private nftStrategy: Unit0NftStrategy;
  private tokenStrategy: Unit0TokenStrategy;

  constructor(assetInfoStrategy: IAssetInfoStrategy) {
    this.unit0Api = new Unit0Api();
    this.assetInfoStrategy = assetInfoStrategy;
    this.nftStrategy = new Unit0NftStrategy();
    this.tokenStrategy = new Unit0TokenStrategy();
  }

  async fetchBalance(
    address: string,
    network: NetworkName,
    transactions?: TransactionFromNode[] | Unit0Transfer[],
    onUpdate?: BalanceUpdateCallback,
  ): Promise<BalanceFetchResult> {
    try {
      const balance = await this.fetchUnit0Balance(
        address,
        network,
        transactions as Unit0Transfer[],
        onUpdate,
      );

      return {
        balance,
        success: true,
      };
    } catch (error) {
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
    onUpdate?: BalanceUpdateCallback,
  ): Promise<BalancesItem> {
    try {
      // Fetch native balance first
      const balance = await this.unit0Api.fetchBalance(address, network);

      // Collect all tokens using streams for incremental updates
      let allTokens: Unit0TokenBalance[] = [];

      // Process ERC-20 tokens with streaming
      for await (const pageTokens of this.unit0Api.fetchERC20TokensStream(
        address,
        network,
      )) {
        allTokens = allTokens.concat(pageTokens);

        // Build and emit partial balance after each page
        if (onUpdate) {
          const partialBalance = await this.buildUnit0Balance(
            address,
            network,
            balance,
            allTokens,
            transactions || [],
          );
          onUpdate(partialBalance);
        }
      }

      // Process ERC-721 tokens
      for await (const pageTokens of this.unit0Api.fetchERC721TokensStream(
        address,
        network,
      )) {
        allTokens = allTokens.concat(pageTokens);

        if (onUpdate) {
          const partialBalance = await this.buildUnit0Balance(
            address,
            network,
            balance,
            allTokens,
            transactions || [],
          );
          onUpdate(partialBalance);
        }
      }

      // Process ERC-1155 tokens
      for await (const pageTokens of this.unit0Api.fetchERC1155TokensStream(
        address,
        network,
      )) {
        allTokens = allTokens.concat(pageTokens);

        if (onUpdate) {
          const partialBalance = await this.buildUnit0Balance(
            address,
            network,
            balance,
            allTokens,
            transactions || [],
          );
          onUpdate(partialBalance);
        }
      }

      return this.buildUnit0Balance(
        address,
        network,
        balance,
        allTokens,
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
    // Separate ERC-20 tokens and NFTs using token strategy
    const erc20Tokens = this.tokenStrategy.filterTokensByType(tokens, 'ERC-20');
    let nftTokens = tokens.filter(
      token =>
        token.token?.type === 'ERC-721' || token.token?.type === 'ERC-1155',
    );

    // Deduplicate NFT tokens by contract address to prevent processing same contract multiple times
    const uniqueNftContracts = new Map<string, (typeof nftTokens)[0]>();
    nftTokens.forEach(token => {
      const contractAddress = token.token?.address_hash;
      if (contractAddress && !uniqueNftContracts.has(contractAddress)) {
        uniqueNftContracts.set(contractAddress, token);
      }
    });
    nftTokens = Array.from(uniqueNftContracts.values());

    // Process NFTs using the dedicated NFT strategy
    const { nftData: validNftData, assetsToStore: nftAssetsToStore } =
      await this.nftStrategy.processNfts(
        nftTokens as unknown as INftToken[],
        walletAddress,
        network,
      );

    const unit0AssetBalance: AssetBalance = {
      balance: balanceData.coin_balance || '0',
      sponsorBalance: balanceData.coin_balance || '0',
      minSponsoredAssetFee: null,
    };

    const assets: Record<string, AssetBalance> = {
      unit0: unit0AssetBalance,
    };

    // Process ERC-20 tokens using token strategy
    const { processedTokens, assetsToStore: tokenAssetsToStore } =
      await this.tokenStrategy.processTokens(erc20Tokens);

    // Prepare all assets for storage (ERC-20 tokens + NFTs)
    const assetsToStore: Unit0Assets[] = [];

    // Add processed token balances and assets
    for (const token of processedTokens) {
      // Add balance data
      assets[token.address] = {
        balance: token.balance,
        sponsorBalance: token.balance,
        minSponsoredAssetFee: null,
      };
    }

    // Add token assets to storage
    assetsToStore.push(...(tokenAssetsToStore as Unit0Assets[]));

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

    // Store all assets (ERC-20 tokens + NFTs) using asset info strategy
    await this.assetInfoStrategy.storeAllAssets(assetsToStore);

    // Update NFTs using asset info strategy
    if (validNftData.length > 0) {
      await this.assetInfoStrategy.updateNfts(validNftData as NftAssetDetail[]);
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
