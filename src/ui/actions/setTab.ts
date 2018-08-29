import { ACTION } from './constants';

export function setTab(tab) {
    return {
        type: ACTION.CHANGE_TAB,
        payload: tab,
    };
}
