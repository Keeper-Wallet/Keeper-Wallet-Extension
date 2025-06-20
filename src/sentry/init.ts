import { Breadcrumbs, init, replayIntegration } from '@sentry/browser';

export function initSentry({
  shouldIgnoreError,
  source,
  withReplay = false,
}: {
  shouldIgnoreError: (message: string) => Promise<boolean>;
  source: 'background' | 'popup' | 'accounts';
  withReplay?: boolean;
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
    integrations: [
      new Breadcrumbs({ dom: false }),
      ...(withReplay
        ? [
            replayIntegration({
              maskAllText: true,
              blockAllMedia: true,
            }),
          ]
        : []),
    ],
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: false,
    replaysSessionSampleRate: withReplay ? 0.01 : 0,
    replaysOnErrorSampleRate: withReplay ? 1.0 : 0,
    tracesSampleRate: 0.1,
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
      // remove request data from event
      if (event.request) {
        event.request = {};
      }

      return event;
    },
  });
}
