import * as Sentry from '@sentry/react';
import pipe from 'callbag-pipe';
import subscribe from 'callbag-subscribe';
import log from 'loglevel';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { LoadingScreen } from 'ui/components/pages/loadingScreen';
import { RootWrapper } from 'ui/components/RootWrapper';
import Browser from 'webextension-polyfill';

import type { UiApi } from './background';
import { KEEPERWALLET_DEBUG } from './constants';
import {
  createIpcCallProxy,
  fromPort,
  handleMethodCallRequests,
  MethodCallRequestPayload,
} from './ipc/ipc';
import { ledgerService } from './ledger/service';
import { LedgerSignRequest } from './ledger/types';
import { createUpdateState } from './ui/actions/updateState';
import { routes } from './ui/routes';
import backgroundService, {
  BackgroundGetStateResult,
  BackgroundUiApi,
} from './ui/services/Background';
import { createUiStore } from './ui/store';

log.setDefaultLevel(KEEPERWALLET_DEBUG ? 'debug' : 'warn');

const isNotificationWindow = window.location.pathname === '/notification.html';

const store = createUiStore({
  version: Browser.runtime.getManifest().version,
});

const router = createMemoryRouter(routes);

const updateState = createUpdateState(store);

Browser.storage.onChanged.addListener(async (changes, area) => {
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

const uiApi: UiApi = {
  closePopupWindow: async () => {
    const popup = Browser.extension
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

function connect() {
  const port = Browser.runtime.connect();

  pipe(
    fromPort<MethodCallRequestPayload<keyof UiApi>>(port),
    handleMethodCallRequests(uiApi, result => port.postMessage(result)),
    subscribe({
      complete: () => {
        backgroundService.setConnect(() => {
          backgroundService.init(connect());
        });
      },
    })
  );

  return createIpcCallProxy<keyof BackgroundUiApi, BackgroundUiApi>(
    request => port.postMessage(request),
    fromPort(port)
  );
}

const background = connect();

export function PopupRoot() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      // If popup is opened close notification window
      if (Browser.extension.getViews({ type: 'popup' }).length > 0) {
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
        background.showTab(
          `${window.location.origin}/accounts.html`,
          'accounts'
        );
      }

      updateState({ ...state, networks });

      Sentry.setUser({ id: state.userId });
      Sentry.setTag('network', state.currentNetwork);

      backgroundService.init(background);

      document.addEventListener('mousemove', () =>
        backgroundService.updateIdle()
      );
      document.addEventListener('keyup', () => backgroundService.updateIdle());
      document.addEventListener('mousedown', () =>
        backgroundService.updateIdle()
      );
      document.addEventListener('focus', () => backgroundService.updateIdle());
      window.addEventListener('beforeunload', () => background.identityClear());

      setIsReady(true);
    }

    init();
  }, []);

  return (
    <Provider store={store}>
      <RootWrapper>
        {isReady ? <RouterProvider router={router} /> : <LoadingScreen />}
      </RootWrapper>
    </Provider>
  );
}
