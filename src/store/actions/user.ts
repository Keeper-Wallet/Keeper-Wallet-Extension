import { type CreateWalletInput } from 'wallets/types';

import { type AccountsThunkAction } from '../../accounts/store/types';
import { NETWORK_CONFIG } from '../../constants';
import { NetworkName } from '../../networks/types';
import Background, { WalletTypes } from '../../ui/services/Background';
import { ACTION } from './constants';
import { selectAccount } from './localState';
import { updateActiveState } from './notifications';
import { MultiWallet } from '../../services/types';

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

    const networkCode =
      customCodes[currentNetwork] || NETWORK_CONFIG[currentNetwork].networkCode;

    dispatch(
      selectAccount(
        await Background.addWallet(account, currentNetwork, networkCode),
      ),
    );

    if (type !== WalletTypes.Debug) {
      Background.track({ eventType: 'addWallet', type });
    }
  };
}

export function batchAddAccounts(
  accounts: Array<
    CreateWalletInput & { network: NetworkName; networkCode: string }
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

/**
 * Creates a Waves-only MultiWallet with addresses for all networks (mainnet, testnet, stagenet)
 * using the AccountService directly rather than the legacy account creation flow
 */
export function createWavesOnlyMultiWallet({
  name,
  seed,
  mainnetAddress,
  publicKey,
  testnetAddress,
  stagenetAddress,
  type,
}: {
  name: string;
  seed: string;
  mainnetAddress: string;
  publicKey: string;
  testnetAddress: string;
  stagenetAddress: string;
  type: string;
}): AccountsThunkAction<Promise<void>> {
  return async () => {
    try {
      const multiWallet: MultiWallet = {
        id: Date.now().toString(), // Generate unique ID
        name,
        type,
        coins: {
          waves: {
            [NetworkName.Mainnet]: mainnetAddress,
            [NetworkName.Testnet]: testnetAddress,
            [NetworkName.Stagenet]: stagenetAddress,
          },
        },
        seed,
        publicKey: publicKey, // Use mainnet public key as primary
        timestamp: Date.now(),
      };

      await Background.addMultiWallet(multiWallet);

      console.log('Created Waves-only MultiWallet with name:', name);
    } catch (error) {
      console.error('Failed to create Waves-only MultiWallet:', error);
      throw error;
    }
  };
}
