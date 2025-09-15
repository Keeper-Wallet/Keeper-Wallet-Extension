import { NetworkName } from '../../../networks/types';
import { TransactionFromNode } from '@waves/ts-types';

export interface TransactionFilter {
  limit?: number;
  offset?: number;
  fromHeight?: number;
  toHeight?: number;
  transactionTypes?: string[];
}

export interface TransactionFetchResult {
  transactions: TransactionFromNode[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface ITransactionStrategy {
  readonly networkType: 'waves' | 'unit0';
  
  fetchTransactions(
    address: string,
    network: NetworkName,
    filter?: TransactionFilter
  ): Promise<TransactionFetchResult>;
  
  fetchTransactionById(
    txId: string,
    network: NetworkName
  ): Promise<TransactionFromNode | null>;
}
