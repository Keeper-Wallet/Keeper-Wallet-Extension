import { type NetworkFilter } from 'networks/types';
import {
    isMultichainAccount,
    type PreferencesAccount,
} from 'preferences/types';

export function getActiveAccount(
  accounts: PreferencesAccount[],
  selectedAccount: PreferencesAccount | undefined,
): PreferencesAccount | undefined {
  if (!selectedAccount) {
    return accounts[0];
  }

  return accounts.find(acc => {
    if (acc.accountType === 'waves' && selectedAccount.accountType === 'waves') {
      return acc.address === selectedAccount.address;
    }
    
    if (acc.accountType === 'multichain' && selectedAccount.accountType === 'multichain') {
      return acc.id === selectedAccount.id;
    }
    
    return false;
  }) || accounts[0];
}

export function getAccountAddress(account: PreferencesAccount): string {
  if (isMultichainAccount(account)) {
    return account.accounts.ethereum?.address || account.accounts.unit0?.address || '';
  }
  return account.address || '';
}

export function getAccountAvatarAddress(account: PreferencesAccount): string {
  if (isMultichainAccount(account)) {
    return (
      account.accounts.waves?.address || account.accounts.ethereum?.address || account.accounts.unit0?.address || ''
    );
  }
  return account.address || '';
}

export function getAccountPublicKey(
  account: PreferencesAccount,
): string {
  if (isMultichainAccount(account)) {
    return account.accounts.ethereum?.publicKey || account.accounts.unit0?.publicKey || '';
  }
  return account.publicKey || '';
}

export function getAccountNetworkCode(
  account: PreferencesAccount,
): string {
  if (isMultichainAccount(account)) {
    return '88811';
  }
  return account.networkCode || '';
}

export function getAccountAddressByNetwork(
  account: PreferencesAccount,
  networkFilter: NetworkFilter,
): string | null {
  if (account.accountType === 'waves') {
    if (networkFilter === 'waves' || 
        networkFilter === 'waves-testnet' || 
        networkFilter === 'waves-stagenet' || 
        networkFilter === 'custom') {
      return account.address;
    }
    return null;
  }

  if (account.accountType === 'multichain') {
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
