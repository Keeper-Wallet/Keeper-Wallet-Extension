import { UiStore } from '../store';
import { ACTION } from './constants';
import { equals } from 'ramda';
import { SwopFiExchangerData } from 'ui/reducers/updateState';
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
  exchangers: {
    [network: string]: {
      [exchangerId: string]: SwopFiExchangerData;
    };
  };
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
    const actions = [];
    const {
      assets = {},
      accounts = [],
      currentLocale,
      currentNetworkAccounts = [],
      exchangers,
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
        payload: state.networks,
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
        payload: customNodes,
      });
    }

    if (!equals(currentState.customCodes, customCodes)) {
      actions.push({
        type: ACTION.UPDATE_CODES,
        payload: customCodes,
      });
    }

    if (!equals(currentState.customMatcher, customMatchers)) {
      actions.push({
        type: ACTION.UPDATE_MATCHER,
        payload: customMatchers,
      });
    }

    if (currentLocale && currentLocale !== currentState.currentLocale) {
      actions.push({
        type: ACTION.UPDATE_FROM_LNG,
        payload: currentLocale,
      });
    }

    if (!equals(uiState, currentState.uiState)) {
      actions.push({
        type: ACTION.UPDATE_UI_STATE,
        payload: uiState,
      });
    }

    if (currentNetwork !== currentState.currentNetwork) {
      actions.push({
        type: ACTION.UPDATE_CURRENT_NETWORK,
        payload: currentNetwork,
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
      actions.push({
        type: ACTION.UPDATE_MESSAGES,
        payload: { unapprovedMessages, messages },
      });

      toUpdateActiveNotify.messages = unapprovedMessages;
    }

    if (!equals(currentState.notifications, myNotifications)) {
      actions.push({
        type: ACTION.NOTIFICATIONS.SET,
        payload: myNotifications,
      });

      toUpdateActiveNotify.notifications = myNotifications;
    }

    if (
      toUpdateActiveNotify.messages !== currentState.messages ||
      toUpdateActiveNotify.notifications !== currentState.notifications
    ) {
      actions.push({
        type: ACTION.MESSAGES.SET_ACTIVE_AUTO,
        payload: toUpdateActiveNotify,
      });
    }

    if (!equals(selectedAccount, currentState.selectedAccount)) {
      actions.push({
        type: ACTION.UPDATE_SELECTED_ACCOUNT,
        payload: selectedAccount,
      });
    }

    if (!equals(currentNetworkAccounts, currentState.accounts)) {
      actions.push({
        type: ACTION.UPDATE_ACCOUNTS,
        payload: currentNetworkAccounts,
      });
    }

    if (!equals(accounts, currentState.allNetworksAccounts)) {
      actions.push({
        type: ACTION.UPDATE_ALL_NETWORKS_ACCOUNTS,
        payload: accounts,
      });
    }

    if (
      !currentState.state ||
      initialized !== currentState.state.initialized ||
      locked !== currentState.state.locked
    ) {
      actions.push({
        type: ACTION.UPDATE_APP_STATE,
        payload: { initialized, locked },
      });
    }

    if (!equals(balances, currentState.balances)) {
      actions.push({
        type: ACTION.UPDATE_BALANCES,
        payload: balances,
      });
    }

    if (!equals(assets[currentNetwork], currentState.assets)) {
      actions.push({
        type: ACTION.UPDATE_ASSETS,
        payload: assets[currentNetwork],
      });
    }

    if (
      !equals(exchangers[currentNetwork], currentState.exchangers) &&
      exchangers[currentNetwork] !== undefined
    ) {
      actions.push({
        type: ACTION.UPDATE_EXCHANGERS,
        payload: exchangers[currentNetwork],
      });
    }

    actions.forEach(action => store.dispatch(action));
  };
}
