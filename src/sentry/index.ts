import { WAVESKEEPER_DEBUG } from '../constants';
import * as Sentry from '@sentry/react';
import backgroundService from 'ui/services/Background';

export function initUiSentry(source: 'popup' | 'accounts') {
  return Sentry.init({
    dsn: __SENTRY_DSN__,
    environment: __SENTRY_ENVIRONMENT__,
    release: __SENTRY_RELEASE__,
    debug: WAVESKEEPER_DEBUG,
    autoSessionTracking: false,
    initialScope: {
      tags: {
        source: source,
      },
    },
    integrations: [new Sentry.Integrations.Breadcrumbs({ dom: false })],
    beforeSend: async (event, hint) => {
      const message =
        hint.originalException &&
        typeof hint.originalException === 'object' &&
        'message' in hint.originalException &&
        typeof hint.originalException.message === 'string' &&
        hint.originalException.message
          ? hint.originalException.message
          : String(hint.originalException);

      const shouldIgnore = await backgroundService.shouldIgnoreError(
        'beforeSendPopup',
        message
      );

      if (shouldIgnore) {
        return null;
      }

      return event;
    },
  });
}
