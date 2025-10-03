import { IMultiWalletCreationStrategy } from '../interfaces/IMultiWalletCreationStrategy';
import { 
  WavesNetworkData, 
  Unit0NetworkData, 
  WalletAuthData, 
  CreateMultiWalletInput,
  ValidationResult 
} from '../interfaces/types';
import { NetworkName } from '../../../networks/types';
import { NETWORK_CODES } from '../../../services/types';

/**
 * Ledger-based MultiWallet Creation Strategy
 */
export class LedgerMultiWalletStrategy implements IMultiWalletCreationStrategy {
  constructor(
    private ledgerId: number,
    private publicKey: string,
    private address: string
  ) {}

  /**
   * Create Waves addresses for specified networks
   * Uses provided public key and address from Ledger device
   */
  async createWavesAddresses(networks: NetworkName[]): Promise<WavesNetworkData> {
    const networkData: WavesNetworkData = {
      publicKey: this.publicKey,
      networks: {}
    };

    // Use the same address for all Waves networks (Ledger limitation)
    for (const network of networks) {
      const networkCode = this.#getWavesNetworkCode(network);
      
      switch (network) {
        case NetworkName.Mainnet:
          networkData.networks.mainnet = { address: this.address, networkCode };
          break;
        case NetworkName.Testnet:
          networkData.networks.testnet = { address: this.address, networkCode };
          break;
        case NetworkName.Stagenet:
          networkData.networks.stagenet = { address: this.address, networkCode };
          break;
        case NetworkName.Custom:
          networkData.networks.custom = { address: this.address, networkCode };
          break;
      }
    }

    return networkData;
  }

  /**
   * Create Unit0 addresses for specified networks
   * Unit0 Ledger support not yet implemented
   */
  async createUnit0Addresses(networks: NetworkName[]): Promise<Unit0NetworkData> {
    // Unit0 Ledger support would require Ethereum app integration
    // TODO: Implement when Ethereum app integration is ready
    throw new Error('Unit0 blockchain support for Ledger devices is not yet implemented');
  }

  /**
   * Get authentication data for secure storage
   */
  getAuthData(): WalletAuthData {
    return { ledgerId: this.ledgerId };
  }

  /**
   * Validate input for React form integration
   */
  validateInput(input: CreateMultiWalletInput): ValidationResult {
    const errors: string[] = [];

    if (input.type !== 'ledger') {
      errors.push('Strategy type mismatch: expected ledger wallet');
    }

    if (!('id' in input) || typeof input.id !== 'number') {
      errors.push('Ledger ID is required and must be a number');
    }

    if (!('publicKey' in input) || !input.publicKey) {
      errors.push('Public key is required for Ledger wallets');
    }

    if (!('address' in input) || !input.address) {
      errors.push('Address is required for Ledger wallets');
    }

    if (!input.name || input.name.trim().length === 0) {
      errors.push('Wallet name is required');
    }

    if (!input.blockchains || input.blockchains.length === 0) {
      errors.push('At least one blockchain must be selected');
    }

    // Check for Unit0 blockchain selection (not yet supported)
    if (input.blockchains.includes('unit0')) {
      errors.push('Unit0 blockchain support for Ledger wallets is not yet implemented');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Simple boolean check for strategy selection
   */
  canHandle(input: CreateMultiWalletInput): boolean {
    return input.type === 'ledger' && 
           'id' in input && 
           'publicKey' in input && 
           'address' in input &&
           Boolean(input.publicKey) && 
           Boolean(input.address);
  }

  /**
   * Get wallet type identifier
   */
  getWalletType(): string {
    return 'ledger';
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
}
