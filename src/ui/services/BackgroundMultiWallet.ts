import { NetworkName } from '../../networks/types';

// The MultiWallet structure represents a single logical wallet with addresses across networks
export interface MultiWallet {
  name: string;
  type: 'seed'; // For now only seed wallets are supported
  seed: string;
  coins: {
    waves: {
      publicKey: string;
      networks: {
        mainnet: { address: string; networkCode: string };
        testnet: { address: string; networkCode: string };
        stagenet: { address: string; networkCode: string };
      };
    };
    // Future expansion for unit0, ethereum, etc.
  };
}

class BackgroundMultiWallet {
  private STORAGE_KEY = 'keeper_multiwallets';

  /**
   * Get all stored MultiWallets
   */
  getMultiWallets(): MultiWallet[] {
    const storedData = localStorage.getItem(this.STORAGE_KEY);
    if (!storedData) {
      return [];
    }
    
    try {
      return JSON.parse(storedData);
    } catch (e) {
      console.error('Error parsing MultiWallets from storage:', e);
      return [];
    }
  }

  /**
   * Add a new MultiWallet and store it
   */
  addMultiWallet(multiWallet: MultiWallet): void {
    const multiWallets = this.getMultiWallets();
    
    // Check for duplicates
    const isDuplicate = multiWallets.some(wallet => 
      wallet.name === multiWallet.name && 
      wallet.coins.waves.networks.mainnet.address === multiWallet.coins.waves.networks.mainnet.address
    );
    
    if (isDuplicate) {
      console.warn('Duplicate MultiWallet not added:', multiWallet.name);
      return;
    }
    
    multiWallets.push(multiWallet);
    this.saveMultiWallets(multiWallets);
  }

  /**
   * Find a MultiWallet by account address and network
   */
  findMultiWalletByAccount(address: string, network: NetworkName): MultiWallet | null {
    const multiWallets = this.getMultiWallets();
    
    const networkKey = network.toLowerCase() as 'mainnet' | 'testnet' | 'stagenet';
    
    return multiWallets.find(wallet => 
      wallet.coins.waves.networks[networkKey]?.address === address
    ) || null;
  }

  /**
   * Save all MultiWallets to storage
   */
  private saveMultiWallets(multiWallets: MultiWallet[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(multiWallets));
  }

  /**
   * Create a marker to link individual accounts to their MultiWallet
   * This is used for backward compatibility
   */
  createMultiWalletMarker(walletName: string): string {
    return `multiWallet:${walletName}`;
  }

  /**
   * Check if an account is part of a MultiWallet
   */
  isMultiWalletAccount(ethereumAddress?: string): boolean {
    if (!ethereumAddress) return false;
    return ethereumAddress.startsWith('multiWallet:');
  }

  /**
   * Extract the wallet name from a MultiWallet marker
   */
  extractWalletName(marker: string): string | null {
    if (!this.isMultiWalletAccount(marker)) return null;
    return marker.replace('multiWallet:', '');
  }
}

export default new BackgroundMultiWallet();
