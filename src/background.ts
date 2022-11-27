import * as Sentry from '@sentry/react';
import { verifyCustomData } from '@waves/waves-transactions';
import { TSignedData } from '@waves/waves-transactions/dist/requests/custom-data';
import { BalancesItem } from 'balances/types';
import { collectBalances } from 'balances/utils';
import EventEmitter from 'events';
import { SUPPORTED_LANGUAGES } from 'i18n/constants';
import { ERRORS } from 'lib/keeperError';
import { PortStream } from 'lib/portStream';
import { TabsManager } from 'lib/tabsManager';
import log from 'loglevel';
import {
  MessageInput,
  MessageInputOfType,
  MessageStoreItem,
} from 'messages/types';
import { NetworkName } from 'networks/types';
import { PERMISSIONS } from 'permissions/constants';
import { PermissionObject } from 'permissions/types';
import { IdleOptions, PreferencesAccount } from 'preferences/types';
import { UiState } from 'ui/reducers/updateState';
import { v4 as uuidv4 } from 'uuid';
import { CreateWalletInput } from 'wallets/types';
import Browser from 'webextension-polyfill';

import {
  IgnoreErrorsContext,
  KEEPERWALLET_DEBUG,
  MSG_STATUSES,
} from './constants';
import { AddressBookController } from './controllers/AddressBookController';
import { AssetInfoController } from './controllers/assetInfo';
import { getExtraFee } from './controllers/calculateFee';
import { CurrentAccountController } from './controllers/currentAccount';
import { IdentityController } from './controllers/IdentityController';
import { IdleController } from './controllers/idle';
import { MessageController } from './controllers/message';
import { NetworkController } from './controllers/network';
import { NftInfoController } from './controllers/NftInfoController';
import { NotificationsController } from './controllers/notifications';
import { PermissionsController } from './controllers/permissions';
import { PreferencesController } from './controllers/preferences';
import { RemoteConfigController } from './controllers/remoteConfig';
import { StatisticsController } from './controllers/statistics';
import { SwapController } from './controllers/SwapController';
import { TrashController } from './controllers/trash';
import { TxInfoController } from './controllers/txInfo';
import { UiStateController } from './controllers/uiState';
import { VaultController } from './controllers/VaultController';
import { WalletController } from './controllers/wallet';
import { setupDnode } from './lib/dnodeUtil';
import { WindowManager } from './lib/windowManager';
import {
  backupStorage,
  createExtensionStorage,
  ExtensionStorage,
  StorageLocalState,
} from './storage/storage';
import { getTxVersions } from './wallets';

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
      hint &&
      hint.originalException &&
      typeof hint.originalException === 'object' &&
      'message' in hint.originalException &&
      typeof hint.originalException.message === 'string' &&
      hint.originalException.message
        ? hint.originalException.message
        : String(hint?.originalException);

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

Browser.runtime.onConnect.addListener(async remotePort => {
  const bgService = await bgPromise;

  if (remotePort.name === 'contentscript') {
    bgService.setupPageConnection(remotePort);
  } else {
    bgService.setupUiConnection(remotePort);
  }
});

Browser.runtime.onUpdateAvailable.addListener(async () => {
  await backupStorage();
  Browser.runtime.reload();
});

Browser.runtime.onInstalled.addListener(async details => {
  const bgService = await bgPromise;

  if (details.reason === 'update') {
    bgService.assetInfoController.addTickersForExistingAssets();
    bgService.vaultController.migrate();
    bgService.addressBookController.migrate();
    bgService.extensionStorage.clear();
  }
});

