import { type TransactionFromNode } from '@waves/ts-types';
import { type AssetDetail } from 'assets/types';
import { type NetworkName } from 'networks/types';

export interface AssetBalance {
  balance: string;
  sponsorBalance: string;
  minSponsoredAssetFee: string | null;
}

export type BalanceAssets = Partial<Record<string, AssetBalance>>;

export interface BalancesItem {
  aliases?: string[];
  assets?: BalanceAssets;
  available?: string;
  leasedOut?: string;
  regular?: string;
  network?: NetworkName;
  nfts?: AssetDetail[];
  txHistory?: TransactionFromNode[];
}
