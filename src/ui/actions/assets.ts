import { ACTION, createAction } from './constants';

export const getAsset = (payload: string, force = false) => ({
  type: ACTION.GET_ASSETS,
  payload,
  meta: { force },
});
export const getNfts = () => ({ type: ACTION.GET_NFTS });
export const getHistory = () => ({ type: ACTION.GET_HISTORY });
export const updateNfts = createAction(ACTION.UPDATE_NFTS);
export const updateHistory = createAction(ACTION.UPDATE_HISTORY);
export const updateAsset = createAction(ACTION.UPDATE_ASSET);
export const setActiveAccount = createAction(ACTION.SET_ACTIVE_ACCOUNT);
