import './global.css';
import './ui/styles/app.styl';
import './ui/styles/icons.styl';

import {
  createIpcCallProxy,
  fromWebExtensionPort,
  handleMethodCallRequests,
} from 'ipc/ipc';
import { createPopupStore } from 'popup/store/create';
import { createUpdateState } from 'popup/updateState';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import Background, { type BackgroundUiApi } from 'ui/services/Background';
import { AccountsList } from 'units/accountsList';
import AddAccount from 'units/addAccount';
import ImportMultichainAccount from 'units/importMultichainAccount';
import Browser from 'webextension-polyfill';
import { onEnd, pipe, publish } from 'wonka';

function connectBackground() {
  let port: Browser.Runtime.Port | null = Browser.runtime.connect();

  pipe(
    fromWebExtensionPort(port),
    handleMethodCallRequests({}, result => port?.postMessage(result)),
    onEnd(() => {
      Background.setConnect(() => {
        port = null;
        Background.init(connectBackground());
      });
    }),
    publish,
  );

  return createIpcCallProxy<keyof BackgroundUiApi, BackgroundUiApi>(
    request => port?.postMessage(request),
    fromWebExtensionPort(port),
  );
}

const rootEl = document.getElementById('app-content');
const store = createPopupStore();
const updateState = createUpdateState(store);

if (rootEl) {
  const background = connectBackground();
  Background.init(background);

  background.getState().then(state => {
    updateState(state);
  });

  Browser.storage.onChanged.addListener(async (changes, area) => {
    if (area !== 'local') return;
    const stateChanges = Object.fromEntries(
      Object.entries(changes).map(([key, v]) => [key, v.newValue]),
    );
    updateState(stateChanges);
  });

  createRoot(rootEl).render(
    <StrictMode>
      <Provider store={store}>
        <div>
          <ImportMultichainAccount />
          <AddAccount />
          <AccountsList />
        </div>
      </Provider>
    </StrictMode>,
  );
}
