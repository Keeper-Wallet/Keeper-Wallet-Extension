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
});

export type AppState = ReturnType<typeof reducer>;

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;

export function createUiStore() {
  return createStore(
    reducer,
    { version: extension.runtime.getManifest().version },
    applyMiddleware(...Object.values(middleware))
  );
}

export type UiStore = ReturnType<typeof createUiStore>;

export const useAppDispatch = () => useDispatch<UiStore['dispatch']>();
