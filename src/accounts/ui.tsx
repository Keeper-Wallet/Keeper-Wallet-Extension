import 'initProtobuf';
import 'ui/styles/app.styl';
import 'ui/styles/icons.styl';
import 'ui/i18n';

import * as Sentry from '@sentry/react';
import * as extension from 'extensionizer';
import log from 'loglevel';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import { KEEPERWALLET_DEBUG } from '../constants';
import { cbToPromise, setupDnode, transformMethods } from 'lib/dnode-util';
import * as PortStream from 'lib/port-stream.js';
import { setLangs, setTabMode } from 'ui/actions';
import { createUpdateState } from './updateState';
import { RootAccounts } from 'ui/components/RootAccounts';
import { LANGS } from 'ui/i18n';
import backgroundService from 'ui/services/Background';
import { createAccountsStore } from './store';
import { LedgerSignRequest } from 'ledger/types';
import { ledgerService } from 'ledger/service';
import { initUiSentry } from 'sentry';

initUiSentry('accounts');

log.setDefaultLevel(KEEPERWALLET_DEBUG ? 'debug' : 'warn');

startUi();

async function startUi() {
  const store = createAccountsStore();

  store.dispatch(setTabMode('tab'));
  store.dispatch(setLangs(LANGS));

  ReactDOM.render(
    <Provider store={store}>
      <div className="app">
        <RootAccounts />
      </div>
    </Provider>,
    document.getElementById('app-content')
  );

  const updateState = createUpdateState(store);

  const port = extension.runtime.connect({ name: 'ui' });
  const connectionStream = new PortStream(port);

  const emitterApi = {
    sendUpdate: async state => updateState(state),
    closeEdgeNotificationWindow: async () => undefined,
    ledgerSignRequest: async (request: LedgerSignRequest) => {
      const { selectedAccount } = store.getState();

      return ledgerService.queueSignRequest(selectedAccount, request);
    },
  };

  const dnode = setupDnode(connectionStream, emitterApi, 'api');
  const background = await new Promise<any>(resolve => {
    dnode.once('remote', background => {
      resolve(transformMethods(cbToPromise, background));
    });
  });

  if (WAVESKEEPER_DEBUG) {
    (global as any).background = background;
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
