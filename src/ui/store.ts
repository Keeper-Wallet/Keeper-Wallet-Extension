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

export const store = createStore(
    combineReducers(reducers),
    { version: extension.runtime.getManifest().version },
    applyMiddleware(
        ...Object.values(middleware)
    )
);

