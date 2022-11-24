import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import {
  applyMiddleware,
  combineReducers,
  createStore,
  PreloadedState,
} from 'redux';
import { createLogger } from 'redux-logger';
import thunk, { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { KEEPERWALLET_DEBUG } from 'ui/appConfig';
import * as middleware from 'ui/midleware';
import * as reducers from 'ui/reducers/updateState';
import { UiAction } from 'ui/store';

const reducer = combineReducers({
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

export function createAccountsStore(
  preloadedState: PreloadedState<AccountsState>
) {
  return createStore<
    AccountsState,
    UiAction,
    {
      dispatch: ThunkDispatch<AccountsState, undefined, UiAction>;
    },
    Record<never, unknown>
  >(
    reducer,
    preloadedState,
    applyMiddleware(
      thunk,
      ...Object.values(middleware),
      ...(KEEPERWALLET_DEBUG
        ? [
            createLogger({
              collapsed: true,
              diff: true,
            }),
          ]
        : [])
    )
  );
}

export type AccountsStore = ReturnType<typeof createAccountsStore>;

export type AccountsThunkAction<ReturnType> = ThunkAction<
  ReturnType,
  AccountsState,
  undefined,
  UiAction
>;

export const useAppDispatch = () => useDispatch<AccountsStore['dispatch']>();
