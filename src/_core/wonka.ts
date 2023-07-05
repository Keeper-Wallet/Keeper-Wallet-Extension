import type Browser from 'webextension-polyfill';
import { make } from 'wonka';

export function fromWebExtensionEvent<T extends unknown[]>(
  event: Browser.Events.Event<(...args: T) => void>,
) {
  return make<T>(observer => {
    function listener(...args: T) {
      observer.next(args);
    }

    event.addListener(listener);

    return () => {
      event.removeListener(listener);
    };
  });
}
