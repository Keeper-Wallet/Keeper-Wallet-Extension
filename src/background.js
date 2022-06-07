import * as Sentry from '@sentry/react';
import log from 'loglevel';
import EventEmitter from 'events';
import { v4 as uuidv4 } from 'uuid';
import { extension } from 'lib/extension';
import { ERRORS } from 'lib/KeeperError';
import PortStream from 'lib/port-stream.js';
import LocalStore from 'lib/localStore';
import { getFirstLangCode } from 'lib/get-first-lang-code';
import { MSG_STATUSES, KEEPERWALLET_DEBUG } from './constants';
import {
  AssetInfoController,
  CurrentAccountController,
  IdentityController,
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
import { SwapController } from './controllers/SwapController';
import {
  getExtraFee,
  getMinimumFee,
} from './controllers/CalculateFeeController';
import { setupDnode } from './lib/dnode-util';
import { WindowManager } from './lib/WindowManager';
import { verifyCustomData } from '@waves/waves-transactions';
import { VaultController } from './controllers/VaultController';
import { getTxVersions } from './wallets';
import { TabsManager } from 'lib/tabsManager';

log.setDefaultLevel(KEEPERWALLET_DEBUG ? 'debug' : 'warn');

const bgPromise = setupBackgroundService();

Sentry.init({
  dsn: __SENTRY_DSN__,
  environment: __SENTRY_ENVIRONMENT__,
  release: __SENTRY_RELEASE__,
  debug: KEEPERWALLET_DEBUG,
  autoSessionTracking: false,
  initialScope: {
    tags: {
      source: 'background',
    },
  },
  beforeSend: async (event, hint) => {
    const message =
      hint.originalException &&
      typeof hint.originalException === 'object' &&
      'message' in hint.originalException &&
      typeof hint.originalException.message === 'string' &&
      hint.originalException.message
        ? hint.originalException.message
        : String(hint.originalException);

    const backgroundService = await bgPromise;

    const shouldIgnore =
      backgroundService.remoteConfigController.shouldIgnoreError(
        'beforeSend',
        message
      ) ||
      backgroundService.remoteConfigController.shouldIgnoreError(
        'beforeSendBackground',
        message
      );

    if (shouldIgnore) {
      return null;
    }

    return event;
  },
});

extension.runtime.onConnect.addListener(async remotePort => {
  const bgService = await bgPromise;
  const portStream = new PortStream(remotePort);

  if (remotePort.name === 'contentscript') {
    const origin = new URL(remotePort.sender.url).hostname;
    bgService.setupPageConnection(portStream, origin);
  } else {
    bgService.setupUiConnection(portStream);
  }
});

extension.runtime.onConnectExternal.addListener(async remotePort => {
  const bgService = await bgPromise;
  const portStream = new PortStream(remotePort);
  const origin = new URL(remotePort.sender.url).hostname;
  bgService.setupPageConnection(portStream, origin);
});

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
    bgService.assetInfoController.addTickersForExistingAssets();
    bgService.vaultController.migrate();

    await bgService.localStore.clear();
  }
});

async function setupBackgroundService() {
  const localStore = new LocalStore();
  await localStore.create();
  const initLangCode = await getFirstLangCode();
  const backgroundService = new BackgroundService({ localStore, initLangCode });

  // global access to service on debug
  if (KEEPERWALLET_DEBUG) {
    global.background = backgroundService;
  }

  const updateBadge = async () => {
    const { selectedAccount } = await backgroundService.localStore.get();
    const messages = backgroundService.messageController.getUnapproved();
    const notifications =
      backgroundService.notificationsController.getGroupNotificationsByAccount(
        selectedAccount
      );
    const msg = notifications.length + messages.length;
    const text = msg ? String(msg) : '';

    const action = extension.action || extension.browserAction;
    action.setBadgeText({ text });
    action.setBadgeBackgroundColor({ color: '#768FFF' });
  };

  // update badge
  backgroundService.messageController.on('Update badge', updateBadge);
  backgroundService.notificationsController.on('Update badge', updateBadge);
  await updateBadge();
  // open new tab
  backgroundService.messageController.on('Open new tab', url => {
    extension.tabs.create({ url });
  });

  // Notification window management
  const windowManager = new WindowManager({ localStore });
  backgroundService.on(
    'Show notification',
    windowManager.showWindow.bind(windowManager)
  );
  backgroundService.on('Close notification', () => {
    windowManager.closeWindow();
  });
  backgroundService.on('Resize notification', (width, height) => {
    windowManager.resizeWindow(width, height);
  });
  // Tabs manager
  const tabsManager = new TabsManager();
  backgroundService.on('Show tab', async (url, name) => {
    backgroundService.emit('closePopupWindow');
    return tabsManager.getOrCreate(url, name);
  });

  return backgroundService;
}

