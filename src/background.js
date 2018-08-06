import pump from 'pump';
import debounce from 'debounce-stream';
import asStream from 'obs-store/lib/asStream';
import extension from 'extensionizer';
import {createStreamSink} from './lib/createStreamSink';
import {getFirstLangCode} from './lib/get-first-lang-code';
import ComposableObservableStore from './lib/ComposableObservableStore';
import ExtensionStore from './lib/local-store';
import {PreferencesController} from './controllers/PreferencesController'


const WAVESKEEPER_DEBUG = process.env.WAVESKEEPER_DEBUG;


setupBackgroundService().catch(e => console.error(e));


async function setupBackgroundService() {
    const localStore = new ExtensionStore();

    // create background service
    const initState = await localStore.get();
    const initLangCode = await getFirstLangCode();

    const backgroundService = new BackgroundService({
        initState,
        initLangCode
    });

    // setup state persistence
    pump(
        asStream(backgroundService.store),
        debounce(1000),
        createStreamSink(persistData),
        (error) => {
            console.error('Persistence pipeline failed', error)
        }
    );

    async function persistData(state) {
        if (!state) {
            throw new Error('Updated state is missing', state)
        }
        if (localStore.isSupported) {
            try {
                await localStore.set(state)
            } catch (err) {
                // log error so we dont break the pipeline
                console.error('error setting state in local store:', err)
            }
        }
    }

    // connect to other contexts
    extension.runtime.onConnect.addListener(connectRemote)
    extension.runtime.onConnectExternal.addListener(connectExternal)

    function connectRemote() {

    }

    function connectExternal() {

    }
}

class BackgroundService {
    constructor(options = {}) {
        // observable state store
        const initState = options.initState || {}
        this.store = new ComposableObservableStore(initState)

        this.preferencesController = new PreferencesController({
            initState: initState.PreferencesController,
            initLangCode: options.langCode,
        })


        this.store.updateStructure({
            PreferencesController: this.preferencesController.store
        })
    }

}