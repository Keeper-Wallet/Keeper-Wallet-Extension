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

    if (currentNetwork !== currentState.currentNetwork) {
        actions.push({
            type: ACTION.UPDATE_CURRENT_NETWORK,
            payload: currentNetwork
        });
    }

    if (messages.length !== currentState.messages.length) {
        actions.push({
            type: ACTION.UPDATE_MESSAGES,
            payload: messages
        });
    }

    if (accounts.length !== currentState.accounts.length) {
        actions.push({
            type: ACTION.UPDATE_ACCOUNTS,
            payload: accounts
        });
    }

    if (!currentState.state || initialized !== currentState.state.initialized || locked !== currentState.state.locked) {
        actions.push({
            type: ACTION.UPDATE_APP_STATE,
            payload: { initialized, locked }
        });
    }

    if (currentLocale !== currentState.currentLocale) {
        actions.push({
            type: ACTION.UPDATE_FROM_LNG,
            payload: currentLocale
        });
    }

    if (balances.length !== currentState.balances.length) {
        actions.push({
            type: ACTION.UPDATE_BALANCES,
            payload: balances
        });
    }

    actions.forEach(action => store.dispatch(action));
}
