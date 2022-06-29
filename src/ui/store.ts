import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import * as reducers from './reducers/updateState';
import * as middleware from './midleware';
import { extension } from 'lib/extension';
import { KEEPERWALLET_DEBUG } from './appConfig';

const middlewares = Object.values(middleware);

if (KEEPERWALLET_DEBUG) {
  middlewares.push(() => next => action => {
    console.log('-->', action.type, action.payload, action.meta);
    return next(action);
  });
}

const reducer = combineReducers(reducers);

export type AppState = ReturnType<typeof reducer>;

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;

export function createUiStore() {
  return createStore(
    reducer,
    { version: extension.runtime.getManifest().version },
    applyMiddleware(...middlewares)
  );
}

export type UiStore = ReturnType<typeof createUiStore>;

export const useAppDispatch = () => useDispatch<UiStore['dispatch']>();
