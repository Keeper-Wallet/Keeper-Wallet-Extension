import { ACTION } from '../actions';
import { combineReducers } from 'redux';
import { simpleFabric } from './utils';

const loading = simpleFabric(false)(ACTION.PAIRING.LOADING);
const seed = simpleFabric(null)(ACTION.PAIRING.SET_SEED);

export const pairing = combineReducers({
    loading,
    seed
});


