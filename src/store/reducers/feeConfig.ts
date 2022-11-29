import { DEFAULT_MAIN_CONFIG, FeeConfig } from '../../constants';
import { ACTION } from '../actions/constants';
import { AppAction } from '../types';

export function feeConfig(
  state = DEFAULT_MAIN_CONFIG.fee,
  action: AppAction
): FeeConfig {
  switch (action.type) {
    case ACTION.UPDATE_FEE_CONFIG:
      return action.payload;
    default:
      return state;
  }
}
