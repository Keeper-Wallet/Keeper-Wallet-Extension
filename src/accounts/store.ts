import { applyMiddleware, combineReducers, createStore } from 'redux';
import * as reducers from 'ui/reducers/updateState';
import * as middleware from 'ui/midleware';
import * as extension from 'extensionizer';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

const reducer = combineReducers({
  tab: reducers.tab,
  accounts: reducers.accounts,
  currentLocale: reducers.currentLocale,
  state: reducers.state,
  selectedAccount: reducers.selectedAccount,
  currentNetwork: reducers.currentNetwork,
  customCodes: reducers.customCodes,
  customNodes: reducers.customNodes,
  customMatcher: reducers.customMatcher,
  networks: reducers.networks,
  langs: reducers.langs,
  idleOptions: reducers.idleOptions,
  backTabs: reducers.backTabs,
  version: reducers.version,
  localState: reducers.localState,
  uiState: reducers.uiState,
  allNetworksAccounts: reducers.allNetworksAccounts,
});

export type AccountsState = ReturnType<typeof reducer>;

export const useAccountsSelector: TypedUseSelectorHook<AccountsState> =
  useSelector;

export function createAccountsStore() {
  return createStore(
    reducer,
    { version: extension.runtime.getManifest().version },
    applyMiddleware(...Object.values(middleware))
  );
}

export type AccountsStore = ReturnType<typeof createAccountsStore>;

export const useAppDispatch = () => useDispatch<AccountsStore['dispatch']>();
