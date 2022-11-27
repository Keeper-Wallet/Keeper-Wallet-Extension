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

export function createMethodCallRequest<K>(
  method: K,
  ...args: unknown[]
): MethodCallRequestPayload<K> {
  const id = nanoid();

  return { keeperMethodCallRequest: { id, method, args } };
}

type MethodCallResponse<T> =
  | { id: string; data: T }
  | { id: string; error: { message: string } };

export function handleMethodCallRequests<K extends string>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  api: Record<K, (...args: any[]) => Promise<unknown>>,
  sendResult: (result: MethodCallResponsePayload<unknown>) => void
) {
  return tap<MethodCallRequestPayload<K>>(async data => {
    if (!data.keeperMethodCallRequest) return;

    const { id, method, args } = data.keeperMethodCallRequest;

    try {
      sendResult({
        keeperMethodCallResponse: { id, data: await api[method](...args) },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      sendResult({
        keeperMethodCallResponse: {
          id,
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

export interface MethodCallResponsePayload<T = unknown> {
  keeperMethodCallResponse: MethodCallResponse<T>;
}

export function handleMethodCallResponse<T>(
  request: MethodCallRequestPayload<string>
) {
  return (source: Source<MethodCallResponsePayload<T>>) =>
    new Promise<T>((resolve, reject) => {
      pipe(
        source,
        map(data => data.keeperMethodCallResponse),
        filter(response => response?.id === request.keeperMethodCallRequest.id),
        take(1),
        subscribe(response => {
          invariant(response);

          if ('data' in response) {
            resolve(response.data);
          } else {
            reject(response.error);
          }
        })
      );
    });
}
