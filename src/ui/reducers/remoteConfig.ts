import { ACTION } from '../actions';
import { simpleFabric } from './utils';

export const config = simpleFabric({})(ACTION.REMOTE_CONFIG.SET_CONFIG);
