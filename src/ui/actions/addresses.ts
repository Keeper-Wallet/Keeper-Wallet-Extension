import { ACTION, createAction } from './constants';

export const setAddresses = createAction(ACTION.SET_ADDRESSES);
export const setAddress = createAction(ACTION.SET_ADDRESS);
export const removeAddress = createAction(ACTION.REMOVE_ADDRESS);
