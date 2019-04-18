import { ACTION } from './constants';

export function setNotifications(notifications) {
    return {
        type: ACTION.NOTIFICATIONS.SET,
        payload: notifications,
    };
}

export function deleteNotifications(ids: [string]) {
    return {
        type: ACTION.NOTIFICATIONS.DELETE,
        payload: ids,
    };
}

export function setShowedNotification(id) {
    return {
        type: ACTION.NOTIFICATIONS.SET_SHOWED,
        payload: id,
    };
}


export function setActiveNotification(id) {
    return {
        type: ACTION.NOTIFICATIONS.SET_ACTIVE,
        payload: id,
    };
}

export function setShowNotification(options) {
    return {
        type: ACTION.NOTIFICATIONS.SET_PERMS,
        payload: options,
    }
}

