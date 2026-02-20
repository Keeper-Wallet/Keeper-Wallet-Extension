import { type MultiWallet } from '../../../services/types';
import { type IMultiWalletCreationStrategy } from '../interfaces/IMultiWalletCreationStrategy';
import { type IWalletFactory } from '../interfaces/IWalletFactory';
import {
  type CreateMultiWalletInput,
  type MultiWalletCreationResult,
  type ValidationResult,
} from '../interfaces/types';
import { DebugMultiWalletStrategy } from '../strategies/DebugMultiWalletStrategy';
import { SeedWalletStrategy } from '../strategies/SeedWalletStrategy';
import { WavesEncodedSeedStrategy } from '../strategies/WavesEncodedSeedStrategy';
import { WavesLedgerWalletStrategy } from '../strategies/WavesLedgerWalletStrategy';
import { WavesPrivateKeyStrategy } from '../strategies/WavesPrivateKeyStrategy';
import { WavesWxWalletStrategy } from '../strategies/WavesWxWalletStrategy';

export class WalletFactory implements IWalletFactory {
  async createWallet(
    input: CreateMultiWalletInput,
  ): Promise<MultiWalletCreationResult> {
    try {
      const validation = this.validateInput(input);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const strategy = this.#selectStrategy(input);
      const baseWallet = this.#createBaseWallet(input, strategy);
      await this.#populateBlockchainAddresses(baseWallet, input, strategy);

      return {
        success: true,
        wallet: baseWallet,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error : new Error('Unknown error occurred'),
      };
    }
  }

