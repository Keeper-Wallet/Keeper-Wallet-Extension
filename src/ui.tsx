import './ui/styles/app.styl';
import './ui/styles/icons.styl';
import './ui/i18n';

import * as Sentry from '@sentry/react';
import * as extension from 'extensionizer';
import log from 'loglevel';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import { WAVESKEEPER_DEBUG } from './constants';
import { cbToPromise, setupDnode, transformMethods } from './lib/dnode-util';
import * as PortStream from './lib/port-stream.js';
import { setLangs } from './ui/actions';
import { createUpdateState } from './ui/actions/updateState';
import { Root } from './ui/components/Root';
import { LANGS } from './ui/i18n';
import backgroundService from './ui/services/Background';
import { createUiStore } from './ui/store';

Sentry.init({
  dsn: __SENTRY_DSN__,
  environment: __SENTRY_ENVIRONMENT__,
  release: __SENTRY_RELEASE__,
  debug: WAVESKEEPER_DEBUG,
  autoSessionTracking: false,
  initialScope: {
    tags: {
      source: 'popup',
    },
  },
  integrations: [new Sentry.Integrations.Breadcrumbs({ dom: false })],
  beforeSend: async (event, hint) => {
    const message =
      hint.originalException instanceof Error
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

log.setDefaultLevel(WAVESKEEPER_DEBUG ? 'debug' : 'warn');

startUi();

async function startUi() {
  const store = createUiStore();

  store.dispatch(setLangs(LANGS));

  ReactDOM.render(
    <Provider store={store}>
      <div className="app">
        <Root />
      </div>
    </Provider>,
    document.getElementById('app-content')
  );

  const updateState = createUpdateState(store);

  const port = extension.runtime.connect({ name: 'ui' });
  const connectionStream = new PortStream(port);

  const emitterApi = {
    sendUpdate: async state => updateState(state),
    // This method is used in Microsoft Edge browser
    closeEdgeNotificationWindow: async () => {
      if (
        window.location.href.split('/').reverse()[0] === 'notification.html'
      ) {
        window.close();
      }
    },
  };

  const dnode = setupDnode(connectionStream, emitterApi, 'api');
  const background = await new Promise<any>(resolve => {
    dnode.once('remote', background => {
      resolve(transformMethods(cbToPromise, background));
    });
  });

  // global access to service on debug
  if (WAVESKEEPER_DEBUG) {
    (global as any).background = background;
  }

  // If popup is opened close notification window
  if (extension.extension.getViews({ type: 'popup' }).length > 0) {
    await background.closeNotificationWindow();
  }

  if (window.location.href.split('/').reverse()[0] === 'notification.html') {
    background.resizeNotificationWindow(
      357 + window.outerWidth - window.innerWidth,
      600 + window.outerHeight - window.innerHeight
    );
  }

  const [state, networks] = await Promise.all([
    background.getState(),
    background.getNetworks(),
  ]);

  updateState({ ...state, networks });

  Sentry.setUser({ id: state.userId });
  Sentry.setTag('network', state.currentNetwork);

  backgroundService.init(background);
  document.addEventListener('mousemove', () => backgroundService.updateIdle());
  document.addEventListener('keyup', () => backgroundService.updateIdle());
  document.addEventListener('mousedown', () => backgroundService.updateIdle());
  document.addEventListener('focus', () => backgroundService.updateIdle());
}
