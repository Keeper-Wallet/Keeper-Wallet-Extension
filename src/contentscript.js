import * as extension from 'extensionizer'

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

}


function shouldInject() {
    return true
}