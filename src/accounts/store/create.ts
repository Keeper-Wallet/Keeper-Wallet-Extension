import { applyMiddleware, createStore } from 'redux';
import { createLogger } from 'redux-logger';
import thunk, { type ThunkDispatch } from 'redux-thunk';

import * as middleware from '../../store/middleware';
import type { AppAction } from '../../store/types';
import { reducer } from './reducer';
import type { AccountsState } from './types';

export function createAccountsStore() {
  const store = createStore<
    AccountsState,
    AppAction,
    { dispatch: ThunkDispatch<AccountsState, undefined, AppAction> },
    Record<never, unknown>
  >(
    reducer,
    applyMiddleware(
      thunk,
      ...Object.values(middleware),
      ...(process.env.NODE_ENV === 'development'
        ? [createLogger({ collapsed: true })]
        : []),
    ),
  );

  if (import.meta.webpackHot) {
    import.meta.webpackHot.accept('./reducer', () => {
      store.replaceReducer(reducer);
    });
  }

  return store;
}
