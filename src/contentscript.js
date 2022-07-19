import { extension } from 'lib/extension';
import LocalMessageDuplexStream from 'post-message-stream';
import PortStream from './lib/port-stream.js';

if (shouldInject()) {
  injectBundle();
  setupConnection();
}

// function initKeeper() {
//     let cbs = [];
//     window.KeeperWallet = window.Waves = {
//         on: function (event, cb) { cbs.push({ event, cb }) },
//         _inited: function (api) {
//             cbs.forEach(function ({ event, cb }) {
//                 api.on(event, cb);
//             });
//             cbs = [];
//         }
//     };
// }

function injectBundle() {
  try {
    // inject in-page script
    // const script = document.createElement('script');
    const container = document.head || document.documentElement;
    // script.innerHTML = '(' + initKeeper.toString() + ')()';
    // container.insertBefore(script, container.children[0]);

    const script2 = document.createElement('script');
    script2.src = extension.runtime.getURL('inpage.js');
    container.insertBefore(script2, container.children[0]);

    script2.onload = () => {
      script2.parentElement.removeChild(script2);
    };
  } catch (e) {
    console.error('Injection failed.', e);
  }
}

function setupConnection() {
  const pageStream = new LocalMessageDuplexStream({
    name: 'waves_keeper_content',
    target: 'waves_keeper_page',
  });

  extension.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') {
      return;
    }

    pageStream.write({ name: 'updatePublicState' });

    if ('currentNetwork' in changes) {
      pageStream.write({ name: 'networkChange' });
    }
  });

  const connect = () => {
    const pluginPort = extension.runtime.connect({ name: 'contentscript' });
    const pluginStream = new PortStream(pluginPort);

    pageStream.pipe(pluginStream).pipe(pageStream);

    const onDisconnect = port => {
      port.onDisconnect.removeListener(onDisconnect);

      pageStream.unpipe(pluginStream);
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
