import {
    ACTION,
    updateActiveMessage,
    approvePending,
    rejectOk,
    approveOk,
    approveError,
    pendingOrigin, allowOriginDone, disallowOriginDone, deleteOriginDone
} from '../actions';
import { MSG_STATUSES } from '../../constants'
import background from '../services/Background';

export const updateActiveMessageReducer = store => next => action => {
    const { activeMessage, messages } = store.getState();
    
    if (action.type === ACTION.UPDATE_MESSAGES) {
        const { unapprovedMessages, messages } = action.payload;
        
        if (!activeMessage) {
            store.dispatch(updateActiveMessage(unapprovedMessages[0]));
            return next(action);
        }
        
        const activeMessageUpdated = messages.find(({ id }) => id === activeMessage.id);
        
        if (activeMessageUpdated) {
            const { status } = activeMessageUpdated;
            store.dispatch(updateActiveMessage(activeMessageUpdated));
    
            // UNAPPROVED
            // SIGNED
            // PUBLISHED
            // FAILED
            // REJECTED
            
            switch (status) {
                case MSG_STATUSES.REJECTED:
                    store.dispatch(rejectOk(activeMessageUpdated.id));
                    store.dispatch(approvePending(false));
                    break;
                case MSG_STATUSES.SIGNED:
                case MSG_STATUSES.PUBLISHED:
                    store.dispatch(approveOk(activeMessageUpdated.id));
                    store.dispatch(approvePending(false));
                    break;
                case MSG_STATUSES.FAILED:
                    debugger;
                    store.dispatch(approvePending(false));
                    store.dispatch(approveError({ error: activeMessageUpdated.err.message, message: activeMessageUpdated }));
                    break;
            }
        }
        
        return next(action);
    }
    
    if (action.type === ACTION.APPROVE_REJECT_CLEAR && !action.payload) {
        store.dispatch(updateActiveMessage(messages[0]));
    }
    
    return next(action);
};

export const clearMessages = () => next => action => {
    
    if (ACTION.CLEAR_MESSAGES === action.type) {
        background.clearMessages();
        return;
    }
    
    return next(action);
};

export const allowOrigin = store => next => action => {
    if (action.type !== ACTION.PERMISSIONS.ALLOW) {
        return next(action);
    }
    
    store.dispatch(pendingOrigin(true));
    background.allowOrigin(action.payload)
        .catch(e => e)
        .then(() => {
            store.dispatch(pendingOrigin(false));
            store.dispatch(allowOriginDone(action.payload));
        });
    
};

export const disAllowOrigin = store => next => action => {
    if (action.type !== ACTION.PERMISSIONS.DISALLOW) {
        return next(action);
    }
    
    store.dispatch(pendingOrigin(true));
    background.disableOrigin(action.payload)
        .catch(e => e)
        .then(() => {
            store.dispatch(pendingOrigin(false));
            store.dispatch(disallowOriginDone(action.payload));
        });
};

export const deleteOrigin = store => next => action => {
    if (action.type !== ACTION.PERMISSIONS.DELETE) {
        return next(action);
    }
    
    store.dispatch(pendingOrigin(true));
    background.deleteOrigin(action.payload)
        .catch(e => e)
        .then(() => {
            store.dispatch(pendingOrigin(false));
            store.dispatch(deleteOriginDone(action.payload));
        });
};

export const approve = store => next => action => {
    if (action.type !== ACTION.APPROVE) {
        return next(action);
    }
    const messageId = action.payload;
    const { selectedAccount } = store.getState();
    background.approve(messageId, selectedAccount);
    store.dispatch(approvePending(true));
};

export const reject = store => next => action => {
    if (action.type !== ACTION.REJECT) {
        return next(action);
    }
    
    background.reject(action.payload);
    store.dispatch(approvePending(true));
};
