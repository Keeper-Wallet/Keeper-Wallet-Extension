import { ACTION, createAction } from './constants';

export const pairingLoading = createAction(ACTION.PAIRING.LOADING);
export const pairingSetData = createAction(ACTION.PAIRING.SET_SEED);
export const pairingGetData = createAction(ACTION.PAIRING.GET_SEED);
