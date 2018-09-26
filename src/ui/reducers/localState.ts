import { combineReducers } from 'redux';
import { ACTION } from '../actions/constants';
import { store } from '../store';

function newUser(state = {}, action) {
     switch (action.type) {
         case ACTION.SET_PASSWORD_PENDING:
         case ACTION.SET_PASSWORD_UPDATE:
             return {...state, ...action.payload };
    }

    return state;
}

function assets(state = {}, action) {
    switch (action.type) {
        case ACTION.SET_ACTIVE_ACCOUNT:
            return {...state, account: action.payload };
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

function newAccount(state = { name: '', address: '', type: 'seed', seed: '' }, action) {
    switch (action.type) {
        case ACTION.NEW_ACCOUNT_NAME:
            const name = action.payload != null ? action.payload : state.name;
            return { ...state, name };
        case ACTION.NEW_ACCOUNT_SELECT:
            return { ...state, ...action.payload };
    }

    return state;
}

function addNewAccount(state = { pending: false, error: false }, { type, payload }) {
     switch (type) {
         case ACTION.SAVE_NEW_ACCOUNT_SEND:
         case ACTION.SAVE_NEW_ACCOUNT_RECEIVE:
             return payload;
     }

     return state;
}

function menu(state = { logo: false }, { type, payload }) {
    if (type === ACTION.CHANGE_MENU) {
        return { ...state, ...payload };
    }
    return state;
}

export const localState = combineReducers({
    newUser,
    login,
    newAccount,
    addNewAccount,
    menu,
    assets,
});
