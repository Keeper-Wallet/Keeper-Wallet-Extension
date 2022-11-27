import filter from 'callbag-filter';
import pipe from 'callbag-pipe';
import subscribe from 'callbag-subscribe';
import { equals } from 'ramda';

import type { __BackgroundPageApiDirect } from './background';
import {
  createMethodCallRequest,
  fromPostMessage,
  handleMethodCallResponse,
} from './ipc/ipc';

declare global {
  interface KeeperApi extends __BackgroundPageApiDirect {
    on(
      event: 'update',
      cb: (
        state: Awaited<ReturnType<__BackgroundPageApiDirect['publicState']>>
      ) => void
    ): void;
    initialPromise: Promise<typeof KeeperWallet>;
  }

  // eslint-disable-next-line no-var
  var KeeperWallet: KeeperApi;
}

function callBackground<K extends keyof __BackgroundPageApiDirect>(method: K) {
  return (...args: Parameters<__BackgroundPageApiDirect[K]>) => {
    const request = createMethodCallRequest(method, ...args);

    postMessage(request, location.origin);

    return pipe(
      fromPostMessage(),
      handleMethodCallResponse<
        Awaited<ReturnType<__BackgroundPageApiDirect[K]>>
      >(request)
    );
  };
}

global.KeeperWallet = {
  auth: callBackground('auth'),
  decryptMessage: callBackground('decryptMessage'),
  encryptMessage: callBackground('encryptMessage'),
  getKEK: callBackground('getKEK'),
  notification: callBackground('notification'),
  publicState: callBackground('publicState'),
  resourceIsApproved: callBackground('resourceIsApproved'),
  resourceIsBlocked: callBackground('resourceIsBlocked'),
  signAndPublishCancelOrder: callBackground('signAndPublishCancelOrder'),
  signAndPublishOrder: callBackground('signAndPublishOrder'),
  signAndPublishTransaction: callBackground('signAndPublishTransaction'),
  signCancelOrder: callBackground('signCancelOrder'),
  signCustomData: callBackground('signCustomData'),
  signOrder: callBackground('signOrder'),
  signRequest: callBackground('signRequest'),
  signTransaction: callBackground('signTransaction'),
  signTransactionPackage: callBackground('signTransactionPackage'),
  verifyCustomData: callBackground('verifyCustomData'),
  wavesAuth: callBackground('wavesAuth'),
  get initialPromise() {
    // eslint-disable-next-line no-console
    console.warn(
      "You don't need to use initialPromise anymore. If KeeperWallet variable is defined, you can call any api it right away"
    );
    return Promise.resolve(global.KeeperWallet);
  },
  on: (event, cb) => {
    let lastPublicState:
      | Awaited<ReturnType<typeof KeeperWallet['publicState']>>
      | undefined;

    pipe(
      fromPostMessage(),
      filter(data => data.keeperMethod === 'updatePublicState'),
      subscribe(async () => {
        const isApproved = await KeeperWallet.resourceIsApproved();

        if (!isApproved) {
          return;
        }

        const updatedPublicState = await KeeperWallet.publicState();

        if (!equals(updatedPublicState, lastPublicState)) {
          lastPublicState = updatedPublicState;
          cb(updatedPublicState);
        }
      })
    );
  },
};

function defineDeprecatedName(name: string) {
  Object.defineProperty(window, name, {
    configurable: true,
    get() {
      // eslint-disable-next-line no-console
      console.warn(
        `${name} global variable is deprecated and will be removed in future releases, please update to use KeeperWallet instead`
      );
      return KeeperWallet;
    },
  });
}

defineDeprecatedName('WavesKeeper');
defineDeprecatedName('Waves');
