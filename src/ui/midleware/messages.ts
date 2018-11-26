import { ACTION, updateActiveMessage } from '../actions';

export const updateActiveMessageReducer = store => next => action => {
    const { messages, activeMessage } = store.getState();
    
    if (activeMessage && action.type === ACTION.UPDATE_MESSAGES) {
        return next(action);
    }
    
    if (action.type === ACTION.UPDATE_MESSAGES) {
        store.dispatch(updateActiveMessage(action.payload[0]));
    }
    
    if (action.type === ACTION.APPROVE_REJECT_CLEAR && !action.payload) {
        store.dispatch(updateActiveMessage(messages[0]));
    }
    
    return next(action);
};