async function setupBackgroundService() {
  const [acceptLanguages, extensionStorage] = await Promise.all([
    Browser.i18n.getAcceptLanguages(),
    createExtensionStorage(),
  ]);

  const initLangCode = acceptLanguages.find(code =>
    SUPPORTED_LANGUAGES.find(lang => lang.id === code.toLowerCase())
  );

  const backgroundService = new BackgroundService({
    extensionStorage,
    initLangCode,
  });

  // global access to service on debug
  if (KEEPERWALLET_DEBUG) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).background = backgroundService;
  }

  const updateBadge = () => {
    const selectedAccount =
      backgroundService.preferencesController.getSelectedAccount();
    const messages = backgroundService.messageController.getUnapproved();
    const notifications =
      backgroundService.notificationsController.getGroupNotificationsByAccount(
        selectedAccount
      );
    const msg = notifications.length + messages.length;
    const text = msg ? String(msg) : '';

    const action = Browser.action || Browser.browserAction;
    action.setBadgeText({ text });
    action.setBadgeBackgroundColor({ color: '#768FFF' });
  };

  // update badge
  backgroundService.messageController.on('Update badge', updateBadge);
  backgroundService.notificationsController.on('Update badge', updateBadge);
  updateBadge();
  // open new tab
  backgroundService.messageController.on('Open new tab', url => {
    Browser.tabs.create({ url });
  });

  // Notification window management
  const windowManager = new WindowManager({ extensionStorage });
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
  const tabsManager = new TabsManager({ extensionStorage });
  backgroundService.on('Show tab', async (url, name) => {
    backgroundService.emit('closePopupWindow');
    tabsManager.getOrCreate(url, name);
  });
  backgroundService.on('Close current tab', async () => {
    return tabsManager.closeCurrentTab();
  });

  backgroundService.messageController.clearMessages();
  windowManager.closeWindow();

  return backgroundService;
}

type NewMessageFnArgs<T extends MessageInput['type']> = [
  data: MessageInputOfType<T>['data'],
  type: MessageInputOfType<T>['type'],
  options: MessageInputOfType<T>['options'],
  broadcast: MessageInputOfType<T>['broadcast'],
  title?: MessageInputOfType<T>['title']
];

type NewMessageFn = {
  (...args: NewMessageFnArgs<'auth'>): Promise<unknown>;
  (...args: NewMessageFnArgs<'cancelOrder'>): Promise<unknown>;
  (...args: NewMessageFnArgs<'customData'>): Promise<unknown>;
  (...args: NewMessageFnArgs<'order'>): Promise<unknown>;
  (...args: NewMessageFnArgs<'request'>): Promise<unknown>;
  (...args: NewMessageFnArgs<'transaction'>): Promise<unknown>;
  (...args: NewMessageFnArgs<'transactionPackage'>): Promise<unknown>;
  (...args: NewMessageFnArgs<'wavesAuth'>): Promise<unknown>;
};

class BackgroundService extends EventEmitter {
  extensionStorage;

  addressBookController;
  assetInfoController;
  currentAccountController;
  identityController;
  idleController;
  messageController;
  networkController;
  nftInfoController;
  notificationsController;
  permissionsController;
  preferencesController;
  remoteConfigController;
  statisticsController;
  swapController;
  trash;
  txinfoController;
  uiStateController;
  vaultController;
  walletController;

