import { store } from '../store';
import { ACTION } from './constants';

export function updateState(state) {
    const actions = [];
    const {
        currentLocale,
        accounts = [],
        initialized,
        locked,
        currentNetwork,
        messages = [],
        balances = [],
        pollInterval,
        uiState = {}
    } = state;
    const currentState = store.getState();


    if (uiState.tab !== currentState.tab) {
        actions.push({
            type: ACTION.UPDATE_FROM_TAB,
            payload: uiState.tab || ''
        });
    }

    if (currentNetwork !== currentState.currentNetwork) {
        actions.push({
            type: ACTION.UPDATE_CURRENT_NETWORK,
            payload: currentNetwork
        });
    }

    if (locked !== currentState.locked) {
        actions.push({
            type: ACTION.UPDATE_LOCK,
            payload: locked
        });
    }

    if (currentLocale !== currentState.currentLocale) {
        actions.push({
            type: ACTION.UPDATE_FROM_LNG,
            payload: currentLocale
        });
    }

    if (initialized !== currentState.initialized) {
        actions.push({
            type: ACTION.UPDATE_HAS_ACCOUNT,
            payload: initialized
        });
    }

    if (accounts.length !== currentState.accounts.length) {
        actions.push({
            type: ACTION.UPDATE_ACCOUNTS,
            payload: accounts
        });
    }

    if (balances.length !== currentState.balances.length) {
        actions.push({
            type: ACTION.UPDATE_BALANCES,
            payload: balances
        });
    }

    if (messages.length !== currentState.messages.length) {
        actions.push({
            type: ACTION.UPDATE_MESSAGES,
            payload: messages
        });
    }

    actions.forEach(action => store.dispatch(action));
}
