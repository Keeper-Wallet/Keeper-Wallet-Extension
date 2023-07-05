import type { StorageLocalState } from 'storage/storage';

import { ACTION } from '../actions/constants';
import { simpleFabric } from './utils';

export const config = simpleFabric(
  {} as StorageLocalState['config'] | Record<never, unknown>,
)(ACTION.REMOTE_CONFIG.SET_CONFIG);
