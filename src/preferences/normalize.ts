import { NetworkName } from '../networks/types';
import type { PreferencesAccount } from './types';

// Legacy waves-account (without accountType)
export type OldWavesAccount = {
  address: string;
  publicKey: string;
  network: string;
  name: string;
  networkCode?: string;
  type?: string;
  lastUsed?: number;
};

function getNetworkByString(network: string): NetworkName {
  switch (network) {
    case 'mainnet':
      return NetworkName.Mainnet;
    case 'testnet':
      return NetworkName.Testnet;
    case 'stagenet':
      return NetworkName.Stagenet;
    case 'custom':
      return NetworkName.Custom;
    default:
      return NetworkName.Mainnet;
  }
}

export function normalizeOldWavesAccount(
  account: OldWavesAccount,
): PreferencesAccount | null {
  if (
    account &&
    !('accountType' in account) &&
    typeof account.address === 'string' &&
    typeof account.publicKey === 'string' &&
    typeof account.network === 'string' &&
    typeof account.name === 'string'
  ) {
    return {
      accountType: 'waves',
      id: account.address,
      address: account.address,
      name: account.name,
      network: getNetworkByString(account.network),
      networkCode: account.networkCode || 'W',
      publicKey: account.publicKey,
      chain: 'waves',
      type: account.type || 'seed',
      lastUsed: account.lastUsed,
    };
  }
  return null;
}

export function normalizePreferencesAccount(
  account: PreferencesAccount | OldWavesAccount,
): PreferencesAccount {
  return (
    normalizeOldWavesAccount(account as OldWavesAccount) ||
    (account as PreferencesAccount)
  );
}

export function normalizeAccounts(
  accounts: Array<PreferencesAccount | OldWavesAccount>,
): PreferencesAccount[] {
  return accounts.map(normalizePreferencesAccount);
}
