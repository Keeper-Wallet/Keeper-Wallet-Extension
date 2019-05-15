import log from 'loglevel';
import pump from 'pump';
import url from 'url';
import EventEmitter from 'events';
import debounceStream from 'debounce-stream';
import debounce from 'debounce';
import asStream from 'obs-store/lib/asStream';
import extension from 'extensionizer';
import { ERRORS } from './lib/KeeperError';
import { MSG_STATUSES } from './constants';
import { createStreamSink } from './lib/createStreamSink';
import { getFirstLangCode } from './lib/get-first-lang-code';
import PortStream from './lib/port-stream.js';
import { ComposableObservableStore } from './lib/ComposableObservableStore';
import { equals } from 'ramda';
import LocalStore from './lib/local-store';
import {
    PreferencesController,
    WalletController,
    NotificationsController,
    NetworkController,
    MessageController,
    BalanceController,
    PermissionsController,
    UiStateController,
    AssetInfoController,
    TxInfoController,
    ExternalDeviceController,
    RemoteConfigController,
    IdleController,
} from './controllers';
import { PERMISSIONS } from './controllers/PermissionsController';
import { setupDnode } from './lib/dnode-util';
import { WindowManager } from './lib/WindowManger';
import { getAdapterByType } from '@waves/signature-adapter';
import { WAVESKEEPER_DEBUG } from './constants';

const isEdge = window.navigator.userAgent.indexOf("Edge") > -1;
log.setDefaultLevel(WAVESKEEPER_DEBUG ? 'debug' : 'warn');

setupBackgroundService().catch(e => log.error(e));

