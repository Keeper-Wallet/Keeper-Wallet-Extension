import './ui/styles/app.styl';
import './ui/styles/icons.styl';
import './ui/i18n';

import * as Sentry from '@sentry/react';
import { extension } from 'lib/extension';
import log from 'loglevel';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import { KEEPERWALLET_DEBUG } from './constants';
import { ledgerService } from './ledger/service';
import { LedgerSignRequest } from './ledger/types';
import { cbToPromise, setupDnode, transformMethods } from './lib/dnode-util';
import * as PortStream from './lib/port-stream.js';
import { setLangs } from './ui/actions';
import { createUpdateState } from './ui/actions/updateState';
import { Root } from 'ui/components/Root';
import { Error } from 'ui/components/pages/Error';
import { LANGS } from './ui/i18n';
import backgroundService from './ui/services/Background';
import { createUiStore } from './ui/store';
import { initUiSentry } from 'sentry';

const isNotificationWindow = window.location.pathname === '/notification.html';

initUiSentry({
  ignoreErrorContext: 'beforeSendPopup',
  source: 'popup',
});

log.setDefaultLevel(KEEPERWALLET_DEBUG ? 'debug' : 'warn');

startUi();

async function startUi() {
  const store = createUiStore();

  store.dispatch(setLangs(LANGS));

  ReactDOM.render(
    <Provider store={store}>
      <Sentry.ErrorBoundary fallback={errorData => <Error {...errorData} />}>
        <div className="app">
          <Root />
        </div>
      </Sentry.ErrorBoundary>
    </Provider>,
    document.getElementById('app-content')
  );

  const updateState = createUpdateState(store);

  extension.storage.onChanged.addListener(async (changes, area) => {
    if (area !== 'local') {
      return;
    }

    const stateChanges = await backgroundService.getState([
      'initialized',
      'locked',
      'assets',
    ]);

    for (const key in changes) {
      stateChanges[key] = changes[key].newValue;
    }

    updateState(stateChanges);
  });

  const emitterApi = {
    closePopupWindow: async () => {
      const popup = extension.extension
        .getViews({ type: 'popup' })
        .find(w => w.location.pathname === '/popup.html');
      if (popup) {
        popup.close();
      }
    },
    ledgerSignRequest: async (request: LedgerSignRequest) => {
      const { selectedAccount } = store.getState();

      return ledgerService.queueSignRequest(selectedAccount, request);
    },
  };

  const connect = async () => {
    const port = extension.runtime.connect();

    port.onDisconnect.addListener(() => {
      backgroundService.setConnect(async () => {
        const newBackground = await connect();
        backgroundService.init(newBackground);
      });
    });

    const connectionStream = new PortStream(port);
    const dnode = setupDnode(connectionStream, emitterApi, 'api');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await new Promise<any>(resolve => {
      dnode.once('remote', background => {
        resolve(transformMethods(cbToPromise, background));
      });
    });
  };

  const background = await connect();

  // If popup is opened close notification window
  if (extension.extension.getViews({ type: 'popup' }).length > 0) {
    await background.closeNotificationWindow();
  }

  if (
    isNotificationWindow &&
    !window.matchMedia('(display-mode: fullscreen)').matches
  ) {
    background.resizeNotificationWindow(
      357 + window.outerWidth - window.innerWidth,
      600 + window.outerHeight - window.innerHeight
    );
  }

  const [state, networks] = await Promise.all([
    background.getState(),
    background.getNetworks(),
  ]);

  if (!state.initialized) {
    background.showTab(window.location.origin + '/accounts.html', 'accounts');
  }

  updateState({ ...state, networks });

  Sentry.setUser({ id: state.userId });
  Sentry.setTag('network', state.currentNetwork);

  backgroundService.init(background);

  document.addEventListener('mousemove', () => backgroundService.updateIdle());
  document.addEventListener('keyup', () => backgroundService.updateIdle());
  document.addEventListener('mousedown', () => backgroundService.updateIdle());
  document.addEventListener('focus', () => backgroundService.updateIdle());
  window.addEventListener('beforeunload', () => background.identityClear());
}
