import { captureException } from '@sentry/react';
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
  keeperMethodCallResponse: MethodCallResponse<T>;
}

export function handleMethodCallRequests<K extends string>(
  api: ApiObject<K>,
  sendResult: (result: MethodCallResponsePayload<unknown>) => void
) {
  return tap<MethodCallRequestPayload<K>>(async data => {
    if (!data.keeperMethodCallRequest) return;

    const { id, method, args } = data.keeperMethodCallRequest;

    try {
      const result = await api[method](...args);

      try {
        sendResult({
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

          sendResult({
            keeperMethodCallResponse: {
              id,
              data: JSON.parse(JSON.stringify(result)),
            },
          });
          return;
        }

        throw err;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      sendResult({
        keeperMethodCallResponse: {
          id,
          isError: true,
          error: { ...err, message: err.message ?? String(err) },
        },
      });
    }
  });
}

export function filterMethodCallRequests<K>(
  source: Source<MethodCallRequestPayload<K>>
) {
  return pipe(
    source,
    filter<MethodCallRequestPayload<K>>(
      data => data.keeperMethodCallRequest != null
    )
  );
}

export function createIpcCallProxy<K extends string, T extends ApiObject<K>>(
  sendRequest: (payload: MethodCallRequestPayload<string>) => void,
  responseSource: Source<
    MethodCallResponsePayload<Awaited<ReturnType<T[keyof T]>>>
  >
) {
  function getIpcMethod<Method extends K>(method: Method) {
    return (...args: Parameters<T[Method]>) => {
      const id = nanoid();
      const request = { keeperMethodCallRequest: { id, method, args } };

      sendRequest(request);

      return new Promise<Awaited<ReturnType<T[Method]>>>((resolve, reject) => {
        pipe(
          responseSource,
          map(data => data.keeperMethodCallResponse),
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
