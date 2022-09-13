import { ACTION } from './constants';

export function navigate(tab: string | null) {
  return {
    type: ACTION.NAVIGATE,
    payload: tab,
  };
}

export function addBackTab(tab: string | null) {
  return {
    type: ACTION.ADD_BACK_TAB,
    payload: tab,
  };
}

export function removeBackTab() {
  return {
    type: ACTION.REMOVE_BACK_TAB,
  };
}
