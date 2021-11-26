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
export const getHistory = (address: string) => ({
  type: ACTION.GET_HISTORY,
  payload: address,
});
export const getAliases = (address: string) => ({
  type: ACTION.GET_ALIASES,
  payload: address,
});
export const updateNfts = createAction(ACTION.UPDATE_NFTS);
export const updateHistory = createAction(ACTION.UPDATE_HISTORY);
export const updateAliases = createAction(ACTION.UPDATE_ALIASES);
export const updateAsset = createAction(ACTION.UPDATE_ASSET);
export const setActiveAccount = createAction(ACTION.SET_ACTIVE_ACCOUNT);
