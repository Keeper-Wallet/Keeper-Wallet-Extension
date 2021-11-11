import { useSelector, TypedUseSelectorHook, useDispatch } from 'react-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import * as reducers from './reducers/updateState';
import * as middleware from './midleware';
import * as extension from 'extensionizer';
import { WAVESKEEPER_DEBUG } from './appConfig';

if (WAVESKEEPER_DEBUG) {
  middleware['logMW'] = store => next => action => {
    console.log('-->', action.type, action.payload);
    return next(action);
  };
}

const reducer = combineReducers(reducers);

export type AppState = ReturnType<typeof reducer>;

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;

export const store = createStore(
  reducer,
  { version: extension.runtime.getManifest().version },
  applyMiddleware(...Object.values(middleware))
);

export const useAppDispatch = () => useDispatch<typeof store.dispatch>();
