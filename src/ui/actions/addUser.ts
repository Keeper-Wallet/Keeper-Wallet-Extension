import { ACTION } from './constants';

export function addUser(account) {
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
