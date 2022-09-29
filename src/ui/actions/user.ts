import { ACTION } from './constants';
import Background, { WalletTypes } from '../services/Background';
import { NetworkName } from 'networks/types';
import { AccountsThunkAction } from 'accounts/store';
import { selectAccount } from './localState';
import { UiThunkAction } from 'ui/store';
import { updateActiveState } from './notifications';

export function deleteAllAccounts(): UiThunkAction<Promise<void>> {
  return async dispatch => {
    await Background.deleteVault();

    dispatch(updateActiveState());
  };
}

type CreateAccountInput =
  | {
      type: 'seed';
      name: string;
      seed: string;
    }
  | {
      type: 'encodedSeed';
      encodedSeed: string;
      name: string;
    }
  | {
      type: 'privateKey';
      name: string;
      privateKey: string;
    }
  | {
      type: 'wx';
      name: string;
      publicKey: string;
      address: string | null;
      uuid: string;
      username: string;
    }
  | {
      type: 'ledger';
      address: string | null;
      id: number;
      name: string;
      publicKey: string;
    }
  | {
      type: 'debug';
      address: string;
      name: string;
      networkCode: string;
    };

export function createAccount(
  account: CreateAccountInput,
  type: WalletTypes
): AccountsThunkAction<Promise<void>> {
  return async (dispatch, getState) => {
    const { currentNetwork, networks } = getState();

    const networkCode = (
      networks.filter(({ name }) => name === currentNetwork)[0] || networks[0]
    ).code;

    const lastAccount = await Background.addWallet({
      ...account,
      networkCode,
      network: currentNetwork,
    });

    dispatch(selectAccount(lastAccount));

    if (type !== WalletTypes.Debug) {
      Background.sendEvent('addWallet', { type });
    }
  };
}

type BatchAddAccountsInput = Array<
  {
    name: string;
    network: NetworkName;
  } & (
    | {
        type: 'seed';
        seed: string;
      }
    | {
        type: 'encodedSeed';
        encodedSeed: string;
      }
    | {
        type: 'privateKey';
        privateKey: string;
      }
    | {
        type: 'debug';
        address: string;
      }
  )
>;

export function batchAddAccounts(
  accounts: BatchAddAccountsInput,
  type: WalletTypes
): AccountsThunkAction<Promise<void>> {
  return async () => {
    await Promise.all(accounts.map(account => Background.addWallet(account)));

    if (type !== WalletTypes.Debug) {
      Background.sendEvent('addWallet', { type });
    }
  };
}

export const lock = () => ({ type: ACTION.LOCK });

export const setLocale = (locale: string) => ({
  type: ACTION.CHANGE_LNG,
  payload: locale,
});

export const changePassword = (oldPassword: string, newPassword: string) => ({
  type: ACTION.CHANGE_PASSWORD,
  payload: { oldPassword, newPassword },
});
