import { store } from '../store';
import { ACTION } from './constants';

const deepEqualByJSON = (obj1, obj2) => JSON.stringify(obj1) === JSON.stringify(obj2);

export function updateState(state) {
    const actions = [];
    const {
        currentLocale,
        currentNetworkAccounts: accounts = [],
        selectedAccount = {},
        initialized,
        locked,
        currentNetwork = '',
        messages = [],
        balances = [],
        uiState = {},
        customNodes = {}
    } = state;
    const currentState = store.getState();

    if (state.networks && state.networks.length) {
        actions.push({
            type: ACTION.UPDATE_NETWORKS,
            payload: state.networks
        });
    }

    if (!deepEqualByJSON(currentState.customNodes, customNodes)) {
        actions.push({
            type: ACTION.UPDATE_NODES,
            payload: customNodes
        });
    }

    if (currentLocale && currentLocale !== currentState.currentLocale) {
        actions.push({
            type: ACTION.UPDATE_FROM_LNG,
            payload: currentLocale
        });
    }

    if (uiState) {
        actions.push({
            type: ACTION.UPDATE_UI_STATE,
            payload: uiState
        });
    }

    if (currentNetwork !== currentState.currentNetwork) {
        actions.push({
            type: ACTION.UPDATE_CURRENT_NETWORK,
            payload: currentNetwork
        });
    }

    if (!deepEqualByJSON(messages, currentState.messages)) {
        actions.push({
            type: ACTION.UPDATE_MESSAGES,
            payload: messages
        });
    }

    if (selectedAccount.address !== currentState.selectedAccount.address ) {
        actions.push({
            type: ACTION.UPDATE_SELECTED_ACCOUNT,
            payload: selectedAccount
        });
    }
    
    if (!deepEqualByJSON(accounts, currentState.accounts)) {
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

    const hasNewBalance = Object.keys(balances).filter(key => balances[key] !== currentState.balances[key]).length;

    if (hasNewBalance) {
        actions.push({
            type: ACTION.UPDATE_BALANCES,
            payload: balances
        });
    }

    actions.forEach(action => store.dispatch(action));
}
