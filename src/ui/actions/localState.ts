import { ACTION } from './constants';


export function newUser() {
   return {
       type: ACTION.SET_PASSWORD_PENDING,
       payload: {
           pending: true,
           error: false
       }
   };
}

export function newUserUpdate(error) {
    return {
        type: ACTION.SET_PASSWORD_UPDATE,
        payload: {
            pending: false,
            error: error
        }
    };
}

export function login(password) {
    return {
        type: ACTION.LOGIN,
        payload: password
    };
}

export function loginPending() {
    return {
        type: ACTION.LOGIN_PENDING,
        payload: {
            pending: true,
            error: false
        }
    };
}

export function loginUpdate(error) {
    return {
        type: ACTION.LOGIN_UPDATE,
        payload: {
            pending: false,
            error
        }
    };
}
