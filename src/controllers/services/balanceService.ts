import { BigNumber } from '@waves/bignumber';
import { type TransactionFromNode } from '@waves/ts-types';
import { type AssetBalance, type BalancesItem } from 'balances/types';
import { NetworkName, type NetworkProfile } from 'networks/types';
import { type NftAssetDetail } from 'nfts/types';

import { Unit0Api, type Unit0BalanceResponse, type Unit0TokenBalance } from '../api/unit0Api';
import { WavesApi, type WavesAssetsResponse, type WavesBalanceResponse } from '../api/wavesApi';

export class BalanceService {
  private wavesApi: WavesApi;
  private unit0Api: Unit0Api;

  constructor(getNode: () => string) {
    this.wavesApi = new WavesApi(getNode);
    this.unit0Api = new Unit0Api();
  }

  async buildUnit0Balance(
    address: string,
    network: NetworkProfile,
    data?: Unit0BalanceResponse,
    tokens?: Unit0TokenBalance[]
  ): Promise<BalancesItem> {
    const networkName = this.getNetworkName(network);
    const balanceData = data || await this.unit0Api.fetchBalance(address, networkName);
    const tokenData = tokens || await this.unit0Api.fetchTokenBalances(address, networkName);

    const unit0AssetBalance: AssetBalance = {
      balance: balanceData.coin_balance || '0',
      sponsorBalance: balanceData.coin_balance || '0',
      minSponsoredAssetFee: null,
    };

    const assets: Record<string, AssetBalance> = {
      unit0: unit0AssetBalance,
    };

    for (const token of tokenData) {
      assets[token.token_id] = {
        balance: token.balance || '0',
        sponsorBalance: token.balance || '0',
        minSponsoredAssetFee: null,
      };
    }

    return {
      available: balanceData.coin_balance || '0',
      regular: balanceData.coin_balance || '0',
      leasedOut: '0',
      network,
      assets,
    };
  }

  async buildWavesBalance(
    address: string,
    network: NetworkProfile,
    wavesBalance: WavesBalanceResponse,
    assetsBalance: WavesAssetsResponse,
    aliases: string[],
    txHistory: TransactionFromNode[],
    nfts: NftAssetDetail[]
  ): Promise<BalancesItem> {
    const wavesAssetBalance: AssetBalance = {
      minSponsoredAssetFee: '100000',
      sponsorBalance: wavesBalance.available,
      balance: wavesBalance.available,
    };

    const assets = Object.fromEntries([
      ['WAVES', wavesAssetBalance],
      ...assetsBalance.balances.map(info => {
        const assetBalance: AssetBalance = {
          minSponsoredAssetFee: info.minSponsoredAssetFee,
          sponsorBalance: info.sponsorBalance,
          balance: info.balance,
        };
        return [info.assetId, assetBalance];
      }),
    ]);

    const mappedNfts = nfts.map(nft => ({
      id: nft.assetId,
      name: nft.name,
      precision: nft.decimals,
      description: nft.description,
      height: nft.issueHeight,
      timestamp: new Date(nft.issueTimestamp).toJSON() as unknown as Date,
      sender: nft.issuer,
      quantity: nft.quantity,
      reissuable: nft.reissuable,
      hasScript: nft.scripted,
      displayName: nft.name,
      minSponsoredFee: nft.minSponsoredAssetFee ?? undefined,
      originTransactionId: nft.originTransactionId,
      issuer: nft.issuer,
    }));

    return {
      aliases,
      available: wavesBalance.available,
      regular: wavesBalance.regular,
      leasedOut: new BigNumber(wavesBalance.regular)
        .sub(wavesBalance.available)
        .toString(),
      network,
      txHistory,
      assets,
      nfts: mappedNfts,
    };
  }

  private getNetworkName(network: NetworkProfile): NetworkName {
    switch (network) {
      case 'mainnet':
        return NetworkName.Mainnet;
      case 'testnet':
        return NetworkName.Testnet;
      default:
        return NetworkName.Mainnet;
    }
  }

  async fetchUnit0Balance(address: string, network: NetworkProfile): Promise<BalancesItem> {
    try {
      const networkName = this.getNetworkName(network);
      const { balance, tokens } = await this.unit0Api.fetchBalanceAndTokens(address, networkName);
      return this.buildUnit0Balance(address, network, balance, tokens);
    } catch (error) {
      console.error('Error fetching unit0 balance:', error);
      return this.buildUnit0Balance(address, network, { coin_balance: '0' }, []);
    }
  }

  async fetchWavesBalanceData(address: string) {
    return Promise.all([
      this.wavesApi.fetchBalance(address),
      this.wavesApi.fetchAssetsBalance(address),
      this.wavesApi.fetchNfts(address),
      this.wavesApi.fetchAliases(address),
      this.wavesApi.fetchTxHistory(address),
    ]);
  }

  async updateMultipleWavesBalances(addresses: string[]): Promise<Array<{
    id: string;
    balance: string;
  }>> {
    const results: Array<{ id: string; balance: string }> = [];
    
    while (addresses.length > 0) {
      const batch = addresses.splice(0, 1000);
      try {
        const batchResults = await this.wavesApi.fetchMultipleBalances(batch);
        results.push(...batchResults);
      } catch (error) {
        console.error('Error updating waves balances batch:', error);
      }
    }
    
    return results;
  }
} 
