import { IMultiWalletCreationStrategy } from '../interfaces/IMultiWalletCreationStrategy';
import {
  WavesNetworkData,
  Unit0NetworkData,
  WalletAuthData,
  CreateMultiWalletInput,
  ValidationResult,
} from '../interfaces/types';
import { NetworkName } from '../../../networks/types';
import { NETWORK_CODES, type WalletItem } from '../../../services/types';
import { DebugWallet } from '../../../wallets/debug';

/**
 * Debug-based MultiWallet Creation Strategy
 */
export class DebugMultiWalletStrategy implements IMultiWalletCreationStrategy {
  constructor(
    private debugAddress: string,
    private unit0DebugAddress?: string,
  ) {}

  /**
   * Create Waves addresses for specified networks
   * Uses debug address for all networks
   */
  async createWavesAddresses(
    networks: NetworkName[],
    customCode?: string,
  ): Promise<WavesNetworkData> {
    const mainnetData: WalletItem = {
      address: this.debugAddress,
      networkCode: this.#getWavesNetworkCode(NetworkName.Mainnet)!,
    };

    const testnetData: WalletItem = {
      address: this.debugAddress,
      networkCode: this.#getWavesNetworkCode(NetworkName.Testnet)!,
    };

    const networkData: WavesNetworkData = {
      publicKey: 'debug-waves-public-key',
      networks: {
        mainnet: mainnetData,
        testnet: testnetData,
      },
    };

    // Add optional networks if requested
    for (const network of networks) {
      const networkCode = this.#getWavesNetworkCode(network, customCode);
      if (!networkCode) continue; // Skip if network code is not available

      switch (network) {
        case NetworkName.Stagenet:
          networkData.networks.stagenet = {
            address: this.debugAddress,
            networkCode,
          };
          break;
        case NetworkName.Custom:
          networkData.networks.custom = {
            address: this.debugAddress,
            networkCode,
          };
          break;
      }
    }

    return networkData;
  }

  /**
   * Create Unit0 addresses for specified networks
   * Uses debug address for all networks
   */
  async createUnit0Addresses(
    networks: NetworkName[],
  ): Promise<Unit0NetworkData> {
    if (!this.unit0DebugAddress) {
      throw new Error('Unit0 debug address is required for Unit0 support');
    }

    const mainnetData: WalletItem = {
      address: this.unit0DebugAddress,
      networkCode: this.#getUnit0NetworkCode(NetworkName.Mainnet),
    };

    const testnetData: WalletItem = {
      address: this.unit0DebugAddress,
      networkCode: this.#getUnit0NetworkCode(NetworkName.Testnet),
    };

    const networkData: Unit0NetworkData = {
      publicKey: 'debug-unit0-public-key',
      networks: {
        mainnet: mainnetData,
        testnet: testnetData,
      },
    };

    return networkData;
  }

  /**
   * Create DebugWallet instances for signing operations
   * This integrates with the existing wallet infrastructure
   */
  async createWalletInstances(
    networks: NetworkName[],
  ): Promise<{ [key: string]: DebugWallet }> {
    const walletInstances: { [key: string]: DebugWallet } = {};

    // Create DebugWallet instances for each requested network
    for (const network of networks) {
      if (
        [
          NetworkName.Mainnet,
          NetworkName.Testnet,
          NetworkName.Stagenet,
          NetworkName.Custom,
        ].includes(network)
      ) {
        const networkCode = this.#getWavesNetworkCode(network);
        if (!networkCode) continue; // Skip if network code is not available

        const walletInstance = new DebugWallet({
          address: this.debugAddress,
          name: `${network}-debug-wallet`,
          network,
          networkCode,
        });

        walletInstances[network] = walletInstance;
      }
    }

    return walletInstances;
  }

  /**
   * Get authentication data for secure storage
   */
  getAuthData(): WalletAuthData {
    return {}; // No sensitive data for debug wallets
  }

  /**
   * Validate input for React form integration
   */
  validateInput(input: CreateMultiWalletInput): ValidationResult {
    const errors: string[] = [];

    if (input.type !== 'debug') {
      errors.push('Strategy type mismatch: expected debug wallet');
    }

    if (!('address' in input) || !input.address) {
      errors.push('Debug address is required');
    } else {
      // Basic address validation
      const address = input.address.trim();
      if (address.length < 10) {
        errors.push('Debug address is too short');
      }
    }

    if (!input.name || input.name.trim().length === 0) {
      errors.push('Wallet name is required');
    }

    if (!input.blockchains || input.blockchains.length === 0) {
      errors.push('At least one blockchain must be selected');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Simple boolean check for strategy selection
   */
  canHandle(input: CreateMultiWalletInput): boolean {
    return (
      input.type === 'debug' && 'address' in input && Boolean(input.address)
    );
  }

  /**
   * Get wallet type identifier
   */
  getWalletType(): string {
    return 'debug';
  }

  /**
   * Get blockchain type for strategy categorization
   */
  getBlockchainType(): string {
    return this.unit0DebugAddress ? 'multi' : 'waves';
  }

  /**
   * Check blockchain support
   */
  supportsBlockchain(blockchainType: string): boolean {
    if (blockchainType === 'waves') return true;
    if (blockchainType === 'unit0') return Boolean(this.unit0DebugAddress);
    return false;
  }

  /**
   * Get Waves network code from NetworkName
   */
  #getWavesNetworkCode(
    network: NetworkName,
    customCode?: string,
  ): string | undefined {
    switch (network) {
      case NetworkName.Mainnet:
        return NETWORK_CODES.waves.mainnet;
      case NetworkName.Testnet:
        return NETWORK_CODES.waves.testnet;
      case NetworkName.Stagenet:
        return NETWORK_CODES.waves.stagenet;
      case NetworkName.Custom:
        return customCode;
      default:
        return NETWORK_CODES.waves.mainnet;
    }
  }

  /**
   * Get Unit0 network code from NetworkName
   */
  #getUnit0NetworkCode(network: NetworkName): string {
    switch (network) {
      case NetworkName.Mainnet:
        return NETWORK_CODES.unit0.mainnet;
      case NetworkName.Testnet:
        return NETWORK_CODES.unit0.testnet;
      default:
        return NETWORK_CODES.unit0.mainnet;
    }
  }
}
