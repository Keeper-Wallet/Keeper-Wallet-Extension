import { Dispatch } from 'redux';
import Background from '../../ui/services/Background';
import { ACTION } from '../actions/constants';

/**
 * Synchronizes accounts from MultiWallet structure to Redux store
 * Gets legacy format accounts and dispatches appropriate Redux actions
 * to update both allNetworksAccounts and current network accounts
 */
export async function syncLegacyAccountsToRedux(dispatch: Dispatch, currentNetwork?: string): Promise<void> {
  try {
    // Get all accounts in legacy format
    const legacyAccounts = await Background.getLegacyFormatAccounts();
    
    if (!legacyAccounts || legacyAccounts.length === 0) {
      console.warn('No legacy accounts found to sync to Redux');
      return;
    }
    
    // Update all networks accounts in Redux
    dispatch({
      type: ACTION.UPDATE_ALL_NETWORKS_ACCOUNTS,
      payload: legacyAccounts,
    });
    
    // If currentNetwork is provided, filter accounts by network
    if (currentNetwork) {
      const networkAccounts = legacyAccounts.filter(account => account.network === currentNetwork);
      
      dispatch({
        type: ACTION.UPDATE_CURRENT_NETWORK_ACCOUNTS,
        payload: networkAccounts,
      });
    }
  } catch (error) {
    console.error('Failed to sync legacy accounts to Redux:', error);
  }
}
