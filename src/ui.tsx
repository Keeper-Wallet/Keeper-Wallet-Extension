import './ui/styles/app.styl';
import './ui/styles/icons.styl';
import './ui/i18n';

import * as extension from 'extensionizer';
import log from 'loglevel';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import { cbToPromise, setupDnode, transformMethods } from './lib/dnode-util';
import * as PortStream from './lib/port-stream.js';
import { setLangs } from './ui/actions';
import { createUpdateState } from './ui/actions/updateState';
import { Root } from './ui/components/Root';
import { LANGS } from './ui/i18n';
import backgroundService from './ui/services/Background';
import { createUiStore } from './ui/store';

const WAVESKEEPER_DEBUG = process.env.NODE_ENV !== 'production';
log.setDefaultLevel(WAVESKEEPER_DEBUG ? 'debug' : 'warn');

startUi().catch(log.error);

async function startUi() {
  const store = createUiStore();

  store.dispatch(setLangs(LANGS));

  ReactDOM.render(
    <Provider store={store}>
      <div className="app">
        <Root />
      </div>
    </Provider>,
    document.getElementById('app-content')
  );

  const updateState = createUpdateState(store);

  const port = extension.runtime.connect({ name: 'ui' });
  const connectionStream = new PortStream(port);

  const emitterApi = {
    sendUpdate: async state => updateState(state),
    // This method is used in Microsoft Edge browser
    closeEdgeNotificationWindow: async () => {
      if (
        window.location.href.split('/').reverse()[0] === 'notification.html'
      ) {
        window.close();
      }
    },
  };

  const dnode = setupDnode(connectionStream, emitterApi, 'api');
  const background = await new Promise<any>(resolve => {
    dnode.once('remote', background => {
      resolve(transformMethods(cbToPromise, background));
    });
  });

  // global access to service on debug
  if (WAVESKEEPER_DEBUG) {
    (global as any).background = background;
  }

  // If popup is opened close notification window
  if (extension.extension.getViews({ type: 'popup' }).length > 0) {
    await background.closeNotificationWindow();
  }

  const [state, networks] = await Promise.all([
    background.getState(),
    background.getNetworks(),
  ]);

  updateState({ ...state, networks });

  backgroundService.init(background);
  document.addEventListener('mousemove', () => backgroundService.updateIdle());
  document.addEventListener('keyup', () => backgroundService.updateIdle());
  document.addEventListener('mousedown', () => backgroundService.updateIdle());
  document.addEventListener('focus', () => backgroundService.updateIdle());
}
