import { ACTION } from './constants';

export function setTab(tab) {
    return {
        type: ACTION.CHANGE_TAB,
        payload: tab,
    };
}

export function setTmpTab(tab) {
    return {
        type: ACTION.CHANGE_TMP_TAB,
        payload: tab,
    };
}
