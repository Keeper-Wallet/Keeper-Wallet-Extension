import { createStore, combineReducers, applyMiddleware } from 'redux';
import * as reducers from './reducers/updateState';
import * as middleware from './midleware';
import * as extension from 'extensionizer';


export const store = createStore(
    combineReducers(reducers),
    { version: extension.runtime.getManifest().version },
    applyMiddleware(
        ...Object.values(middleware)
    )
);

