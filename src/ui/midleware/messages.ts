import { ACTION, updateActiveMessage } from '../actions';

export const updateActiveMessageRed = store => next => action => {
    const { messages, activeMessage } = store.getState();
    
    if (activeMessage) {
        return next(action);
    }
    
    if (action.type === ACTION.UPDATE_MESSAGES) {
        store.dispatch(updateActiveMessage(action.payload[0]));
    }
    
    if (action.type === ACTION.UPDATE_ACTIVE_MESSAGE && !action.payload && messages.length) {
        store.dispatch(updateActiveMessage(messages[0]));
    }
    
    return next(action);
};
