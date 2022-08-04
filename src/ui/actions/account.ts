import { ACTION } from './constants';

export function changeAccountName(account: { address: string; name: string }) {
  return {
    type: ACTION.CHANGE_ACCOUNT_NAME,
    payload: account,
  };
}
