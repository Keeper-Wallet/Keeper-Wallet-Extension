import { BigNumber } from '@waves/bignumber';

export interface AssetDetail {
  description: string;
  displayName: string;
  hasScript?: boolean;
  height: number;
  id: string;
  isFavorite?: boolean;
  issuer?: string;
  isSuspicious?: boolean;
  lastUpdated?: number;
  minSponsoredFee?: BigNumber | string | number;
  name: string;
  originTransactionId?: string;
  precision: number;
  quantity: BigNumber | string | number;
  reissuable: boolean;
  sender: string;
  ticker?: string;
  timestamp: Date;
}
