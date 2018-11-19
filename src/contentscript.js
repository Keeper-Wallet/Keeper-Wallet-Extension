import extension from 'extensionizer';
import pump from 'pump';
import LocalMessageDuplexStream from 'post-message-stream';
import ObjectMultiplex from 'obj-multiplex';
import PortStream from './lib/port-stream.js';

if (shouldInject()) {
    injectBundle();
    setupConnection();
}

function injectBundle() {
    try {
        // inject in-page script
        let script = document.createElement('script');
        script.src = extension.extension.getURL('inpage.js');
        const container = document.head || document.documentElement;
        container.insertBefore(script, container.children[0]);
        script.onload = () => script.remove();
    } catch (e) {
        console.error('Injection failed.', e);
    }
}


function setupConnection() {
    const pageStream = new LocalMessageDuplexStream({
        name: 'content',
        target: 'page',
    });

    const pluginPort = extension.runtime.connect({name: 'contentscript'})
    const pluginStream = new PortStream(pluginPort)

    // forward communication plugin->inpage
    pump(
        pageStream,
        pluginStream,
        pageStream,
        (err) => logStreamDisconnectWarning('Waveskeeper Contentscript Forwarding', err)
    );

    // // setup local multistream channels
    // const mux = new ObjectMultiplex();
    // mux.setMaxListeners(25)
    //
    // pump(
    //     mux,
    //     pageStream,
    //     mux,
    //     (err) => logStreamDisconnectWarning('WavesKeeper Inpage', err)
    // );
    // pump(
    //     mux,
    //     pluginStream,
    //     mux,
    //     (err) => logStreamDisconnectWarning('WavesKeeper Background', err)
    // );


    // // connect phishing warning stream
    // const phishingStream = mux.createStream('phishing')
    // phishingStream.once('data', redirectToPhishingWarning)
    //
    // // ignore unused channels (handled by background, inpage)
    //mux.ignoreStream('inpageApi')
    // mux.ignoreStream('publicConfig')
    // mux.ignoreStream('waves')
}

/**
 * Error handler for page to plugin stream disconnections
 *
 * @param {string} remoteLabel Remote stream name
 * @param {Error} err Stream connection error
 */
function logStreamDisconnectWarning(remoteLabel, err) {
    let warningMsg = `WaveskeeperContentscript - lost connection to ${remoteLabel}`
    if (err) warningMsg += '\n' + err.stack
    console.warn(warningMsg)
}

function shouldInject() {
    return doctypeCheck() && suffixCheck()
        && documentElementCheck() && !blacklistedDomainCheck()
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

/**
 * Checks if the current domain is blacklisted
 *
 * @returns {boolean} {@code true} if the current domain is blacklisted
 */
function blacklistedDomainCheck() {
    const blacklistedDomains = [
        // 'uscourts.gov',
        // 'dropbox.com',
        // 'webbyawards.com',
        // 'cdn.shopify.com/s/javascripts/tricorder/xtld-read-only-frame.html',
        // 'adyen.com',
        // 'gravityforms.com',
    ];
    const currentUrl = window.location.href;
    let currentRegex;
    for (let i = 0; i < blacklistedDomains.length; i++) {
        const blacklistedDomain = blacklistedDomains[i].replace('.', '\\.')
        currentRegex = new RegExp(`(?:https?:\\/\\/)(?:(?!${blacklistedDomain}).)*$`)
        if (!currentRegex.test(currentUrl)) {
            return true
        }
    }
    return false
}

/**
 * Redirects the current page to a phishing information page
 */
function redirectToPhishingWarning() {
    console.log('WavesKeeper - redirecting to phishing warning')
    // Todo: render some phishing message or redirect user to phishing page
    //window.location.href = 'https://metamask.io/phishing.html'
}
