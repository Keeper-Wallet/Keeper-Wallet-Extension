import { ACTION } from '../actions';

const createSimpleReducer = (def, type) => (store = def, action) => type === action.type ? action.payload : store;

export const notifications = createSimpleReducer([], ACTION.NOTIFICATIONS.SET);

export const activeNotification = (store = null, { type, payload }) => {
    switch (type) {
        case ACTION.NOTIFICATIONS.SET:
            if (!store && payload.length === 1) {
                return payload[0];
            }
            
            if (store) {
                const { origin } = store[0];
                const newItem = payload.find(([item]) => item.origin === origin);
                if (newItem) {
                    return  newItem;
                }
            }
            
            break;
        case ACTION.NOTIFICATIONS.SET_ACTIVE:
            return payload;
    }
    
    return store;
};

export const activePopup = (store = null,  { type, payload }) => {
    switch (type) {
        case ACTION.MESSAGES.SET_ACTIVE_AUTO:
            return getActiveFromState(store, payload.messages, payload.allMessages, payload.notifications);
        case ACTION.MESSAGES.UPDATE_ACTIVE:
            return payload;
        case ACTION.MESSAGES.SET_ACTIVE_MESSAGE:
            return  { notify: null, msg: payload };
        case ACTION.MESSAGES.SET_ACTIVE_NOTIFICATION:
            return  { msg: null, notify: payload };
    }
    
    return  store;
};


const getActiveFromState = (state, messages = [], allMessages = [], notifications = []) => {
    // Can activeMessage
    if (state != null && (state.msg || state.notify)) {
        
        // Update from messages
        if (state.msg) {
            const msgItem = allMessages.find((item) => item.id === state.msg.id);
            state.msg = msgItem || state.msg;
        }
        
        // Update from notifications
        if (state.notify) {
            const { origin } = state.notify[0];
            const newItem = notifications.find(([item]) => item.origin === origin);
            state.notify = newItem || state.notify;
        }
        
        return state;
    }
    
    // To msgList
    if (messages.length + notifications.length > 1) {
        return  null;
    }
    
    // Has one message
    if (messages.length === 1) {
        return { msg: messages[0], notify: null };
    }
    
    // Has one notification
    return { notify: notifications[0], msg: null };
};
