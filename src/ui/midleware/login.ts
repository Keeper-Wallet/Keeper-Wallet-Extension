import { ACTION } from '../actions/constants';
import { loginPending, loginUpdate } from '../actions/localState';
import background from '../services/Background';
import { UiMiddleware } from 'ui/store';

export const login: UiMiddleware = store => next => action => {
  if (action.type === ACTION.LOGIN) {
    store.dispatch(loginPending());
    background
      .unlock(action.payload)
      .catch(e => store.dispatch(loginUpdate(e)));
  }

  return next(action);
};
