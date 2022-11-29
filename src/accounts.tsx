import './global.css';
import './ui/styles/app.styl';
import './ui/styles/icons.styl';

import * as Sentry from '@sentry/react';
import pipe from 'callbag-pipe';
import subscribe from 'callbag-subscribe';
import i18next from 'i18next';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import Browser from 'webextension-polyfill';

import { createAccountsStore } from './accounts/store/create';
import { createUpdateState } from './accounts/updateState';
import { AccountsRoot } from './accountsRoot';
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
import { initUiSentry } from './sentry';
import { setLoading } from './store/actions/localState';
import { RootWrapper } from './ui/components/RootWrapper';
import Background, {
  BackgroundGetStateResult,
  BackgroundUiApi,
} from './ui/services/Background';

initUiSentry({
  ignoreErrorContext: 'beforeSendAccounts',
  source: 'accounts',
});

const store = createAccountsStore();

Promise.all([
  Browser.storage.local
    .get('currentLocale')
    .then(({ currentLocale }) => i18next.changeLanguage(currentLocale)),
  i18nextInit(),
])
  .then(() => {
    render(
      <Provider store={store}>
        <RootWrapper>
          <AccountsRoot />
        </RootWrapper>
      </Provider>,
      document.getElementById('app-content')
    );
  })
  .then(() => {
    const updateState = createUpdateState(store);

    Browser.storage.onChanged.addListener(async (changes, area) => {
      if (area !== 'local') {
        return;
      }

      const stateChanges: Partial<Record<string, unknown>> &
        Partial<BackgroundGetStateResult> = await Background.getState([
        'initialized',
        'locked',
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

    Promise.all([background.getState(), background.getNetworks()]).then(
      ([state, networks]) => {
        updateState({ ...state, networks });

        Sentry.setUser({ id: state.userId });
        Sentry.setTag('network', state.currentNetwork);

        Background.init(background);

        document.addEventListener('mousemove', () => Background.updateIdle());
        document.addEventListener('keyup', () => Background.updateIdle());
        document.addEventListener('mousedown', () => Background.updateIdle());
        document.addEventListener('focus', () => Background.updateIdle());

        store.dispatch(setLoading(false));
      }
    );
  });
