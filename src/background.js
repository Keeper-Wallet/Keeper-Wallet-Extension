import log from 'loglevel';
import pump from 'pump';
import Dnode from 'dnode';
import EventEmitter from 'events'
import debounceStream from 'debounce-stream';
import debounce from 'debounce';
import asStream from 'obs-store/lib/asStream';
import extension from 'extensionizer';
import {createStreamSink} from './lib/createStreamSink';
import {getFirstLangCode} from './lib/get-first-lang-code';
import PortStream from './lib/port-stream.js';
import ComposableObservableStore from './lib/ComposableObservableStore';
import ExtensionStore from './lib/local-store';
import {PreferencesController} from './controllers/PreferencesController'

const WAVESKEEPER_DEBUG = process.env.WAVESKEEPER_DEBUG;
log.setDefaultLevel(WAVESKEEPER_DEBUG ? 'debug' : 'warn');

setupBackgroundService().catch(e => log.error(e));


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
        debounceStream(1000),
        createStreamSink(persistData),
        (error) => {
            log.error('Persistence pipeline failed', error)
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
                log.error('error setting state in local store:', err)
            }
        }
    }

    // connect to other contexts
    extension.runtime.onConnect.addListener(connectRemote);
    extension.runtime.onConnectExternal.addListener(connectExternal);

    function connectRemote(remotePort) {
        const processName = remotePort.name;
        if (processName === 'contentscript') {
            connectExternal(remotePort)
        } else {
            const portStream = new PortStream(remotePort);
            backgroundService.setupUiConnection(portStream, processName);
        }
    }

    function connectExternal(remotePort) {
        const portStream = new PortStream(remotePort);
        backgroundService.setupPageConnection(portStream, remotePort.sender.url);
    }
}

class BackgroundService extends EventEmitter {
    constructor(options = {}) {
        super();
        this.sendUpdate = debounce(this._privateSendUpdate.bind(this), 200);

        // observable state store
        const initState = options.initState || {}
        this.store = new ComposableObservableStore(initState)

        this.preferencesController = new PreferencesController({
            initState: initState.PreferencesController,
            initLangCode: options.langCode,
        });


        this.store.updateStructure({
            PreferencesController: this.preferencesController.store
        });
        this.store.subscribe(this.sendUpdate.bind(this))
    }


    getState() {
        throw 'Not Implemented'
    }

    getApi() {
        throw 'Not Implemented'
    }

    getInpageApi() {
        throw 'Not Implemented'
    }

    setupUiConnection(connectionStream, origin) {
        // setup multiplexing
        const mux = new ObjectMultiplex()
        pump(
            connectionStream,
            mux,
            connectionStream,
            (err) => {
                if (err) console.error(err)
            }
        );
        const apiStream = mux.createStream('api')
        const api = this.getApi()
        const dnode = Dnode(api)
        pump(
            apiStream,
            dnode,
            apiStream,
            (err) => {
                if (err) log.error(err)
            }
        )
        dnode.on('remote', (remote) => {
            // push updates to popup
            const sendUpdate = remote.sendUpdate.bind(remote)
            this.on('update', sendUpdate)
        })
    }

    setupPageConnection(connectionStream, origin) {
        //ToDo: check origin
        const mux = new ObjectMultiplex();
        pump(
            connectionStream,
            mux,
            connectionStream,
            (err) => {
                if (err) console.error(err)
            }
        );
        const apiStream = mux.createStream('inpageApi');
        const api = this.getInpageApi();
        const dnode = Dnode(api);
        pump(
            apiStream,
            dnode,
            apiStream,
            (err) => {
                if (err) log.error(err)
            }
        )
    }


    _privateSendUpdate() {
        this.emit('update', this.getState())
    }
}