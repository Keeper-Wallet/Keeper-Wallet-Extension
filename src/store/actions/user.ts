import { normalizePreferencesAccount } from 'preferences/normalize';
import { type PreferencesAccount } from 'preferences/types';
import { type CreateWalletInput, type WalletAccount } from 'wallets/types';

import { type AccountsThunkAction } from '../../accounts/store/types';
import { NETWORKS } from '../../networks/config';
import {
    type NetworkProfile
} from '../../networks/types';
import Background, { WalletTypes } from '../../ui/services/Background';
import { ACTION } from './constants';
import { selectAccount } from './localState';
import { updateActiveState } from './notifications';

export function deleteAllAccounts(): AccountsThunkAction<Promise<void>> {
  return async dispatch => {
    await Background.deleteVault();

    dispatch(updateActiveState());
  };
}

export function createAccount(
  account: { name: string } & (
    | { type: 'debug'; address: string }
    | { type: 'encodedSeed'; encodedSeed: string }
    | { type: 'ledger'; address: string; id: number; publicKey: string }
    | { type: 'privateKey'; privateKey: string }
    | { type: 'seed'; seed: string }
    | {
        type: 'wx';
        address: string;
        publicKey: string;
        username: string;
        uuid: string;
      }
  ),
  type: WalletTypes,
): AccountsThunkAction<Promise<void>> {
  return async (dispatch, getState) => {
    const { currentNetwork, customCodes } = getState();

    const networkConfig = NETWORKS.find(n => n.network === 'waves');
    const profileConfig =
      networkConfig?.params[currentNetwork as NetworkProfile];
    const networkCode =
      customCodes[currentNetwork] || String(profileConfig?.chainId ?? '');

    let walletInput: CreateWalletInput;
    if ('type' in account && !('accountType' in account)) {
      walletInput = { ...account, accountType: 'waves' } as CreateWalletInput;
    } else {
      walletInput = account as CreateWalletInput;
    }

    if (
      'accountType' in walletInput &&
      walletInput.accountType === 'multichain'
    ) {
      dispatch(
        selectAccount(
          walletAccountToPreferencesAccount(
            await Background.addWallet(walletInput),
            currentNetwork,
          ),
        ),
      );
    } else {
      dispatch(
        selectAccount(
          walletAccountToPreferencesAccount(
            await Background.addWallet(
              walletInput,
              currentNetwork,
              networkCode,
            ),
            currentNetwork,
          ),
        ),
      );
    }

    if (type !== WalletTypes.Debug) {
      Background.track({ eventType: 'addWallet', type });
    }
  };
}

export function batchAddAccounts(
  accounts: Array<
    CreateWalletInput & { network: NetworkProfile; networkCode: string }
  >,
  type: WalletTypes,
): AccountsThunkAction<Promise<void>> {
  return async () => {
    await Background.batchAddWallets(accounts);

    if (type !== WalletTypes.Debug) {
      Background.track({ eventType: 'addWallet', type });
    }
  };
}

export const setLocale = (locale: string) => ({
  type: ACTION.CHANGE_LNG,
  payload: locale,
});

export const changePassword = (oldPassword: string, newPassword: string) => ({
  type: ACTION.CHANGE_PASSWORD,
  payload: { oldPassword, newPassword },
});

function walletAccountToPreferencesAccount(
  account: WalletAccount,
  currentNetwork: NetworkProfile,
): PreferencesAccount {
  const normalized = normalizePreferencesAccount(account);
  if (normalized.accountType === 'multichain') {
    if (normalized.accounts.waves) {
      return {
        ...normalized,
        chain: 'waves',
        address: normalized.accounts.waves.address,
        network: NetworkProfile.Mainnet,
        networkCode: 'W',
        publicKey: normalized.accounts.waves.publicKey,
        type: 'seed',
      };
    }
    // fallback: берем первый доступный chain
    const firstChain = Object.keys(normalized.accounts)[0] as keyof typeof normalized.accounts;
    const chainAccount = normalized.accounts[firstChain];
    if (!chainAccount) throw new Error('No available chain account');
    return {
      ...normalized,
      chain: 'waves',
      address: chainAccount.address,
      network: NetworkProfile.Mainnet,
      networkCode: 'W',
      publicKey: chainAccount.publicKey,
      type: 'seed',
    };
  }
  return normalized;
}
