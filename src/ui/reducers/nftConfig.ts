import { UiAction } from 'ui/store';
import { DEFAULT_NFT_CONFIG, NftConfig } from '../../constants';
import { ACTION } from '../actions';

export function nftConfig(
  state: NftConfig | undefined = DEFAULT_NFT_CONFIG,
  action: UiAction
): NftConfig {
  switch (action.type) {
    case ACTION.UPDATE_NFT_CONFIG:
      return action.payload;
    default:
      return state;
  }
}
