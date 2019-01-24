import { ACTION } from '../actions/constants';
export * from './localState';

const MAX_HISTORY = 10;

const createSimpleReducer = (def, type) => (store = def, action) => type === action.type ? action.payload : store;

export const tab = createSimpleReducer('', ACTION.CHANGE_TAB);
export const uiState = createSimpleReducer({}, ACTION.UPDATE_UI_STATE);
export const accounts = createSimpleReducer([], ACTION.UPDATE_ACCOUNTS);
export const state =  createSimpleReducer(null, ACTION.UPDATE_APP_STATE);
export const selectedAccount =  createSimpleReducer({}, ACTION.UPDATE_SELECTED_ACCOUNT);
export const networks =  createSimpleReducer([], ACTION.UPDATE_NETWORKS);
export const currentNetwork =  createSimpleReducer('', ACTION.UPDATE_CURRENT_NETWORK);
export const activeMessage =  createSimpleReducer(null, ACTION.UPDATE_ACTIVE_MESSAGE);
export const balances =  createSimpleReducer({}, ACTION.UPDATE_BALANCES);
export const currentLocale =  createSimpleReducer('en', ACTION.UPDATE_FROM_LNG);
export const customNodes =  createSimpleReducer({}, ACTION.UPDATE_NODES);
export const customMatcher =  createSimpleReducer({}, ACTION.UPDATE_MATCHER);
export const langs =  createSimpleReducer({}, ACTION.UPDATE_LANGS);
export const origins =  createSimpleReducer({}, ACTION.UPDATE_ORIGINS);

export const messages =  (store = [], action: any) => {
    if (ACTION.UPDATE_MESSAGES === action.type) {
        return [ ...action.payload.unapprovedMessages ];
    }
    
    return store;
};


export const assets = (store = {}, action: any) => {
    if (ACTION.UPDATE_ASSET === action.type) {
        return { ...store, ...action.payload };
    }
    return store;
};

export const backTabs = (state = [], { type, payload }) => {
    if (type === ACTION.ADD_BACK_TAB) {
        state = [...state, payload].slice(-MAX_HISTORY);
    }  else if (type === ACTION.REMOVE_BACK_TAB) {
        state = state.slice(0, -1);
    }
    return state;
};

export const version = (store = '') => store;
