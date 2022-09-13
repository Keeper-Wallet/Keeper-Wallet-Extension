import { ACTION } from './constants';

export function setTab(tab: string | null) {
  return {
    type: ACTION.CHANGE_TAB,
    payload: tab,
  };
}