  validateInput(input: CreateMultiWalletInput): ValidationResult {
    const errors: string[] = [];

    if (!input.name || input.name.trim().length === 0) {
      errors.push('Wallet name is required');
    }

    if (!input.type) {
      errors.push('Wallet type is required');
    }

    if (!input.blockchains || input.blockchains.length === 0) {
      errors.push('At least one blockchain must be selected');
    }

    if (!input.networks || Object.keys(input.networks).length === 0) {
      errors.push('Network configuration is required');
    }

    try {
      const strategy = this.#selectStrategy(input);
      const strategyValidation = strategy.validateInput(input);
      if (!strategyValidation.isValid) {
        errors.push(...strategyValidation.errors);
      }
    } catch (strategyError) {
      errors.push(
        `Strategy selection failed: ${(strategyError as Error).message}`,
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  supportedWalletTypes(): string[] {
    return ['seed', 'privateKey', 'ledger', 'debug', 'wx', 'encodedSeed'];
  }

  getSupportedBlockchains(walletType: string): string[] {
    try {
      const mockInput = {
        type: walletType,
        name: 'mock',
        blockchains: [],
        networks: {},
      } as unknown as CreateMultiWalletInput;
      const strategy = this.#selectStrategy(mockInput);

      const supportedBlockchains: string[] = [];
      if (strategy.supportsBlockchain('waves')) {
        supportedBlockchains.push('waves');
      }
      if (strategy.supportsBlockchain('unit0')) {
        supportedBlockchains.push('unit0');
      }

      return supportedBlockchains;
    } catch {
      return ['waves'];
    }
  }

  supportsMultiBlockchain(walletType: string): boolean {
    const supportedBlockchains = this.getSupportedBlockchains(walletType);
    return supportedBlockchains.length > 1;
  }

  getAvailableNetworks(blockchainType: string): string[] {
    switch (blockchainType) {
      case 'waves':
        return ['mainnet', 'testnet', 'stagenet', 'custom'];
      case 'unit0':
        return ['mainnet', 'testnet'];
      default:
        return [];
    }
  }

  #selectStrategy(input: CreateMultiWalletInput): IMultiWalletCreationStrategy {
    let strategy: IMultiWalletCreationStrategy;

    switch (input.type) {
      case 'seed':
        if (!('seed' in input) || !input.seed) {
          throw new Error('Seed is required for seed wallet');
        }
        strategy = new SeedWalletStrategy(input.seed);
        break;

      case 'privateKey':
        if (!('privateKey' in input) || !input.privateKey) {
          throw new Error('Private key is required for private key wallet');
        }
        strategy = new WavesPrivateKeyStrategy(input.privateKey);
        break;

      case 'encodedSeed':
        if (!('encodedSeed' in input) || !input.encodedSeed) {
          throw new Error('Encoded seed is required for encoded seed wallet');
        }
        strategy = new WavesEncodedSeedStrategy(input.encodedSeed);
        break;

      case 'wx':
        if (
          !('uuid' in input) ||
          !input.uuid ||
          !('username' in input) ||
          !input.username ||
          !('publicKey' in input) ||
          !input.publicKey ||
          !('address' in input) ||
          !input.address
        ) {
          throw new Error(
            'UUID, username, publicKey, and address are required for WX wallet',
          );
        }
        strategy = new WavesWxWalletStrategy(
          input.uuid,
          input.username,
          input.publicKey,
          input.address,
        );
        break;

      case 'ledger':
        if (
          !('id' in input) ||
          input.id === undefined ||
          !('publicKey' in input) ||
          !input.publicKey ||
          !('address' in input) ||
          !input.address
        ) {
          throw new Error(
            'ID, publicKey, and address are required for Ledger wallet',
          );
        }
        strategy = new WavesLedgerWalletStrategy(
          input.id,
          input.publicKey,
          input.address,
        );
        break;

      case 'debug':
        if (!('address' in input) || !input.address) {
          throw new Error('Debug address is required for debug wallet');
        }
        strategy = new DebugMultiWalletStrategy(
          input.address,
          input.unit0Address,
        );
        break;

      default:
        throw new Error(
          `Unsupported wallet type: ${(input as CreateMultiWalletInput).type}`,
        );
    }

    if (!strategy.canHandle(input)) {
      throw new Error(
        `Selected strategy cannot handle input for wallet type: ${input.type}`,
      );
    }

    return strategy;
  }

  #createBaseWallet(
    input: CreateMultiWalletInput,
    strategy: IMultiWalletCreationStrategy,
  ): MultiWallet {
    const now = Date.now();
    return {
      id: crypto.randomUUID(),
      name: input.name,
      type: strategy.getWalletType(),
      createdAt: now,
      lastUsed: now,
      coins: {} as MultiWallet['coins'],
      ...strategy.getAuthData(),
    };
  }

  async #populateBlockchainAddresses(
    multiWallet: MultiWallet,
    input: CreateMultiWalletInput,
    strategy: IMultiWalletCreationStrategy,
  ): Promise<void> {
    if (input.blockchains.includes('waves') && input.networks.waves) {
      try {
        const wavesData = await strategy.createWavesAddresses(
          input.networks.waves,
          input.customCode ?? undefined,
        );
        multiWallet.coins.waves = wavesData as typeof multiWallet.coins.waves;
      } catch (error) {
        throw new Error(
          `Failed to create Waves addresses: ${(error as Error).message}`,
        );
      }
    }

    if (input.blockchains.includes('unit0') && input.networks.unit0) {
      try {
        if (!strategy.supportsBlockchain('unit0')) {
          return;
        }

        const unit0Data = await strategy.createUnit0Addresses(
          input.networks.unit0,
        );
        multiWallet.coins.unit0 = unit0Data as typeof multiWallet.coins.unit0;
      } catch (error) {
        if (
          (error as Error).message.includes('not supported') ||
          (error as Error).message.includes('not yet implemented')
        ) {
          // Skip Unit0 for unsupported strategies
        } else {
          throw new Error(
            `Failed to create Unit0 addresses: ${(error as Error).message}`,
          );
        }
      }
    }

    if (Object.keys(multiWallet.coins).length === 0) {
      throw new Error(
        'No blockchain addresses were created - check your input configuration',
      );
    }
  }
}
