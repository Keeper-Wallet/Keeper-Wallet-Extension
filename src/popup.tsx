import './global.css';
import './ui/styles/app.styl';
import './ui/styles/icons.styl';

import * as Sentry from '@sentry/react';
import pipe from 'callbag-pipe';
import subscribe from 'callbag-subscribe';
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
import { PopupRoot } from './popupRoot';
import { initUiSentry } from './sentry';
import { setLoading } from './ui/actions/localState';
import { createUpdateState } from './ui/actions/updateState';
import { RootWrapper } from './ui/components/RootWrapper';
import Background, {
  BackgroundGetStateResult,
  BackgroundUiApi,
} from './ui/services/Background';
import { createUiStore } from './ui/store';

initUiSentry({
  ignoreErrorContext: 'beforeSendPopup',
  source: 'popup',
});

const store = createUiStore({
  version: Browser.runtime.getManifest().version,
});

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
      background.showTab(`${window.location.origin}/accounts.html`, 'accounts');
    }

    Sentry.setUser({ id: state.userId });
    Sentry.setTag('network', state.currentNetwork);

    updateState({ ...state, networks });

    Background.init(background);

    document.addEventListener('mousemove', () => Background.updateIdle());
    document.addEventListener('keyup', () => Background.updateIdle());
    document.addEventListener('mousedown', () => Background.updateIdle());
    document.addEventListener('focus', () => Background.updateIdle());
    window.addEventListener('beforeunload', () => background.identityClear());

    store.dispatch(setLoading(false));
  });

i18nextInit().then(() => {
  render(
    <Provider store={store}>
      <RootWrapper>
        <PopupRoot />
      </RootWrapper>
    </Provider>,
    document.getElementById('app-content')
  );
});
