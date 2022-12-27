import { captureException } from '@sentry/browser';
import { Source } from 'callbag';
import create from 'callbag-create';
import filter from 'callbag-filter';
import map from 'callbag-map';
import pipe from 'callbag-pipe';
import subscribe from 'callbag-subscribe';
import take from 'callbag-take';
import tap from 'callbag-tap';
import { nanoid } from 'nanoid';
import invariant from 'tiny-invariant';
import Browser from 'webextension-polyfill';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromPort<T = any>(port: Browser.Runtime.Port) {
  return create<T>((next, error, complete) => {
    function handleDisconnect() {
      port.onDisconnect.removeListener(handleDisconnect);
      port.onMessage.removeListener(handleMessage);
      complete();
    }

    function handleMessage(message: T) {
      next(message);
    }

    port.onDisconnect.addListener(handleDisconnect);
    port.onMessage.addListener(handleMessage);
  });
}

export function fromPostMessage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return create<any>(next => {
    function handleMessage(event: MessageEvent) {
      if (
        event.origin !== location.origin ||
        event.source !== window ||
        !event.data
      ) {
        return;
      }

      next(event.data);
    }

    addEventListener('message', handleMessage);

    return () => {
      removeEventListener('message', handleMessage);
    };
  });
}

interface MethodCallRequest<K> {
  id: string;
  method: K;
  args: unknown[];
}

export interface MethodCallRequestPayload<K> {
  keeperMethodCallRequest: MethodCallRequest<K>;
}

type ApiObject<K extends string> = Record<
  K,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (...args: any[]) => Promise<unknown>
>;

type MethodCallResponse<T> =
  | { id: string; isError?: never; data: T }
  | { id: string; isError: true; error: { message: string } };

export interface MethodCallResponsePayload<T = unknown> {
  keeperMethodCallResponse?: MethodCallResponse<T>;
}

export function handleMethodCallRequests<K extends string>(
  api: ApiObject<K>,
  sendResponse: (
    result: 'KEEPER_PONG' | MethodCallResponsePayload<unknown>
  ) => void
) {
  return tap<'KEEPER_PING' | MethodCallRequestPayload<K>>(async data => {
    if (data === 'KEEPER_PING') {
      sendResponse('KEEPER_PONG');
      return;
    }

    if (!data.keeperMethodCallRequest) return;

    const { id, method, args } = data.keeperMethodCallRequest;

    try {
      const result = await api[method](...args);

      try {
        sendResponse({
          keeperMethodCallResponse: { id, data: result },
        });
      } catch (err) {
        if (
          err instanceof DOMException &&
          (err.code === 25 || err.name === 'DataCloneError')
        ) {
          captureException(
            new Error(
              `Method ${method} returned not clonable response, fix it please: ${err}`
            )
          );

          sendResponse({
            keeperMethodCallResponse: {
              id,
              data: JSON.parse(JSON.stringify(result)),
            },
          });
          return;
        }

        throw err;
      }
    } catch (err) {
      sendResponse({
        keeperMethodCallResponse: {
          id,
          isError: true,
          error:
            err instanceof Response
              ? { message: await err.text() }
              : err && typeof err === 'object'
              ? {
                  ...err,
                  message: String('message' in err ? err.message : err),
                }
              : { message: String(err) },
        },
      });
    }
  });
}

export function filterIpcRequests<K>(
  source: Source<MethodCallRequestPayload<K>>
) {
  return pipe(
    source,
    filter<'KEEPER_PONG' | 'KEEPER_PING' | MethodCallRequestPayload<K>>(
      data =>
        data === 'KEEPER_PING' ||
        data === 'KEEPER_PONG' ||
        data.keeperMethodCallRequest != null
    )
  );
}

export function createIpcCallProxy<K extends string, T extends ApiObject<K>>(
  sendRequest: (
    payload: 'KEEPER_PING' | MethodCallRequestPayload<string>
  ) => void,
  responseSource: Source<
    'KEEPER_PONG' | MethodCallResponsePayload<Awaited<ReturnType<T[keyof T]>>>
  >
) {
  let connectionPromise: Promise<void> | null = null;

  function ensureConnection() {
    connectionPromise ??= new Promise<void>(resolve => {
      let retryTimeout: ReturnType<typeof setTimeout>;

      function sendPing() {
        sendRequest('KEEPER_PING');
        retryTimeout = setTimeout(sendPing, 1000);
      }

      pipe(
        responseSource,
        subscribe({
          next: response => {
            if (response !== 'KEEPER_PONG') {
              return;
            }

            clearTimeout(retryTimeout);
            resolve();
          },
          complete: () => {
            connectionPromise = null;
          },
        })
      );

      sendPing();
    });

    return connectionPromise;
  }

  function getIpcMethod<Method extends K>(method: Method) {
    return async (...args: Parameters<T[Method]>) => {
      await ensureConnection();

      const id = nanoid();
      const request = { keeperMethodCallRequest: { id, method, args } };

      sendRequest(request);

      return new Promise<Awaited<ReturnType<T[Method]>>>((resolve, reject) => {
        pipe(
          responseSource,
          map(data =>
            typeof data === 'object' ? data.keeperMethodCallResponse : undefined
          ),
          filter(
            response => response?.id === request.keeperMethodCallRequest.id
          ),
          take(1),
          subscribe(response => {
            invariant(response);

            if (response.isError) {
              reject(response.error);
            } else {
              resolve(response.data);
            }
          })
        );
      });
    };
  }

  return new Proxy({} as T, {
    get: (target, method: K) => {
      if (!target[method]) {
        target[method] = getIpcMethod(method) as T[K];
      }

      return target[method];
    },
  });
}
