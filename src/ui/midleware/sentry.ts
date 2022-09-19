import * as Sentry from '@sentry/react';
import { ACTION } from '../actions/constants';
import { UiMiddleware } from 'ui/store';

export const sentryBreadcrumbs: UiMiddleware = () => next => action => {
  Sentry.addBreadcrumb({
    type: 'info',
    category: 'redux.action',
    data: {
      'action.type': action.type,
    },
  });

  switch (action.type) {
    case ACTION.UPDATE_CURRENT_NETWORK:
      Sentry.setTag('network', action.payload);

      Sentry.addBreadcrumb({
        type: 'user',
        category: 'network-change',
        level: Sentry.Severity.Info,
        message: `Change network to ${action.payload}`,
      });
      break;
    case ACTION.UPDATE_SELECTED_ACCOUNT:
      Sentry.addBreadcrumb({
        type: 'user',
        category: 'account-change',
        level: Sentry.Severity.Info,
        message: 'Change active account',
      });
      break;
  }

  return next(action);
};
