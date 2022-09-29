import { UiAction } from 'ui/store';
import { DEFAULT_FEE_CONFIG, FeeConfig } from '../../constants';
import { ACTION } from '../actions/constants';

export function feeConfig(
  state: FeeConfig | undefined = DEFAULT_FEE_CONFIG,
  action: UiAction
): FeeConfig {
  switch (action.type) {
    case ACTION.UPDATE_FEE_CONFIG:
      return action.payload;
    default:
      return state;
  }
}
