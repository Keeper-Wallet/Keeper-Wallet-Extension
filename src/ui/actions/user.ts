import { ACTION } from './constants';

export function user(account) {
    return {
        type: ACTION.SAVE_NEW_ACCOUNT,
        payload: account
    };
}

export function addUserSend() {
    return {
        type: ACTION.SAVE_NEW_ACCOUNT_SEND,
        payload: {
            pending: true,
            error: false
        }
    };
}

export function addUserReceive(error?) {
    return {
        type: ACTION.SAVE_NEW_ACCOUNT_RECEIVE,
        payload: {
            pending: false,
            error: !!error
        }
    };
}

export const lock = () => ({ type: ACTION.LOCK });

export const setLocale = (locale) => ({ type: ACTION.CHANGE_LNG, payload: locale });


