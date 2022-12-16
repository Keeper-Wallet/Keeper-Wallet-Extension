import { addBreadcrumb, setTag } from '@sentry/browser';

import { ACTION } from '../actions/constants';
import { AppMiddleware } from '../types';

export const sentryBreadcrumbs: AppMiddleware = () => next => action => {
  addBreadcrumb({
    type: 'info',
    category: 'redux.action',
    data: {
      'action.type': action.type,
    },
  });

  switch (action.type) {
    case ACTION.UPDATE_CURRENT_NETWORK:
      setTag('network', action.payload);

      addBreadcrumb({
        type: 'user',
        category: 'network-change',
        level: 'info',
        message: `Change network to ${action.payload}`,
      });
      break;
    case ACTION.UPDATE_SELECTED_ACCOUNT:
      addBreadcrumb({
        type: 'user',
        category: 'account-change',
        level: 'info',
        message: 'Change active account',
      });
      break;
  }

  return next(action);
};
