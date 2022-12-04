import './global.css';
import './ui/styles/app.styl';
import './ui/styles/icons.styl';

import { setTag, setUser } from '@sentry/react';
import pipe from 'callbag-pipe';
import subscribe from 'callbag-subscribe';
import i18next from 'i18next';
import { StrictMode } from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import Browser from 'webextension-polyfill';

import type { UiApi } from './background';
import { i18nextInit } from './i18n/init';
import {
  createIpcCallProxy,
  fromPort,
  handleMethodCallRequests,
  MethodCallRequestPayload,
} from './ipc/ipc';
import { ledgerService } from './ledger/service';
import { LedgerSignRequest } from './ledger/types';
import { createPopupStore } from './popup/store/create';
import { createUpdateState } from './popup/updateState';
import { PopupRoot } from './popupRoot';
import { initUiSentry } from './sentry';
import { setLoading } from './store/actions/localState';
import { RootWrapper } from './ui/components/RootWrapper';
import Background, {
  BackgroundGetStateResult,
  BackgroundUiApi,
} from './ui/services/Background';

initUiSentry({
  ignoreErrorContext: 'beforeSendPopup',
  source: 'popup',
});

const store = createPopupStore();

Promise.all([
  Browser.storage.local
    .get('currentLocale')
    .then(({ currentLocale }) => i18next.changeLanguage(currentLocale)),
  i18nextInit(),
]).then(() => {
  render(
    <StrictMode>
      <Provider store={store}>
        <RootWrapper>
          <PopupRoot />
        </RootWrapper>
      </Provider>
    </StrictMode>,
    document.getElementById('app-content')
  );

  const updateState = createUpdateState(store);

  Browser.storage.onChanged.addListener(async (changes, area) => {
    if (area !== 'local') {
      return;
    }

    const stateChanges: Partial<Record<string, unknown>> &
      Partial<BackgroundGetStateResult> = await Background.getState([
      'initialized',
      'locked',
      ...('currentNetwork' in changes ? (['assets'] as const) : []), // assets change when the network changes
    ]);

    for (const key in changes) {
      stateChanges[key] = changes[key].newValue;
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

        return ledgerService.queueSignRequest(selectedAccount, request);
      },
    };

    const port = Browser.runtime.connect();

    pipe(
      fromPort<MethodCallRequestPayload<keyof UiApi>>(port),
      handleMethodCallRequests(uiApi, result => port.postMessage(result)),
      subscribe({
        complete: () => {
          Background.setConnect(() => {
            Background.init(connect());
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

  Promise.resolve()
    .then(() => {
      if (Browser.extension.getViews({ type: 'popup' }).length > 0) {
        return background.closeNotificationWindow();
      }
    })
    .then(() => {
      if (
        location.pathname === '/notification.html' &&
        !window.matchMedia('(display-mode: fullscreen)').matches
      ) {
        background.resizeNotificationWindow(
          357 + window.outerWidth - window.innerWidth,
          600 + window.outerHeight - window.innerHeight
        );
      }

      return Promise.all([background.getState(), background.getNetworks()]);
    })
    .then(([state, networks]) => {
      if (!state.initialized) {
        background.showTab(
          `${window.location.origin}/accounts.html`,
          'accounts'
        );
      }

      setUser({ id: state.userId });
      setTag('network', state.currentNetwork);

      updateState({ ...state, networks });

      Background.init(background);

      document.addEventListener('mousemove', () => Background.updateIdle());
      document.addEventListener('keyup', () => Background.updateIdle());
      document.addEventListener('mousedown', () => Background.updateIdle());
      document.addEventListener('focus', () => Background.updateIdle());
      window.addEventListener('beforeunload', () => background.identityClear());

      store.dispatch(setLoading(false));
    });
});
