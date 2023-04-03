import { filter, make, map, pipe, subscribe, take } from 'wonka';

import type { __BackgroundPageApiDirect, PublicState } from './background';
import {
  createIpcCallProxy,
  fromMessagePort,
  fromPostMessage,
} from './ipc/ipc';

const messagePortPromise = new Promise<MessagePort>(resolve =>
  pipe(
    fromPostMessage(location.origin, window),
    map(value =>
      typeof value === 'object' &&
      value != null &&
      'keeperMessagePort' in value &&
      value.keeperMessagePort instanceof MessagePort
        ? value.keeperMessagePort
        : undefined
    ),
    filter(messagePort => messagePort != null),
    take(1),
    subscribe(messagePort => {
      if (messagePort) {
        resolve(messagePort);
      }
    })
  )
);

declare global {
  interface KeeperApi
    extends Omit<__BackgroundPageApiDirect, 'subscribeToPublicState'> {
    on(event: 'update', cb: (publicState: PublicState) => void): void;
    initialPromise: Promise<typeof KeeperWallet>;
  }

  // eslint-disable-next-line no-var
  var KeeperWallet: KeeperApi;
}

const proxy = createIpcCallProxy<
  keyof __BackgroundPageApiDirect,
  __BackgroundPageApiDirect
>(
  request => {
    messagePortPromise.then(messagePort => messagePort.postMessage(request));
  },
  make(observer => {
    messagePortPromise.then(messagePort => {
      pipe(
        fromMessagePort(messagePort),
        subscribe(value => {
          observer.next(value);
        })
      );
    });

    return () => undefined;
  })
);

const publicStateUpdates = make<PublicState>(observer => {
  proxy.subscribeToPublicState();

  messagePortPromise.then(messagePort => {
    pipe(
      fromMessagePort(messagePort),
      subscribe(value => {
        if (typeof value !== 'object' || value == null || !('event' in value)) {
          return;
        }

        switch (value.event) {
          case 'disconnected':
            proxy.subscribeToPublicState();
            break;
          case 'updatePublicState':
            if ('publicState' in value) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              observer.next(value.publicState as any);
            }
            break;
        }
      })
    );
  });

  return () => undefined;
});

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
      "You don't need to use initialPromise anymore. If KeeperWallet variable is defined, you can call any api right away"
    );
    return Promise.resolve(globalThis.KeeperWallet);
  },
  on: (event, cb) => {
    if (event !== 'update') {
      return;
    }

    pipe(
      publicStateUpdates,
      subscribe(value => {
        cb(value);
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
