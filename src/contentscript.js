import * as extension from 'extensionizer'
// const inpageContent = fs.readFileSync(path.join(__dirname, '..', 'dist', 'chrome', 'inpage.js')).toString();
// const inpageSuffix = '//# sourceURL=' + extension.extension.getURL('inpage.js') + '\n';
// const inpageBundle = inpageContent + inpageSuffix;


if (shouldInject()) {
    injectBundle();
    setupConnection();
}

function injectBundle() {
    try {
        // inject in-page script
        let script = document.createElement('script');
        script.src = extension.extension.getURL('inpage.js')
        (document.head||document.documentElement).appendChild(script);
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