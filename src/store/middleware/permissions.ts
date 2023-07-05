import background from '../../ui/services/Background';
import { ACTION } from '../actions/constants';
import {
  allowOriginDone,
  autoOriginDone,
  deleteOriginDone,
  disallowOriginDone,
  pendingOrigin,
} from '../actions/permissions';
import { type AppAction, type AppMiddleware } from '../types';

let _timer: ReturnType<typeof setTimeout>;

const _permissionMW =
  (
    type: AppAction['type'],
    method: keyof typeof background,
    actionCb: (payload: unknown) => AppAction,
  ): AppMiddleware =>
  store =>
  next =>
  action => {
    if (action.type !== type) {
      return next(action);
    }
    store.dispatch(pendingOrigin(true));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (background[method] as any)(action.payload)
      .then(() => {
        clearTimeout(_timer);
        store.dispatch(actionCb(action.payload));
        store.dispatch(pendingOrigin(false));
        _timer = setTimeout(() => {
          store.dispatch(actionCb(null));
        }, 1000);
      })
      .catch(() => store.dispatch(pendingOrigin(false)));
  };

export const allowOrigin = _permissionMW(
  ACTION.PERMISSIONS.ALLOW,
  'allowOrigin',
  allowOriginDone,
);

export const setAutoOrigin = _permissionMW(
  ACTION.PERMISSIONS.SET_AUTO,
  'setAutoSign',
  autoOriginDone,
);

export const disAllowOrigin = _permissionMW(
  ACTION.PERMISSIONS.DISALLOW,
  'disableOrigin',
  disallowOriginDone,
);

export const deleteOrigin = _permissionMW(
  ACTION.PERMISSIONS.DELETE,
  'deleteOrigin',
  deleteOriginDone,
);
