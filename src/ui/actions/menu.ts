import { ACTION } from './constants';

export function setMenu(data) {
    return {
        type: ACTION.CHANGE_MENU,
        payload: data
    };
}
