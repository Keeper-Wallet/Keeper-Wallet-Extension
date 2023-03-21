import filter from 'callbag-filter';
import pipe from 'callbag-pipe';
import subscribe from 'callbag-subscribe';
import { deepEqual } from 'fast-equals';

import type { __BackgroundPageApiDirect } from './background';
import { createIpcCallProxy, fromPostMessage } from './ipc/ipc';

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

const proxy = createIpcCallProxy<
  keyof __BackgroundPageApiDirect,
  __BackgroundPageApiDirect
>(request => postMessage(request, location.origin), fromPostMessage());

globalThis.KeeperWallet = {
  auth: proxy.auth,
  decryptMessage: proxy.decryptMessage,
  encryptMessage: proxy.encryptMessage,
  getKEK: proxy.getKEK,
  notification: proxy.notification,
  publicState: proxy.publicState,
  resourceIsApproved: proxy.resourceIsApproved,
  resourceIsBlocked: proxy.resourceIsBlocked,
  signAndPublishCancelOrder: proxy.signAndPublishCancelOrder,
  signAndPublishOrder: proxy.signAndPublishOrder,
  signAndPublishTransaction: proxy.signAndPublishTransaction,
  signCancelOrder: proxy.signCancelOrder,
  signCustomData: proxy.signCustomData,
  signOrder: proxy.signOrder,
  signRequest: proxy.signRequest,
  signTransaction: proxy.signTransaction,
  signTransactionPackage: proxy.signTransactionPackage,
  verifyCustomData: proxy.verifyCustomData,
  wavesAuth: proxy.wavesAuth,
  get initialPromise() {
    // eslint-disable-next-line no-console
    console.warn(
      "You don't need to use initialPromise anymore. If KeeperWallet variable is defined, you can call any api it right away"
    );
    return Promise.resolve(globalThis.KeeperWallet);
  },
  on: (event, cb) => {
    if (event !== 'update') {
      return;
    }

    let lastPublicState:
      | Awaited<ReturnType<(typeof KeeperWallet)['publicState']>>
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

        if (!deepEqual(updatedPublicState, lastPublicState)) {
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
