import { applyMiddleware, combineReducers, createStore } from 'redux';
import { createLogger } from 'redux-logger';
import * as reducers from 'ui/reducers/updateState';
import * as middleware from 'ui/midleware';
import { extension } from 'lib/extension';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { UiAction } from 'ui/store';
import { KEEPERWALLET_DEBUG } from 'ui/appConfig';

const reducer = combineReducers({
  router: reducers.router,
  addresses: reducers.addresses,
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
  version: reducers.version,
  localState: reducers.localState,
  uiState: reducers.uiState,
  allNetworksAccounts: reducers.allNetworksAccounts,
});

export type AccountsState = ReturnType<typeof reducer>;

export const useAccountsSelector: TypedUseSelectorHook<AccountsState> =
  useSelector;

export function createAccountsStore() {
  const middlewares = Object.values(middleware);

  if (KEEPERWALLET_DEBUG) {
    middlewares.push(
      createLogger({
        collapsed: true,
        diff: true,
      })
    );
  }

  return createStore<
    AccountsState,
    UiAction,
    Record<never, unknown>,
    Record<never, unknown>
  >(
    reducer,
    { version: extension.runtime.getManifest().version },
    applyMiddleware(...middlewares)
  );
}

export type AccountsStore = ReturnType<typeof createAccountsStore>;

export const useAppDispatch = () => useDispatch<AccountsStore['dispatch']>();
