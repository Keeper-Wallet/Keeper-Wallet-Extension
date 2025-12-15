import { IMultiWalletCreationStrategy } from '../interfaces/IMultiWalletCreationStrategy';
import {
  WavesNetworkData,
  Unit0NetworkData,
  WalletAuthData,
  CreateMultiWalletInput,
  ValidationResult,
} from '../interfaces/types';
import { NetworkName } from '../../../networks/types';
import { NETWORK_CODES } from '../../../services/types';
import { WxWallet } from '../../../wallets/wx';
import type { IdentityApi } from '../../../controllers/IdentityController';
import { base58Decode, base58Encode, createAddress } from '@keeper-wallet/waves-crypto';

/**
 * Wx (Waves Exchange) MultiWallet Creation Strategy
 */
export class WavesWxWalletStrategy implements IMultiWalletCreationStrategy {
  constructor(
    private wxUuid: string,
    private wxUsername: string,
    private publicKey: string,
    private address: string,
  ) {}

  /**
   * Create Waves addresses for specified networks
   * Uses provided public key to generate network-specific addresses
   */
  async createWavesAddresses(
    networks: NetworkName[],
    customCode?: string,
  ): Promise<WavesNetworkData> {
    // Decode the public key once
    const publicKeyBytes = base58Decode(this.publicKey);

    const networkData: WavesNetworkData = {
      publicKey: this.publicKey,
      networks: {},
    };

    // Only create addresses for the requested networks
    for (const network of networks) {
      const networkCode = this.#getWavesNetworkCode(network, customCode);
      if (!networkCode) continue; // Skip if network code is not available

      const address = base58Encode(
        createAddress(publicKeyBytes, networkCode.charCodeAt(0)),
      );

      switch (network) {
        case NetworkName.Mainnet:
          networkData.networks.mainnet = { address, networkCode };
          break;
        case NetworkName.Testnet:
          networkData.networks.testnet = { address, networkCode };
          break;
        case NetworkName.Stagenet:
          networkData.networks.stagenet = { address, networkCode };
          break;
        case NetworkName.Custom:
          networkData.networks.custom = { address, networkCode };
          break;
      }
    }

    return networkData;
  }

  /**
   * Create Unit0 addresses for specified networks
   * Unit0 Wx support not implemented
   */
  async createUnit0Addresses(
    networks: NetworkName[],
  ): Promise<Unit0NetworkData> {
    // Unit0 Wx support would require additional integration
    throw new Error(
      'Unit0 blockchain support for Wx wallets is not yet implemented',
    );
  }

  /**
   * Create WxWallet instances for signing operations
   * Note: Requires IdentityApi which must be provided at runtime
   */
  async createWalletInstances(
    networks: NetworkName[],
    identityApi?: IdentityApi,
  ): Promise<{ [key: string]: WxWallet }> {
    if (!identityApi) {
      throw new Error(
        'IdentityApi is required to create Wx wallet instances',
      );
    }

    const walletInstances: { [key: string]: WxWallet } = {};

    // Create wallet instances for each Waves network
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

        const walletInstance = new WxWallet(
          {
            address: this.address,
            name: `${network}-wallet`,
            network,
            networkCode,
            publicKey: this.publicKey,
            username: this.wxUsername,
            uuid: this.wxUuid,
          },
          identityApi,
        );

        walletInstances[network] = walletInstance;
      }
    }

    return walletInstances;
  }

  /**
   * Get authentication data for secure storage
   */
  getAuthData(): WalletAuthData {
    return {
      wxUuid: this.wxUuid,
      wxUsername: this.wxUsername,
    };
  }

  /**
   * Validate input for React form integration
   */
  validateInput(input: CreateMultiWalletInput): ValidationResult {
    const errors: string[] = [];

    if (input.type !== 'wx') {
      errors.push('Strategy type mismatch: expected wx wallet');
    }

    if (!('uuid' in input) || !input.uuid) {
      errors.push('Wx UUID is required');
    }

    if (!('username' in input) || !input.username) {
      errors.push('Wx username is required');
    } else {
      // Basic username validation
      const username = input.username.trim();
      if (username.length < 3) {
        errors.push('Wx username must be at least 3 characters');
      }
    }

    if (!('publicKey' in input) || !input.publicKey) {
      errors.push('Public key is required for Wx wallets');
    }

    if (!('address' in input) || !input.address) {
      errors.push('Address is required for Wx wallets');
    }

    if (!input.name || input.name.trim().length === 0) {
      errors.push('Wallet name is required');
    }

    if (!input.blockchains || input.blockchains.length === 0) {
      errors.push('At least one blockchain must be selected');
    }

    // Check for Unit0 blockchain selection (not supported)
    if (input.blockchains.includes('unit0')) {
      errors.push('Unit0 blockchain is not supported for Wx wallets');
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
      input.type === 'wx' &&
      'uuid' in input &&
      'username' in input &&
      'publicKey' in input &&
      'address' in input &&
      Boolean(input.uuid) &&
      Boolean(input.username) &&
      Boolean(input.publicKey) &&
      Boolean(input.address)
    );
  }

  /**
   * Get wallet type identifier
   */
  getWalletType(): string {
    return 'wx';
  }

  /**
   * Get blockchain type for strategy categorization
   */
  getBlockchainType(): string {
    return 'waves'; // Currently only supports Waves
  }

  /**
   * Check blockchain support
   */
  supportsBlockchain(blockchainType: string): boolean {
    return blockchainType === 'waves'; // Only Waves supported for now
  }

  /**
   * Get Waves network code from NetworkName
   */
  #getWavesNetworkCode(network: NetworkName, customCode?: string): string | undefined {
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
}
