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
import {WindowManager} from './lib/WindowManger'

const WAVESKEEPER_DEBUG = process.env.NODE_ENV !== 'production';
const IDLE_INTERVAL = 60;
const isEdge = window.navigator.userAgent.indexOf("Edge") > -1

log.setDefaultLevel(WAVESKEEPER_DEBUG ? 'debug' : 'warn');

setupBackgroundService().catch(e => log.error(e));


async function setupBackgroundService() {
    // Background service init
    const localStore = new LocalStore();
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
    if (!isEdge) {
        extension.runtime.onConnectExternal.addListener(connectExternal)
    }

    // update badge
    backgroundService.messageController.on('Update badge', text => {
        extension.browserAction.setBadgeText({text});
        extension.browserAction.setBadgeBackgroundColor({color: '#768FFF'});
    });

    // open new tab
    backgroundService.messageController.on('Open new tab', url => {
        extension.tabs.create({url});
    });

    // Notification window management
    const windowManager = new WindowManager();
    backgroundService.on('Show notification', windowManager.showWindow.bind(windowManager));
    backgroundService.on('Close notification', () => {
        if (isEdge) {
            // Microsoft Edge doesn't support browser.windows.close api. We emit notification, so window will close itself
            backgroundService.emit('closeEdgeNotificationWindow')
        } else {
            windowManager.closeWindow();
        }
    });

    // Idle management
    extension.idle.setDetectionInterval(IDLE_INTERVAL);
    if (!isEdge) {
        extension.idle.onStateChanged.addListener(state => {
            if (['active', 'idle'].indexOf(state) > -1) {
                backgroundService.walletController.lock()
            }
        });
    } else {
        setInterval(() => {
            extension.idle.queryState(IDLE_INTERVAL, (state) => {
                if (["idle", "locked"].indexOf(state) > -1) {
                    backgroundService.walletController.lock()
                }
            })
        }, 10000)
    }


    // Connection handlers
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

        // Wallet. Wallet creation, app locking, signing method
        this.walletController = new WalletController({initState: initState.WalletController});
        this.walletController.store.subscribe(state => {
            if (!state.locked || !state.initialized) {
                const accounts = this.walletController.getAccounts();
                this.preferencesController.syncAccounts(accounts);
            }
        });

        // Balance. Polls balances for accounts
        this.balanceController = new BalanceController({
            initState: initState.BalanceController,
            getNetwork: this.networkController.getNetwork.bind(this.networkController),
            getNode: this.networkController.getNode.bind(this.networkController),
            getAccounts: this.walletController.getAccounts.bind(this.walletController)
        });
        this.networkController.store.subscribe(() => this.balanceController.updateBalances());

        // AssetInfo. Provides information about assets
        this.assetInfoController = new AssetInfoController({
            initState: initState.AssetInfoController,
            getNetwork: this.networkController.getNetwork.bind(this.networkController),
            getNode: this.networkController.getNode.bind(this.networkController)
        });

        // Messages. Transaction message pipeline. Adds new tx, user approve/reject tx.
        // Delegates different signing to walletController, broadcast and getMatcherPublicKey to networkController,
        // assetInfo for assetInfoController
        this.messageController = new MessageController({
            initState: initState.MessageController,
            signTx: this.walletController.signTx.bind(this.walletController),
            auth: this.walletController.auth.bind(this.walletController),
            signRequest: this.walletController.signRequest.bind(this.walletController),
            signBytes: this.walletController.signBytes.bind(this.walletController),
            broadcast: this.networkController.broadcast.bind(this.networkController),
            getMatcherPublicKey: this.networkController.getMatcherPublicKey.bind(this.networkController),
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
            editWalletName: async (address, name) => this.preferencesController.addLabel(address, name),

            // ui state
            setUiState: async (state) => this.uiStateController.setUiState(state),

            // wallets
            addWallet: async (account) => this.walletController.addWallet(account),
            removeWallet: async (publicKey) => this.walletController.removeWallet(publicKey),
            lock: async () => this.walletController.lock(),
            unlock: async (password) => this.walletController.unlock(password),
            initVault: async (password) => this.walletController.initVault(password),
            deleteVault: async () => {
                await this.messageController.clearMessages();
                await this.walletController.deleteVault();
            },
            newPassword: async (oldPassword, newPassword) => this.walletController.newPassword(oldPassword, newPassword),
            exportAccount: async (address, password) => this.walletController.exportAccount(address, password),
            encryptedSeed: async (address) => this.walletController.encryptedSeed(address),

            // messages
            clearMessages: async () => this.messageController.clearMessages(),
            approve: async (messageId, address) => await this.messageController.approve(messageId, address),
            reject: async (messageId) => this.messageController.reject(messageId),

            // network
            setNetwork: async (network) => this.networkController.setNetwork(network),
            getNetworks: async () => this.networkController.getNetworks(),
            setCustomNode: async (url, network) => this.networkController.setCustomNode(url, network),
            setCustomMatcher: async (url, network) => this.networkController.setCustomMatcher(url, network),

            // external devices
            getUserList: async (type, from, to) => await ExternalDeviceController.getUserList(type, from, to),

            // asset information
            assetInfo: async (assetId) => await this.assetInfoController.assetInfo(assetId),

            // window control
            closeNotificationWindow: async () => this.emit('Close notification')
        }
    }

    getInpageApi(origin) {
        const newMessage = async (data, type, from, broadcast) => {
            const {selectedAccount} = this.getState();

            if (!selectedAccount) throw new Error('WavesKeeper contains co accounts');
            // Proper public key check
            if (from && from !== selectedAccount.address) {
                throw new Error('From address should match selected account address or be blank');
            }

            const messageId = await this.messageController.newMessage(data, type, origin, selectedAccount, broadcast);
            this.emit('Show notification');
            return await this.messageController.getMessageResult(messageId)
        };

        const api = {
            signOrder: async (data, from) => {
                return await newMessage(data, 'order', from, false)
            },
            signAndPublishOrder: async (data, from) => {
                return await newMessage(data, 'order', from, true)
            },
            signCancelOrder: async (data, from) => {
                return await newMessage(data, 'cancelOrder', from, false)
            },
            signAndPublishCancelOrder: async (data, from) => {
                return await newMessage(data, 'cancelOrder', from, true)
            },
            signTransaction: async (data, from) => {
                return await newMessage(data, 'transaction', from, false)
            },
            signAndPublishTransaction: async (data, from) => {
                return await newMessage(data, 'transaction', from, true)
            },
            auth: async (data, from) => {
                return await newMessage(data, 'auth', from, false)
            },
            signRequest: async (data, from) => {
                return await newMessage(data, 'request', from, false)
            },
            pairing: async (data, from) => await newMessage(data, 'pairing', from, false),

            //publicState: async () => this._publicState(this.getState()),
        };

        if (true || origin === 'client.wavesplatform.com' || origin === 'chrome-ext.wvservices.com') {
            api.signBytes = async (data, from) => await newMessage(data, 'bytes', from, false);
            api.publicState = async () => this._publicState(this.getState())
        }

        return api
    }

    setupUiConnection(connectionStream, origin) {
        const api = this.getApi();
        const dnode = setupDnode(connectionStream, api, 'api');

        dnode.on('remote', (remote) => {
            // push updates to popup
            const sendUpdate = remote.sendUpdate.bind(remote);
            this.on('update', sendUpdate);

            //Microsoft Edge doesn't support browser.windows.close api. We emit notification, so window will close itself
            const closeEdgeNotificationWindow = remote.closeEdgeNotificationWindow.bind(remote);
            this.on('closeEdgeNotificationWindow', closeEdgeNotificationWindow)
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
            if (true || origin === 'client.wavesplatform.com' || origin === 'chrome-ext.wvservices.com') {
                this.on('update', function (state) {
                    const updatedPublicState = self._publicState(state);
                    // If public state changed call remote with new public state
                    if (updatedPublicState.locked !== publicState.locked || updatedPublicState.account !== publicState.account) {
                        publicState = updatedPublicState;
                        sendUpdate(publicState)
                    }
                })
            }
        })
    }

    _privateSendUpdate() {
        this.emit('update', this.getState())
    }

    _getCurrentNtwork(account) {
        const networks = {
            code: this.networkController.getNetworkCode(),
            server: this.networkController.getNode(),
            matcher: this.networkController.getMather()
        };
        return !account ? null : networks;
    }

    _publicState(state) {

        let account = null;

        if (!state.locked && state.selectedAccount) {
            account = {
                ...state.selectedAccount,
                balance: state.balances[state.selectedAccount.address] || 0,
            };
        }

        return {
            initialized: state.initialized,
            locked: state.locked,
            account,
            network: this._getCurrentNtwork(state.selectedAccount),
        }
    }
}
