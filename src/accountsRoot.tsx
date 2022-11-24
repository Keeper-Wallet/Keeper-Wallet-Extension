import * as Sentry from '@sentry/react';
import { ledgerService } from 'ledger/service';
import { LedgerSignRequest } from 'ledger/types';
import { cbToPromise, setupDnode, transformMethods } from 'lib/dnodeUtil';
import { extension } from 'lib/extension';
import { PortStream } from 'lib/portStream';
import log from 'loglevel';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { LoadingScreen } from 'ui/components/pages/loadingScreen';
import { RootWrapper } from 'ui/components/RootWrapper';
import backgroundService, {
  BackgroundGetStateResult,
  BackgroundUiApi,
} from 'ui/services/Background';

import { routes } from './accounts/routes';
import { createAccountsStore } from './accounts/store';
import { createUpdateState } from './accounts/updateState';
import { KEEPERWALLET_DEBUG } from './constants';

log.setDefaultLevel(KEEPERWALLET_DEBUG ? 'debug' : 'warn');

const store = createAccountsStore({
  version: extension.runtime.getManifest().version,
});

const updateState = createUpdateState(store);

extension.storage.onChanged.addListener(async (changes, area) => {
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

  return await new Promise<BackgroundUiApi>(resolve => {
    dnode.once('remote', (background: Record<string, unknown>) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolve(transformMethods(cbToPromise, background) as any);
    });
  });
};

const pageFromHash = window.location.hash.split('#')[1];

const router = createMemoryRouter(routes, {
  initialEntries: [pageFromHash || '/'],
});

export function AccountsRoot() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      const background = await connect();

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
