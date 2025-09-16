import { BLOCKCHAIN_TYPES } from 'assets/constants';
import { AssetInfoController } from 'controllers/assetInfo';
import { NftInfoController } from '../../NftInfoController';
import { type NetworkName } from 'networks/types';

import { Unit0BalanceStrategy } from '../implementations/balanceStrategy/Unit0BalanceStrategy';
import { WavesBalanceStrategy } from '../implementations/balanceStrategy/WavesBalanceStrategy';
import { type BalanceFetchResult, type IBalanceStrategy } from '../interfaces/IBalanceStrategy';
import { TransactionContext } from './TransactionContext';

/**
 * Balance Context - Strategy Pattern Context for Balance Operations
 * Manages balance fetching strategies and switches between them based on blockchain type
 */
export class BalanceContext {
  private strategy!: IBalanceStrategy;
  private wavesStrategy: WavesBalanceStrategy;
  private unit0Strategy: Unit0BalanceStrategy;
  private transactionContext: TransactionContext;
  private getNode: () => string;

  constructor(
    getNode: () => string,
    assetInfoController: AssetInfoController,
    nftInfoController: NftInfoController,
  ) {
    this.getNode = getNode;
    this.wavesStrategy = new WavesBalanceStrategy(getNode, assetInfoController, nftInfoController);
    this.unit0Strategy = new Unit0BalanceStrategy(assetInfoController, nftInfoController);
    this.transactionContext = new TransactionContext(BLOCKCHAIN_TYPES.WAVES, getNode);
    this.strategy = this.wavesStrategy;
  }

  /**
   * Set the balance strategy based on blockchain type
   * @param blockchainType - The blockchain type ('waves', 'unit0', etc.)
   */
  setStrategy(blockchainType: string): void {
    console.log('BalanceContext.setStrategy:', blockchainType);
    
    switch (blockchainType) {
      case BLOCKCHAIN_TYPES.WAVES:
        this.strategy = this.wavesStrategy;
        this.transactionContext.setStrategy(blockchainType, this.getNode);
        break;
      case BLOCKCHAIN_TYPES.UNIT0:
        this.strategy = this.unit0Strategy;
        this.transactionContext.setStrategy(blockchainType);
        break;
      default:
        throw new Error(`Unsupported blockchain type: ${blockchainType}`);
    }
  }

  /**
   * Fetch balance using the current strategy
   * @param address - The wallet address
   * @param network - The network name
   * @returns Promise resolving to balance fetch result
   */
  async fetchBalance(
    address: string,
    network: NetworkName,
  ): Promise<BalanceFetchResult> {
    console.log('BalanceContext.fetchBalance called with strategy:', this.strategy.constructor.name);
    
    // First fetch transactions using the transaction strategy
    const txHistoryResult = await this.transactionContext.fetchTransactions(address, network);
    
    // Then fetch balance using the balance strategy with the transactions
    return this.strategy.fetchBalance(address, network, txHistoryResult.transactions);
  }

  /**
   * Get the current strategy's blockchain type
   * @returns The blockchain type
   */
  getCurrentBlockchainType(): string {
    return this.strategy.getBlockchainType();
  }

  /**
   * Check if the current strategy can handle a specific blockchain type
   * @param blockchainType - The blockchain type to check
   * @returns True if the current strategy can handle the blockchain type
   */
  canHandleBlockchainType(blockchainType: string): boolean {
    return this.strategy.canHandle(blockchainType);
  }
}