class BackgroundService extends EventEmitter {
  constructor({ localStore, initLangCode }) {
    super();

    this.localStore = localStore;

    // Controllers
    this.trash = new TrashController({
      localStore: this.localStore,
    });

    this.remoteConfigController = new RemoteConfigController({
      localStore: this.localStore,
    });

    this.remoteConfigController.on('identityConfigChanged', () => {
      // update cognito identity configuration
      this.identityController.configure();
    });

    this.permissionsController = new PermissionsController({
      localStore: this.localStore,
      remoteConfig: this.remoteConfigController,
      getSelectedAccount: () => this.preferencesController.getSelectedAccount(),
      identity: {
        restoreSession: userId =>
          this.identityController.restoreSession(userId),
      },
    });

    // Network. Works with blockchain
    this.networkController = new NetworkController({
      localStore: this.localStore,
      getNetworkConfig: () => this.remoteConfigController.getNetworkConfig(),
      getNetworks: () => this.remoteConfigController.getNetworks(),
    });

    // Preferences. Contains accounts, available accounts, selected language etc.
    this.preferencesController = new PreferencesController({
      localStore: this.localStore,
      initLangCode,
      getNetwork: this.networkController.getNetwork.bind(
        this.networkController
      ),
      getNetworkConfig: () => this.remoteConfigController.getNetworkConfig(),
    });

    // On network change
    this.networkController.store.subscribe(() => {
      // select accounts of this network
      this.preferencesController.syncCurrentNetworkAccounts();
      // update cognito identity configuration
      this.identityController.configure();
    });

    // Ui State. Provides storage for ui application
    this.uiStateController = new UiStateController({
      localStore: this.localStore,
    });

    this.identityController = new IdentityController({
      localStore: this.localStore,
      getNetwork: this.networkController.getNetwork.bind(
        this.networkController
      ),
      getSelectedAccount: this.preferencesController.getSelectedAccount.bind(
        this.preferencesController
      ),
      getIdentityConfig: this.remoteConfigController.getIdentityConfig.bind(
        this.remoteConfigController
      ),
    });

    // Wallet. Wallet creation, app locking, signing method
    this.walletController = new WalletController({
      localStore: this.localStore,
      assetInfo: (...args) => this.assetInfoController.assetInfo(...args),
      getNetwork: this.networkController.getNetwork.bind(
        this.networkController
      ),
      getNetworkCode: this.networkController.getNetworkCode.bind(
        this.networkController
      ),
      getNetworks: this.networkController.getNetworks.bind(
        this.networkController
      ),
      ledger: {
        signOrder: data =>
          this.ledgerSign('order', {
            ...data,
            dataBuffer: Array.from(data.dataBuffer),
          }),
        signRequest: data =>
          this.ledgerSign('request', {
            ...data,
            dataBuffer: Array.from(data.dataBuffer),
          }),
        signSomeData: data =>
          this.ledgerSign('someData', {
            ...data,
            dataBuffer: Array.from(data.dataBuffer),
          }),
        signTransaction: data =>
          this.ledgerSign('transaction', {
            ...data,
            dataBuffer: Array.from(data.dataBuffer),
          }),
      },
      trash: this.trash,
      identity: {
        signBytes: bytes => this.identityController.signBytes(bytes),
      },
    });

    this.vaultController = new VaultController({
      localStore: this.localStore,
      wallet: this.walletController,
      identity: this.identityController,
    });

    this.vaultController.store.subscribe(state => {
      if (!state.locked || !state.initialized) {
        const accounts = this.walletController.getAccounts();
        this.preferencesController.syncAccounts(accounts);
      }
    });

    this.walletController.store.subscribe(() => {
      const accounts = this.walletController.getAccounts();
      this.preferencesController.syncAccounts(accounts);
      this.currentAccountController.updateBalances();
    });

    this.walletController
      .on('addWallet', wallet => {
        if (wallet.getAccount().type === 'wx') {
          // persist current session to storage
          this.identityController.persistSession(wallet.getAccount().uuid);
        }
      })
      .on('removeWallet', wallet => {
        if (wallet.getAccount().type === 'wx') {
          this.identityController.removeSession(wallet.getAccount().uuid);
        }
      });

    this.networkController.store.subscribe(() =>
      this.currentAccountController.updateBalances()
    );

    // AssetInfo. Provides information about assets
    this.assetInfoController = new AssetInfoController({
      localStore: this.localStore,
      getNetwork: this.networkController.getNetwork.bind(
        this.networkController
      ),
      getNode: this.networkController.getNode.bind(this.networkController),
    });

    // Balance. Polls balances for accounts
    this.currentAccountController = new CurrentAccountController({
      localStore: this.localStore,
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
      isLocked: this.vaultController.isLocked.bind(this.vaultController),
      assetInfoController: this.assetInfoController,
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
      localStore: this.localStore,
      signTx: this.walletController.signTx.bind(this.walletController),
      signOrder: this.walletController.signOrder.bind(this.walletController),
      signCancelOrder: this.walletController.signCancelOrder.bind(
        this.walletController
      ),
      signWavesAuth: this.walletController.signWavesAuth.bind(
        this.walletController
      ),
      signCustomData: this.walletController.signCustomData.bind(
        this.walletController
      ),
      auth: this.walletController.auth.bind(this.walletController),
      signRequest: this.walletController.signRequest.bind(
        this.walletController
      ),
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
      localStore: this.localStore,
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
    this.statisticsController = new StatisticsController({
      localStore: this.localStore,
      networkController: this.networkController,
    });

    this.swapController = new SwapController({
      assetInfoController: this.assetInfoController,
      networkController: this.networkController,
      preferencesController: this.preferencesController,
      walletController: this.walletController,
    });

    this.idleController = new IdleController({
      localStore: this.localStore,
      preferencesController: this.preferencesController,
      vaultController: this.vaultController,
    });
  }

  async getState(params) {
    const state = await this.localStore.get(params);

    const { selectedAccount } = await this.localStore.get(['selectedAccount']);
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
      getState: async params => await this.getState(params),
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
      lock: async () => this.vaultController.lock(),
      unlock: async password => this.vaultController.unlock(password),
      initVault: async password => {
        this.vaultController.init(password);
        this.statisticsController.addEvent('initVault');
      },
      deleteVault: async () => {
        await this.messageController.clearMessages();
        await this.vaultController.clear();
      },
      newPassword: async (oldPassword, newPassword) =>
        this.walletController.newPassword(oldPassword, newPassword),
      getAccountSeed: async (address, network, password) =>
        this.walletController.getAccountSeed(address, network, password),
      getAccountEncodedSeed: async (address, network, password) =>
        this.walletController.getAccountEncodedSeed(address, network, password),
      getAccountPrivateKey: async (address, network, password) =>
        this.walletController.getAccountPrivateKey(address, network, password),
      encryptedSeed: async (address, network) =>
        this.walletController.encryptedSeed(address, network),

      // messages
      getMessageById: async id => this.messageController.getMessageById(id),
      clearMessages: async () => this.messageController.clearMessages(),
      deleteMessage: async id => this.messageController.deleteMessage(id),
      approve: async (messageId, address) => {
        const [error, message] = await this.messageController.approve(
          messageId,
          address
        );

        if (error) return error;

        this.statisticsController.sendTxEvent(message);
        return message.result;
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
        this.currentAccountController.restartPolling();
      },
      setCustomMatcher: async (url, network) =>
        this.networkController.setCustomMatcher(url, network),

      // asset information
      assetInfo: this.assetInfoController.assetInfo.bind(
        this.assetInfoController
      ),
      updateAssets: this.assetInfoController.updateAssets.bind(
        this.assetInfoController
      ),
      toggleAssetFavorite: this.assetInfoController.toggleAssetFavorite.bind(
        this.assetInfoController
      ),
      // window control
      closeNotificationWindow: async () => this.emit('Close notification'),
      resizeNotificationWindow: async (width, height) =>
        this.emit('Resize notification', width, height),

      showTab: async (url, name) => this.emit('Show tab', url, name),

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
      updateBalances: this.currentAccountController.updateBalances.bind(
        this.currentAccountController
      ),
      swapAssets: this.swapController.swapAssets.bind(this.swapController),
      signAndPublishTransaction: data =>
        newMessage(data, 'transaction', undefined, true),
      getMinimumFee: getMinimumFee,
      getExtraFee: (address, network) =>
        getExtraFee(address, this.networkController.getNode(network)),

      shouldIgnoreError: async (context, message) =>
        this.remoteConfigController.shouldIgnoreError(context, message),

      identitySignIn: async (username, password) =>
        this.identityController.signIn(username, password),
      identityConfirmSignIn: async code =>
        this.identityController.confirmSignIn(code),
      identityUser: async () => this.identityController.getIdentityUser(),
      identityRestore: async userId =>
        this.identityController.restoreSession(userId),
      identityUpdate: async () => this.identityController.updateSession(),
      identityClear: async () => this.identityController.clearSession(),

      ledgerSignResponse: async (requestId, err, signature) => {
        this.emit(
          `ledger:signResponse:${requestId}`,
          err ? new Error(err) : null,
          signature
        );
      },
    };
  }

  async validatePermission(origin) {
    const { selectedAccount } = await this.getState(['selectedAccount']);

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

      const { selectedAccount } = await this.getState(['selectedAccount']);

      const { noSign, ...result } = await this.messageController.newMessage({
        data,
        type,
        title,
        origin,
        options,
        broadcast,
        account: selectedAccount,
      });

      if (noSign) {
        return result;
      }

      if (origin) {
        if (
          selectedAccount.type !== 'ledger' &&
          (await this.permissionsController.canApprove(origin, data))
        ) {
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

    const newNotification = async data => {
      const { selectedAccount } = await this.getState(['selectedAccount']);
      const myData = { ...data };
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
      verifyCustomData: async data => verifyCustomData(data),
      notification: async data => {
        const { selectedAccount, initialized } = await this.getState([
          'selectedAccount',
          'initialized',
        ]);

        if (!selectedAccount) {
          throw !initialized ? ERRORS.INIT_KEEPER() : ERRORS.EMPTY_KEEPER();
        }

        await this.validatePermission(origin);

        return await newNotification(data);
      },
      //pairing: async (data, from) => await newMessage(data, 'pairing', from, false),

      publicState: async () => {
        const { selectedAccount, initialized } = await this.getState([
          'selectedAccount',
          'initialized',
        ]);

        if (!selectedAccount) {
          throw !initialized ? ERRORS.INIT_KEEPER() : ERRORS.EMPTY_KEEPER();
        }

        await this.validatePermission(origin);

        return this._publicState(await this.getState(), origin);
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
        const { selectedAccount, initialized } = await this.getState([
          'selectedAccount',
          'initialized',
        ]);

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
        const { selectedAccount, initialized } = await this.getState([
          'selectedAccount',
          'initialized',
        ]);

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
        const { selectedAccount, initialized } = await this.getState([
          'selectedAccount',
          'initialized',
        ]);

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
      const ledgerSignRequest = remote.ledgerSignRequest.bind(remote);
      this.on('ledger:signRequest', ledgerSignRequest);

      const closePopupWindow = remote.closePopupWindow.bind(remote);
      this.on('closePopupWindow', closePopupWindow);

      dnode.on('end', () => {
        this.removeListener('ledger:signRequest', ledgerSignRequest);
        this.removeListener('closePopupWindow', closePopupWindow);
      });

      this.statisticsController.sendOpenEvent();
    };

    dnode.on('remote', remoteHandler);
  }

  setupPageConnection(connectionStream, origin) {
    const inpageApi = this.getInpageApi(origin);
    setupDnode(connectionStream, inpageApi, 'inpageApi');
  }

  _getCurrentNetwork(account) {
    const networks = {
      code: this.networkController.getNetworkCode(),
      server: this.networkController.getNode(),
      matcher: this.networkController.getMatcher(),
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
      version: extension.runtime.getManifest().version,
      initialized: state.initialized,
      locked: state.locked,
      account,
      network: this._getCurrentNetwork(state.selectedAccount),
      messages,
      txVersion: getTxVersions(
        state.selectedAccount ? state.selectedAccount.type : 'seed'
      ),
    };
  }

  ledgerSign(type, data) {
    return new Promise((resolve, reject) => {
      const requestId = uuidv4();

      this.emit('ledger:signRequest', { id: requestId, type, data });

      this.once(`ledger:signResponse:${requestId}`, (err, signature) => {
        if (err) {
          return reject(err);
        }

        resolve(signature);
      });
    });
  }
}
