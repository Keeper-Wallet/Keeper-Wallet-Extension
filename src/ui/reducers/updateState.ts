import { ACTION } from '../actions/constants';

export const tmpTab = (store = null, action: any) => {
    return action.type === ACTION.CHANGE_TMP_TAB ? action.payload : store;
};

export const locked = (store = null, action: any) => {
    return action.type === ACTION.UPDATE_LOCK ? action.payload : store;
};

export const initialized = (store = null, action: any) => {
    return action.type === ACTION.UPDATE_HAS_ACCOUNT ? action.payload : store;
};

export const tab = (store = '', action: any) => {
    return action.type === ACTION.UPDATE_FROM_TAB ? action.payload : store;
};

export const uiState = (store = {}, action: any) => {
    return action.type === ACTION.UPDATE_UI_STATE ? action.payload : store;
};

export const accounts = (store = [], action: any) => {
    return action.type === ACTION.UPDATE_ACCOUNTS ? action.payload : store;
};

export const currentNetwork = (store = '', action: any) => {
    return action.type === ACTION.UPDATE_CURRENT_NETWORK ? action.payload : store;
};

export const messages = (store = [], action: any) => {
    return action.type === ACTION.UPDATE_MESSAGES ? action.payload : store;
};

export const balances = (store = [], action: any) => {
    return action.type === ACTION.UPDATE_BALANCES ? action.payload : store;
};

export const currentLocale = (store = [], action: any) => {
    return action.type === ACTION.UPDATE_FROM_LNG ? action.payload : store;
};

