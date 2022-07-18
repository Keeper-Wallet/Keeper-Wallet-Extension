import { DEFAULT_FEE_CONFIG, FeeConfig } from '../../constants';
import { ACTION } from '../actions';

export function feeConfig(
  state: FeeConfig | undefined = DEFAULT_FEE_CONFIG,
  action: { type: typeof ACTION.UPDATE_FEE_CONFIG; payload: FeeConfig }
): FeeConfig {
  switch (action.type) {
    case ACTION.UPDATE_FEE_CONFIG:
      return action.payload;
    default:
      return state;
  }
}
