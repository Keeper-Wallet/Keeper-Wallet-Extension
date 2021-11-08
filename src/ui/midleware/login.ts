import { ACTION } from '../actions/constants';
import { loginUpdate, loginPending } from '../actions';
import background from '../services/Background';

export const login = store => next => action => {
  if (action.type === ACTION.LOGIN) {
    store.dispatch(loginPending());
    background
      .unlock(action.payload)
      .catch(e => store.dispatch(loginUpdate(e)));
  }

  return next(action);
};
