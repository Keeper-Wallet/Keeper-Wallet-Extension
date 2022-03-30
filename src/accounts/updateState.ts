import { AccountsStore } from './store';
import { ACTION } from 'ui/actions/constants';
import { equals } from 'ramda';

interface Account {
  address: string;
  network: string;
}

interface UpdateStateInput {
  accounts?: Account[];
  currentLocale: string;
  currentNetwork?: string;
  currentNetworkAccounts: Account[];
  customCodes?: unknown;
  customNodes?: unknown;
  idleOptions?: unknown;
  initialized: boolean;
  locked: boolean;
  networks?: unknown[];
  selectedAccount?: { address?: string; network?: string };
  uiState: unknown;
}

export function createUpdateState(store: AccountsStore) {
  return (state: UpdateStateInput) => {
    const actions = [];

    const {
      accounts = [],
      currentLocale,
      currentNetworkAccounts = [],
      selectedAccount = {},
      initialized,
      locked,
      currentNetwork = '',
      idleOptions = {},
      uiState = {},
      customNodes = {},
      customCodes = {},
    } = state;
    const currentState = store.getState();

    if (state.networks && state.networks.length) {
      actions.push({
        type: ACTION.UPDATE_NETWORKS,
        payload: state.networks,
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

    actions.forEach(action => store.dispatch(action));
  };
}
