import { TransactionFromNode } from '@waves/ts-types';
import { NetworkName } from '../../../networks/types';
import { MAX_TX_HISTORY_ITEMS } from '../../../constants';
import { ITransactionStrategy, TransactionFilter, TransactionFetchResult } from '../interfaces/ITransactionStrategy';

export class WavesTransactionStrategy implements ITransactionStrategy {
  readonly networkType = 'waves' as const;

  constructor(private getNode: () => string) {}

  async fetchTransactions(
    address: string,
    network: NetworkName,
    filter: TransactionFilter = {}
  ): Promise<TransactionFetchResult> {
    const limit = filter.limit || MAX_TX_HISTORY_ITEMS;
    const url = new URL(
      `transactions/address/${address}/limit/${limit}`,
      this.getNode()
    );

    const response = await fetch(url, {
      headers: {
        accept: 'application/json; large-significand-format=string',
      },
    });

    if (!response.ok) {
      throw new Error(`Waves transaction fetch failed: ${response.status}`);
    }

    const json = (await response.json()) as [TransactionFromNode[]];
    const transactions = json[0];

    return {
      transactions,
      hasMore: transactions.length === limit,
    };
  }

  async fetchTransactionById(
    txId: string,
    network: NetworkName
  ): Promise<TransactionFromNode | null> {
    const url = new URL(`transactions/info/${txId}`, this.getNode());
    
    const response = await fetch(url, {
      headers: {
        accept: 'application/json; large-significand-format=string',
      },
    });

    if (!response.ok) {
      return null;
    }

    return response.json() as Promise<TransactionFromNode>;
  }
}
