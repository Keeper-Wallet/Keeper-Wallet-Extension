import { ACTION } from '../actions';

const createSimpleReducer = (def, type) => (store = def, action) => type === action.type ? action.payload : store;

export const notifications = createSimpleReducer([], ACTION.NOTIFICATIONS.SET);

export const activeNotification = (store = null, { type, payload }) => {
    switch (type) {
        case ACTION.NOTIFICATIONS.SET:
            if (!store && payload.length === 1) {
                return payload[0];
            }
            break;
        case ACTION.NOTIFICATIONS.SET_ACTIVE:
            return payload;
    }
    
    return store;
};
