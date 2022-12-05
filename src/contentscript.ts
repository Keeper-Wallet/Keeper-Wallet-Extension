import pipe from 'callbag-pipe';
import subscribe from 'callbag-subscribe';
import {
  filterIpcRequests,
  fromPort,
  fromPostMessage,
  MethodCallResponsePayload,
} from 'ipc/ipc';
import Browser from 'webextension-polyfill';

if (document.documentElement.tagName === 'HTML') {
  const getPort = (() => {
    let port: Browser.Runtime.Port | undefined;

    return () => {
      if (!port) {
        port = Browser.runtime.connect({ name: 'contentscript' });

        pipe(
          fromPort<MethodCallResponsePayload>(port),
          subscribe({
            next: message => {
              postMessage(message, location.origin);
            },
            complete: () => {
              port = undefined;
            },
          })
        );
      }

      return port;
    };
  })();

  document.head.appendChild(
    Object.assign(document.createElement('script'), {
      src: Browser.runtime.getURL('inpage.js'),
      onload: () => {
        pipe(
          fromPostMessage(),
          filterIpcRequests,
          subscribe(data => {
            getPort().postMessage(data);
          })
        );

        Browser.storage.onChanged.addListener(() => {
          postMessage({ keeperMethod: 'updatePublicState' }, location.origin);
        });
      },
    })
  );
}
