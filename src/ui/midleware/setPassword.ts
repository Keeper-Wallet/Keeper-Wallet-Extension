import { ACTION } from '../actions/constants';
import { newUser, newUserUpdate } from '../actions';
import background from '../services/Background';

export const setPassword = store => next => action => {
    if (action.type === ACTION.SET_PASSWORD) {
        store.dispatch(newUser());
        background.initVault(action.payload)
            .catch((e) => store.dispatch(newUserUpdate(e)));
    }

    return next(action);
};
