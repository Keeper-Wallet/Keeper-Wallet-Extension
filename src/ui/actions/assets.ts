import { ACTION, createAction } from './constants';

export const getAsset = createAction(ACTION.GET_ASSETS);
export const updateAssets = createAction(ACTION.UPDATE_ASSETS);
export const favoriteAsset = createAction(ACTION.FAVORITE_ASSET);
