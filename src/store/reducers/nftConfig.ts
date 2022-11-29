import { DEFAULT_MAIN_CONFIG, NftConfig } from '../../constants';
import { ACTION } from '../actions/constants';
import { AppAction } from '../types';

export function nftConfig(
  state = DEFAULT_MAIN_CONFIG.nfts,
  action: AppAction
): NftConfig {
  switch (action.type) {
    case ACTION.UPDATE_NFT_CONFIG:
      return action.payload;
    default:
      return state;
  }
}
