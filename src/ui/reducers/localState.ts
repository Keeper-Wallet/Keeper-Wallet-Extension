import { combineReducers } from 'redux';
import { ACTION } from '../actions/constants';


function newUser(state = {}, action) {
     switch (action.type) {
         case ACTION.SET_PASSWORD_PENDING:
         case ACTION.SET_PASSWORD_UPDATE:
             return {...state, ...action.payload };
    }

    return state;
}

function login(state = {}, action) {
    switch (action.type) {
        case ACTION.LOGIN_UPDATE:
        case ACTION.LOGIN_PENDING:
            return {...state, ...action.payload };
    }

    return state;
}


export const localState = combineReducers({
    newUser,
    login
});
