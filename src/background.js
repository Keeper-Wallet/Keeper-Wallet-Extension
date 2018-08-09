import log from 'loglevel';
import pump from 'pump';
import Dnode from 'dnode';
import url from 'url';
import EventEmitter from 'events';
import debounceStream from 'debounce-stream';
import debounce from 'debounce';
import asStream from 'obs-store/lib/asStream';
import extension from 'extensionizer';
import {createStreamSink} from './lib/createStreamSink';
import {getFirstLangCode} from './lib/get-first-lang-code';
import PortStream from './lib/port-stream.js';
import ComposableObservableStore from './lib/ComposableObservableStore';
import ExtensionStore from './lib/local-store';
import {PreferencesController, WalletController, NetworkController, MessageController} from './controllers'
import {setupDnode} from './lib/dnode-util';

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

    // global access to service on debug
    if (WAVESKEEPER_DEBUG) {
        global.background = backgroundService
    }

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
        const origin = url.parse(remotePort.sender.url).hostname;
        backgroundService.setupPageConnection(portStream, origin);
    }
}

class BackgroundService extends EventEmitter {
    constructor(options = {}) {
        super();

        // Observable state store
        const initState = options.initState || {};
        this.store = new ComposableObservableStore(initState);

        // Controllers
        this.preferencesController = new PreferencesController({
            initState: initState.PreferencesController,
            initLangCode: options.langCode,
        });

        this.walletController = new WalletController({initState: initState.WalletController});
        this.walletController.store.subscribe(state => {
            if (!state.locked){
                const accounts = this.walletController.getAccounts();
                this.preferencesController.syncAccounts(accounts);
            }
        });

        this.networkContoller = new NetworkController({initState: initState.NetworkController});

        this.messageController = new MessageController({
            initState: initState.MessageController,
            sign: this.walletController.sign.bind(this.walletController)
        })

        // Single state composed from states of all controllers
        this.store.updateStructure({
            PreferencesController: this.preferencesController.store,
            WalletController: this.walletController.store,
            NetworkController: this.networkContoller.store,
            MessageController: this.messageController.store
        });

        // Call send update, which is bound to ui EventEmitter, on every store update
        this.sendUpdate = debounce(this._privateSendUpdate.bind(this), 200);
        this.store.subscribe(this.sendUpdate.bind(this))
    }


    getState() {
        return this.store.getFlatState()
    }

    getApi() {
        // RPC API object. Only async functions allowed
        return {
            // state
            getState: async () => this.getState(),

            // preferences
            setCurrentLocale: async (key) => this.preferencesController.setCurrentLocale(key),
            selectAccount: async (publicKey) => this.preferencesController.selectAccount(publicKey),

            // wallets
            addWallet: async (type, key) => this.walletController.addWallet(type, key),
            removeWallet: async (publicKey) => this.walletController.removeWallet(publicKey),
            lock: async () => this.walletController.lock(),
            unlock: async (password) => this.walletController.unlock(password),
            initVault: async (password) => this.walletController.initVault(password),
            exportAccount: async (publicKey) => this.walletController.exportAccount(publicKey),

            // messages
            clearMessages: async () => this.messageController.clearMessages(),
            sign: async (messageId) => this.messageController.sign(messageId),
            reject: async (messageId) => this.messageController.reject(messageId),

            // network
            setNetwork: async (network) => this.networkContoller.setNetwork(network)

        }
    }

    getInpageApi(origin) {
        return {
            sayHello: async () => 'hello',
            signMessage: async (from, message) => await this.messageController.newMessage(from, origin, message)
        }
    }

    setupUiConnection(connectionStream, origin) {
        const api = this.getApi()
        const dnode = setupDnode(connectionStream, api, 'api');

        dnode.on('remote', (remote) => {
            // push updates to popup
            const sendUpdate = remote.sendUpdate.bind(remote);
            this.on('update', sendUpdate)
        })
    }

    setupPageConnection(connectionStream, origin) {
        //ToDo: check origin

        const inpageApi = this.getInpageApi(origin);
        const dnode = setupDnode(connectionStream, inpageApi, 'inpageApi');

    }


    _privateSendUpdate() {
        this.emit('update', this.getState())
    }
}