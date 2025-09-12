import { type TRANSACTION_TYPE } from '@waves/marshall/dist/schemas';
import {
  type EthereumTransactionFields,
  type TransactionFromNode,
} from '@waves/ts-types';
import { type AssetDetail } from 'assets/types';
import { type NetworkName } from 'networks/types';

// Extract and extend the transfer payload type from EthereumTransactionFields for Unit0 transactions
type TransferPayload = Extract<
  EthereumTransactionFields['payload'],
  { type: 'transfer' }
>;

export type Unit0TransferPayload = TransferPayload & {
  tokenSymbol?: string;
  tokenName?: string;
  tokenDecimals?: string;
  fromName?: string;
  toName?: string;
  isIncoming?: boolean;
  isOutgoing?: boolean;
  timestamp?: number;
  height: number;
  sender: string;
};

export type Unit0Transfer = {
  id?: string;
  type: TRANSACTION_TYPE;
  fee: string;
  sender: string;
  payload: Unit0TransferPayload;
};

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
