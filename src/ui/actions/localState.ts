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

