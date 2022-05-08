import { UiStore } from '../store';
import { ACTION } from './constants';
import { equals } from 'ramda';
import { AssetDetail } from '../services/Background';

interface Account {
  address: string;
  network: string;
}

interface UpdateStateInput {
  assets: Record<string, Record<string, AssetDetail>>;
  accounts?: Account[];
  balances?: Record<
    string,
    {
      available: string;
      leasedOut: string;
    }
  >;
  config?: unknown;
  currentLocale: string;
  currentNetwork?: string;
  currentNetworkAccounts: Account[];
  customCodes?: unknown;
  customMatchers?: unknown;
  customNodes?: unknown;
  idleOptions?: unknown;
  initialized: boolean;
  locked: boolean;
  messages?: unknown[];
  networks?: unknown[];
  myNotifications?: unknown[];
  origins?: unknown;
  selectedAccount?: { address?: string; network?: string };
  uiState?: unknown;
}

export function createUpdateState(store: UiStore) {
  return (state: UpdateStateInput) => {
    const {
      assets = {},
      accounts = [],
      currentLocale,
      currentNetworkAccounts = [],
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
      store.dispatch({
        type: ACTION.UPDATE_NETWORKS,
        payload: state.networks,
      });
    }

    if (!equals(currentState.config, config)) {
      store.dispatch({
        type: ACTION.REMOTE_CONFIG.SET_CONFIG,
        payload: config,
      });
    }

    if (!equals(currentState.idleOptions, idleOptions)) {
      store.dispatch({
        type: ACTION.REMOTE_CONFIG.UPDATE_IDLE,
        payload: idleOptions,
      });
    }

    if (!equals(currentState.customNodes, customNodes)) {
      store.dispatch({
        type: ACTION.UPDATE_NODES,
        payload: customNodes,
      });
    }

    if (!equals(currentState.customCodes, customCodes)) {
      store.dispatch({
        type: ACTION.UPDATE_CODES,
        payload: customCodes,
      });
    }

    if (!equals(currentState.customMatcher, customMatchers)) {
      store.dispatch({
        type: ACTION.UPDATE_MATCHER,
        payload: customMatchers,
      });
    }

    if (currentLocale && currentLocale !== currentState.currentLocale) {
      store.dispatch({
        type: ACTION.UPDATE_FROM_LNG,
        payload: currentLocale,
      });
    }

    if (!equals(uiState, currentState.uiState)) {
      store.dispatch({
        type: ACTION.UPDATE_UI_STATE,
        payload: uiState,
      });
    }

    if (currentNetwork !== currentState.currentNetwork) {
      store.dispatch({
        type: ACTION.UPDATE_CURRENT_NETWORK,
        payload: currentNetwork,
      });
    }

    if (!equals(origins, currentState.origins)) {
      store.dispatch({
        type: ACTION.UPDATE_ORIGINS,
        payload: origins,
      });
    }

    function isMyMessages(msg) {
      try {
        return (
          msg.status === 'unapproved' &&
          msg.account.address === selectedAccount.address &&
          msg.account.network === selectedAccount.network
        );
      } catch (e) {
        return false;
      }
    }

    const unapprovedMessages = messages.filter(isMyMessages);
    const toUpdateActiveNotify = {
      allMessages: messages,
      messages: currentState.messages,
      notifications: currentState.notifications,
    };

    if (!equals(unapprovedMessages, currentState.messages)) {
      store.dispatch({
        type: ACTION.UPDATE_MESSAGES,
        payload: { unapprovedMessages, messages },
      });

      toUpdateActiveNotify.messages = unapprovedMessages;
    }

    if (!equals(currentState.notifications, myNotifications)) {
      store.dispatch({
        type: ACTION.NOTIFICATIONS.SET,
        payload: myNotifications,
      });

      toUpdateActiveNotify.notifications = myNotifications;
    }

    if (
      toUpdateActiveNotify.messages !== currentState.messages ||
      toUpdateActiveNotify.notifications !== currentState.notifications
    ) {
      store.dispatch({
        type: ACTION.MESSAGES.SET_ACTIVE_AUTO,
        payload: toUpdateActiveNotify,
      });
    }

    if (!equals(selectedAccount, currentState.selectedAccount)) {
      store.dispatch({
        type: ACTION.UPDATE_SELECTED_ACCOUNT,
        payload: selectedAccount,
      });
    }

    if (!equals(currentNetworkAccounts, currentState.accounts)) {
      store.dispatch({
        type: ACTION.UPDATE_ACCOUNTS,
        payload: currentNetworkAccounts,
      });
    }

    if (!equals(accounts, currentState.allNetworksAccounts)) {
      store.dispatch({
        type: ACTION.UPDATE_ALL_NETWORKS_ACCOUNTS,
        payload: accounts,
      });
    }

    if (
      !currentState.state ||
      initialized !== currentState.state.initialized ||
      locked !== currentState.state.locked
    ) {
      store.dispatch({
        type: ACTION.UPDATE_APP_STATE,
        payload: { initialized, locked },
      });
    }

    if (!equals(balances, currentState.balances)) {
      store.dispatch({
        type: ACTION.UPDATE_BALANCES,
        payload: balances,
      });
    }

    if (!equals(assets[currentNetwork], currentState.assets)) {
      store.dispatch({
        type: ACTION.SET_ASSETS,
        payload: assets[currentNetwork],
      });
    }
  };
}
