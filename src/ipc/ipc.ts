import { type Source } from 'callbag';
import create from 'callbag-create';
import filter from 'callbag-filter';
import map from 'callbag-map';
import pipe from 'callbag-pipe';
import subscribe from 'callbag-subscribe';
import take from 'callbag-take';
import tap from 'callbag-tap';
import { nanoid } from 'nanoid';
import invariant from 'tiny-invariant';
import type Browser from 'webextension-polyfill';

export function fromPostMessage(origin: string, source: MessageEventSource) {
  return create(next => {
    function handleMessage(event: MessageEvent<unknown>) {
      if (event.origin !== origin || event.source !== source) {
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

export function fromMessagePort(port: MessagePort) {
  return create(next => {
    function handleMessage(event: MessageEvent<unknown>) {
      next(event.data);
    }

    port.addEventListener('message', handleMessage);
    port.start();

    return () => {
      port.removeEventListener('message', handleMessage);
    };
  });
}

export function fromWebExtensionPort(port: Browser.Runtime.Port) {
  return create((next, _error, complete) => {
    function stopListening() {
      port.onDisconnect.removeListener(handleDisconnect);
      port.onMessage.removeListener(next);
    }

    function handleDisconnect() {
      stopListening();
      complete();
    }

    port.onDisconnect.addListener(handleDisconnect);
    port.onMessage.addListener(next);

    return () => {
      stopListening();
    };
  });
}

interface MethodCallRequest<K> {
  id: string;
  method: K;
  args: unknown[];
}

interface MethodCallRequestPayload<K> {
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

interface MethodCallResponsePayload<T = unknown> {
  keeperMethodCallResponse?: MethodCallResponse<T>;
}

export function handleMethodCallRequests<K extends string>(
  api: ApiObject<K>,
  sendResponse: (
    result: 'KEEPER_PONG' | MethodCallResponsePayload<unknown>
  ) => void
) {
  return tap(async data => {
    if (data === 'KEEPER_PING') {
      sendResponse('KEEPER_PONG');
      return;
    }

    if (
      typeof data !== 'object' ||
      data == null ||
      !('keeperMethodCallRequest' in data) ||
      typeof data.keeperMethodCallRequest !== 'object' ||
      data.keeperMethodCallRequest == null ||
      !('id' in data.keeperMethodCallRequest) ||
      typeof data.keeperMethodCallRequest.id !== 'string' ||
      !('method' in data.keeperMethodCallRequest) ||
      typeof data.keeperMethodCallRequest.method !== 'string' ||
      !('args' in data.keeperMethodCallRequest) ||
      !Array.isArray(data.keeperMethodCallRequest.args)
    ) {
      return;
    }

    const { id, method, args } = data.keeperMethodCallRequest;

    try {
      const result = await api[method as K](...args);

      sendResponse({
        keeperMethodCallResponse: { id, data: result },
      });
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

export function createIpcCallProxy<K extends string, T extends ApiObject<K>>(
  sendRequest: (
    payload: 'KEEPER_PING' | MethodCallRequestPayload<string>
  ) => void,
  responseSource: Source<unknown>
) {
  function ensureConnection() {
    return new Promise<void>(resolve => {
      let retryTimeout: ReturnType<typeof setTimeout>;

      (function sendPing() {
        sendRequest('KEEPER_PING');
        retryTimeout = setTimeout(sendPing, 1000);
      })();

      pipe(
        responseSource,
        subscribe(response => {
          if (response !== 'KEEPER_PONG') {
            return;
          }

          clearTimeout(retryTimeout);
          resolve();
        })
      );
    });
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
            typeof data === 'object' &&
            data != null &&
            'keeperMethodCallResponse' in data
              ? data.keeperMethodCallResponse
              : undefined
          ),
          map(
            (
              data
            ):
              | { error?: unknown; id: string; isError: true }
              | { data?: unknown; id: string; isError?: never }
              | undefined =>
              typeof data === 'object' &&
              data != null &&
              'id' in data &&
              typeof data.id === 'string'
                ? 'isError' in data && data.isError === true
                  ? {
                      error: 'error' in data ? data.error : undefined,
                      id: data.id,
                      isError: data.isError,
                    }
                  : {
                      data: 'data' in data ? data.data : undefined,
                      id: data.id,
                    }
                : undefined
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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              resolve(response.data as any);
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
