import {
  base58Encode,
  createAddress,
  createPrivateKey,
  createPublicKey,
  utf8Encode,
} from '@keeper-wallet/waves-crypto';
import { Wallet } from 'ethers';

import { NetworkName } from '../../../networks/types';
import { NETWORK_CODES, type WalletItem } from '../../../services/types';
import { type IMultiWalletCreationStrategy } from '../interfaces/IMultiWalletCreationStrategy';
import {
  type CreateMultiWalletInput,
  type Unit0NetworkData,
  type ValidationResult,
  type WalletAuthData,
  type WavesNetworkData,
} from '../interfaces/types';

/**
 * Seed-based Wallet Creation Strategy
 */
export class SeedWalletStrategy implements IMultiWalletCreationStrategy {
  constructor(private seed: string) {}

  /**
   * Create Waves addresses for specified networks
   * Uses existing @keeper-wallet/waves-crypto functions
   */
  async createWavesAddresses(
    networks: NetworkName[],
  ): Promise<WavesNetworkData> {
    const privateKey = await createPrivateKey(utf8Encode(this.seed));
    const publicKey = await createPublicKey(privateKey);
    const publicKeyBase58 = base58Encode(publicKey);

    // Always generate mainnet and testnet addresses
    const mainnetCode = this.#getWavesNetworkCode(NetworkName.Mainnet);
    const mainnetAddress = base58Encode(
      createAddress(publicKey, mainnetCode.charCodeAt(0)),
    );

    const testnetCode = this.#getWavesNetworkCode(NetworkName.Testnet);
    const testnetAddress = base58Encode(
      createAddress(publicKey, testnetCode.charCodeAt(0)),
    );

    const networkData: WavesNetworkData = {
      publicKey: publicKeyBase58,
      networks: {
        mainnet: { address: mainnetAddress, networkCode: mainnetCode },
        testnet: { address: testnetAddress, networkCode: testnetCode },
      },
    };

    // Add optional networks if requested
    for (const network of networks) {
      const networkCode = this.#getWavesNetworkCode(network);
      const address = base58Encode(
        createAddress(publicKey, networkCode.charCodeAt(0)),
      );

      switch (network) {
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
   * Uses ethers.js for EVM-compatible address generation
   */
  async createUnit0Addresses(
    networks: NetworkName[],
  ): Promise<Unit0NetworkData> {
    // Create HD wallet from seed phrase
    const hdWallet = Wallet.fromPhrase(this.seed);
    const derivedWallet = hdWallet.derivePath("m/44'/60'/0'/0/0");
    const address = derivedWallet.address;

    const mainnetData: WalletItem = {
      address,
      networkCode: this.#getUnit0NetworkCode(NetworkName.unit0MainNet),
    };

    const testnetData: WalletItem = {
      address: address as string,
      networkCode: this.#getUnit0NetworkCode(NetworkName.unit0Testnet),
    };

    const networkData: Unit0NetworkData = {
      publicKey: derivedWallet.signingKey.publicKey,
      networks: {
        mainnet: mainnetData,
        testnet: testnetData,
      },
    };

    return networkData;
  }

  /**
   * Get authentication data for secure storage
   */
  getAuthData(): WalletAuthData {
    return { seed: this.seed };
  }

  /**
   * Validate input for React form integration
   */
  validateInput(input: CreateMultiWalletInput): ValidationResult {
    const errors: string[] = [];

    if (input.type !== 'seed') {
      errors.push('Strategy type mismatch: expected seed wallet');
    }

    if (!('seed' in input) || !input.seed) {
      errors.push('Seed phrase is required');
    } else {
      // Validate seed phrase format (basic check)
      const seedWords = input.seed.trim().split(/\s+/);
      if (seedWords.length < 12 || seedWords.length > 24) {
        errors.push('Seed phrase must be 12-24 words');
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
    return input.type === 'seed' && 'seed' in input && Boolean(input.seed);
  }

  /**
   * Get wallet type identifier
   */
  getWalletType(): string {
    return 'seed';
  }

  /**
   * Get blockchain type for strategy categorization
   */
  getBlockchainType(): string {
    return 'multi'; // Supports multiple blockchains
  }

  /**
   * Check blockchain support
   */
  supportsBlockchain(blockchainType: string): boolean {
    return ['waves', 'unit0'].includes(blockchainType);
  }

  /**
   * Get Waves network code from NetworkName
   */
  #getWavesNetworkCode(network: NetworkName): string {
    switch (network) {
      case NetworkName.Mainnet:
        return NETWORK_CODES.waves.mainnet;
      case NetworkName.Testnet:
        return NETWORK_CODES.waves.testnet;
      case NetworkName.Stagenet:
        return NETWORK_CODES.waves.stagenet;
      case NetworkName.Custom:
        return NETWORK_CODES.waves.mainnet;
      default:
        return NETWORK_CODES.waves.mainnet;
    }
  }

  /**
   * Get Unit0 network code from NetworkName
   */
  #getUnit0NetworkCode(network: NetworkName): string {
    switch (network) {
      case NetworkName.unit0MainNet:
        return NETWORK_CODES.unit0.mainnet;
      case NetworkName.unit0Testnet:
        return NETWORK_CODES.unit0.testnet;
      default:
        return NETWORK_CODES.unit0.mainnet;
    }
  }
}
