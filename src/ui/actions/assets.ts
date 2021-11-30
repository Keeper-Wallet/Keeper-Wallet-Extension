import { ACTION, createAction } from './constants';

export const getAsset = (payload: string, force = false) => ({
  type: ACTION.GET_ASSETS,
  payload,
  meta: { force },
});
export const getNfts = (address: string) => ({
  type: ACTION.GET_NFTS,
  payload: address,
});
export const getTxHistory = (address: string) => ({
  type: ACTION.GET_TX_HISTORY,
  payload: address,
});
export const getAliases = (address: string) => ({
  type: ACTION.GET_ALIASES,
  payload: address,
});
export const updateNfts = createAction(ACTION.UPDATE_NFTS);
export const updateTxHistory = createAction(ACTION.UPDATE_TX_HISTORY);
export const updateAliases = createAction(ACTION.UPDATE_ALIASES);
export const updateAsset = createAction(ACTION.UPDATE_ASSET);
export const setActiveAccount = createAction(ACTION.SET_ACTIVE_ACCOUNT);
