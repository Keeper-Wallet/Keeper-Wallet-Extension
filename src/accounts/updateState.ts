import { AccountsStore } from './store';
import { ACTION } from 'ui/actions/constants';
import { equals } from 'ramda';

function getParam<S>(param: S, defaultParam: S) {
  if (param) {
    return param;
  }

  return param === null ? defaultParam : undefined;
}

interface Account {
  address: string;
  network: string;
}

interface UpdateStateInput {
  addresses: Record<string, string>;
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
  selectedAccount?: { address?: string; network?: string } | null;
  uiState: unknown;
}

export function createUpdateState(store: AccountsStore) {
  return (state: UpdateStateInput) => {
    const actions = [];
    const currentState = store.getState();

    if (state.networks && state.networks.length) {
      actions.push({
        type: ACTION.UPDATE_NETWORKS,
        payload: state.networks,
      });
    }

    const idleOptions = getParam(state.idleOptions, {});
    if (idleOptions && !equals(currentState.idleOptions, idleOptions)) {
      actions.push({
        type: ACTION.REMOTE_CONFIG.UPDATE_IDLE,
        payload: idleOptions,
      });
    }

    const customNodes = getParam(state.customNodes, {});
    if (customNodes && !equals(currentState.customNodes, customNodes)) {
      actions.push({
        type: ACTION.UPDATE_NODES,
        payload: customNodes,
      });
    }

    const customCodes = getParam(state.customCodes, {});
    if (customCodes && !equals(currentState.customCodes, customCodes)) {
      actions.push({
        type: ACTION.UPDATE_CODES,
        payload: customCodes,
      });
    }

    if (
      state.currentLocale &&
      state.currentLocale !== currentState.currentLocale
    ) {
      actions.push({
        type: ACTION.UPDATE_FROM_LNG,
        payload: state.currentLocale,
      });
    }

    const uiState = getParam(state.uiState, {});
    if (uiState && !equals(uiState, currentState.uiState)) {
      actions.push({
        type: ACTION.UPDATE_UI_STATE,
        payload: uiState,
      });
    }

    const currentNetwork = getParam(state.currentNetwork, '');
    if (
      currentNetwork !== undefined &&
      currentNetwork !== currentState.currentNetwork
    ) {
      actions.push({
        type: ACTION.UPDATE_CURRENT_NETWORK,
        payload: currentNetwork,
      });
    }

    const selectedAccount = getParam(state.selectedAccount, {});
    if (
      selectedAccount &&
      !equals(selectedAccount, currentState.selectedAccount)
    ) {
      actions.push({
        type: ACTION.UPDATE_SELECTED_ACCOUNT,
        payload: selectedAccount,
      });
    }

    const currentNetworkAccounts = getParam(state.currentNetworkAccounts, []);
    if (
      currentNetworkAccounts &&
      !equals(currentNetworkAccounts, currentState.accounts)
    ) {
      actions.push({
        type: ACTION.UPDATE_ACCOUNTS,
        payload: currentNetworkAccounts,
      });
    }

    const accounts = getParam(state.accounts, []);
    if (accounts && !equals(accounts, currentState.allNetworksAccounts)) {
      actions.push({
        type: ACTION.UPDATE_ALL_NETWORKS_ACCOUNTS,
        payload: accounts,
      });
    }

    if (
      !currentState.state ||
      state.initialized !== currentState.state.initialized ||
      state.locked !== currentState.state.locked
    ) {
      actions.push({
        type: ACTION.UPDATE_APP_STATE,
        payload: { initialized: state.initialized, locked: state.locked },
      });
    }

    const addresses = getParam(state.addresses, {});
    if (addresses && !equals(addresses, currentState.addresses)) {
      store.dispatch({
        type: ACTION.UPDATE_ADDRESSES,
        payload: addresses,
      });
    }

    actions.forEach(action => store.dispatch(action));
  };
}
