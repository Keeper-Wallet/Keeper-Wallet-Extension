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
export const updateNfts = createAction(ACTION.UPDATE_NFTS);
export const updateTxHistory = createAction(ACTION.UPDATE_TX_HISTORY);
export const updateAliases = createAction(ACTION.UPDATE_ALIASES);
export const favoriteAsset = createAction(ACTION.FAVORITE_ASSET);
export const setActiveAccount = createAction(ACTION.SET_ACTIVE_ACCOUNT);
