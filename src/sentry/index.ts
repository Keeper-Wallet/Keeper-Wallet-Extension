import * as Sentry from '@sentry/react';
import backgroundService from 'ui/services/Background';

import { KEEPERWALLET_DEBUG } from '../constants';

export function initUiSentry({
  ignoreErrorContext,
  source,
}: {
  ignoreErrorContext: 'beforeSendAccounts' | 'beforeSendPopup';
  source: 'popup' | 'accounts';
}) {
  return Sentry.init({
    dsn: __SENTRY_DSN__,
    environment: __SENTRY_ENVIRONMENT__,
    release: __SENTRY_RELEASE__,
    debug: KEEPERWALLET_DEBUG,
    autoSessionTracking: false,
    initialScope: {
      tags: {
        source,
      },
    },
    integrations: [new Sentry.Integrations.Breadcrumbs({ dom: false })],
    beforeSend: async (event, hint) => {
      const message =
        hint &&
        hint.originalException &&
        typeof hint.originalException === 'object' &&
        'message' in hint.originalException &&
        typeof hint.originalException.message === 'string' &&
        hint.originalException.message
          ? hint.originalException.message
          : String(hint?.originalException);

      const [shouldIgnoreGlobal, shouldIgnoreContext] = await Promise.all([
        backgroundService.shouldIgnoreError('beforeSend', message),
        backgroundService.shouldIgnoreError(ignoreErrorContext, message),
      ]);

      const shouldIgnore = shouldIgnoreGlobal || shouldIgnoreContext;

      if (shouldIgnore) {
        return null;
      }

      return event;
    },
  });
}
