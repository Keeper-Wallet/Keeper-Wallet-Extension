import { createStore, combineReducers } from 'redux';
import { updateState } from './reducers/updateState'
import { routerReducer } from 'react-router-redux';

const reducers = combineReducers({
    routing: routerReducer,
    state: updateState,
    app: (state) => state || {}
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
}

export interface IApp {
}
