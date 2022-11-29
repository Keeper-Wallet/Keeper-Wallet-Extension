import { combineReducers } from 'redux';

import { ACTION } from '../actions/constants';
import { simpleFabric } from './utils';

const pending = simpleFabric(false)(ACTION.PERMISSIONS.PENDING);
const allowed = simpleFabric(null)(ACTION.PERMISSIONS.CONFIRMED_ALLOW);
const disallowed = simpleFabric(null)(ACTION.PERMISSIONS.CONFIRMED_DISALLOW);
const deleted = simpleFabric(null)(ACTION.PERMISSIONS.CONFIRMED_DELETE);

export const permissions = combineReducers({
  pending,
  allowed,
  disallowed,
  deleted,
});
