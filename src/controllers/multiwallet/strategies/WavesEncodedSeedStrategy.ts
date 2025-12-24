import {
  base58Decode,
  base58Encode,
  createAddress,
  createPrivateKey,
  createPublicKey,
  utf8Decode,
  utf8Encode,
} from '@keeper-wallet/waves-crypto';

import { NetworkName } from '../../../networks/types';
import { NETWORK_CODES } from '../../../services/types';
import { EncodedSeedWallet } from '../../../wallets/encodedSeed';
import { type IMultiWalletCreationStrategy } from '../interfaces/IMultiWalletCreationStrategy';
import {
  type CreateMultiWalletInput,
  type Unit0NetworkData,
  type ValidationResult,
  type WalletAuthData,
  type WavesNetworkData,
} from '../interfaces/types';

/**
 * Waves Encoded Seed-based Wallet Creation Strategy
 * Only supports Waves blockchain (mainnet, testnet, stagenet, custom)
 */
export class WavesEncodedSeedStrategy implements IMultiWalletCreationStrategy {
  constructor(private encodedSeed: string) {}

  /**
   * Static helper method to create an encoded seed from a regular seed phrase
   * Useful for testing and converting plain seed phrases to encoded format
   * @param seedPhrase - Regular seed phrase (12-24 words)
   * @returns Base58-encoded seed string
   */
  static createEncodedSeed(seedPhrase: string): string {
    return base58Encode(utf8Encode(seedPhrase));
  }

  /**
   * Create Waves addresses for specified networks
   * Decodes encoded seed and uses it for address generation
   */
  async createWavesAddresses(
    networks: NetworkName[],
    customCode?: string,
  ): Promise<WavesNetworkData> {
    // Decode the encoded seed (base58 -> bytes)
    const decodedSeed = this.#decodeSeed(this.encodedSeed);
    const privateKey = await createPrivateKey(decodedSeed);
    const publicKey = await createPublicKey(privateKey);
    const publicKeyBase58 = base58Encode(publicKey);

    // Always generate mainnet and testnet addresses
    const mainnetCode = this.#getWavesNetworkCode(NetworkName.Mainnet);
    if (!mainnetCode) {
      throw new Error('Mainnet network code is required');
    }
    const mainnetAddress = base58Encode(
      createAddress(publicKey, mainnetCode.charCodeAt(0)),
    );

    const testnetCode = this.#getWavesNetworkCode(NetworkName.Testnet);
    if (!testnetCode) {
      throw new Error('Testnet network code is required');
    }
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
      const networkCode = this.#getWavesNetworkCode(network, customCode);
      if (!networkCode) continue;

      const address = base58Encode(
        createAddress(publicKey, networkCode.charCodeAt(0)),
      );

      if (network === NetworkName.Stagenet) {
        networkData.networks.stagenet = { address, networkCode };
      } else if (network === NetworkName.Custom) {
        networkData.networks.custom = { address, networkCode };
      }
    }

    return networkData;
  }

  /**
   * Create Unit0 addresses for specified networks
   * Unit0 not supported for encoded seed wallets
   */
  async createUnit0Addresses(): Promise<Unit0NetworkData> {
    throw new Error(
      'Unit0 blockchain is not supported for encoded seed wallets',
    );
  }

  /**
   * Create EncodedSeedWallet instances for signing operations
   */
  async createWalletInstances(
    networks: NetworkName[],
    customCode?: string,
  ): Promise<{ [key: string]: EncodedSeedWallet }> {
    const walletInstances: { [key: string]: EncodedSeedWallet } = {};

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
        const networkCode = this.#getWavesNetworkCode(network, customCode);
        if (!networkCode) continue; // Skip if network code is not available

        const walletInstance = await EncodedSeedWallet.create({
          encodedSeed: this.encodedSeed,
          name: `${network}-wallet`,
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
    return { encodedSeed: this.encodedSeed };
  }

  /**
   * Validate input for React form integration
   */
  validateInput(input: CreateMultiWalletInput): ValidationResult {
    const errors: string[] = [];

    if (input.type !== 'encodedSeed') {
      errors.push('Strategy type mismatch: expected encodedSeed wallet');
    }

    if (!('encodedSeed' in input) || !input.encodedSeed) {
      errors.push('Encoded seed is required');
    } else {
      // Basic encoded seed validation
      const encodedSeed = input.encodedSeed.trim();
      if (encodedSeed.length < 32) {
        errors.push('Encoded seed is too short');
      }

      // Try to decode the seed to validate it
      try {
        const decodedSeed = this.#decodeSeed(encodedSeed);
        // Convert bytes to string to check if it's a valid seed phrase
        const seedString = utf8Decode(decodedSeed);
        const seedWords = seedString.trim().split(/\s+/);
        if (seedWords.length < 12 || seedWords.length > 24) {
          errors.push('Decoded seed phrase must be 12-24 words');
        }
      } catch (error) {
        errors.push('Invalid encoded seed format');
      }
    }

    if (!input.name || input.name.trim().length === 0) {
      errors.push('Wallet name is required');
    }

    if (!input.blockchains || input.blockchains.length === 0) {
      errors.push('At least one blockchain must be selected');
    }

    // Check for Unit0 blockchain selection (not supported)
    if (input.blockchains.includes('unit0')) {
      errors.push('Unit0 blockchain is not supported for encoded seed wallets');
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
      input.type === 'encodedSeed' &&
      'encodedSeed' in input &&
      Boolean(input.encodedSeed)
    );
  }

  /**
   * Get wallet type identifier
   */
  getWalletType(): string {
    return 'encodedSeed';
  }

  /**
   * Get blockchain type for strategy categorization
   */
  getBlockchainType(): string {
    return 'waves'; // Only Waves supported
  }

  /**
   * Check blockchain support
   */
  supportsBlockchain(blockchainType: string): boolean {
    return blockchainType === 'waves'; // Only Waves supported
  }

  /**
   * Decode the encoded seed
   * Strips 'base58:' prefix if present and decodes base58 to bytes
   */
  #decodeSeed(encodedSeed: string): Uint8Array {
    try {
      // Strip 'base58:' prefix if present (matches EncodedSeedWallet.create pattern)
      const cleanEncodedSeed = encodedSeed.replace(/^base58:/, '');

      // Decode base58 to bytes
      return base58Decode(cleanEncodedSeed);
    } catch (error) {
      throw new Error(
        'Failed to decode encoded seed. Must be valid base58 format.',
      );
    }
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
}
