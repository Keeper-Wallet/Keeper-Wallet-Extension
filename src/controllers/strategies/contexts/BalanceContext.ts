import { BLOCKCHAIN_TYPES } from 'assets/constants';
import { type AssetInfoController } from 'controllers/assetInfo';
import { type NetworkName } from 'networks/types';

import { type NftInfoController } from '../../NftInfoController';
import { Unit0AssetInfoStrategy } from '../implementations/assetInfoStrategy/Unit0AssetInfoStrategy';
import { WavesAssetInfoStrategy } from '../implementations/assetInfoStrategy/WavesAssetInfoStrategy';
import { Unit0BalanceStrategy } from '../implementations/balanceStrategy/Unit0BalanceStrategy';
import { WavesBalanceStrategy } from '../implementations/balanceStrategy/WavesBalanceStrategy';
import {
  type BalanceFetchResult,
  type IBalanceStrategy,
} from '../interfaces/IBalanceStrategy';
import { TransactionContext } from './TransactionContext';

/**
 * Balance Context - Strategy Pattern Context for Balance Operations
 * Manages balance fetching strategies and switches between them based on blockchain type
 */
export class BalanceContext {
  private strategy!: IBalanceStrategy;
  private readonly wavesStrategy: WavesBalanceStrategy;
  private readonly unit0Strategy: Unit0BalanceStrategy;
  private transactionContext: TransactionContext;
  private readonly getNode: () => string;

  constructor(
    getNode: () => string,
    assetInfoController: AssetInfoController,
    nftInfoController: NftInfoController,
  ) {
    this.getNode = getNode;

    const wavesAssetInfoStrategy = new WavesAssetInfoStrategy(
      assetInfoController,
      nftInfoController,
    );
    const unit0AssetInfoStrategy = new Unit0AssetInfoStrategy(
      assetInfoController,
      nftInfoController,
    );

    this.wavesStrategy = new WavesBalanceStrategy(
      getNode,
      wavesAssetInfoStrategy,
    );
    this.unit0Strategy = new Unit0BalanceStrategy(unit0AssetInfoStrategy);
    this.transactionContext = new TransactionContext(
      BLOCKCHAIN_TYPES.WAVES,
      getNode,
    );
    this.strategy = this.wavesStrategy;
  }

  /**
   * Set the balance strategy based on blockchain type
   * @param blockchainType - The blockchain type ('waves', 'unit0', etc.)
   */
  setStrategy(blockchainType: string): void {
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
    const txHistoryResult = await this.transactionContext.fetchTransactions(
      address,
      network,
    );

    return this.strategy.fetchBalance(
      address,
      network,
      txHistoryResult.transactions,
    );
  }
}
