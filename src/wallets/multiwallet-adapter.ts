import { type MessageTx } from '../messages/types';
import { NetworkName } from '../networks/types';
import { PreferencesAccount } from '../preferences/types';
import { SeedWallet } from './seed';

/**
 * Creates a legacy wallet adapter that exposes the same interface as traditional wallets
 * by creating a new wallet instance directly from account data
 */
export function createLegacyWalletAdapter(
  account: PreferencesAccount,
  walletData: any
) {
  if (!walletData.seed) {
    throw new Error('Seed is required to create a wallet adapter');
  }

  // Create a new wallet instance with the account data
  // Using walletData which contains sensitive info like seed that's not in account
  const wallet = new SeedWallet({
    address: account.address,
    name: account.name,
    network: account.network,
    networkCode: account.networkCode,
    publicKey: account.publicKey,
    seed: walletData.seed,
    ethereumAddress: account.ethereumAddress,
  });

  return {
    // Pass through all the account properties
    ...account,
    
    // Implement all signing methods by delegating to the wallet
    signAuth: (bytes: Uint8Array) => wallet.signAuth(bytes),
    signCancelOrder: (bytes: Uint8Array) => wallet.signCancelOrder(bytes),
    signCustomData: (bytes: Uint8Array) => wallet.signCustomData(bytes),
    signOrder: (bytes: Uint8Array, version: 1 | 2 | 3 | 4) => wallet.signOrder(bytes, version),
    signRequest: (bytes: Uint8Array) => wallet.signRequest(bytes),
    signTx: (bytes: Uint8Array, tx: MessageTx) => wallet.signTx(bytes, tx),
    signWavesAuth: (bytes: Uint8Array) => wallet.signWavesAuth(bytes),
    
    // Additional methods that might be needed
    getAccount: () => account,
  };
}

/**
 * Helper function to find an account by address and network in a list of accounts
 */
export function findAccountByAddressAndNetwork(
  accounts: PreferencesAccount[],
  address: string,
  network: NetworkName
): PreferencesAccount | undefined {
  return accounts.find(
    account => account.address === address && account.network === network
  );
}
