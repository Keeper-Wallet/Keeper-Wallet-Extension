import { type TransactionFromNode } from '@waves/ts-types';
import {BLOCKCHAIN_TYPES } from 'assets/constants';
import { type Unit0Transfer } from 'balances/types';
import { type NetworkName } from 'networks/types';

import { Unit0TransactionStrategy } from '../implementations/transactionStrategy/Unit0TransactionStrategy';
import { WavesTransactionStrategy } from '../implementations/transactionStrategy/WavesTransactionStrategy';
import { type ITransactionStrategy, type TransactionFetchResult,type TransactionFilter } from '../interfaces/ITransactionStrategy';

export class TransactionContext {
  private strategy!: ITransactionStrategy;

  constructor(
    blockchainType: string,
    getNode?: () => string
  ) {
    this.setStrategy(blockchainType, getNode);
  }

  setStrategy(blockchainType: string, getNode?: () => string): void {
    switch (blockchainType) {
      case BLOCKCHAIN_TYPES.WAVES:
        if (!getNode) {
          throw new Error('getNode function required for Waves strategy');
        }
        this.strategy = new WavesTransactionStrategy(getNode);
        break;
      
      case BLOCKCHAIN_TYPES.UNIT0:
        this.strategy = new Unit0TransactionStrategy();
        break;
      
      default:
        throw new Error(`Unsupported blockchain type: ${blockchainType}`);
    }
  }

  async fetchTransactions(
    address: string,
    network: NetworkName,
    filter?: TransactionFilter
  ): Promise<TransactionFetchResult> {
    return this.strategy.fetchTransactions(address, network, filter);
  }

  async fetchTransactionById(
    txId: string,
    network: NetworkName
  ): Promise<TransactionFromNode | Unit0Transfer | null> {
    return this.strategy.fetchTransactionById(txId, network);
  }

  get networkType(): 'waves' | 'unit0' {
    return this.strategy.networkType;
  }
}
