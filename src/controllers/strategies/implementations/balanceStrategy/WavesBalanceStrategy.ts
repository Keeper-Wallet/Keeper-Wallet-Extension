import { BigNumber } from '@waves/bignumber';
import { type TransactionFromNode } from '@waves/ts-types';
import { type AssetBalance, type BalancesItem } from 'balances/types';
import { type NetworkName } from 'networks/types';
import { type NftAssetDetail } from 'nfts/types';

import { MAX_NFT_ITEMS } from '../../../../constants';
import { type IAssetInfoStrategy } from '../../interfaces/IAssetInfoStrategy';
import {
  type BalanceFetchResult,
  type IBalanceStrategy,
} from '../../interfaces/IBalanceStrategy';

/**
 * Waves Balance Strategy Implementation
 * Handles balance fetching for Waves blockchain
 */
export class WavesBalanceStrategy implements IBalanceStrategy {
  private readonly getNode: () => string;
  private assetInfoStrategy: IAssetInfoStrategy;

  constructor(getNode: () => string, assetInfoStrategy: IAssetInfoStrategy) {
    this.getNode = getNode;
    this.assetInfoStrategy = assetInfoStrategy;
  }

  async fetchBalance(
    address: string,
    network: NetworkName,
    transactions?: TransactionFromNode[],
    onUpdate?: (balance: BalancesItem) => void,
  ): Promise<BalanceFetchResult> {
    try {
      // Fetch balance, assets, and aliases first (fast)
      const [wavesBalance, myAssets, aliases] = await Promise.all([
        this.fetchWavesBalance(address),
        this.fetchAssetsBalance(address),
        this.fetchAliases(address),
      ]);

      // If onUpdate callback exists, show assets immediately before fetching NFTs
      if (onUpdate) {
        const initialBalance = this.buildWavesBalance(
          address,
          network,
          wavesBalance,
          myAssets,
          [], // No NFTs yet
          aliases,
          transactions || [],
        );

        // Update asset metadata BEFORE showing assets so they display correctly
        const assets = this.assetInfoStrategy.getAssets?.() || {};
        const assetExists = (assetId: string) => !!assets[assetId];
        const isMaxAgeExceeded = (assetId: string) => {
          const asset = assets[assetId];
          if (!asset || asset.lastUpdated === undefined) {
            return false;
          }
          return (
            this.assetInfoStrategy.isMaxAgeExceeded?.(asset.lastUpdated) ||
            false
          );
        };

        const isSponsorshipUpdated = (balanceAsset: {
          assetId: string;
          minSponsoredAssetFee: string | null;
        }) =>
          balanceAsset.minSponsoredAssetFee !==
          assets[balanceAsset.assetId]?.minSponsoredFee;

        const fetchAssetIds = (
          myAssets.balances.filter(
            info =>
              !assetExists(info.assetId) ||
              isSponsorshipUpdated(info) ||
              isMaxAgeExceeded(info.assetId),
          ) as Array<{ assetId: string }>
        ).map(info => info.assetId);

        await this.assetInfoStrategy.updateAssets?.(fetchAssetIds, {
          ignoreCache: true,
        });

        onUpdate(initialBalance);
      }

      // Fetch NFTs with streaming support
      let allNfts: NftAssetDetail[] = [];

      if (onUpdate) {
        // Stream NFTs with incremental updates
        for await (const pageNfts of this.fetchNftsStream(address)) {
          allNfts = allNfts.concat(pageNfts);

          // Build partial balance and emit update
          const partialBalance = this.buildWavesBalance(
            address,
            network,
            wavesBalance,
            myAssets,
            allNfts,
            aliases,
            transactions || [],
          );
          onUpdate(partialBalance);
        }
      } else {
        // Fetch all NFTs at once (no streaming)
        allNfts = await this.fetchNfts(address);
      }

      const assets = this.assetInfoStrategy.getAssets?.() || {};
      const assetExists = (assetId: string) => !!assets[assetId];
      const isMaxAgeExceeded = (assetId: string) => {
        const asset = assets[assetId];
        if (!asset || asset.lastUpdated === undefined) {
          return false;
        }
        return (
          this.assetInfoStrategy.isMaxAgeExceeded?.(asset.lastUpdated) || false
        );
      };

      // Determine which assets need sponsorship updates
      const isSponsorshipUpdated = (balanceAsset: {
        assetId: string;
        minSponsoredAssetFee: string | null;
      }) =>
        balanceAsset.minSponsoredAssetFee !==
        assets[balanceAsset.assetId]?.minSponsoredFee;

      // Build asset IDs that need updating from balance data
      const fetchAssetIds = (
        myAssets.balances.filter(
          info =>
            !assetExists(info.assetId) ||
            isSponsorshipUpdated(info) ||
            isMaxAgeExceeded(info.assetId),
        ) as Array<{ assetId: string }>
      )
        .concat(
          allNfts.filter(
            info =>
              !assetExists(info.assetId) || isMaxAgeExceeded(info.assetId),
          ),
        )
        .map(info => info.assetId)
        .concat(
          (transactions || [])
            .flatMap(tx => [
              ...('assetId' in tx ? [tx.assetId] : []),
              ...('order1' in tx
                ? [
                    tx.order1.assetPair.amountAsset,
                    tx.order1.assetPair.priceAsset,
                  ]
                : []),
              ...('payment' in tx ? tx.payment?.map(x => x.assetId) ?? [] : []),
              ...('stateChanges' in tx
                ? tx.stateChanges.transfers.map(x => x.asset)
                : []),
            ])
            .filter((item): item is string => item != null)
            .filter(
              assetId => !assetExists(assetId) || isMaxAgeExceeded(assetId),
            ),
        );

      await Promise.all(
        [
          this.assetInfoStrategy.updateAssets?.(fetchAssetIds, {
            ignoreCache: true,
          }),
          this.assetInfoStrategy.updateNfts(allNfts),
        ].filter(Boolean),
      );

      const balance = this.buildWavesBalance(
        address,
        network,
        wavesBalance,
        myAssets,
        allNfts,
        aliases,
        transactions || [],
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

  getBlockchainType(): string {
    return 'waves';
  }

  canHandle(blockchainType: string): boolean {
    return blockchainType === 'waves';
  }

  private buildWavesBalance(
    address: string,
    network: NetworkName,
    wavesBalance: {
      address: string;
      regular: string;
      generating: string;
      available: string;
      effective: string;
    },
    myAssets: {
      address: string;
      balances: Array<{
        assetId: string;
        balance: string;
        minSponsoredAssetFee: string | null;
        sponsorBalance: string;
      }>;
    },
    myNfts: NftAssetDetail[],
    aliases: string[],
    transactions: TransactionFromNode[],
  ): BalancesItem {
    const wavesAssetBalance: AssetBalance = {
      minSponsoredAssetFee: '100000',
      sponsorBalance: wavesBalance.available,
      balance: wavesBalance.available,
    };

    return {
      aliases: aliases || [],
      available: wavesBalance.available,
      regular: wavesBalance.regular,
      leasedOut: new BigNumber(wavesBalance.regular)
        .sub(wavesBalance.available)
        .toString(),
      network,
      txHistory: transactions,
      assets: Object.fromEntries([
        ['WAVES', wavesAssetBalance],
        ...myAssets.balances.map(info => {
          const assetBalance: AssetBalance = {
            minSponsoredAssetFee: info.minSponsoredAssetFee,
            sponsorBalance: info.sponsorBalance,
            balance: info.balance,
          };
          return [info.assetId, assetBalance];
        }),
      ]),
      nfts: myNfts.map(nft => ({
        id: nft.assetId,
        name: nft.name,
        precision: nft.decimals,
        description: nft.description,
        height: nft.issueHeight,
        timestamp: new Date(nft.issueTimestamp).toJSON(),
        sender: nft.issuer,
        quantity: nft.quantity,
        reissuable: nft.reissuable,
        hasScript: nft.scripted,
        displayName: nft.name,
        minSponsoredFee: nft.minSponsoredAssetFee ?? undefined,
        originTransactionId: nft.originTransactionId,
        issuer: nft.issuer,
      })),
    };
  }

  private async fetchWavesBalance(address: string) {
    const url = new URL(`addresses/balance/details/${address}`, this.getNode());
    const response = await fetch(url, {
      headers: { accept: 'application/json; large-significand-format=string' },
    });

    if (!response.ok) {
      throw response;
    }

    return (await response.json()) as {
      address: string;
      regular: string;
      generating: string;
      available: string;
      effective: string;
    };
  }

  private async fetchAssetsBalance(address: string) {
    const url = new URL(`assets/balance/${address}`, this.getNode());
    const response = await fetch(url, {
      headers: { accept: 'application/json; large-significand-format=string' },
    });

    if (!response.ok) {
      throw response;
    }

    return (await response.json()) as {
      address: string;
      balances: Array<{
        assetId: string;
        balance: string;
        minSponsoredAssetFee: string | null;
        sponsorBalance: string;
      }>;
    };
  }

  /**
   * Fetch NFTs with pagination support
   */
  private async fetchNfts(address: string): Promise<NftAssetDetail[]> {
    const allNfts: NftAssetDetail[] = [];
    let after: string | null = null;

    do {
      const url = new URL(
        `assets/nft/${address}/limit/${MAX_NFT_ITEMS}`,
        this.getNode(),
      );

      if (after) {
        url.searchParams.set('after', after);
      }

      const response = await fetch(url, {
        headers: {
          accept: 'application/json; large-significand-format=string',
        },
      });

      if (!response.ok) {
        throw response;
      }

      const nfts = (await response.json()) as NftAssetDetail[];

      if (!Array.isArray(nfts) || nfts.length === 0) {
        break;
      }

      allNfts.push(...nfts);

      // If we got less than MAX_NFT_ITEMS, we've reached the end
      if (nfts.length < MAX_NFT_ITEMS) {
        break;
      }

      // Set 'after' to the last NFT's assetId for next page
      after = nfts[nfts.length - 1].assetId;

      // Add delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      // eslint-disable-next-line no-constant-condition
    } while (true);

    return allNfts;
  }

  /**
   * Stream NFTs with pagination - yields each page as it loads
   */
  private async *fetchNftsStream(
    address: string,
  ): AsyncGenerator<NftAssetDetail[]> {
    let after: string | null = null;

    do {
      const url = new URL(
        `assets/nft/${address}/limit/${MAX_NFT_ITEMS}`,
        this.getNode(),
      );

      if (after) {
        url.searchParams.set('after', after);
      }

      const response = await fetch(url, {
        headers: {
          accept: 'application/json; large-significand-format=string',
        },
      });

      if (!response.ok) {
        throw response;
      }

      const nfts = (await response.json()) as NftAssetDetail[];

      if (!Array.isArray(nfts) || nfts.length === 0) {
        break;
      }

      // Yield current page immediately
      yield nfts;

      // If we got less than MAX_NFT_ITEMS, we've reached the end
      if (nfts.length < MAX_NFT_ITEMS) {
        break;
      }

      // Set 'after' to the last NFT's assetId for next page
      after = nfts[nfts.length - 1].assetId;

      // Add delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } while (true);
  }

  private async fetchAliases(address: string): Promise<string[]> {
    const url = new URL(`alias/by-address/${address}`, this.getNode());
    const response = await fetch(url, {
      headers: { accept: 'application/json' },
    });

    if (!response.ok) {
      throw response;
    }

    const aliases = (await response.json()) as string[];
    return Array.isArray(aliases) ? aliases : [];
  }
}
