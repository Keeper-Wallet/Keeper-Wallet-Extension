import { ACTION } from './constants';

export function createNew(password) {
    return {
        type: ACTION.SET_PASSWORD,
        payload: password,
    };
}
