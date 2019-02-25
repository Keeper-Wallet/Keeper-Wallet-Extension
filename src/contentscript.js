import extension from 'extensionizer';
import pump from 'pump';
import LocalMessageDuplexStream from 'post-message-stream';
import PortStream from './lib/port-stream.js';

if (shouldInject()) {
    injectBundle();
    setupConnection();
}

function injectBundle() {
    try {
        // inject in-page script
        // const script = document.createElement('script');
        const container = document.head || document.documentElement;
        // script.innerHTML = '(' + initKeeper.toString() + ')()';
        // container.insertBefore(script, container.children[0]);

        const script2 = document.createElement('script');
        script2.src = extension.extension.getURL('inpage.js');
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

    const pluginPort = extension.runtime.connect({name: 'contentscript'});
    const pluginStream = new PortStream(pluginPort);

    // forward communication plugin->inpage
    pump(
        pageStream,
        pluginStream,
        pageStream,
        (err) => logStreamDisconnectWarning('Waveskeeper Contentscript Forwarding', err)
    );
}

/**
 * Error handler for page to plugin stream disconnections
 *
 * @param {string} remoteLabel Remote stream name
 * @param {Error} err Stream connection error
 */
function logStreamDisconnectWarning(remoteLabel, err) {
    let warningMsg = `WaveskeeperContentscript - lost connection to ${remoteLabel}`;
    if (err) warningMsg += '\n' + err.stack;
    console.warn(warningMsg)
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
        return doctype.name === 'html'
    } else {
        return true
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
            return false
        }
    }
    return true
}

/**
 * Checks the documentElement of the current document
 *
 * @returns {boolean} {@code true} if the documentElement is an html node or if none exists
 */
function documentElementCheck() {
    const documentElement = document.documentElement.nodeName;
    if (documentElement) {
        return documentElement.toLowerCase() === 'html'
    }
    return true
}
