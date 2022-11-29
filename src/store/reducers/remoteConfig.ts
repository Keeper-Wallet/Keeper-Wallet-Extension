import { BackgroundGetStateResult } from '../../ui/services/Background';
import { ACTION } from '../actions/constants';
import { simpleFabric } from './utils';

export const config = simpleFabric(
  {} as BackgroundGetStateResult['config'] | Record<never, unknown>
)(ACTION.REMOTE_CONFIG.SET_CONFIG);
