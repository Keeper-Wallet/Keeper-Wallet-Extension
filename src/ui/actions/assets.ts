import { ACTION, createAction } from './constants';

type CompareValue = any;

export const getAsset = (
  payload: string,
  compareFields: { [assetField: string]: CompareValue } = {}
) => ({
  type: ACTION.GET_ASSETS,
  payload,
  meta: { compareFields },
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
