import 'babel-polyfill';
import './ui/styles/app.styl';
import './ui/styles/icons.styl';
import './ui/i18n';

import EventEmitter from 'events';
import extension from 'extensionizer';
import log from 'loglevel';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import { cbToPromise, setupDnode, transformMethods } from './lib/dnode-util';
import PortStream from './lib/port-stream.js';
import { setLangs } from './ui/actions';
import { updateState } from './ui/actions/updateState';
import { Root } from './ui/components/Root';
import { LANGS } from './ui/i18n';
import backgroundService from './ui/services/Background';
import { store } from './ui/store';

const WAVESKEEPER_DEBUG = process.env.NODE_ENV !== 'production';
log.setDefaultLevel(WAVESKEEPER_DEBUG ? 'debug' : 'warn');

startUi().catch(log.error);

async function startUi() {
  const port = extension.runtime.connect({ name: 'ui' });
  const connectionStream = new PortStream(port);

  // Bind event emitter to background function sendUpdate.
  // This way every time background calls sendUpdate with its state we get event with new background state
  const eventEmitter = new EventEmitter();
  const emitterApi = {
    sendUpdate: async state => eventEmitter.emit('update', state),
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
  const background = await new Promise(resolve => {
    dnode.once('remote', background => {
      let backgroundWithPromises = transformMethods(cbToPromise, background);
      // Add event emitter api to background object

      backgroundWithPromises.on = eventEmitter.on.bind(eventEmitter);
      resolve(backgroundWithPromises);
    });
  });

  // global access to service on debug
  if (WAVESKEEPER_DEBUG) {
    global.background = background;
    console.log('inited');
  }

  // If popup is opened close notification window
  if (extension.extension.getViews({ type: 'popup' }).length > 0) {
    await background.closeNotificationWindow();
  }

  if (WAVESKEEPER_DEBUG) {
    console.log('closed windows');
  }

  backgroundService.init(background);
  backgroundService.on(updateState);
  backgroundService.getNetworks();
  backgroundService.getState();
  document.addEventListener('mousemove', () => backgroundService.updateIdle());
  document.addEventListener('keyup', () => backgroundService.updateIdle());
  document.addEventListener('mousedown', () => backgroundService.updateIdle());
  document.addEventListener('focus', () => backgroundService.updateIdle());
}

store.dispatch(setLangs(LANGS));

ReactDOM.render(
  <Provider store={store}>
    <div className="app">
      <Root />
    </div>
  </Provider>,
  document.getElementById('app-content')
);
