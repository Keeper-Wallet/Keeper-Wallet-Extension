import { ACTION } from './constants';

export const deleteAccount = () => ({ type: ACTION.DELETE_ACCOUNT });

export function user(account) {
    return {
        type: ACTION.SAVE_NEW_ACCOUNT,
        payload: account,
    };
}

export function addUserSend() {
    return {
        type: ACTION.SAVE_NEW_ACCOUNT_SEND,
        payload: {
            pending: true,
            error: false,
        },
    };
}

export function addUserReceive(error?) {
    return {
        type: ACTION.SAVE_NEW_ACCOUNT_RECEIVE,
        payload: {
            pending: false,
            error: !!error,
            errorData: error,
        },
    };
}

export function batchAddAccounts(
    accounts: Array<{
        hasBackup: boolean;
        name: string;
        network: string;
        seed: string;
        type: string;
    }>
) {
    return {
        type: ACTION.BATCH_ADD_ACCOUNTS,
        payload: accounts,
    };
}

export const lock = () => ({ type: ACTION.LOCK });

export const setLocale = (locale) => ({ type: ACTION.CHANGE_LNG, payload: locale });

export const changePassword = (oldPassword, newPassword) => ({
    type: ACTION.CHANGE_PASSWORD,
    payload: { oldPassword, newPassword },
});
