import log from 'loglevel';
import pump from 'pump';
import url from 'url';
import EventEmitter from 'events';
import debounceStream from 'debounce-stream';
import debounce from 'debounce';
import asStream from 'obs-store/lib/asStream';
import extension from 'extensionizer';
import {createStreamSink} from './lib/createStreamSink';
import {getFirstLangCode} from './lib/get-first-lang-code';
import PortStream from './lib/port-stream.js';
import {ComposableObservableStore} from './lib/ComposableObservableStore';
import LocalStore from './lib/local-store';
import {
    PreferencesController,
    WalletController,
    NetworkController,
    MessageController,
    BalanceController,
    UiStateController, AssetInfoController, ExternalDeviceController
} from './controllers'
import {setupDnode} from './lib/dnode-util';
import * as uiHelper from './lib/uiHelper'


const WAVESKEEPER_DEBUG = true;
log.setDefaultLevel(WAVESKEEPER_DEBUG ? 'debug' : 'warn');

setupBackgroundService().catch(e => log.error(e));


async function setupBackgroundService() {
    const localStore = new LocalStore();

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
        global.uiHelper = uiHelper
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

        // Network. Works with blockchain
        this.networkController = new NetworkController({initState: initState.NetworkController});

        // Preferences. Contains accounts, available accounts, selected language etc.
        this.preferencesController = new PreferencesController({
            initState: initState.PreferencesController,
            initLangCode: options.langCode,
            getNetwork: this.networkController.getNetwork.bind(this.networkController)
        });

        // On network change select accounts of this network
        this.networkController.store.subscribe(() => this.preferencesController.syncCurrentNetworkAccounts());


        // Ui State. Provides storage for ui application
        this.uiStateController = new UiStateController({initState: initState.UiStateController});

        // Wallet. Wallet creation, app locking, signing methond
        this.walletController = new WalletController({initState: initState.WalletController});
        this.walletController.store.subscribe(state => {
            if (!state.locked) {
                const accounts = this.walletController.getAccounts();
                this.preferencesController.syncAccounts(accounts);
            }
        });

        // Balance. Polls balances for accounts
        this.balanceController = new BalanceController({
            initState: initState.BalanceController,
            getNetwork: this.networkController.getNetwork.bind(this.networkController),
            getCustomNodes: this.networkController.getCustomNodes.bind(this.networkController),
            getAccounts: this.walletController.getAccounts.bind(this.walletController)
        });
        this.networkController.store.subscribe(() => this.balanceController.updateBalances());

        // AssetInfo. Provides information about assets
        this.assetInfoController = new AssetInfoController({
            initState: initState.AssetInfoController,
            getNetwork: this.networkController.getNetwork.bind(this.networkController)
        });

        // Messages. Transaction message pipeline. Adds new tx, user approve/reject tx.
        // Delegates approve to walletController, broadcast to networkController and assetInfo for assetInfoController
        this.messageController = new MessageController({
            initState: initState.MessageController,
            sign: this.walletController.sign.bind(this.walletController),
            broadcast: this.networkController.broadcast.bind(this.networkController),
            assetInfo: this.assetInfoController.assetInfo.bind(this.assetInfoController)
        });


        // Single state composed from states of all controllers
        this.store.updateStructure({
            PreferencesController: this.preferencesController.store,
            WalletController: this.walletController.store,
            NetworkController: this.networkController.store,
            MessageController: this.messageController.store,
            BalanceController: this.balanceController.store,
            UiStateController: this.uiStateController.store,
            AssetInfoController: this.assetInfoController.store
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

            // ui state
            setUiState: async (state) => this.uiStateController.setUiState(state),

            // wallets
            addWallet: async (account) => this.walletController.addWallet(account),
            removeWallet: async (publicKey) => this.walletController.removeWallet(publicKey),
            lock: async () => this.walletController.lock(),
            unlock: async (password) => this.walletController.unlock(password),
            initVault: async (password) => this.walletController.initVault(password),
            newPassword: async (oldPassword, newPassword) => this.walletController.newPassword(oldPassword, newPassword),
            exportAccount: async (address, password) => this.walletController.exportAccount(address, password),

            // messages
            clearMessages: async () => this.messageController.clearMessages(),
            approve: async (messageId, address) => await this.messageController.approve(messageId, address),
            reject: async (messageId) => this.messageController.reject(messageId),

            // network
            setNetwork: async (network) => this.networkController.setNetwork(network),
            getNetworks: async () => this.networkController.getNetworks(),
            setCustomNode: async (url, network) => this.networkController.setCustomNode(url, network),

            // external devices
            getUserList: async (type, from, to) => await ExternalDeviceController.getUserList(type, from, to),

            // asset information
            assetInfo: async (assetId) => await this.assetInfoController.assetInfo(assetId)
        }
    }

    getInpageApi(origin) {
        const sign = async (tx, from, broadcast = false) => {
            this._validateTx(tx, from)
            return await this.messageController.newTx(tx, origin, from, broadcast)
        };

        return {
            sign: async (tx, from) => {
                return await sign(tx, from, false)
            },
            signAndPublish: async (tx, from) => {
                return await sign(tx, from, true)
            },
            publicState: async () => this._publicState(this.getState()),
        }
    }

    setupUiConnection(connectionStream, origin) {
        const api = this.getApi();
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

        const self = this;
        // Select public state from app state
        let publicState = this._publicState(this.getState());
        dnode.on('remote', (remote) => {
            // push account change event to the page
            const sendUpdate = remote.sendUpdate.bind(remote);
            this.on('update', function (state) {
                const updatedPublicState = self._publicState(state);
                // If public state changed call remote with new public state
                if (updatedPublicState.locked !== publicState.locked || updatedPublicState.account !== publicState.account) {
                    publicState = updatedPublicState;
                    sendUpdate(publicState)
                }
            })
        })
    }

    _privateSendUpdate() {
        this.emit('update', this.getState())
    }

    _publicState(state) {
        return {
            locked: state.locked,
            account: state.locked ? undefined : state.selectedAccount
        }
    }

    _validateTx(tx, from) {
        // Fields check
        if (!tx.type || !tx.data) {
            throw new Error('Invalid tx. Tx should contain type and data fields');
        }

        // Proper public key check
        const selectedAccount = this.getState().selectedAccount;
        const selectedAccountAddress = selectedAccount ? selectedAccount.address : undefined
        if (from && from !== selectedAccountAddress) {
            throw new Error('From address should match selected account address or be blank');
        }
    }

}
