import { ACTION } from './constants';


export function changeAccountName(account) {
    return {
        type: ACTION.CHANGE_ACCOUNT_NAME,
        payload: account
    };
}
