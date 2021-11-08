import { ACTION } from './constants';

export function getBalances() {
  return {
    type: ACTION.GET_BALANCES,
    payload: null,
  };
}
