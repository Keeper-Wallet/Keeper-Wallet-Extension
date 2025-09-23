import { type TRANSACTION_TYPE } from '@waves/marshall/dist/schemas';
import {
  type EthereumTransactionFields,
  type TransactionFromNode,
} from '@waves/ts-types';
import { type AssetDetail } from 'assets/types';
import { type NetworkName } from 'networks/types';

// Extract and modify the transfer payload type to support both string and numeric types
type TransferPayload = Omit<
  Extract<EthereumTransactionFields['payload'], { type: 'transfer' }>,
  'type'
> & {
  type: 'transfer' | 4 | 'invocation';
};

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
  // Invocation payload properties (optional for compatibility)
  dApp?: string;
  call?: { function?: string };
};

// Create a union type that explicitly includes all possible payload types
export type Unit0PayloadUnion =
  | Unit0TransferPayload
  | Extract<EthereumTransactionFields['payload'], { type: 'invocation' }>;

export type Unit0Transfer = {
  id?: string;
  type: TRANSACTION_TYPE;
  fee: string;
  sender?: string;
  recipient?: string;
  payload: Unit0PayloadUnion;
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
  txHistory?: TransactionFromNode[] | Unit0Transfer[];
}
