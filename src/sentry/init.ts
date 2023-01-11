import { Breadcrumbs, init } from '@sentry/browser';

export function initSentry({
  shouldIgnoreError,
  source,
}: {
  shouldIgnoreError: (message: string) => Promise<boolean>;
  source: 'background' | 'popup' | 'accounts';
}) {
  return init({
    dsn: __SENTRY_DSN__,
    environment: __SENTRY_ENVIRONMENT__,
    release: __SENTRY_RELEASE__,
    initialScope: {
      tags: {
        source,
      },
    },
    integrations: [new Breadcrumbs({ dom: false })],
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

      if (await shouldIgnoreError(message)) {
        return null;
      }

      return event;
    },
  });
}
