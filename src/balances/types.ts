import { TransactionFromNode } from '@waves/ts-types';
import { AssetDetail } from 'assets/types';
import { NetworkName } from 'networks/types';

export interface AssetBalance {
  balance: string;
  sponsorBalance: string;
  minSponsoredAssetFee: string | null;
}

export interface BalancesItem {
  aliases?: string[];
  assets?: Record<string, AssetBalance>;
  available: string;
  leasedOut: string;
  network: NetworkName;
  nfts?: AssetDetail[];
  txHistory?: TransactionFromNode[];
}
