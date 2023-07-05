import { deepEqual } from 'fast-equals';
import type { StorageLocalState } from 'storage/storage';
import { ACTION } from 'store/actions/constants';
import type { AppAction } from 'store/types';

import type { AccountsStore } from './store/types';

function getParam<S, D>(param: S, defaultParam: D) {
  if (param) {
    return param;
  }

  return param === null ? defaultParam : undefined;
}

export function createUpdateState(store: AccountsStore) {
  return (stateChanges: Partial<StorageLocalState>) => {
    const actions: AppAction[] = [];
    const currentState = store.getState();

    const idleOptions = getParam(stateChanges.idleOptions, {});
    if (idleOptions && !deepEqual(currentState.idleOptions, idleOptions)) {
      actions.push({
        type: ACTION.REMOTE_CONFIG.UPDATE_IDLE,
        payload: idleOptions,
      });
    }

    const customNodes = getParam(stateChanges.customNodes, {});
    if (customNodes && !deepEqual(currentState.customNodes, customNodes)) {
      actions.push({
        type: ACTION.UPDATE_NODES,
        payload: customNodes,
      });
    }

    const customCodes = getParam(stateChanges.customCodes, {});
    if (customCodes && !deepEqual(currentState.customCodes, customCodes)) {
      actions.push({
        type: ACTION.UPDATE_CODES,
        payload: customCodes,
      });
    }

    if (
      stateChanges.currentLocale &&
      stateChanges.currentLocale !== currentState.currentLocale
    ) {
      actions.push({
        type: ACTION.UPDATE_FROM_LNG,
        payload: stateChanges.currentLocale,
      });
    }

    const uiState = getParam(stateChanges.uiState, {});
    if (uiState && !deepEqual(uiState, currentState.uiState)) {
      actions.push({
        type: ACTION.UPDATE_UI_STATE,
        payload: uiState,
      });
    }

    const currentNetwork = getParam(stateChanges.currentNetwork, '');
    if (currentNetwork && currentNetwork !== currentState.currentNetwork) {
      actions.push({
        type: ACTION.UPDATE_CURRENT_NETWORK,
        payload: currentNetwork,
      });
    }

    const selectedAccount = getParam(
      stateChanges.selectedAccount,
      {} as unknown as undefined,
    );
    if (
      selectedAccount &&
      !deepEqual(selectedAccount, currentState.selectedAccount)
    ) {
      actions.push({
        type: ACTION.UPDATE_SELECTED_ACCOUNT,
        payload: selectedAccount,
      });
    }

    const accounts = getParam(stateChanges.accounts, []);
    if (accounts && !deepEqual(accounts, currentState.allNetworksAccounts)) {
      actions.push({
        type: ACTION.UPDATE_ALL_NETWORKS_ACCOUNTS,
        payload: accounts,
      });
    }

    if (
      (stateChanges.accounts != null &&
        !deepEqual(stateChanges.accounts, currentState.allNetworksAccounts)) ||
      (stateChanges.currentNetwork != null &&
        stateChanges.currentNetwork !== currentState.currentNetwork)
    ) {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const accounts =
        stateChanges.accounts || currentState.allNetworksAccounts;
      const network =
        stateChanges.currentNetwork || currentState.currentNetwork;

      actions.push({
        type: ACTION.UPDATE_CURRENT_NETWORK_ACCOUNTS,
        payload: accounts.filter(account => account.network === network),
      });
    }

    if (
      !currentState.state ||
      ('initialized' in stateChanges &&
        stateChanges.initialized !== currentState.state.initialized) ||
      ('locked' in stateChanges &&
        stateChanges.locked !== currentState.state.locked)
    ) {
      actions.push({
        type: ACTION.UPDATE_APP_STATE,
        payload: {
          initialized:
            stateChanges.initialized ?? currentState.state?.initialized,
          locked: stateChanges.locked ?? currentState.state?.locked,
        },
      });
    }

    const addresses = getParam(stateChanges.addresses, {});
    if (addresses && !deepEqual(addresses, currentState.addresses)) {
      store.dispatch({
        type: ACTION.UPDATE_ADDRESSES,
        payload: addresses,
      });
    }

    actions.forEach(action => store.dispatch(action));
  };
}
