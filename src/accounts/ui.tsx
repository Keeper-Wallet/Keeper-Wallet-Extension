import 'ui/styles/app.styl';
import 'ui/styles/icons.styl';
import 'ui/i18n';

import * as Sentry from '@sentry/react';
import { extension } from 'lib/extension';
import log from 'loglevel';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import { KEEPERWALLET_DEBUG } from '../constants';
import { cbToPromise, setupDnode, transformMethods } from 'lib/dnode-util';
import PortStream from 'lib/port-stream.js';
import { setLangs, setTabMode } from 'ui/actions';
import { createUpdateState } from './updateState';
import { RootAccounts } from 'ui/components/RootAccounts';
import { Error } from 'ui/components/pages/Error';
import { LANGS } from 'ui/i18n';
import backgroundService from 'ui/services/Background';
import { createAccountsStore } from './store';
import { LedgerSignRequest } from 'ledger/types';
import { ledgerService } from 'ledger/service';
import { initUiSentry } from 'sentry';

initUiSentry({
  ignoreErrorContext: 'beforeSendAccounts',
  source: 'accounts',
});

log.setDefaultLevel(KEEPERWALLET_DEBUG ? 'debug' : 'warn');

startUi();

async function startUi() {
  const store = createAccountsStore();

  store.dispatch(setTabMode('tab'));
  store.dispatch(setLangs(LANGS));

  ReactDOM.render(
    <Provider store={store}>
      <Sentry.ErrorBoundary fallback={errorData => <Error {...errorData} />}>
        <div className="app">
          <RootAccounts />
        </div>
      </Sentry.ErrorBoundary>
    </Provider>,
    document.getElementById('app-content')
  );

  const updateState = createUpdateState(store);

  const onChanged =
    extension.storage.local.onChanged || extension.storage.onChanged;
  onChanged.addListener(async changes => {
    const stateChanges = await backgroundService.getState([
      'initialized',
      'locked',
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
