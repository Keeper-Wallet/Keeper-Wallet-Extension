import { TRANSACTION_TYPE } from '@waves/ts-types';
import { type Unit0Transfer } from 'balances/types';
import { NetworkName } from 'networks/types';

import {
  type ITransactionStrategy,
  type TransactionFetchResult,
  type TransactionFilter,
} from '../../interfaces/ITransactionStrategy';
import { type Unit0NftTransfer } from '../../interfaces/IUnit0Types';

export class Unit0TransactionStrategy implements ITransactionStrategy {
  readonly networkType = 'unit0' as const;

  constructor() {}

  private getBaseUrl(network: NetworkName): string {
    if (network === NetworkName.Testnet || network === NetworkName.Stagenet) {
      return 'https://explorer-testnet.unit0.dev/api/v2/addresses/';
    }
    return 'https://explorer.unit0.dev/api/v2/addresses/';
  }

  private getMockAddress(network: NetworkName): string {
    return network === NetworkName.Testnet
      ? '0xE860EA6CF834Ca574A364e6B1Dc10A27102CaF84'
      : '0x145205f669f49F55727de5b542D9C1EACa03A246';
  }

  async fetchTransactions(
    address: string,
    network: NetworkName,
    filter: TransactionFilter = {},
  ): Promise<TransactionFetchResult> {
    const limit = filter.limit || 50;
    const baseUrl = this.getBaseUrl(network);
    const mockAddress = this.getMockAddress(network);

    const response = await fetch(
      `${baseUrl}${mockAddress}/token-transfers?type=&items_count=${limit}`,
    );

    if (!response.ok) {
      throw new Error(`Unit0 transaction fetch failed: ${response.status}`);
    }

    const data = await response.json();
    const unit0Transfers = Array.isArray(data.items) ? data.items : [];

    // Convert Unit0 transfers to TransactionFromNode format
    const transactions = unit0Transfers.map(
      (transfer: Unit0NftTransfer) =>
        this.convertUnit0ToTransaction(transfer, mockAddress),
      // TODO: need to delete after removing mock address)
    );

    return {
      transactions: transactions as Unit0Transfer[],
      hasMore: unit0Transfers.length === limit,
    };
  }

  async fetchTransactionById(): Promise<Unit0Transfer | null> {
    // Unit0 API doesn't have single transaction endpoint in current implementation
    // This would need to be implemented based on Unit0 API capabilities
    return null;
  }

  private convertUnit0ToTransaction(
    unit0Tx: Unit0NftTransfer,
    address: string,
  ): Unit0Transfer {
    const sender = unit0Tx.from?.hash;
    const recipient = unit0Tx.to?.hash;
    const isOutgoing = recipient === address;
    const isIncoming = sender === address;
    const timestamp = new Date(unit0Tx.timestamp).getTime();
    const assetId =
      unit0Tx.token.hash ?? unit0Tx.token.address_hash ?? unit0Tx.token.address;

    return {
      id: unit0Tx.transaction_hash,
      sender,
      type: TRANSACTION_TYPE.ETHEREUM,
      fee: '0',
      payload: {
        type: TRANSACTION_TYPE.TRANSFER,
        height: unit0Tx.block_number,
        timestamp,
        sender,
        recipient,
        amount: unit0Tx.total.value || '0',
        asset: assetId,
        tokenSymbol: unit0Tx.token.symbol,
        tokenName: unit0Tx.token.name,
        tokenDecimals: unit0Tx.token.decimals?.toString(),
        fromName: unit0Tx.from?.name,
        toName: unit0Tx.to?.name,
        isIncoming,
        isOutgoing,
      },
    };
  }
}
