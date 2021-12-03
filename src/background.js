import log from 'loglevel';
import pump from 'pump';
import url from 'url';
import EventEmitter from 'events';
import debounceStream from 'debounce-stream';
import debounce from 'debounce';
import asStream from 'obs-store/lib/asStream';
import extension from 'extensionizer';
import { ERRORS } from './lib/KeeperError';
import { MSG_STATUSES, WAVESKEEPER_DEBUG } from './constants';
import { createStreamSink } from './lib/createStreamSink';
import { getFirstLangCode } from './lib/get-first-lang-code';
import PortStream from './lib/port-stream.js';
import { ComposableObservableStore } from './lib/ComposableObservableStore';
import { equals } from 'ramda';
import LocalStore from './lib/local-store';
import {
  AssetInfoController,
  BalanceController,
  ExternalDeviceController,
  IdleController,
  MessageController,
  NetworkController,
  NotificationsController,
  PERMISSIONS,
  PermissionsController,
  PreferencesController,
  RemoteConfigController,
  StatisticsController,
  TrashController,
  TxInfoController,
  UiStateController,
  WalletController,
} from './controllers';
import { setupDnode } from './lib/dnode-util';
import { WindowManager } from './lib/WindowManger';
import '@waves/waves-transactions';
import { getAdapterByType } from '@waves/signature-adapter';
import { waves } from './controllers/wavesTransactionsController';

const version = extension.runtime.getManifest().version;
const isEdge = window.navigator.userAgent.indexOf('Edge') > -1;
log.setDefaultLevel(WAVESKEEPER_DEBUG ? 'debug' : 'warn');

const bgPromise = setupBackgroundService().catch(e => log.error(e));

extension.runtime.onInstalled.addListener(async details => {
  const bgService = await bgPromise;
  const prevUiState = bgService.uiStateController.getUiState();

  bgService.uiStateController.setUiState({
    ...prevUiState,
    isFeatureUpdateShown:
      details.reason === extension.runtime.OnInstalledReason.INSTALL ||
      !!prevUiState.isFeatureUpdateShown,
  });

  if (details.reason === extension.runtime.OnInstalledReason.UPDATE) {
    bgService.messageController.clearUnusedMessages();
  }
});

const Adapter = getAdapterByType('seed');
const adapter = new Adapter('test seed for get seed adapter info');

