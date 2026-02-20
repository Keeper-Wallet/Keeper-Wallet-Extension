import { TRANSACTION_TYPE } from '@waves/ts-types';
import { type Unit0PayloadUnion, type Unit0Transfer } from 'balances/types';
import { Unit0Api } from 'controllers/api/unit0Api';
import { NetworkName } from 'networks/types';

import {
  type ITransactionStrategy,
  type TransactionFetchResult,
  type TransactionFilter,
} from '../../interfaces/ITransactionStrategy';
import {
  type Unit0TokenTransfer,
  type Unit0TokenTransferResponse,
  type Unit0Transaction,
  type Unit0TransactionResponse,
} from '../../interfaces/IUnit0Types';

export class Unit0TransactionStrategy implements ITransactionStrategy {
  readonly networkType = 'unit0' as const;
  private unit0Api: Unit0Api;
  private creatorCache: Map<string, string> = new Map(); // Cache token contract -> creator address

  constructor() {
    this.unit0Api = new Unit0Api();
  }

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
    const nativeTransactions = unit0Txs
      .map((tx: Unit0Transaction) =>
        this.convertUnit0ToTransaction(tx, address),
      )
      .filter(tx => {
        if (tx.type !== TRANSACTION_TYPE.ETHEREUM) return true;
        const p = (tx as Unit0Transfer).payload as Unit0PayloadUnion;
        // Hide native UNIT0 entries with zero amount (0.0000 UNIT0)
        const isUnit0 = 'tokenSymbol' in p && p.tokenSymbol === 'UNIT0';
        const amountStr =
          'amount' in p && typeof p.amount === 'string'
            ? p.amount
            : String('amount' in p ? p.amount ?? '' : '');
        const isZero = amountStr === '0';
        return !(isUnit0 && isZero);
      });

    const tokenTransactions = await Promise.all(
      tokenTransfers.map((transfer: Unit0TokenTransfer) =>
        this.convertTokenTransferToTransaction(transfer, address, network),
      ),
    );

    // Merge and sort by timestamp → position → nonce (most recent first)
    const allTransactions = [...nativeTransactions, ...tokenTransactions].sort(
      (a, b) => {
        // First sort by timestamp (block time)
        const aTime = 'timestamp' in a.payload ? a.payload.timestamp || 0 : 0;
        const bTime = 'timestamp' in b.payload ? b.payload.timestamp || 0 : 0;

        if (bTime !== aTime) {
          return bTime - aTime;
        }

        // If timestamps are equal, sort by position within block
        const aPosition = 'position' in a.payload ? a.payload.position || 0 : 0;
        const bPosition = 'position' in b.payload ? b.payload.position || 0 : 0;

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
      hasMore: unit0Txs.length === limit || tokenTransfers.length === limit,
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
    const toAddress = unit0Tx.to?.hash;
    const createdContract = unit0Tx.created_contract?.hash;
    const recipient = toAddress;
    const isOutgoing = sender?.toLowerCase() === address.toLowerCase();
    const isIncoming = recipient?.toLowerCase() === address.toLowerCase();
    const timestamp = new Date(unit0Tx.timestamp).getTime();

    // For native coin transfers, asset is null (UNIT0 native token)
    const assetId = null;

    const isContractCreation = !unit0Tx.to && !!unit0Tx.created_contract;
    const isContractCall = Boolean(
      unit0Tx.to?.is_contract || unit0Tx.method || unit0Tx.decoded_input,
    );

    // Contract creation or contract call -> map as invocation to avoid missing recipient
    if (isContractCreation || isContractCall) {
      const dApp = createdContract || toAddress || undefined;
      const fnName =
        unit0Tx.method ?? unit0Tx.decoded_input?.method_call ?? undefined;

      return {
        id: unit0Tx.hash,
        sender,
        type: TRANSACTION_TYPE.ETHEREUM,
        fee: unit0Tx.fee?.value || '0',
        payload: {
          type: 'invocation' as const,
          height: unit0Tx.block_number,
          timestamp,
          // for completeness
          sender,
          recipient: toAddress ?? '',
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
          // invocation-specific
          dApp,
          call: fnName ? { function: fnName } : undefined,
        },
      };
    }

    // Simple EOA -> EOA coin transfer
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
        recipient: recipient ?? '',
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

  private async convertTokenTransferToTransaction(
    transfer: Unit0TokenTransfer,
    address: string,
    network: NetworkName,
  ): Promise<Unit0Transfer> {
    // Check if this is a token minting transaction
    const isTokenMinting = transfer.type === 'token_minting';

    let sender = transfer.from?.hash;
    const recipient = transfer.to?.hash;
    const tokenContractAddress =
      transfer.token.address || transfer.token.address_hash;

    // For token minting, we need to get the token creator as the sender
    // The creator is the one who deployed the contract
    if (isTokenMinting && tokenContractAddress) {
      // Check cache first
      if (!this.creatorCache.has(tokenContractAddress)) {
        try {
          const contractInfo = await this.unit0Api.fetchContractInfo(
            tokenContractAddress,
            network,
          );
          const creatorAddress = contractInfo?.creator_address_hash;
          if (creatorAddress) {
            this.creatorCache.set(tokenContractAddress, creatorAddress);
            sender = creatorAddress;
          }
        } catch {
          // Keep original sender if fetch fails
        }
      } else {
        const cachedCreator = this.creatorCache.get(tokenContractAddress);
        if (cachedCreator) {
          sender = cachedCreator;
        }
      }
    }

    const isOutgoing = sender?.toLowerCase() === address.toLowerCase();
    const isIncoming = recipient?.toLowerCase() === address.toLowerCase();
    const timestamp = new Date(transfer.timestamp).getTime();

    // Use token contract address as asset ID (convert undefined to null)
    const assetId =
      transfer.token.address || transfer.token.address_hash || null;

    // Normalize NFT vs ERC-20 specifics
    const tokenType = transfer.token.type;
    const upperType = tokenType ? tokenType.toUpperCase() : undefined;
    const isErc721 = upperType === 'ERC-721';
    const isErc1155 = upperType === 'ERC-1155';

    let amount = transfer.total.value;
    let tokenDecimals = transfer.token.decimals;

    if (isErc721) {
      amount = '1';
      tokenDecimals = '0';
    } else if (isErc1155) {
      // Keep actual amount for 1155 but decimals must be 0
      tokenDecimals = '0';
    }

    const tokenId = isErc721 || isErc1155 ? transfer.total.token_id : undefined;

    // Determine transaction type based on minting status
    // If it's a minting transaction and current user is the creator, show as Issue
    // Otherwise show as incoming transfer
    const txType =
      isTokenMinting && isOutgoing
        ? TRANSACTION_TYPE.ISSUE // User is minting their own NFT
        : TRANSACTION_TYPE.ETHEREUM; // Regular transfer or receiving minted NFT

    return {
      id: `${transfer.transaction_hash}-${transfer.log_index || 0}`,
      sender,
      type: txType,
      fee: '0', // Fee is in the native transaction
      payload: {
        type: 'transfer' as const,
        height: transfer.block_number || 0,
        timestamp,
        sender,
        recipient,
        amount,
        asset: assetId,
        tokenSymbol: transfer.token.symbol,
        tokenName: transfer.token.name,
        tokenDecimals,
        tokenId,
        tokenType:
          (isErc721 && 'ERC-721') || (isErc1155 && 'ERC-1155') || undefined,
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
