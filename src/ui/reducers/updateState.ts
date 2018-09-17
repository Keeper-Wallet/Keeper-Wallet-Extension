import { ACTION } from '../actions/constants';
export * from './localState';

export const state = (store = null, action: any) => {
    return action.type === ACTION.UPDATE_APP_STATE ? action.payload : store;
};

export const tab = (store = '', action: any) => {
    return action.type === ACTION.CHANGE_TAB ? action.payload : store;
};

export const uiState = (store = {}, action: any) => {
    return action.type === ACTION.UPDATE_UI_STATE ? action.payload : store;
};

export const accounts = (store = [], action: any) => {
    return action.type === ACTION.UPDATE_ACCOUNTS ? action.payload : store;
};

export const selectedAccount = (store = {}, action: any) => {
    return action.type === ACTION.UPDATE_SELECTED_ACCOUNT ? action.payload : store;
};

export const networks = (store = [], action: any) => {
    return action.type === ACTION.UPDATE_NETWORKS ? action.payload : store;
};

export const currentNetwork = (store = '', action: any) => {
    return action.type === ACTION.UPDATE_CURRENT_NETWORK ? action.payload : store;
};

export const messages = (store = [], action: any) => {
    return action.type === ACTION.UPDATE_MESSAGES ? action.payload : store;
};

export const balances = (store = {}, action: any) => {
    return action.type === ACTION.UPDATE_BALANCES ? action.payload : store;
};

export const currentLocale = (store = 'en', action: any) => {
    return action.type === ACTION.UPDATE_FROM_LNG ? action.payload : store;
};

export const version = (store = '') => store;
