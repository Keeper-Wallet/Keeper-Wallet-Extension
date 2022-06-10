import { ACTION } from './constants';
import { WalletTypes } from '../services/Background';

export const deleteAccount = () => ({ type: ACTION.DELETE_ACCOUNT });

export function createAccount(account, type: WalletTypes) {
  return {
    type: ACTION.SAVE_NEW_ACCOUNT,
    payload: account,
    meta: { type },
  };
}

export function batchAddAccounts(
  accounts: Array<
    | {
        name: string;
        network: string;
      } & (
        | { type: 'seed'; seed: string }
        | { type: 'encodedSeed'; encodedSeed: string }
        | { type: 'privateKey'; privateKey: string }
        | { type: 'debug'; address: string }
      )
  >,
  type: WalletTypes
) {
  return {
    type: ACTION.BATCH_ADD_ACCOUNTS,
    payload: accounts,
    meta: { type },
  };
}

export const lock = () => ({ type: ACTION.LOCK });

export const setLocale = locale => ({
  type: ACTION.CHANGE_LNG,
  payload: locale,
});

export const changePassword = (oldPassword, newPassword) => ({
  type: ACTION.CHANGE_PASSWORD,
  payload: { oldPassword, newPassword },
});
