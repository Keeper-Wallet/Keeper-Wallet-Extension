import { applyMiddleware, createStore, PreloadedState } from 'redux';
import { createLogger } from 'redux-logger';
import thunk, { ThunkDispatch } from 'redux-thunk';
import { AppAction } from 'store/types';

import * as middleware from '../../store/middleware';
import { KEEPERWALLET_DEBUG } from '../../ui/appConfig';
import { reducer } from './reducer';
import type { PopupState } from './types';

export function createPopupStore(preloadedState: PreloadedState<PopupState>) {
  const store = createStore<
    PopupState,
    AppAction,
    { dispatch: ThunkDispatch<PopupState, undefined, AppAction> },
    Record<never, unknown>
  >(
    reducer,
    preloadedState,
    applyMiddleware(
      thunk,
      ...Object.values(middleware),
      ...(KEEPERWALLET_DEBUG
        ? [createLogger({ collapsed: true, diff: true })]
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
