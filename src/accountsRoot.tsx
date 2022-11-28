import * as Sentry from '@sentry/react';
import pipe from 'callbag-pipe';
import subscribe from 'callbag-subscribe';
import { ledgerService } from 'ledger/service';
import { LedgerSignRequest } from 'ledger/types';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { LoadingScreen } from 'ui/components/pages/loadingScreen';
import { RootWrapper } from 'ui/components/RootWrapper';
import backgroundService, {
  BackgroundGetStateResult,
  BackgroundUiApi,
} from 'ui/services/Background';
import Browser from 'webextension-polyfill';

import { routes } from './accounts/routes';
import { createAccountsStore } from './accounts/store';
import { createUpdateState } from './accounts/updateState';
import type { UiApi } from './background';
import {
  createIpcCallProxy,
  fromPort,
  handleMethodCallRequests,
  MethodCallRequestPayload,
} from './ipc/ipc';

const store = createAccountsStore({
  version: Browser.runtime.getManifest().version,
});

const updateState = createUpdateState(store);

Browser.storage.onChanged.addListener(async (changes, area) => {
  if (area !== 'local') {
    return;
  }

  const stateChanges: Partial<Record<string, unknown>> &
    Partial<BackgroundGetStateResult> = await backgroundService.getState([
    'initialized',
    'locked',
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

const pageFromHash = window.location.hash.split('#')[1];

const router = createMemoryRouter(routes, {
  initialEntries: [pageFromHash || '/'],
});

export function AccountsRoot() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      const [state, networks] = await Promise.all([
        background.getState(),
        background.getNetworks(),
      ]);

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
