import Browser from 'webextension-polyfill';
import { onEnd, pipe, subscribe } from 'wonka';

import { fromMessagePort, fromWebExtensionPort } from './ipc/ipc';

if (document.documentElement.tagName === 'HTML') {
  document.head.appendChild(
    Object.assign(document.createElement('script'), {
      src: Browser.runtime.getURL('inpage.js'),
      onload: () => {
        const messageChannel = new MessageChannel();
        const inpagePort = messageChannel.port1;

        postMessage(
          { keeperMessagePort: messageChannel.port2 },
          location.origin,
          [messageChannel.port2],
        );

        const getWebExtensionPort = (() => {
          let webExtensionPort: Browser.Runtime.Port | undefined;

          return () => {
            if (!webExtensionPort) {
              webExtensionPort = Browser.runtime.connect({
                name: 'contentscript',
              });

              pipe(
                fromWebExtensionPort(webExtensionPort),
                onEnd(() => {
                  webExtensionPort = undefined;
                  inpagePort.postMessage({ event: 'disconnected' });
                }),
                subscribe(message => {
                  inpagePort.postMessage(message);
                }),
              );
            }

            return webExtensionPort;
          };
        })();

        pipe(
          fromMessagePort(inpagePort),
          subscribe(data => {
            getWebExtensionPort().postMessage(data);
          }),
        );
      },
    }),
  );
}
