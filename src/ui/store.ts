import { createStore, combineReducers, applyMiddleware } from 'redux';
import * as reducers from './reducers/updateState';
import * as middleware from './midleware/BackgroundMW';

export const store = createStore(
    combineReducers(reducers),
    { state: {} },
    applyMiddleware(
        ...Object.values(middleware)
    )
);

