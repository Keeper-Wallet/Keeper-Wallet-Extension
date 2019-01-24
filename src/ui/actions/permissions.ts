import {ACTION} from './constants';

export const allowOrigin = origin => ({
    type: ACTION.PERMISSIONS.ALLOW,
    payload: origin,
});

export const disableOrigin = origin => ({
    type: ACTION.PERMISSIONS.DISALLOW,
    payload: origin,
});

export const deleteOrigin = origin => ({
    type: ACTION.PERMISSIONS.DELETE,
    payload: origin,
});

export const pendingOrigin = state => ({
    type: ACTION.PERMISSIONS.PENDING,
    payload: state,
});

export const allowOriginDone = state => ({
    type: ACTION.PERMISSIONS.CONFIRMED_ALLOW,
    payload: state,
});

export const disallowOriginDone = state => ({
    type: ACTION.PERMISSIONS.CONFIRMED_ALLOW,
    payload: state,
});

export const deleteOriginDone = state => ({
    type: ACTION.PERMISSIONS.CONFIRMED_ALLOW,
    payload: state,
});