  constructor({
    extensionStorage,
    initLangCode,
  }: {
    extensionStorage: ExtensionStorage;
    initLangCode: string | null | undefined;
  }) {
    super();

    this.extensionStorage = extensionStorage;

    // Controllers
    this.trash = new TrashController({
      extensionStorage: this.extensionStorage,
    });

    this.remoteConfigController = new RemoteConfigController({
      extensionStorage: this.extensionStorage,
    });

    this.remoteConfigController.on('identityConfigChanged', () => {
      // update cognito identity configuration
      this.identityController.configure();
    });

    this.permissionsController = new PermissionsController({
      extensionStorage: this.extensionStorage,
      remoteConfig: this.remoteConfigController,
      getSelectedAccount: () => this.preferencesController.getSelectedAccount(),
      identity: {
        restoreSession: userId =>
          this.identityController.restoreSession(userId),
      },
    });

    // Network. Works with blockchain
    this.networkController = new NetworkController({
      extensionStorage: this.extensionStorage,
      getNetworkConfig: () => this.remoteConfigController.getNetworkConfig(),
      getNetworks: () => this.remoteConfigController.getNetworks(),
    });

    // Preferences. Contains accounts, available accounts, selected language etc.
    this.preferencesController = new PreferencesController({
      extensionStorage: this.extensionStorage,
      initLangCode,
      getNetwork: this.networkController.getNetwork.bind(
        this.networkController
      ),
    });

    // On network change
    this.networkController.store.subscribe(() => {
      this.preferencesController.ensureSelectedAccountInCurrentNetwork();
      // update cognito identity configuration
      this.identityController.configure();
    });

    // Ui State. Provides storage for ui application
    this.uiStateController = new UiStateController({
      extensionStorage: this.extensionStorage,
    });

    this.identityController = new IdentityController({
      extensionStorage: this.extensionStorage,
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
      extensionStorage: this.extensionStorage,
      assetInfo: (...args) => this.assetInfoController.assetInfo(...args),
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
      extensionStorage: this.extensionStorage,
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
      extensionStorage: this.extensionStorage,
      getNetwork: this.networkController.getNetwork.bind(
        this.networkController
      ),
      getNode: this.networkController.getNode.bind(this.networkController),
      remoteConfig: this.remoteConfigController,
    });

    this.nftInfoController = new NftInfoController({
      extensionStorage: this.extensionStorage,
      getNetwork: this.networkController.getNetwork.bind(
        this.networkController
      ),
      getNode: this.networkController.getNode.bind(this.networkController),
    });

    // Balance. Polls balances for accounts
    this.currentAccountController = new CurrentAccountController({
      extensionStorage: this.extensionStorage,
      getNetwork: this.networkController.getNetwork.bind(
        this.networkController
      ),
      getNode: this.networkController.getNode.bind(this.networkController),
      getAccounts: this.preferencesController.getAccounts.bind(
        this.preferencesController
      ),
      getSelectedAccount: this.preferencesController.getSelectedAccount.bind(
        this.preferencesController
      ),
      isLocked: this.vaultController.isLocked.bind(this.vaultController),
      assetInfoController: this.assetInfoController,
      nftInfoController: this.nftInfoController,
    });

    this.txinfoController = new TxInfoController({
      getNode: this.networkController.getNode.bind(this.networkController),
    });

    this.addressBookController = new AddressBookController({
      extensionStorage: this.extensionStorage,
    });

    // Messages. Transaction message pipeline. Adds new tx, user approve/reject tx.
    // Delegates different signing to walletController, broadcast and getMatcherPublicKey to networkController,
    // assetInfo for assetInfoController
    this.messageController = new MessageController({
      extensionStorage: this.extensionStorage,
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
      getAccountBalance: this.currentAccountController.getAccountBalance.bind(
        this.currentAccountController
      ),
      getFeeConfig: this.remoteConfigController.getFeeConfig.bind(
        this.remoteConfigController
      ),
    });

    // Notifications
    this.notificationsController = new NotificationsController({
      extensionStorage: this.extensionStorage,
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

    // Statistics
    this.statisticsController = new StatisticsController({
      extensionStorage: this.extensionStorage,
      networkController: this.networkController,
    });

    this.swapController = new SwapController({
      assetInfoController: this.assetInfoController,
      networkController: this.networkController,
      preferencesController: this.preferencesController,
      walletController: this.walletController,
    });

    this.idleController = new IdleController({
      extensionStorage: this.extensionStorage,
      preferencesController: this.preferencesController,
      vaultController: this.vaultController,
    });
  }

  getState<K extends keyof StorageLocalState>(params?: K | K[]) {
    const state = this.extensionStorage.getState(params);
    const { selectedAccount } =
      this.extensionStorage.getState('selectedAccount');
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
      getState: async <K extends keyof StorageLocalState>(params?: K[]) =>
        this.getState(params),
      updateIdle: async () => this.idleController.update(),
      setIdleOptions: async ({ type }: { type: IdleOptions['type'] }) => {
        const config = this.remoteConfigController.getIdleConfig();
        if (!Object.keys(config).includes(type)) {
          throw ERRORS.UNKNOWN_IDLE();
        }
        this.idleController.setOptions({ type, interval: config[type] });
      },

      // preferences
      setCurrentLocale: async (key: string) =>
        this.preferencesController.setCurrentLocale(key),
      selectAccount: async (address: string, network: NetworkName) =>
        this.preferencesController.selectAccount(address, network),
      editWalletName: async (
        address: string,
        name: string,
        network: NetworkName
      ) => this.preferencesController.addLabel(address, name, network),

      // ui state
      setUiState: async (state: UiState) =>
        this.uiStateController.setUiState(state),

      // wallets
      addWallet: async (
        account: Omit<CreateWalletInput, 'networkCode'> & {
          networkCode?: string;
        }
      ) => this.walletController.addWallet(account),
      removeWallet: async (address: string, network: NetworkName) =>
        this.walletController.removeWallet(address, network),
      lock: async () => this.vaultController.lock(),
      unlock: async (password: string) => this.vaultController.unlock(password),
      initVault: async (password: string) => {
        this.vaultController.init(password);
        this.statisticsController.addEvent('initVault');
      },
      deleteVault: async () => {
        this.messageController.clearMessages();
        this.vaultController.clear();
      },
      newPassword: async (oldPassword: string, newPassword: string) =>
        this.vaultController.update(oldPassword, newPassword),
      checkPassword: async (password: string) =>
        this.walletController.checkPassword(password),
      getAccountSeed: async (
        address: string,
        network: NetworkName,
        password: string
      ) => this.walletController.getAccountSeed(address, network, password),
      getAccountEncodedSeed: async (
        address: string,
        network: NetworkName,
        password: string
      ) =>
        this.walletController.getAccountEncodedSeed(address, network, password),
      getAccountPrivateKey: async (
        address: string,
        network: NetworkName,
        password: string
      ) =>
        this.walletController.getAccountPrivateKey(address, network, password),
      encryptedSeed: async (address: string, network: NetworkName) =>
        this.walletController.encryptedSeed(address, network),

      // messages
      getMessageById: async (id: string) =>
        this.messageController.getMessageById(id),
      clearMessages: async () => this.messageController.clearMessages(),
      deleteMessage: async (id: string) =>
        this.messageController.deleteMessage(id),
      approve: async (messageId: string, account: PreferencesAccount) => {
        const message = await this.messageController.approve(
          messageId,
          account
        );

        this.statisticsController.sendTxEvent(message);
        return message.result;
      },
      reject: async (messageId: string, forever?: boolean) =>
        this.messageController.reject(messageId, forever),
      updateTransactionFee: this.messageController.updateTransactionFee.bind(
        this.messageController
      ),
      // notifications
      setReadNotification: async (id: string) =>
        this.notificationsController.setMessageStatus(
          id,
          MSG_STATUSES.SHOWED_NOTIFICATION
        ),
      deleteNotifications: async (ids: string[]) =>
        this.notificationsController.deleteNotifications(ids),

      // network
      setNetwork: async (network: NetworkName) =>
        this.networkController.setNetwork(network),
      getNetworks: async () => this.networkController.getNetworks(),
      setCustomNode: async (
        url: string | null | undefined,
        network: NetworkName
      ) => this.networkController.setCustomNode(url, network),
      setCustomCode: async (code: string | undefined, network: NetworkName) => {
        this.walletController.updateNetworkCode(network, code);
        this.networkController.setCustomCode(code, network);
        this.currentAccountController.restartPolling();
      },
      setCustomMatcher: async (
        url: string | null | undefined,
        network: NetworkName
      ) => this.networkController.setCustomMatcher(url, network),

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
      // addresses
      setAddress: async (address: string, name: string) =>
        this.addressBookController.setAddress(address, name),
      setAddresses: async (addresses: Record<string, string>) =>
        this.addressBookController.setAddresses(addresses),
      removeAddress: async (address: string) =>
        this.addressBookController.removeAddress(address),
      // window control
      closeNotificationWindow: async () => {
        this.emit('Close notification');
      },
      resizeNotificationWindow: async (width: number, height: number) =>
        this.emit('Resize notification', width, height),

      showTab: async (url: string, name: string) => {
        this.emit('Show tab', url, name);
      },

      closeCurrentTab: async () => {
        this.emit('Close current tab');
      },

      // origin settings
      allowOrigin: async (origin: string) => {
        this.statisticsController.addEvent('allowOrigin', { origin });
        this.messageController.rejectByOrigin(origin);
        this.permissionsController.deletePermission(
          origin,
          PERMISSIONS.REJECTED
        );
        this.permissionsController.setPermission(origin, PERMISSIONS.APPROVED);
      },

      disableOrigin: async (origin: string) => {
        this.statisticsController.addEvent('disableOrigin', { origin });
        this.permissionsController.deletePermission(
          origin,
          PERMISSIONS.APPROVED
        );
        this.permissionsController.setPermission(origin, PERMISSIONS.REJECTED);
      },

      deleteOrigin: async (origin: string) => {
        this.permissionsController.deletePermissions(origin);
      },
      // extended permission autoSign
      setAutoSign: async ({
        origin,
        params,
      }: {
        origin: string;
        params: Pick<PermissionObject, 'interval' | 'totalAmount'>;
      }) => {
        this.permissionsController.setAutoApprove(origin, params);
      },
      setNotificationPermissions: async ({
        origin,
        canUse,
      }: {
        origin: string;
        canUse: boolean;
      }) => {
        this.permissionsController.setNotificationPermissions(
          origin,
          canUse,
          0
        );
      },
      sendEvent: async (event: string, properties: Record<string, unknown>) =>
        this.statisticsController.addEvent(event, properties),
      updateBalances: this.currentAccountController.updateBalances.bind(
        this.currentAccountController
      ),
      swapAssets: this.swapController.swapAssets.bind(this.swapController),
      signAndPublishTransaction: (
        data: MessageInputOfType<'transaction'>['data']
      ) => newMessage(data, 'transaction', undefined, true),
      getExtraFee: (address: string, network: NetworkName) =>
        getExtraFee(address, this.networkController.getNode(network)),

      shouldIgnoreError: async (
        context: IgnoreErrorsContext,
        message: string
      ) => this.remoteConfigController.shouldIgnoreError(context, message),

      identitySignIn: async (username: string, password: string) =>
        this.identityController.signIn(username, password),
      identityConfirmSignIn: async (code: string) =>
        this.identityController.confirmSignIn(code),
      identityUser: async () => this.identityController.getIdentityUser(),
      identityRestore: async (userId: string) =>
        this.identityController.restoreSession(userId),
      identityUpdate: async () => this.identityController.updateSession(),
      identityClear: async () => this.identityController.clearSession(),

      ledgerSignResponse: async (
        requestId: string,
        err: string | null,
        signature: string | undefined
      ) => {
        this.emit(
          `ledger:signResponse:${requestId}`,
          err ? new Error(err) : null,
          signature
        );
      },
    };
  }

  async validatePermission(origin: string, connectionId: string) {
    const { selectedAccount } = this.getState('selectedAccount');

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
        const messageData: MessageInput = {
          origin,
          connectionId,
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

  getNewMessageFn(origin?: string, connectionId?: string): NewMessageFn {
    return async (data, type, options, broadcast, title = '') => {
      if (data.type === 1000) {
        type = 'auth';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data = data.data as any;
        data.isRequest = true;
      }

      if (origin != null && connectionId != null) {
        await this.validatePermission(origin, connectionId);
      }

      const { selectedAccount } = this.getState('selectedAccount');

      const { noSign, ...result } = await this.messageController.newMessage({
        connectionId,
        data,
        type,
        title,
        origin,
        options,
        broadcast,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        account: selectedAccount!,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      if (noSign) {
        return result;
      }

      if (origin) {
        if (
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          selectedAccount!.type !== 'ledger' &&
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (await this.permissionsController.canApprove(origin, data as any))
        ) {
          this.messageController.approve(result.id);
        } else {
          this.emit('Show notification');
        }
      }

      return await this.messageController.getMessageResult(result.id);
    };
  }

  getInpageApi(origin: string, connectionId: string) {
    const newMessage = this.getNewMessageFn(origin, connectionId);

    const newNotification = async (
      data:
        | {
            message?: string;
            title?: string;
          }
        | undefined
    ) => {
      const { selectedAccount } = this.getState('selectedAccount');
      const myData = { ...data };
      const result = this.notificationsController.newNotification({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        address: selectedAccount!.address,
        message: myData.message,
        origin,
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

      signOrder: async (
        data: MessageInputOfType<'order'>['data'],
        options: MessageInputOfType<'order'>['options']
      ) => {
        return await newMessage(data, 'order', options, false);
      },
      signAndPublishOrder: async (
        data: MessageInputOfType<'order'>['data'],
        options: MessageInputOfType<'order'>['options']
      ) => {
        return await newMessage(data, 'order', options, true);
      },
      signCancelOrder: async (
        data: MessageInputOfType<'cancelOrder'>['data'],
        options: MessageInputOfType<'cancelOrder'>['options']
      ) => {
        return await newMessage(data, 'cancelOrder', options, false);
      },
      signAndPublishCancelOrder: async (
        data: MessageInputOfType<'cancelOrder'>['data'],
        options: MessageInputOfType<'cancelOrder'>['options']
      ) => {
        return await newMessage(data, 'cancelOrder', options, true);
      },
      signTransaction: async (
        data: MessageInputOfType<'transaction'>['data'],
        options: MessageInputOfType<'transaction'>['options']
      ) => {
        return await newMessage(data, 'transaction', options, false);
      },
      signTransactionPackage: async (
        data: MessageInputOfType<'transactionPackage'>['data'],
        title: string | undefined,
        options: MessageInputOfType<'transactionPackage'>['options']
      ) => {
        return await newMessage(
          data,
          'transactionPackage',
          options,
          false,
          title
        );
      },
      signAndPublishTransaction: async (
        data: MessageInputOfType<'transaction'>['data'],
        options: MessageInputOfType<'transaction'>['options']
      ) => {
        return await newMessage(data, 'transaction', options, true);
      },
      auth: async (
        data: MessageInputOfType<'auth'>['data'],
        options: MessageInputOfType<'auth'>['options']
      ) => {
        return await newMessage(data, 'auth', options, false);
      },
      wavesAuth: async (
        data: MessageInputOfType<'wavesAuth'>['data'],
        options: MessageInputOfType<'wavesAuth'>['options']
      ) => {
        const publicKey = data && data.publicKey;
        const timestamp = (data && data.timestamp) || Date.now();
        return await newMessage(
          { publicKey, timestamp },
          'wavesAuth',
          options,
          false
        );
      },
      signRequest: async (
        data: MessageInputOfType<'request'>['data'],
        options: MessageInputOfType<'request'>['options']
      ) => {
        return await newMessage(data, 'request', options, false);
      },
      signCustomData: async (
        data: MessageInputOfType<'customData'>['data'],
        options: MessageInputOfType<'customData'>['options']
      ) => {
        return await newMessage(data, 'customData', options, false);
      },
      verifyCustomData: async (data: TSignedData) => verifyCustomData(data),
      notification: async (data?: { message?: string; title?: string }) => {
        const { selectedAccount, initialized } = this.getState([
          'selectedAccount',
          'initialized',
        ]);

        if (!selectedAccount) {
          throw !initialized ? ERRORS.INIT_KEEPER() : ERRORS.EMPTY_KEEPER();
        }

        await this.validatePermission(origin, connectionId);

        return await newNotification(data);
      },

      publicState: async () => {
        const { selectedAccount, initialized } = this.getState([
          'selectedAccount',
          'initialized',
        ]);

        if (!selectedAccount) {
          throw !initialized ? ERRORS.INIT_KEEPER() : ERRORS.EMPTY_KEEPER();
        }

        await this.validatePermission(origin, connectionId);

        return this._publicState(origin);
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

      getKEK: async (publicKey: string, prefix: string) => {
        const { selectedAccount, initialized } = this.getState([
          'selectedAccount',
          'initialized',
        ]);

        if (!selectedAccount) {
          throw !initialized ? ERRORS.INIT_KEEPER() : ERRORS.EMPTY_KEEPER();
        }

        if (!prefix || typeof prefix !== 'string') {
          throw ERRORS.INVALID_FORMAT(undefined, 'prefix is invalid');
        }

        if (!publicKey || typeof publicKey !== 'string') {
          throw ERRORS.INVALID_FORMAT(undefined, 'publicKey is invalid');
        }

        await this.validatePermission(origin, connectionId);

        return this.walletController.getKEK(
          selectedAccount.address,
          selectedAccount.network,
          publicKey,
          prefix
        );
      },

      encryptMessage: async (
        message: string,
        publicKey: string,
        prefix: string
      ) => {
        const { selectedAccount, initialized } = this.getState([
          'selectedAccount',
          'initialized',
        ]);

        if (!selectedAccount) {
          throw !initialized ? ERRORS.INIT_KEEPER() : ERRORS.EMPTY_KEEPER();
        }

        if (!message || typeof message !== 'string') {
          throw ERRORS.INVALID_FORMAT(undefined, 'message is invalid');
        }

        if (!publicKey || typeof publicKey !== 'string') {
          throw ERRORS.INVALID_FORMAT(undefined, 'publicKey is invalid');
        }

        await this.validatePermission(origin, connectionId);

        return this.walletController.encryptMessage(
          selectedAccount.address,
          selectedAccount.network,
          message,
          publicKey,
          prefix
        );
      },

      decryptMessage: async (
        message: string,
        publicKey: string,
        prefix: string
      ) => {
        const { selectedAccount, initialized } = this.getState([
          'selectedAccount',
          'initialized',
        ]);

        if (!selectedAccount) {
          throw !initialized ? ERRORS.INIT_KEEPER() : ERRORS.EMPTY_KEEPER();
        }

        if (!message || typeof message !== 'string') {
          throw ERRORS.INVALID_FORMAT(undefined, 'message is invalid');
        }

        if (!publicKey || typeof publicKey !== 'string') {
          throw ERRORS.INVALID_FORMAT(undefined, 'publicKey is invalid');
        }

        await this.validatePermission(origin, connectionId);

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

  setupUiConnection(remotePort: Browser.Runtime.Port) {
    const dnode = setupDnode(new PortStream(remotePort), this.getApi(), 'api');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const remoteHandler = (remote: any) => {
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

  setupPageConnection(remotePort: Browser.Runtime.Port) {
    const { sender } = remotePort;

    if (!sender || !sender.url) {
      return;
    }

    const origin = new URL(sender.url).hostname;
    const connectionId = uuidv4();
    const inpageApi = this.getInpageApi(origin, connectionId);

    const dnode = setupDnode(
      new PortStream(remotePort),
      inpageApi,
      'inpageApi'
    );

    dnode.once('end', () => {
      this.messageController.removeMessagesFromConnection(connectionId);

      const messages = this.messageController.getUnapproved();

      const notifications =
        this.notificationsController.getGroupNotificationsByAccount(
          this.preferencesController.getSelectedAccount()
        );

      if (messages.length === 0 && notifications.length === 0) {
        this.emit('Close notification');
      }
    });
  }

  _getCurrentNetwork(account: PreferencesAccount | undefined) {
    const networks = {
      code: this.networkController.getNetworkCode(),
      server: this.networkController.getNode(),
      matcher: this.networkController.getMatcher(),
    };
    return !account ? null : networks;
  }

  _publicState(originReq: string) {
    let account:
      | (PreferencesAccount & { balance: BalancesItem | number })
      | null = null;

    let msg: Array<{
      id: MessageStoreItem['id'];
      status: MessageStoreItem['status'];
      uid: MessageStoreItem['ext_uuid'];
    }> = [];

    const canIUse = this.permissionsController.hasPermission(
      originReq,
      PERMISSIONS.APPROVED
    );

    const state = this.getState();

    const { selectedAccount, messages, initialized, locked } = state;

    if (selectedAccount && canIUse) {
      const address = selectedAccount.address;
      const balances = collectBalances(state);

      account = {
        ...selectedAccount,
        balance: balances[selectedAccount.address] || 0,
      };

      msg = messages
        .filter(
          // eslint-disable-next-line @typescript-eslint/no-shadow
          ({ account, origin }) =>
            account.address === address && origin === originReq
        )
        .map(({ id, status, ext_uuid }) => ({ id, status, uid: ext_uuid }));
    }

    return {
      version: Browser.runtime.getManifest().version,
      initialized,
      locked,
      account,
      network: this._getCurrentNetwork(selectedAccount),
      messages: msg,
      txVersion: getTxVersions(selectedAccount ? selectedAccount.type : 'seed'),
    };
  }

  ledgerSign(type: string, data: unknown) {
    return new Promise<string>((resolve, reject) => {
      const requestId = uuidv4();

      this.emit('ledger:signRequest', { id: requestId, type, data });

      this.once(
        `ledger:signResponse:${requestId}`,
        (err: unknown, signature: string) => {
          if (err) {
            return reject(err);
          }

          resolve(signature);
        }
      );
    });
  }
}

export type __BackgroundUiApiDirect = ReturnType<BackgroundService['getApi']>;
