import {
    ACTION,
    pendingOrigin,
    allowOriginDone,
    autoOriginDone,
    disallowOriginDone,
    deleteOriginDone
} from '../actions';
import { MSG_STATUSES } from '../../constants'
import background from '../services/Background';

let _timer;

const _permissionMW = (type, method, actionCb) => store => next => action => {
    if (action.type !== type) {
        return next(action);
    }
    store.dispatch(pendingOrigin(true));
    background[method](action.payload)
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

export const allowOrigin = _permissionMW(ACTION.PERMISSIONS.ALLOW, 'allowOrigin', allowOriginDone);

export const setAutoOrigin = _permissionMW(ACTION.PERMISSIONS.SET_AUTO, 'setAutoSign', autoOriginDone);

export const disAllowOrigin = _permissionMW(ACTION.PERMISSIONS.DISALLOW, 'disableOrigin', disallowOriginDone);

export const deleteOrigin = _permissionMW(ACTION.PERMISSIONS.DELETE, 'deleteOrigin', deleteOriginDone);

