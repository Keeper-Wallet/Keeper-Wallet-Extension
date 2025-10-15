import { TRANSACTION_TYPE } from '@waves/ts-types';
import { type Unit0Transfer } from 'balances/types';
import { NetworkName } from 'networks/types';

import {
  type ITransactionStrategy,
  type TransactionFetchResult,
  type TransactionFilter,
} from '../../interfaces/ITransactionStrategy';
import { type Unit0Transaction } from '../../interfaces/IUnit0Types';

export class Unit0TransactionStrategy implements ITransactionStrategy {
  readonly networkType = 'unit0' as const;

  constructor() {}

  private getBaseUrl(network: NetworkName): string {
    if (network === NetworkName.Testnet || network === NetworkName.Stagenet) {
      return 'https://explorer-testnet.unit0.dev/api/v2/addresses/';
    }
    return 'https://explorer.unit0.dev/api/v2/addresses/';
  }

  async fetchTransactions(
    address: string,
    network: NetworkName,
    filter: TransactionFilter = {},
  ): Promise<TransactionFetchResult> {
    const limit = filter.limit || 50;
    const baseUrl = this.getBaseUrl(network);

    const response = await fetch(`${baseUrl}${address}/transactions`);

    if (!response.ok) {
      throw new Error(`Unit0 transaction fetch failed: ${response.status}`);
    }

    const data = await response.json();
    const unit0Txs = Array.isArray(data.items) ? data.items : [];

    // Convert Unit0 transactions to internal format
    const transactions = unit0Txs.map((tx: Unit0Transaction) =>
      this.convertUnit0ToTransaction(tx, address),
    );

    return {
      transactions: transactions as Unit0Transfer[],
      hasMore: unit0Txs.length === limit,
    };
  }

  async fetchTransactionById(): Promise<Unit0Transfer | null> {
    // Unit0 API doesn't have single transaction endpoint in current implementation
    // This would need to be implemented based on Unit0 API capabilities
    return null;
  }

  private convertUnit0ToTransaction(
    unit0Tx: Unit0Transaction,
    address: string,
  ): Unit0Transfer {
    const sender = unit0Tx.from?.hash;
    const recipient = unit0Tx.to?.hash;
    const isOutgoing = sender?.toLowerCase() === address.toLowerCase();
    const isIncoming = recipient?.toLowerCase() === address.toLowerCase();
    const timestamp = new Date(unit0Tx.timestamp).getTime();

    // For native coin transfers, asset is null (UNIT0 native token)
    // For token transfers, we would get it from token_transfers array
    const assetId = null;

    return {
      id: unit0Tx.hash,
      sender,
      type: TRANSACTION_TYPE.ETHEREUM,
      fee: unit0Tx.fee?.value || '0',
      payload: {
        type: 'transfer' as const,
        height: unit0Tx.block_number,
        timestamp,
        sender,
        recipient,
        amount: unit0Tx.value || '0',
        asset: assetId,
        tokenSymbol: 'UNIT0',
        tokenName: 'UNIT0',
        tokenDecimals: '18',
        fromName: unit0Tx.from?.name ?? undefined,
        toName: unit0Tx.to?.name ?? undefined,
        isIncoming,
        isOutgoing,
      },
    };
  }
}
