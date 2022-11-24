import { UiAction } from 'ui/store';

import { DEFAULT_MAIN_CONFIG, FeeConfig } from '../../constants';
import { ACTION } from '../actions/constants';

export function feeConfig(
  state = DEFAULT_MAIN_CONFIG.fee,
  action: UiAction
): FeeConfig {
  switch (action.type) {
    case ACTION.UPDATE_FEE_CONFIG:
      return action.payload;
    default:
      return state;
  }
}