async function setupBackgroundService() {
  // Background service init
  const localStore = new LocalStore();
  const initState = await localStore.get();
  const initLangCode = await getFirstLangCode();
  const backgroundService = new BackgroundService({
    initState,
    initLangCode,
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
    error => {
      log.error('Persistence pipeline failed', error);
    }
  );

  async function persistData(state) {
    if (!state) {
      throw new Error('Updated state is missing', state);
    }
    if (localStore.isSupported) {
      try {
        await localStore.set(state);
      } catch (err) {
        // log error so we dont break the pipeline
        log.error('error setting state in local store:', err);
      }
    }
  }

  // connect to other contexts
  extension.runtime.onConnect.addListener(connectRemote);

  if (!isEdge) {
    extension.runtime.onConnectExternal.addListener(connectExternal);
  }

  const updateBadge = () => {
    const state = backgroundService.store.getFlatState();
    const { selectedAccount } = state;
    const messages = backgroundService.messageController.getUnapproved();
    const notifications =
      backgroundService.notificationsController.getGroupNotificationsByAccount(
        selectedAccount
      );
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
  backgroundService.on(
    'Show notification',
    windowManager.showWindow.bind(windowManager)
  );
  backgroundService.on('Close notification', () => {
    if (isEdge) {
      // Microsoft Edge doesn't support browser.windows.close api. We emit notification, so window will close itself
      backgroundService.emit('closeEdgeNotificationWindow');
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

  return backgroundService;
}

class BackgroundService extends EventEmitter {
  constructor(options = {}) {
    super();

    // Observable state store
    const initState = options.initState || {};
    this.store = new ComposableObservableStore(initState);

    this.trash = new TrashController({
      initState: initState.TrashController,
    });

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
      getNetwork: this.networkController.getNetwork.bind(
        this.networkController
      ),
      getNetworkConfig: () => this.remoteConfigController.getNetworkConfig(),
    });

    // On network change select accounts of this network
    this.networkController.store.subscribe(() =>
      this.preferencesController.syncCurrentNetworkAccounts()
    );

    // Ui State. Provides storage for ui application
    this.uiStateController = new UiStateController({
      initState: initState.UiStateController,
    });

    // Wallet. Wallet creation, app locking, signing method
    this.walletController = new WalletController({
      initState: initState.WalletController,
      getNetwork: this.networkController.getNetwork.bind(
        this.networkController
      ),
      getNetworkCode: this.networkController.getNetworkCode.bind(
        this.networkController
      ),
      getNetworks: this.networkController.getNetworks.bind(
        this.networkController
      ),
      trash: this.trash,
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
      getNetwork: this.networkController.getNetwork.bind(
        this.networkController
      ),
      getNode: this.networkController.getNode.bind(this.networkController),
      getAccounts: this.walletController.getAccounts.bind(
        this.walletController
      ),
      getCode: this.networkController.getNetworkCode.bind(
        this.networkController
      ),
      getSelectedAccount: this.preferencesController.getSelectedAccount.bind(
        this.preferencesController
      ),
      isLocked: this.walletController.isLocked.bind(this.walletController),
    });

    this.networkController.store.subscribe(() =>
      this.balanceController.updateBalances()
    );

    this.walletController.store.subscribe(() =>
      this.balanceController.updateBalances()
    );

    // AssetInfo. Provides information about assets
    this.assetInfoController = new AssetInfoController({
      initState: initState.AssetInfoController,
      getNetwork: this.networkController.getNetwork.bind(
        this.networkController
      ),
      getNode: this.networkController.getNode.bind(this.networkController),
    });

    this.txinfoController = new TxInfoController({
      getNetwork: this.networkController.getNetwork.bind(
        this.networkController
      ),
      getNode: this.networkController.getNode.bind(this.networkController),
    });

    // Messages. Transaction message pipeline. Adds new tx, user approve/reject tx.
    // Delegates different signing to walletController, broadcast and getMatcherPublicKey to networkController,
    // assetInfo for assetInfoController
    this.messageController = new MessageController({
      initState: initState.MessageController,
      signTx: this.walletController.signTx.bind(this.walletController),
      signWaves: this.walletController.signWaves.bind(this.walletController),
      auth: this.walletController.auth.bind(this.walletController),
      signRequest: this.walletController.signRequest.bind(
        this.walletController
      ),
      signBytes: this.walletController.signBytes.bind(this.walletController),
      networkController: this.networkController,
      getMatcherPublicKey: this.networkController.getMatcherPublicKey.bind(
        this.networkController
      ),
      assetInfoController: this.assetInfoController,
      txInfo: this.txinfoController.txInfo.bind(this.txinfoController),
      setPermission: this.permissionsController.setPermission.bind(
        this.permissionsController
      ),
      getMessagesConfig: () => this.remoteConfigController.getMessagesConfig(),
      getPackConfig: () => this.remoteConfigController.getPackConfig(),
    });

    // Notifications
    this.notificationsController = new NotificationsController({
      initState: initState.NotificationsController,
      getMessagesConfig: () => this.remoteConfigController.getMessagesConfig(),
      canShowNotification: (...args) =>
        this.permissionsController.canUseNotification(...args),
      setNotificationPermissions: (origin, canUse, time) =>
        this.permissionsController.setNotificationPermissions(
          origin,
          canUse,
          time
        ),
    });

    //Statistics
    this.statisticsController = new StatisticsController(
      initState.StatisticsController,
      {
        network: this.networkController,
      }
    );

    // Single state composed from states of all controllers
    this.store.updateStructure({
      StatisticsController: this.statisticsController.store,
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
      TrashController: this.trash.store,
    });

    // Call send update, which is bound to ui EventEmitter, on every store update
    this.sendUpdate = debounce(this._privateSendUpdate.bind(this), 200);
    this.store.subscribe(this.sendUpdate.bind(this));
  }

  getState() {
    const state = this.store.getFlatState();
    const { selectedAccount } = state;
    const myNotifications =
      this.notificationsController.getGroupNotificationsByAccount(
        selectedAccount
      );
    return { ...state, myNotifications };
  }

  getApi() {
    const newMessage = this.getNewMessageFn();

    // RPC API object. Only async functions allowed
    return {
      // state
      getState: async () => this.getState(),
      updateIdle: async () => this.idleController.update(),
      setIdleOptions: async ({ type }) => {
        const config = this.remoteConfigController.getIdleConfig();
        if (!Object.keys(config).includes(type)) {
          throw ERRORS.UNKNOWN_IDLE();
        }
        this.idleController.setOptions({ type, interval: config[type] });
      },

      // preferences
      setCurrentLocale: async key =>
        this.preferencesController.setCurrentLocale(key),
      selectAccount: async (address, network) =>
        this.preferencesController.selectAccount(address, network),
      editWalletName: async (address, name, network) =>
        this.preferencesController.addLabel(address, name, network),

      // ui state
      setUiState: async state => this.uiStateController.setUiState(state),

      // wallets
      addWallet: async account => this.walletController.addWallet(account),
      removeWallet: async (address, network) =>
        this.walletController.removeWallet(address, network),
      lock: async () => this.walletController.lock(),
      unlock: async password => this.walletController.unlock(password),
      initVault: async password => {
        const result = await this.walletController.initVault(password);
        this.statisticsController.addEvent('initVault');
        return result;
      },
      deleteVault: async () => {
        await this.messageController.clearMessages();
        await this.walletController.deleteVault();
      },
      newPassword: async (oldPassword, newPassword) =>
        this.walletController.newPassword(oldPassword, newPassword),
      exportAccount: async (address, password, network) =>
        this.walletController.exportAccount(address, password, network),
      encryptedSeed: async (address, network) =>
        this.walletController.encryptedSeed(address, network),

      // messages
      clearMessages: async () => this.messageController.clearMessages(),
      deleteMessage: async id => this.messageController.deleteMessage(id),
      approve: async (messageId, address) => {
        const approveData = await this.messageController.approve(
          messageId,
          address
        );
        const message = this.messageController.getMessageById(messageId);
        this.statisticsController.sendTxEvent(message);
        return approveData;
      },
      reject: async (messageId, forever) =>
        this.messageController.reject(messageId, forever),
      updateTransactionFee: this.messageController.updateTransactionFee.bind(
        this.messageController
      ),
      // notifications
      setReadNotification: async id =>
        this.notificationsController.setMessageStatus(
          id,
          MSG_STATUSES.SHOWED_NOTIFICATION
        ),
      deleteNotifications: async ids =>
        this.notificationsController.deleteNotifications(ids),

      // network
      setNetwork: async network => this.networkController.setNetwork(network),
      getNetworks: async () => this.networkController.getNetworks(),
      setCustomNode: async (url, network) =>
        this.networkController.setCustomNode(url, network),
      setCustomCode: async (code, network) => {
        this.walletController.updateNetworkCode(network, code);
        this.networkController.setCustomCode(code, network);
        this.balanceController.restartPolling();
      },
      setCustomMatcher: async (url, network) =>
        this.networkController.setCustomMatcher(url, network),

      // external devices
      getUserList: async (type, from, to) =>
        await ExternalDeviceController.getUserList(type, from, to),

      // asset information
      assetInfo: async (assetId, compareFields) =>
        await this.assetInfoController.assetInfo(assetId, compareFields),

      nftInfo: this.assetInfoController.nftInfo.bind(this.assetInfoController),

      txHistory: this.txinfoController.txHistory.bind(this.txinfoController),
      aliasByAddress: this.txinfoController.aliasByAddress.bind(
        this.txinfoController
      ),

      // window control
      closeNotificationWindow: async () => this.emit('Close notification'),

      // origin settings
      allowOrigin: async origin => {
        this.statisticsController.addEvent('allowOrigin', { origin });
        this.messageController.rejectByOrigin(origin);
        this.permissionsController.deletePermission(
          origin,
          PERMISSIONS.REJECTED
        );
        this.permissionsController.setPermission(origin, PERMISSIONS.APPROVED);
      },

      disableOrigin: async origin => {
        this.statisticsController.addEvent('disableOrigin', { origin });
        this.permissionsController.deletePermission(
          origin,
          PERMISSIONS.APPROVED
        );
        this.permissionsController.setPermission(origin, PERMISSIONS.REJECTED);
      },

      deleteOrigin: async origin => {
        this.permissionsController.deletePermissions(origin);
      },
      // extended permission autoSign
      setAutoSign: async ({ origin, params }) => {
        this.permissionsController.setAutoApprove(origin, params);
      },
      setNotificationPermissions: async ({ origin, canUse }) => {
        this.permissionsController.setNotificationPermissions(
          origin,
          canUse,
          0
        );
      },
      sendEvent: async (event, properties) =>
        this.statisticsController.addEvent(event, properties),
      updateBalances: this.balanceController.updateBalances.bind(
        this.balanceController
      ),
      signAndPublishTransaction: data =>
        newMessage(data, 'transaction', undefined, true),
    };
  }

  async validatePermission(origin) {
    const { selectedAccount } = this.getState();

    if (!selectedAccount) throw ERRORS.EMPTY_KEEPER();

    const canIUse = this.permissionsController.hasPermission(
      origin,
      PERMISSIONS.APPROVED
    );

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
        const messageData = {
          origin,
          title: null,
          options: {},
          broadcast: false,
          data: { origin },
          type: 'authOrigin',
          account: selectedAccount,
        };
        const result = await this.messageController.newMessage(messageData);
        messageId = result.id;
        this.permissionsController.setMessageIdAccess(origin, messageId);
      }

      this.emit('Show notification');

      await this.messageController
        .getMessageResult(messageId)
        .then(() => {
          this.messageController.setPermission(origin, PERMISSIONS.APPROVED);
        })
        .catch(e => {
          switch (e.data) {
          }
          if (e.data === MSG_STATUSES.REJECTED) {
            // user rejected single permission request
            this.permissionsController.setMessageIdAccess(origin, null);
          } else if (e.data === MSG_STATUSES.REJECTED_FOREVER) {
            // blocked origin
            this.messageController.setPermission(origin, PERMISSIONS.REJECTED);
          }
          return Promise.reject(e);
        });
    }
  }

  getNewMessageFn(origin) {
    return async (data, type, options, broadcast, title = '') => {
      if (data.type === 1000) {
        type = 'auth';
        data = data.data;
        data.isRequest = true;
      }

      if (origin) {
        await this.validatePermission(origin);
      }

      const { noSign, ...result } = await this.messageController.newMessage({
        data,
        type,
        title,
        origin,
        options,
        broadcast,
        account: this.getState().selectedAccount,
      });

      if (noSign) {
        return result;
      }

      if (origin) {
        if (this.permissionsController.canApprove(origin, data)) {
          this.messageController.approve(result.id);
        } else {
          this.emit('Show notification');
        }
      }

      return await this.messageController.getMessageResult(result.id);
    };
  }

  getInpageApi(origin) {
    const newMessage = this.getNewMessageFn(origin);

    const newNotification = data => {
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
          type: 'simple',
        }).id;

        if (result) {
          this.emit('Show notification');
        }

        return result;
      } catch (e) {
        throw e;
      }
    };

    return {
      // api

      signOrder: async (data, options) => {
        return await newMessage(data, 'order', options, false);
      },
      signAndPublishOrder: async (data, options) => {
        return await newMessage(data, 'order', options, true);
      },
      signCancelOrder: async (data, options) => {
        return await newMessage(data, 'cancelOrder', options, false);
      },
      signAndPublishCancelOrder: async (data, options) => {
        return await newMessage(data, 'cancelOrder', options, true);
      },
      signTransaction: async (data, options) => {
        return await newMessage(data, 'transaction', options, false);
      },
      signTransactionPackage: async (data, title, options) => {
        return await newMessage(
          data,
          'transactionPackage',
          options,
          false,
          title
        );
      },
      signAndPublishTransaction: async (data, options) => {
        return await newMessage(data, 'transaction', options, true);
      },
      auth: async (data, options) => {
        return await newMessage(data, 'auth', options, false);
      },
      wavesAuth: async (data, options) => {
        const publicKey = data && data.publicKey;
        const timestamp = (data && data.timestamp) || Date.now();
        return await newMessage(
          { publicKey, timestamp },
          'wavesAuth',
          options,
          false
        );
      },
      signRequest: async (data, options) => {
        return await newMessage(data, 'request', options, false);
      },
      signCustomData: async (data, options) => {
        return await newMessage(data, 'customData', options, false);
      },
      verifyCustomData: async data => {
        return waves.verifyCustomData(data);
      },
      notification: async data => {
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

      resourceIsApproved: async () => {
        return this.permissionsController.hasPermission(
          origin,
          PERMISSIONS.APPROVED
        );
      },

      resourceIsBlocked: async () => {
        return this.permissionsController.hasPermission(
          origin,
          PERMISSIONS.REJECTED
        );
      },

      getKEK: async (publicKey, prefix) => {
        const state = this.getState();
        const { selectedAccount, initialized } = state;

        if (!selectedAccount) {
          throw !initialized ? ERRORS.INIT_KEEPER() : ERRORS.EMPTY_KEEPER();
        }

        if (!prefix || typeof prefix !== 'string') {
          throw ERRORS.INVALID_FORMAT('prefix is invalid');
        }

        if (!publicKey || typeof publicKey !== 'string') {
          throw ERRORS.INVALID_FORMAT('publicKey is invalid');
        }

        await this.validatePermission(origin);

        return this.walletController.getKEK(
          selectedAccount.address,
          selectedAccount.network,
          publicKey,
          prefix
        );
      },

      encryptMessage: async (message, publicKey, prefix) => {
        const state = this.getState();
        const { selectedAccount, initialized } = state;

        if (!selectedAccount) {
          throw !initialized ? ERRORS.INIT_KEEPER() : ERRORS.EMPTY_KEEPER();
        }

        if (!message || typeof message !== 'string') {
          throw ERRORS.INVALID_FORMAT('message is invalid');
        }

        if (!publicKey || typeof publicKey !== 'string') {
          throw ERRORS.INVALID_FORMAT('publicKey is invalid');
        }

        await this.validatePermission(origin);

        return this.walletController.encryptMessage(
          selectedAccount.address,
          selectedAccount.network,
          message,
          publicKey,
          prefix
        );
      },

      decryptMessage: async (message, publicKey, prefix) => {
        const state = this.getState();
        const { selectedAccount, initialized } = state;

        if (!selectedAccount) {
          throw !initialized ? ERRORS.INIT_KEEPER() : ERRORS.EMPTY_KEEPER();
        }

        if (!message || typeof message !== 'string') {
          throw ERRORS.INVALID_FORMAT('message is invalid');
        }

        if (!publicKey || typeof publicKey !== 'string') {
          throw ERRORS.INVALID_FORMAT('publicKey is invalid');
        }

        await this.validatePermission(origin);

        return this.walletController.decryptMessage(
          selectedAccount.address,
          selectedAccount.network,
          message,
          publicKey,
          prefix
        );
      },
    };
  }

  setupUiConnection(connectionStream) {
    const api = this.getApi();
    const dnode = setupDnode(connectionStream, api, 'api');

    const remoteHandler = remote => {
      // push updates to popup
      const sendUpdate = remote.sendUpdate.bind(remote);
      this.on('update', sendUpdate);

      //Microsoft Edge doesn't support browser.windows.close api. We emit notification, so window will close itself
      const closeEdgeNotificationWindow =
        remote.closeEdgeNotificationWindow.bind(remote);
      this.on('closeEdgeNotificationWindow', closeEdgeNotificationWindow);

      dnode.on('end', () => {
        this.removeListener('update', sendUpdate);
        this.removeListener(
          'closeEdgeNotificationWindow',
          closeEdgeNotificationWindow
        );
      });

      this.statisticsController.sendOpenEvent();
    };

    dnode.on('remote', remoteHandler);
  }

  setupPageConnection(connectionStream, origin) {
    //ToDo: check origin

    const inpageApi = this.getInpageApi(origin);
    const dnode = setupDnode(connectionStream, inpageApi, 'inpageApi');
    const self = this;

    const onRemoteHandler = remote => {
      // push account change event to the page
      const sendUpdate = remote.sendUpdate.bind(remote);

      const updateHandler = function (state) {
        const updatedPublicState = self._publicState(state, origin);
        // If public state changed call remote with new public state
        if (!equals(updatedPublicState, publicState)) {
          publicState = updatedPublicState;
          sendUpdate(publicState);
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
      matcher: this.networkController.getMather(),
    };
    return !account ? null : networks;
  }

  _publicState(state, originReq) {
    let account = null;
    let messages = [];
    const canIUse = this.permissionsController.hasPermission(
      originReq,
      PERMISSIONS.APPROVED
    );

    if (state.selectedAccount && canIUse) {
      const address = state.selectedAccount.address;

      account = {
        ...state.selectedAccount,
        balance: state.balances[state.selectedAccount.address] || 0,
      };

      messages = state.messages
        .filter(
          ({ account, origin }) =>
            account.address === address && origin === originReq
        )
        .map(({ id, status, ext_uuid }) => ({ id, status, uid: ext_uuid }));
    }

    return {
      version,
      initialized: state.initialized,
      locked: state.locked,
      account,
      network: this._getCurrentNetwork(state.selectedAccount),
      messages,
      txVersion: adapter.getSignVersions(),
    };
  }
}
