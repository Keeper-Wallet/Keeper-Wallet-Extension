import './global.css';
import './ui/styles/app.styl';
import './ui/styles/icons.styl';

import { setTag, setUser } from '@sentry/browser';
import i18next from 'i18next';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import invariant from 'tiny-invariant';
import Browser from 'webextension-polyfill';
import { onEnd, pipe, publish } from 'wonka';

import { SignProvider } from './_core/signContext';
import { UsdPricesProvider } from './_core/usdPrices';
import type { UiApi } from './background';
import { i18nextInit } from './i18n/init';
import {
  createIpcCallProxy,
  fromWebExtensionPort,
  handleMethodCallRequests,
} from './ipc/ipc';
import { ledgerService } from './ledger/service';
import { type LedgerSignRequest } from './ledger/types';
import { createPopupStore } from './popup/store/create';
import { createUpdateState } from './popup/updateState';
import { PopupRoot } from './popupRoot';
import { initSentry } from './sentry/init';
import { setLoading } from './store/actions/localState';
import { RootWrapper } from './ui/components/RootWrapper';
import Background, { type BackgroundUiApi } from './ui/services/Background';

initSentry({
  source: 'popup',
  shouldIgnoreError: async message => {
    const [shouldIgnoreGlobal, shouldIgnoreContext] = await Promise.all([
      Background.shouldIgnoreError('beforeSend', message),
      Background.shouldIgnoreError('beforeSendPopup', message),
    ]);

    return shouldIgnoreGlobal || shouldIgnoreContext;
  },
});

const store = createPopupStore();

Promise.all([
  Browser.storage.local
    .get('currentLocale')
    .then(({ currentLocale }) => i18next.changeLanguage(currentLocale)),
  i18nextInit(),
]).then(() => {
  const rootEl = document.getElementById('app-content');
  invariant(rootEl);

  createRoot(rootEl).render(
    <StrictMode>
      <Provider store={store}>
        <RootWrapper>
          <UsdPricesProvider>
            <SignProvider>
              <PopupRoot />
            </SignProvider>
          </UsdPricesProvider>
        </RootWrapper>
      </Provider>
    </StrictMode>
  );

  const updateState = createUpdateState(store);

  Browser.storage.onChanged.addListener(async (changes, area) => {
    if (area !== 'local') {
      return;
    }

    const stateChanges = Object.fromEntries(
      Object.entries(changes).map(([key, v]) => [key, v.newValue])
    );

    // we need to update assets when network changes
    if ('currentNetwork' in changes) {
      const { assets } = await Background.getState(['assets']);
      stateChanges.assets = assets;
    }

    updateState(stateChanges);
  });

  function connect() {
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
        invariant(selectedAccount);
        await ledgerService.queueSignRequest(selectedAccount, request);
      },
    };

    let port: Browser.Runtime.Port | null = Browser.runtime.connect();

    pipe(
      fromWebExtensionPort(port),
      handleMethodCallRequests(uiApi, result => port?.postMessage(result)),
      onEnd(() => {
        Background.setConnect(() => {
          port = null;
          Background.init(connect());
        });
      }),
      publish
    );

    return createIpcCallProxy<keyof BackgroundUiApi, BackgroundUiApi>(
      request => port?.postMessage(request),
      fromWebExtensionPort(port)
    );
  }

  const background = connect();

  if (
    location.pathname === '/notification.html' &&
    !window.matchMedia('(display-mode: fullscreen)').matches
  ) {
    background.resizeNotificationWindow(
      357 + window.outerWidth - window.innerWidth,
      600 + window.outerHeight - window.innerHeight
    );
  }

  background.getState().then(state => {
    setUser({ id: state.userId });
    setTag('network', state.currentNetwork);
    updateState(state);
    store.dispatch(setLoading(false));

    Background.init(background);

    document.addEventListener('mousemove', () => Background.updateIdle());
    document.addEventListener('keyup', () => Background.updateIdle());
    document.addEventListener('mousedown', () => Background.updateIdle());
    document.addEventListener('focus', () => Background.updateIdle());
    window.addEventListener('beforeunload', () => background.identityClear());

    if (Browser.extension.getViews({ type: 'popup' }).length > 0) {
      Background.closeNotificationWindow();
    }

    if (!state.initialized) {
      Background.showTab(`${window.location.origin}/accounts.html`, 'accounts');
    }
  });
});
