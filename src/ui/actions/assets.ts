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
export const favoriteAsset = createAction(ACTION.FAVORITE_ASSET);
export const setActiveAccount = createAction(ACTION.SET_ACTIVE_ACCOUNT);
