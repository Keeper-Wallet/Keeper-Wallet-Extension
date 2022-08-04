import { ACTION } from './constants';

export function setMenu(data: unknown) {
  return {
    type: ACTION.CHANGE_MENU,
    payload: data,
  };
}
