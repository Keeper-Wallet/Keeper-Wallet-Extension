import './ui/styles/app.styl';
import './ui/styles/icons.styl';
import './ui/i18n';

import * as Sentry from '@sentry/react';
import { extension } from 'lib/extension';
import log from 'loglevel';
import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { KEEPERWALLET_DEBUG } from './constants';
import { ledgerService } from './ledger/service';
import { LedgerSignRequest } from './ledger/types';
import { cbToPromise, setupDnode, transformMethods } from './lib/dnodeUtil';
import { PortStream } from './lib/portStream';
import { setLangs } from './ui/actions/localState';
import { createUpdateState } from './ui/actions/updateState';
import { LANGS } from './ui/i18n';
import backgroundService, {
  BackgroundGetStateResult,
  BackgroundUiApi,
} from './ui/services/Background';
import { createUiStore } from './ui/store';
import { initUiSentry } from 'sentry';
import { RootWrapper } from 'ui/components/RootWrapper';
import { LoadingScreen } from 'ui/components/pages/loadingScreen';
import { routes } from './ui/routes';

const isNotificationWindow = window.location.pathname === '/notification.html';

initUiSentry({
  ignoreErrorContext: 'beforeSendPopup',
  source: 'popup',
});

log.setDefaultLevel(KEEPERWALLET_DEBUG ? 'debug' : 'warn');

startUi();

async function startUi() {
  const store = createUiStore({
    version: extension.runtime.getManifest().version,
  });

  store.dispatch(setLangs(LANGS));

  render(
    <Provider store={store}>
      <RootWrapper>
        <LoadingScreen />
      </RootWrapper>
    </Provider>,
    document.getElementById('app-content')
  );

  const updateState = createUpdateState(store);

  extension.storage.onChanged.addListener(async (changes, area) => {
    if (area !== 'local') {
      return;
    }

    const stateChanges: Partial<Record<string, unknown>> &
      Partial<BackgroundGetStateResult> = await backgroundService.getState([
      'initialized',
      'locked',
      ...('currentNetwork' in changes ? (['assets'] as const) : []), // assets change when the network changes
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

    return await new Promise<BackgroundUiApi>(resolve => {
      dnode.once('remote', (background: Record<string, unknown>) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolve(transformMethods(cbToPromise, background) as any);
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

  const router = createMemoryRouter(routes);

  render(
    <Provider store={store}>
      <RootWrapper>
        <RouterProvider router={router} />
      </RootWrapper>
    </Provider>,
    document.getElementById('app-content')
  );
}
