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

    const unit0AssetBalance: AssetBalance = {
      balance: balanceData.coin_balance || '0',
      sponsorBalance: balanceData.coin_balance || '0',
      minSponsoredAssetFee: null,
    };

    const assets: Record<string, AssetBalance> = {
      unit0: unit0AssetBalance,
    };

    for (const token of tokenData) {
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

    // Convert Unit0 transactions to Waves-compatible format
    // Use the same mock address that was used to fetch the transactions
    const mockAddress =
      network === NetworkName.Testnet || network === NetworkName.Stagenet
        ? '0xE860EA6CF834Ca574A364e6B1Dc10A27102CaF84'
        : '0xA18Ea8fE573189e35bb4321adf04F0428d6C1612';

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
