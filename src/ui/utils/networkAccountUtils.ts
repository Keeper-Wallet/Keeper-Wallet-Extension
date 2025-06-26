import { type NetworkFilter } from 'networks/types';
import { isMultichainAccount, type PreferencesAccount } from 'preferences/types';

export function getAccountAddressByNetworkFilter(
  account: PreferencesAccount | undefined,
  networkFilter: NetworkFilter,
): string | null {
  if (!account) return null;

  if (account.accountType === 'waves') {
    if (networkFilter === 'waves' || 
        networkFilter === 'waves-testnet' || 
        networkFilter === 'waves-stagenet' || 
        networkFilter === 'custom') {
      return account.address;
    }
    return null;
  }

  if (isMultichainAccount(account)) {
    switch (networkFilter) {
      case 'waves':
      case 'waves-testnet':
      case 'waves-stagenet':
      case 'custom':
        return account.accounts.waves?.address || null;
      case 'unit0':
      case 'unit0-testnet':
        return account.accounts.unit0?.address || account.accounts.ethereum?.address || null;
      case 'all':
        return account.accounts.unit0?.address || account.accounts.ethereum?.address || null;
      default:
        return null;
    }
  }

  return null;
}

export function getAccountNetworkBalance(
  account: PreferencesAccount | undefined,
  networkFilter: NetworkFilter,
): 'ethereum' | 'unit0' | 'waves' | null {
  if (!account) return null;

  if (account.accountType === 'waves') {
    if (networkFilter === 'waves' || 
        networkFilter === 'waves-testnet' || 
        networkFilter === 'waves-stagenet' || 
        networkFilter === 'custom') {
      return 'waves';
    }
    return null;
  }

  if (isMultichainAccount(account)) {
    switch (networkFilter) {
      case 'waves':
      case 'waves-testnet':
      case 'waves-stagenet':
      case 'custom':
        return account.accounts.waves ? 'waves' : null;
      case 'unit0':
      case 'unit0-testnet':
        return account.accounts.unit0 ? 'unit0' : account.accounts.ethereum ? 'ethereum' : null;
      case 'all':
        return account.accounts.unit0 ? 'unit0' : account.accounts.ethereum ? 'ethereum' : null;
      default:
        return null;
    }
  }

  return null;
} 