const Adapter = getAdapterByType('seed');
const adapter = new Adapter('test seed for get seed adapter info');

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
        global.background = backgroundService;
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

    const updateBadge = () => {
        const state = backgroundService.store.getFlatState();
        const { selectedAccount } = state;
        const messages = backgroundService.messageController.getUnapproved();
        const notifications = backgroundService.notificationsController.getGroupNotificationsByAccount(selectedAccount);
        const msg = notifications.length + messages.length;
        const text = msg ? String(msg) : '';
        extension.browserAction.setBadgeText({ text });
        extension.browserAction.setBadgeBackgroundColor({ color: '#768FFF' });
    };

    // update badge
    backgroundService.messageController.on('Update badge', updateBadge);
    backgroundService.notificationsController.on('Update badge', updateBadge);
    updateBadge();
    // open new tab
    backgroundService.messageController.on('Open new tab', url => {
        extension.tabs.create({ url });
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


    backgroundService.idleController = new IdleController({ backgroundService });

    // Connection handlers
    function connectRemote(remotePort) {
        const processName = remotePort.name;
        if (processName === 'contentscript') {
            connectExternal(remotePort);
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
        this.remoteConfigController = new RemoteConfigController({
            initState: initState.RemoteConfigController,
        });

        this.permissionsController = new PermissionsController({
            initState: initState.PermissionsController,
            remoteConfig: this.remoteConfigController,
        });

        // Network. Works with blockchain
        this.networkController = new NetworkController({
            initState: initState.NetworkController,
            getNetworkConfig: () => this.remoteConfigController.getNetworkConfig(),
            getNetworks: () => this.remoteConfigController.getNetworks(),
        });

        // Preferences. Contains accounts, available accounts, selected language etc.
        this.preferencesController = new PreferencesController({
            initState: initState.PreferencesController,
            initLangCode: options.langCode,
            getNetwork: this.networkController.getNetwork.bind(this.networkController),
            getNetworkConfig: () => this.remoteConfigController.getNetworkConfig(),
        });

        // On network change select accounts of this network
        this.networkController.store.subscribe(() => this.preferencesController.syncCurrentNetworkAccounts());

        // Ui State. Provides storage for ui application
        this.uiStateController = new UiStateController({ initState: initState.UiStateController });

        // Wallet. Wallet creation, app locking, signing method
        this.walletController = new WalletController({
            initState: initState.WalletController,
            getNetwork: this.networkController.getNetwork.bind(this.networkController),
            getNetworkCode: this.networkController.getNetworkCode.bind(this.networkController),
            getNetworks: this.networkController.getNetworks.bind(this.networkController),
        });


        this.walletController.store.subscribe(state => {
            if (!state.locked || !state.initialized) {
                const accounts = this.walletController.getAccounts();
                this.preferencesController.syncAccounts(accounts);
            }
        });

        // Balance. Polls balances for accounts
        this.balanceController = new BalanceController({
            initState: initState.BalanceController,
            getNetworkConfig: () => this.remoteConfigController.getNetworkConfig(),
            getNetwork: this.networkController.getNetwork.bind(this.networkController),
            getNode: this.networkController.getNode.bind(this.networkController),
            getAccounts: this.walletController.getAccounts.bind(this.walletController),
            getCode: this.networkController.getNetworkCode.bind(this.networkController),
        });

        this.networkController.store.subscribe(() => this.balanceController.updateBalances());

        // AssetInfo. Provides information about assets
        this.assetInfoController = new AssetInfoController({
            initState: initState.AssetInfoController,
            getNetwork: this.networkController.getNetwork.bind(this.networkController),
            getNode: this.networkController.getNode.bind(this.networkController)
        });

        this.txinfoController = new TxInfoController({
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
            assetInfo: this.assetInfoController.assetInfo.bind(this.assetInfoController),
            txInfo: this.txinfoController.txInfo.bind(this.txinfoController),
            setPermission: this.permissionsController.setPermission.bind(this.permissionsController),
            getMessagesConfig: () => this.remoteConfigController.getMessagesConfig(),
            getPackConfig: () => this.remoteConfigController.getPackConfig(),
            canAutoApprove: (origin, tx) => this.permissionsController.canApprove(origin, tx),
        });

        // Notifications
        this.notificationsController = new NotificationsController({
            initState: initState.NotificationsController,
            getMessagesConfig: () => this.remoteConfigController.getMessagesConfig(),
            canShowNotification: (...args) => this.permissionsController.canUseNotification(...args),
            setNotificationPermissions: (origin, canUse, time) => this.permissionsController.setNotificationPermissions(origin, canUse, time),
        });


        // Single state composed from states of all controllers
        this.store.updateStructure({
            PreferencesController: this.preferencesController.store,
            WalletController: this.walletController.store,
            NetworkController: this.networkController.store,
            MessageController: this.messageController.store,
            BalanceController: this.balanceController.store,
            PermissionsController: this.permissionsController.store,
            UiStateController: this.uiStateController.store,
            AssetInfoController: this.assetInfoController.store,
            RemoteConfigController: this.remoteConfigController.store,
            NotificationsController: this.notificationsController.store,
        });

        // Call send update, which is bound to ui EventEmitter, on every store update
        this.sendUpdate = debounce(this._privateSendUpdate.bind(this), 200);
        this.store.subscribe(this.sendUpdate.bind(this))
    }


    getState() {
        const state = this.store.getFlatState();
        const { selectedAccount } = state;
        const myNotifications = this.notificationsController.getGroupNotificationsByAccount(selectedAccount);
        return { ...state, myNotifications };
    }

    getApi() {
        // RPC API object. Only async functions allowed
        return {
            // state
            getState: async () => this.getState(),
            updateIdle: async () => this.idleController.update(),
            setIdleOptions: async ({ type }) => {
                const config = this.remoteConfigController.getIdleConfig();
                if (!(Object.keys(config)).includes(type)) {
                    throw ERRORS.UNKNOWN_IDLE();
                }
                this.idleController.setOptions({ type, interval: config[type] });
            },

            // preferences
            setCurrentLocale: async (key) => this.preferencesController.setCurrentLocale(key),
            selectAccount: async (address, network) => this.preferencesController.selectAccount(address, network),
            editWalletName: async (address, name, network) => this.preferencesController.addLabel(address, name, network),

            // ui state
            setUiState: async (state) => this.uiStateController.setUiState(state),

            // wallets
            addWallet: async (account) => this.walletController.addWallet(account),
            removeWallet: async (address, network) => this.walletController.removeWallet(address, network),
            lock: async () => this.walletController.lock(),
            unlock: async (password) => this.walletController.unlock(password),
            initVault: async (password) => this.walletController.initVault(password),
            deleteVault: async () => {
                await this.messageController.clearMessages();
                await this.walletController.deleteVault();
            },
            newPassword: async (oldPassword, newPassword) => this.walletController.newPassword(oldPassword, newPassword),
            exportAccount: async (address, password, network) => this.walletController.exportAccount(address, password, network),
            encryptedSeed: async (address, network) => this.walletController.encryptedSeed(address, network),

            // messages
            clearMessages: async () => this.messageController.clearMessages(),
            approve: async (messageId, address) => await this.messageController.approve(messageId, address),
            reject: async (messageId) => this.messageController.reject(messageId),

            // notifications
            setReadNotification: async (id) => this.notificationsController.setMessageStatus(id, MSG_STATUSES.SHOWED_NOTIFICATION),
            deleteNotifications: async (ids) => this.notificationsController.deleteNotifications(ids),

            // network
            setNetwork: async (network) => this.networkController.setNetwork(network),
            getNetworks: async () => this.networkController.getNetworks(),
            setCustomNode: async (url, network) => this.networkController.setCustomNode(url, network),
            setCustomCode: async (code, network) => {
                this.walletController.updateNetworkCode(network, code);
                this.networkController.setCustomCode(code, network);
                this.balanceController.restartPolling();
            },
            setCustomMatcher: async (url, network) => this.networkController.setCustomMatcher(url, network),

            // external devices
            getUserList: async (type, from, to) => await ExternalDeviceController.getUserList(type, from, to),

            // asset information
            assetInfo: async (assetId) => await this.assetInfoController.assetInfo(assetId),

            // window control
            closeNotificationWindow: async () => this.emit('Close notification'),

            // origin settings
            allowOrigin: async (origin) => {
                this.messageController.rejectByOrigin(origin);
                this.permissionsController.deletePermission(origin, PERMISSIONS.REJECTED);
                this.permissionsController.setPermission(origin, PERMISSIONS.APPROVED);
            },

            disableOrigin: async (origin) => {
                this.permissionsController.deletePermission(origin, PERMISSIONS.APPROVED);
                this.permissionsController.setPermission(origin, PERMISSIONS.REJECTED);
            },

            deleteOrigin: async (origin) => {
                this.permissionsController.deletePermissions(origin);
            },
            // extended permission autoSign
            setAutoSign: async ({ origin, params }) => {
                this.permissionsController.setAutoApprove(origin, params);
            },
            setNotificationPermissions: async ({ origin, canUse }) => {
                this.permissionsController.setNotificationPermissions(origin, canUse, 0);
            }
        }
    }

    async validatePermission(origin) {
        const { selectedAccount } = this.getState();

        if (!selectedAccount) throw ERRORS.EMPTY_KEEPER();

        const canIUse = this.permissionsController.hasPermission(origin, PERMISSIONS.APPROVED);

        if (!canIUse && canIUse != null) {
            throw ERRORS.API_DENIED();
        }

        if (canIUse === null) {
            let messageId = this.permissionsController.getMessageIdAccess(origin);

            if (messageId) {
                try {
                    const message = this.messageController.getMessageById(messageId);

                    if (!message || message.account.address !== selectedAccount.address) {
                        messageId = null;
                    }
                } catch (e) {
                    messageId = null;
                }

            }

            if (!messageId) {
                const result = await this.messageController.newMessage({ origin }, 'authOrigin', origin, selectedAccount, false);
                messageId = result.id;
                this.permissionsController.setMessageIdAccess(origin, messageId);
            }

            this.emit('Show notification');

            await this.messageController.getMessageResult(messageId)
                .then(() => {
                    this.messageController.setPermission(origin, PERMISSIONS.APPROVED);
                })
                .catch((e) => {
                    this.messageController.setPermission(origin, PERMISSIONS.REJECTED);
                    return Promise.reject(e);
                });
        }
    }

    getInpageApi(origin) {
        const newMessage = async (data, type, from, broadcast, title = '') => {
            const { selectedAccount } = this.getState();

            await this.validatePermission(origin);

            const { id: messageId, showNotification } = await this.messageController.newMessage(data, type, origin, selectedAccount, broadcast, title);

            if (showNotification) {
                this.emit('Show notification');
            }

            return await this.messageController.getMessageResult(messageId)
        };

        const newNotification = (data) => {
            const { selectedAccount } = this.getState();
            const myData = { ...data };
            try {
                const result = this.notificationsController.newNotification({
                    address: selectedAccount.address,
                    message: myData.message,
                    origin: origin,
                    status: MSG_STATUSES.NEW_NOTIFICATION,
                    timestamp: Date.now(),
                    title: myData.title,
                    type: 'simple'
                }).id;

                if (result) {
                    this.emit('Show notification');
                }

                return result;
            } catch (e) {
                throw e;
            }
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
            signTransactionPackage: async (data, title, from) => {
                return await newMessage(data, 'transactionPackage', from, false, title)
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
            notification: async (data) => {
                const state = this.getState();
                const { selectedAccount, initialized } = state;

                if (!selectedAccount) {
                    throw !initialized ? ERRORS.INIT_KEEPER() : ERRORS.EMPTY_KEEPER();
                }

                await this.validatePermission(origin);

                return await newNotification(data);
            },
            //pairing: async (data, from) => await newMessage(data, 'pairing', from, false),

            publicState: async () => {
                const state = this.getState();
                const { selectedAccount, initialized } = state;

                if (!selectedAccount) {
                    throw !initialized ? ERRORS.INIT_KEEPER() : ERRORS.EMPTY_KEEPER();
                }

                await this.validatePermission(origin);

                return this._publicState(this.getState(), origin);
            },

            encryptMessage: async (message, publicKey) => {
                const state = this.getState();
                const { selectedAccount, initialized } = state;

                if (!selectedAccount) {
                    throw !initialized ? ERRORS.INIT_KEEPER() : ERRORS.EMPTY_KEEPER();
                }

                await this.validatePermission(origin);

                return this.walletController.encryptMessage(selectedAccount.address, selectedAccount.network, message, publicKey);
            },

            decryptMessage: async (message, publicKey) => {
                const state = this.getState();
                const { selectedAccount, initialized } = state;

                if (!selectedAccount) {
                    throw !initialized ? ERRORS.INIT_KEEPER() : ERRORS.EMPTY_KEEPER();
                }

                await this.validatePermission(origin);

                return this.walletController.decryptMessage(selectedAccount.address, selectedAccount.network, message, publicKey);
            }
        };

        return api;
    }

    setupUiConnection(connectionStream) {
        const api = this.getApi();
        const dnode = setupDnode(connectionStream, api, 'api');

        const remoteHandler = (remote) => {
            // push updates to popup
            const sendUpdate = remote.sendUpdate.bind(remote);
            this.on('update', sendUpdate);

            //Microsoft Edge doesn't support browser.windows.close api. We emit notification, so window will close itself
            const closeEdgeNotificationWindow = remote.closeEdgeNotificationWindow.bind(remote);
            this.on('closeEdgeNotificationWindow', closeEdgeNotificationWindow);

            dnode.on('end', () => {
                this.removeListener('update', sendUpdate);
                this.removeListener('closeEdgeNotificationWindow', closeEdgeNotificationWindow);
            });
        };

        dnode.on('remote', remoteHandler);
    }

    setupPageConnection(connectionStream, origin) {
        //ToDo: check origin

        const inpageApi = this.getInpageApi(origin);
        const dnode = setupDnode(connectionStream, inpageApi, 'inpageApi');
        const self = this;

        const onRemoteHandler = (remote) => {
            // push account change event to the page
            const sendUpdate = remote.sendUpdate.bind(remote);

            const updateHandler = function (state) {
                const updatedPublicState = self._publicState(state, origin);
                // If public state changed call remote with new public state
                if (!equals(updatedPublicState, publicState)) {
                    publicState = updatedPublicState;
                    sendUpdate(publicState)
                }
            };


            this.on('update', updateHandler);

            dnode.on('end', () => {
                this.removeListener('update', updateHandler);
            });
        };


        // Select public state from app state
        let publicState = this._publicState(this.getState(), origin);
        dnode.on('remote', onRemoteHandler);
    }

    _privateSendUpdate() {
        this.emit('update', this.getState());
    }

    _getCurrentNetwork(account) {
        const networks = {
            code: this.networkController.getNetworkCode(),
            server: this.networkController.getNode(),
            matcher: this.networkController.getMather()
        };
        return !account ? null : networks;
    }

    _publicState(state, originReq) {

        let account = null;
        let messages = [];
        const canIUse = this.permissionsController.hasPermission(originReq, PERMISSIONS.APPROVED);

        if (state.selectedAccount && canIUse) {

            const address = state.selectedAccount.address;

            account = {
                ...state.selectedAccount,
                balance: state.balances[state.selectedAccount.address] || 0,
            };

            messages = state.messages
                .filter(({ account, origin }) => account.address === address && origin === originReq)
                .map(({ id, status, ext_uuid }) => ({ id, status, uid: ext_uuid }));
        }

        return {
            initialized: state.initialized,
            locked: state.locked,
            account,
            network: this._getCurrentNetwork(state.selectedAccount),
            messages,
            txVersion: adapter.getSignVersions(),
        }
    }
}
