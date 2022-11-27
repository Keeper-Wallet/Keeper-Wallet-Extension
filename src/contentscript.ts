import LocalMessageDuplexStream from 'post-message-stream';
import Browser from 'webextension-polyfill';

import { PortStream } from './lib/portStream';

if (shouldInject()) {
  injectBundle();
  setupConnection();
}

function injectBundle() {
  const container = document.head || document.documentElement;
  const script = document.createElement('script');
  script.src = Browser.runtime.getURL('inpage.js');
  container.insertBefore(script, container.children[0]);

  script.onload = () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    script.parentElement!.removeChild(script);
  };
}

function setupConnection() {
  const pageStream = new LocalMessageDuplexStream({
    name: 'waves_keeper_content',
    target: 'waves_keeper_page',
  });

  Browser.storage.onChanged.addListener(() => {
    pageStream.write({ name: 'updatePublicState' });
  });

  const connect = () => {
    const pluginPort = Browser.runtime.connect({ name: 'contentscript' });
    const pluginStream = new PortStream(pluginPort);

    pageStream.pipe(pluginStream).pipe(pageStream);

    const onDisconnect = (port: Browser.Runtime.Port) => {
      port.onDisconnect.removeListener(onDisconnect);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      pageStream.unpipe(pluginStream);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      pluginStream.unpipe(pageStream);

      pluginStream.destroy();
      connect();
    };

    pluginPort.onDisconnect.addListener(onDisconnect);
  };

  connect();
}

function shouldInject() {
  return doctypeCheck() && suffixCheck() && documentElementCheck();
}

function doctypeCheck() {
  const doctype = window.document.doctype;
  if (doctype) {
    return doctype.name === 'html';
  } else {
    return true;
  }
}

function suffixCheck() {
  const prohibitedTypes = ['xml', 'pdf'];
  const currentUrl = window.location.href;
  let currentRegex;
  for (let i = 0; i < prohibitedTypes.length; i++) {
    currentRegex = new RegExp(`\\.${prohibitedTypes[i]}$`);
    if (currentRegex.test(currentUrl)) {
      return false;
    }
  }
  return true;
}

function documentElementCheck() {
  const documentElement = document.documentElement.nodeName;
  if (documentElement) {
    return documentElement.toLowerCase() === 'html';
  }
  return true;
}
