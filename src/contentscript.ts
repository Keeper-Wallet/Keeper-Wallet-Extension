import { extension } from 'lib/extension';
import LocalMessageDuplexStream from 'post-message-stream';
import { PortStream } from './lib/portStream';

if (shouldInject()) {
  injectBundle();
  setupConnection();
}

function injectBundle() {
  const container = document.head || document.documentElement;
  const script = document.createElement('script');
  script.src = extension.runtime.getURL('inpage.js');
  container.insertBefore(script, container.children[0]);

  script.onload = () => {
    script.parentElement.removeChild(script);
  };
}

function setupConnection() {
  const pageStream = new LocalMessageDuplexStream({
    name: 'waves_keeper_content',
    target: 'waves_keeper_page',
  });

  const onChanged =
    extension.storage.local.onChanged || extension.storage.onChanged;
  onChanged.addListener(() => {
    pageStream.write({ name: 'updatePublicState' });
  });

  const connect = () => {
    const pluginPort = extension.runtime.connect({ name: 'contentscript' });
    const pluginStream = new PortStream(pluginPort);

    pageStream.pipe(pluginStream).pipe(pageStream);

    const onDisconnect = (port: browser.runtime.Port) => {
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

/**
 * Checks the doctype of the current document if it exists
 *
 * @returns {boolean} {@code true} if the doctype is html or if none exists
 */
function doctypeCheck() {
  const doctype = window.document.doctype;
  if (doctype) {
    return doctype.name === 'html';
  } else {
    return true;
  }
}

/**
 * Checks the current document extension
 *
 * @returns {boolean} {@code true} if the current extension is not prohibited
 */
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

/**
 * Checks the documentElement of the current document
 *
 * @returns {boolean} {@code true} if the documentElement is an html node or if none exists
 */
function documentElementCheck() {
  const documentElement = document.documentElement.nodeName;
  if (documentElement) {
    return documentElement.toLowerCase() === 'html';
  }
  return true;
}
