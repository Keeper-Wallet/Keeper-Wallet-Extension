import { ACTION } from './constants';
import { WalletTypes } from '../services/Background';
import { NetworkName } from 'networks/types';
import { UiActionPayload } from 'ui/store';

export const deleteAccount = () => ({ type: ACTION.DELETE_ACCOUNT });

export function createAccount(
  account: UiActionPayload<typeof ACTION.SAVE_NEW_ACCOUNT>,
  type: WalletTypes
) {
  return {
    type: ACTION.SAVE_NEW_ACCOUNT,
    payload: account,
    meta: { type },
  };
}

export type BatchAddAccountsPayload = Array<
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
  accounts: BatchAddAccountsPayload,
  type: WalletTypes
) {
  return {
    type: ACTION.BATCH_ADD_ACCOUNTS,
    payload: accounts,
    meta: { type },
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
