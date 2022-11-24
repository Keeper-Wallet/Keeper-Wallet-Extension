import EventEmitter from 'events';
import LocalMessageDuplexStream from 'post-message-stream';
import { equals } from 'ramda';

import { cbToPromise, setupDnode, transformMethods } from './lib/dnodeUtil';

function createDeffer<T>() {
  let resolve: (value: T) => void;
  let reject: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    resolve: resolve!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    reject: reject!,
  };
}

setupInpageApi();

async function setupInpageApi() {
  let cbs: Record<string, unknown> = {};
  let args: Record<string, unknown[]> | unknown[] = {};
  const wavesAppDef = createDeffer();
  const wavesApp = {};
  const eventEmitter = new EventEmitter();
  const wavesApi: Record<string, unknown> = {
    initialPromise: wavesAppDef.promise,
    on: eventEmitter.on.bind(eventEmitter),
  };
  const proxyApi = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(_: any, prop: string) {
      if (wavesApi[prop]) {
        return wavesApi[prop];
      }

      if (!cbs[prop] && prop !== 'on') {
        // eslint-disable-next-line func-names, @typescript-eslint/no-shadow
        cbs[prop] = function (...args: unknown[]) {
          const def = createDeffer();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (args as any)[prop] = (args as any)[prop] || [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (args as any)[prop].push({ args, def });
          return def.promise;
        };
      }

      if (!cbs[prop] && prop === 'on') {
        // eslint-disable-next-line @typescript-eslint/no-shadow, func-names
        cbs[prop] = function (...args: unknown[]) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (args as any)[prop] = (args as any)[prop] || [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (args as any)[prop].push({ args });
        };
      }

      return cbs[prop];
    },

    set() {
      throw new Error('Not permitted');
    },

    has() {
      return true;
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).KeeperWallet =
    global.WavesKeeper =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).Waves =
      new Proxy(wavesApp, proxyApi);

  const connectionStream = new LocalMessageDuplexStream({
    name: 'waves_keeper_page',
    target: 'waves_keeper_content',
  });

  const dnode = setupDnode(
    connectionStream,
    {},
    'inpageApi',
    'updatePublicState'
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inpageApi = await new Promise<any>(resolve => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-shadow
    dnode.on('remote', (inpageApi: any) => {
      resolve(transformMethods(cbToPromise, inpageApi));
    });
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Object.entries(args).forEach(([prop, data]: [string, any]) => {
    if (data.def) {
      inpageApi[prop](...data.args).then(data.def.resolve, data.def.reject);
    } else {
      inpageApi[prop](...data.args);
    }
  });

  args = [];
  cbs = {};
  Object.assign(wavesApi, inpageApi);
  wavesAppDef.resolve(wavesApi);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).KeeperWallet =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).WavesKeeper =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).Waves =
      wavesApi;
  let publicState = {};
  connectionStream.on('data', async ({ name }) => {
    if (name !== 'updatePublicState') {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isApproved = await (wavesApi as any).resourceIsApproved();
    if (!isApproved) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedPublicState = await (wavesApi as any).publicState();
    if (!equals(updatedPublicState, publicState)) {
      publicState = updatedPublicState;
      eventEmitter.emit('update', updatedPublicState);
    }
  });
  setupClickInterceptor(inpageApi);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setupClickInterceptor(inpageApi: any) {
  const excludeSites = ['waves.exchange'];

  if (excludeSites.includes(location.host)) {
    return false;
  }

  document.addEventListener('click', e => {
    const paymentApiResult = checkForPaymentApiLink(e);
    try {
      if (
        paymentApiResult &&
        processPaymentAPILink(paymentApiResult, inpageApi)
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    } catch {
      // ignore errors
    }
  });
}

function checkForPaymentApiLink(e: MouseEvent) {
  let node = e.target;

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const check = (node: EventTarget) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const href = (node as any).href;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(node as any).href) {
      return false;
    }

    try {
      const url = new URL(href);

      if (
        ![
          'client.wavesplatform.com',
          'dex.wavesplatform.com',
          'waves.exchange',
        ].find(item => url.host === item)
      ) {
        return false;
      }

      if (!url.hash.indexOf('#gateway/auth')) {
        return {
          type: 'auth',
          hash: url.hash,
        };
      }

      if (!url.hash.indexOf('#send/') && url.hash.includes('strict=true')) {
        return {
          type: 'send',
          hash: url.hash,
        };
      }

      return false;
    } catch (err) {
      return false;
    }
  };

  while (node) {
    const result = check(node);
    if (result) {
      return result;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    node = (node as any).parentElement;
  }

  return false;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function processPaymentAPILink({ type, hash }: any, inpageApi: any) {
  const apiData = hash
    .split('?')[1]
    .split('&')
    .reduce(
      (obj: Record<string, string>, data: string) => {
        const item = data.split('=');
        obj[item[0]] = decodeURIComponent(item[1].trim());
        return obj;
      },
      { type }
    );

  switch (apiData.type) {
    case 'auth':
      if (
        !apiData.n ||
        !apiData.d ||
        !apiData.r ||
        apiData.r.indexOf('https') !== 0
      ) {
        return false;
      }

      inpageApi.auth({
        name: apiData.n,
        data: apiData.d,
        icon: apiData.i || '',
        referrer: apiData.r || `${location.origin}`,
        successPath: apiData.s || '/',
      });
      break;
    case 'send': {
      const assetId = hash.split('?')[0].replace('#send/', '');

      if (!assetId || !apiData.amount) {
        return false;
      }

      inpageApi.signAndPublishTransaction({
        type: 4,
        successPath: apiData.referrer,
        data: {
          amount: {
            assetId,
            tokens: apiData.amount,
          },
          fee: {
            assetId: 'WAVES',
            tokens: '0.00100000',
          },
          recipient: apiData.recipient,
          attachment: apiData.attachment || '',
        },
      });
      break;
    }
  }

  return true;
}
