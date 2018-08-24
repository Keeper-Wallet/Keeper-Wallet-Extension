import { createStore, combineReducers } from 'redux';
import { updateState } from './reducers/updateState'

const reducers = combineReducers({
    state: updateState
});

export const store = createStore(reducers);

export interface IState {
    locked: boolean;
    hasAccount: boolean;
    currentLocale: string;
    accounts: Array<any>;
    currentNetwork: string;
    messages: Array<any>;
    balances: any;
    uiState: IUiState;
}

export interface IUiState {
    tab: string;
}
