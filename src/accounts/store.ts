import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { applyMiddleware, createStore, PreloadedState } from 'redux';
import { createLogger } from 'redux-logger';
import thunk, { ThunkAction, ThunkDispatch } from 'redux-thunk';

import { KEEPERWALLET_DEBUG } from '../ui/appConfig';
import * as middleware from '../ui/midleware';
import type { UiAction } from '../ui/store';
import { reducer } from './reducer';

export type AccountsState = ReturnType<typeof reducer>;

export const useAccountsSelector: TypedUseSelectorHook<AccountsState> =
  useSelector;

export function createAccountsStore(
  preloadedState: PreloadedState<AccountsState>
) {
  const store = createStore<
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

  if (import.meta.webpackHot) {
    import.meta.webpackHot.accept('./reducer', () => {
      store.replaceReducer(reducer);
    });
  }

  return store;
}

export type AccountsStore = ReturnType<typeof createAccountsStore>;

export type AccountsThunkAction<ReturnType> = ThunkAction<
  ReturnType,
  AccountsState,
  undefined,
  UiAction
>;

export const useAppDispatch = () => useDispatch<AccountsStore['dispatch']>();
