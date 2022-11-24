import { UiAction } from 'ui/store';

import { DEFAULT_MAIN_CONFIG, NftConfig } from '../../constants';
import { ACTION } from '../actions/constants';

export function nftConfig(
  state = DEFAULT_MAIN_CONFIG.nfts,
  action: UiAction
): NftConfig {
  switch (action.type) {
    case ACTION.UPDATE_NFT_CONFIG:
      return action.payload;
    default:
      return state;
  }
}
