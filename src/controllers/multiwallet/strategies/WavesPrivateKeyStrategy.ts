import {
  base58Decode,
  base58Encode,
  createAddress,
  createPublicKey,
} from '@keeper-wallet/waves-crypto';

import { NetworkName } from '../../../networks/types';
import { NETWORK_CODES } from '../../../services/types';
import { PrivateKeyWallet } from '../../../wallets/privateKey';
import { type IMultiWalletCreationStrategy } from '../interfaces/IMultiWalletCreationStrategy';
import {
  type CreateMultiWalletInput,
  type Unit0NetworkData,
  type ValidationResult,
  type WalletAuthData,
  type WavesNetworkData,
} from '../interfaces/types';

export class WavesPrivateKeyStrategy implements IMultiWalletCreationStrategy {
  constructor(private privateKey: string) {}

  /**
   * Create Waves addresses for specified networks
   * Uses private key to generate public key and addresses
   */
  async createWavesAddresses(
    networks: NetworkName[],
    customCode?: string,
  ): Promise<WavesNetworkData> {
    const privateKeyBytes = base58Decode(this.privateKey);
    const publicKey = await createPublicKey(privateKeyBytes);
    const publicKeyBase58 = base58Encode(publicKey);

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
   * Unit0 not supported for private key wallets
   */
  async createUnit0Addresses(): Promise<Unit0NetworkData> {
    throw new Error(
      'Unit0 blockchain is not supported for private key wallets',
    );
  }

  /**
   * Create PrivateKeyWallet instances for signing operations
   */
  async createWalletInstances(
    networks: NetworkName[],
    customCode?: string,
  ): Promise<{ [key: string]: PrivateKeyWallet }> {
    const walletInstances: { [key: string]: PrivateKeyWallet } = {};

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

        const walletInstance = await PrivateKeyWallet.create({
          name: `${network}-wallet`,
          network,
          networkCode,
          privateKey: this.privateKey,
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
    return { privateKey: this.privateKey };
  }

  /**
   * Validate input for React form integration
   */
  validateInput(input: CreateMultiWalletInput): ValidationResult {
    const errors: string[] = [];

    if (input.type !== 'privateKey') {
      errors.push('Strategy type mismatch: expected privateKey wallet');
    }

    if (!('privateKey' in input) || !input.privateKey) {
      errors.push('Private key is required');
    } else {
      // Validate private key format
      const privateKey = input.privateKey.trim();

      // Check for base58 format (Waves) or hex format (Ethereum)
      const isBase58 =
        /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/.test(
          privateKey,
        );
      const isHex = /^(0x)?[0-9a-fA-F]{64}$/.test(privateKey);

      if (!isBase58 && !isHex) {
        errors.push('Private key must be in base58 format (Waves)');
      }

      if (privateKey.length < 32) {
        errors.push('Private key is too short');
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
      errors.push('Unit0 blockchain is not supported for private key wallets');
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
      input.type === 'privateKey' &&
      'privateKey' in input &&
      Boolean(input.privateKey)
    );
  }

  /**
   * Get wallet type identifier
   */
  getWalletType(): string {
    return 'privateKey';
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
