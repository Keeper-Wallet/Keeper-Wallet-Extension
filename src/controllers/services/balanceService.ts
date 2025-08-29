import { type AssetBalance, type BalancesItem } from '../../balances/types';
import { NetworkName } from '../../networks/types';
import {
  Unit0Api,
  type Unit0BalanceResponse,
  type Unit0TokenBalance,
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
  ): Promise<BalancesItem> {
    const balanceData =
      data || (await this.unit0Api.fetchBalance(address, network));
    const tokenData =
      tokens || (await this.unit0Api.fetchTokenBalances(address, network));

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

  async fetchUnit0Balance(
    address: string,
    network: NetworkName,
  ): Promise<BalancesItem> {
    try {
      const { balance, tokens } = await this.unit0Api.fetchBalanceAndTokens(
        address,
        network,
      );
      return this.buildUnit0Balance(address, network, balance, tokens);
    } catch (error) {
      console.error('Error fetching unit0 balance:', error);
      return this.buildUnit0Balance(
        address,
        network,
        { coin_balance: '0' },
        [],
      );
    }
  }

  isUnit0Network(blockchainType: string): boolean {
    const result = blockchainType === 'unit0';
    return result;
  }
}
