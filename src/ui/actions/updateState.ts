import { store } from '../store';
import { ACTION } from './constants';
import { equals } from 'ramda';

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
        customNodes = {},
        customCodes = {},
        customMatchers = {},
        origins = {},
        config = {},
        idleOptions = {},
        myNotifications = [],
    } = state;
    const currentState = store.getState();

    if (state.networks && state.networks.length) {
        actions.push({
            type: ACTION.UPDATE_NETWORKS,
            payload: state.networks
        });
    }
    
    if (!equals(currentState.notifications, myNotifications)) {
        actions.push({
            type: ACTION.NOTIFICATIONS.SET,
            payload: myNotifications,
        });
    }
    
    if (!equals(currentState.config, config)) {
        actions.push({
            type: ACTION.REMOTE_CONFIG.SET_CONFIG,
            payload: config,
        });
    }
    
    if (!equals(currentState.idleOptions, idleOptions)) {
        actions.push({
            type: ACTION.REMOTE_CONFIG.UPDATE_IDLE,
            payload: idleOptions,
        });
    }
    
    if (!equals(currentState.customNodes, customNodes)) {
        actions.push({
            type: ACTION.UPDATE_NODES,
            payload: customNodes
        });
    }
    
    if (!equals(currentState.customCodes, customCodes)) {
        actions.push({
            type: ACTION.UPDATE_CODES,
            payload: customCodes
        });
    }
    
    if (!equals(currentState.customMatcher, customMatchers)) {
        actions.push({
            type: ACTION.UPDATE_MATCHER,
            payload: customMatchers
        });
    }

    if (currentLocale && currentLocale !== currentState.currentLocale) {
        actions.push({
            type: ACTION.UPDATE_FROM_LNG,
            payload: currentLocale
        });
    }

    if (!equals(uiState, currentState.uiState)) {
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

    if (!equals(origins, currentState.origins)) {
        actions.push({
            type: ACTION.UPDATE_ORIGINS,
            payload: origins,
        });
    }
    
    function isMyMessages(msg) {
        try {
            return msg.status === 'unapproved' && (msg.account.address === selectedAccount.address && msg.account.network === selectedAccount.network);
        } catch (e) {
            return false;
        }
    }
    
    const unapprovedMessages = messages.filter(isMyMessages);
    
    if (!equals(unapprovedMessages, currentState.messages)) {
        actions.push({
            type: ACTION.UPDATE_MESSAGES,
            payload: { unapprovedMessages, messages },
        });
    }
    
    if (selectedAccount.address !== currentState.selectedAccount.address ) {
        actions.push({
            type: ACTION.UPDATE_SELECTED_ACCOUNT,
            payload: selectedAccount
        });
    }
    
    if (!equals(accounts, currentState.accounts)) {
        actions.push({
            type: ACTION.UPDATE_ACCOUNTS,
            payload: accounts
        });
    }

    if (
        !currentState.state ||
        initialized !== currentState.state.initialized ||
        locked !== currentState.state.locked
    ) {
        actions.push({
            type: ACTION.UPDATE_APP_STATE,
            payload: { initialized, locked }
        });
    }
    
    if (!equals(balances, currentState.balances)) {
        actions.push({
            type: ACTION.UPDATE_BALANCES,
            payload: balances
        });
    }

    actions.forEach(action => store.dispatch(action));
}
