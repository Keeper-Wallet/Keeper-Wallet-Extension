import { TRANSACTION_TYPE } from '@waves/ts-types';
import { type Unit0Transfer } from 'balances/types';
import { NetworkName } from 'networks/types';

import {
  type ITransactionStrategy,
  type TransactionFetchResult,
  type TransactionFilter,
} from '../../interfaces/ITransactionStrategy';
import {
  type Unit0Transaction,
  type Unit0TokenTransfer,
  type Unit0TokenTransferResponse,
  type Unit0TransactionResponse,
} from '../../interfaces/IUnit0Types';

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

    // Fetch both native transactions and token transfers in parallel
    const [nativeResponse, tokenResponse] = await Promise.all([
      fetch(`${baseUrl}${address}/transactions`),
      fetch(`${baseUrl}${address}/token-transfers?type=`),
    ]);

    if (!nativeResponse.ok) {
      throw new Error(
        `Unit0 transaction fetch failed: ${nativeResponse.status}`,
      );
    }

    if (!tokenResponse.ok) {
      throw new Error(
        `Unit0 token transfer fetch failed: ${tokenResponse.status}`,
      );
    }

    const nativeData: Unit0TransactionResponse = await nativeResponse.json();
    const tokenData: Unit0TokenTransferResponse = await tokenResponse.json();

    const unit0Txs = Array.isArray(nativeData.items) ? nativeData.items : [];
    const tokenTransfers = Array.isArray(tokenData.items)
      ? tokenData.items
      : [];

    // Convert both types to internal format
    const nativeTransactions = unit0Txs.map((tx: Unit0Transaction) =>
      this.convertUnit0ToTransaction(tx, address),
    );

    const tokenTransactions = tokenTransfers.map(
      (transfer: Unit0TokenTransfer) =>
        this.convertTokenTransferToTransaction(transfer, address),
    );

    // Merge and sort by timestamp → position → nonce (most recent first)
    const allTransactions = [...nativeTransactions, ...tokenTransactions].sort(
      (a, b) => {
        // First sort by timestamp (block time)
        const aTime =
          'timestamp' in a.payload ? a.payload.timestamp || 0 : 0;
        const bTime =
          'timestamp' in b.payload ? b.payload.timestamp || 0 : 0;
        
        if (bTime !== aTime) {
          return bTime - aTime;
        }

        // If timestamps are equal, sort by position within block
        const aPosition =
          'position' in a.payload ? a.payload.position || 0 : 0;
        const bPosition =
          'position' in b.payload ? b.payload.position || 0 : 0;
        
        if (bPosition !== aPosition) {
          return bPosition - aPosition;
        }

        // If positions are equal, sort by nonce (transaction sequence)
        const aNonce = 'nonce' in a.payload ? a.payload.nonce || 0 : 0;
        const bNonce = 'nonce' in b.payload ? b.payload.nonce || 0 : 0;
        
        return bNonce - aNonce;
      },
    );

    return {
      transactions: allTransactions as Unit0Transfer[],
      hasMore:
        unit0Txs.length === limit || tokenTransfers.length === limit,
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
        position: unit0Tx.position,
        nonce: unit0Tx.nonce,
      },
    };
  }

  private convertTokenTransferToTransaction(
    transfer: Unit0TokenTransfer,
    address: string,
  ): Unit0Transfer {
    const sender = transfer.from?.hash;
    const recipient = transfer.to?.hash;
    const isOutgoing = sender?.toLowerCase() === address.toLowerCase();
    const isIncoming = recipient?.toLowerCase() === address.toLowerCase();
    const timestamp = new Date(transfer.timestamp).getTime();

    // Use token contract address as asset ID (convert undefined to null)
    const assetId =
      transfer.token.address || transfer.token.address_hash || null;

    return {
      id: `${transfer.transaction_hash}-${transfer.log_index || 0}`,
      sender,
      type: TRANSACTION_TYPE.ETHEREUM,
      fee: '0', // Fee is in the native transaction
      payload: {
        type: 'transfer' as const,
        height: transfer.block_number || 0,
        timestamp,
        sender,
        recipient,
        amount: transfer.total.value,
        asset: assetId,
        tokenSymbol: transfer.token.symbol,
        tokenName: transfer.token.name,
        tokenDecimals: transfer.token.decimals,
        fromName: transfer.from?.name ?? undefined,
        toName: transfer.to?.name ?? undefined,
        isIncoming,
        isOutgoing,
        position: transfer.log_index,
        nonce: undefined,
      },
    };
  }
}
