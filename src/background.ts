import {
  base58Decode,
  base58Encode,
  verifySignature,
} from '@keeper-wallet/waves-crypto';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import { collectBalances } from 'balances/utils';
import EventEmitter from 'events';
import { deepEqual } from 'fast-equals';
import { getExtraFee } from 'fee/utils';
import { SUPPORTED_LANGUAGES } from 'i18n/constants';
import {
  createIpcCallProxy,
  fromWebExtensionPort,
  handleMethodCallRequests,
} from 'ipc/ipc';
import { type LedgerSignRequest } from 'ledger/types';
import { ERRORS, KeeperError } from 'lib/keeperError';
import { TabsManager } from 'lib/tabsManager';
import {
  type Message,
  type MessageCustomDataSigned,
  type MessageInputOfType,
  type MessageOfType,
  MessageStatus,
  type MessageTx,
} from 'messages/types';
import { makeCustomDataBytes, makeTxBytes } from 'messages/utils';
import { nanoid } from 'nanoid';
import { type NetworkName } from 'networks/types';
import { PERMISSIONS } from 'permissions/constants';
import { type PermissionObject } from 'permissions/types';
import { type IdleOptions, type PreferencesAccount } from 'preferences/types';
import { initSentry } from 'sentry/init';
import { type UiState } from 'store/reducers/updateState';
import invariant from 'tiny-invariant';
import Browser from 'webextension-polyfill';
import {
  empty,
  filter,
  fromPromise,
  onEnd,
  onStart,
  pipe,
  publish,
  share,
  subscribe,
  switchMap,
  takeUntil,
  tap,
} from 'wonka';

import { fromWebExtensionEvent } from './_core/wonka';
import { type IgnoreErrorsContext } from './constants';
import { AddressBookController } from './controllers/AddressBookController';
import { AssetInfoController } from './controllers/assetInfo';
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
import {
  type AnalyticsEvent,
  StatisticsController,
} from './controllers/statistics';
import { TrashController } from './controllers/trash';
import { UiStateController } from './controllers/uiState';
import { VaultController } from './controllers/VaultController';
import { WalletController } from './controllers/wallet';
import { WindowManager } from './lib/windowManager';
import {
  backupStorage,
  createExtensionStorage,
  type ExtensionStorage,
  type StorageLocalState,
} from './storage/storage';
import { getTxVersions } from './wallets/getTxVersions';

const bgPromise = setupBackgroundService();

initSentry({
  source: 'background',
  shouldIgnoreError: async message => {
    const bg = await bgPromise;

    return (
      bg.remoteConfigController.shouldIgnoreError('beforeSend', message) ||
      bg.remoteConfigController.shouldIgnoreError(
        'beforeSendBackground',
        message
      )
    );
  },
});

const storageChangesSource = pipe(
  fromWebExtensionEvent(Browser.storage.onChanged),
  share
);

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

  switch (details.reason) {
    case 'install':
      bgService.statisticsController.track({ eventType: 'installKeeper' });
      break;
    case 'update':
      bgService.assetInfoController.addTickersForExistingAssets();
      bgService.vaultController.migrate();
      bgService.addressBookController.migrate();
      bgService.extensionStorage.clear();
      break;
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

  const updateBadge = () => {
    const selectedAccount =
      backgroundService.preferencesController.getSelectedAccount();

    const notificationsCount = selectedAccount
      ? backgroundService.notificationsController.getNotifications(
          selectedAccount
        ).length
      : 0;

    const unapprovedMessagesCount =
      backgroundService.messageController.getUnapproved().length;

    const msg = notificationsCount + unapprovedMessagesCount;

    const action = Browser.action || Browser.browserAction;
    action.setBadgeText({ text: msg ? String(msg) : '' });
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
  const windowManager = new WindowManager();
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
  trash;
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
    });

    // Network. Works with blockchain
    this.networkController = new NetworkController({
      extensionStorage: this.extensionStorage,
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
        signBytes: this.identityController.signBytes.bind(
          this.identityController
        ),
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

    this.walletController.on('updateWallets', () => {
      const accounts = this.walletController.getAccounts();
      this.preferencesController.syncAccounts(accounts);
      this.currentAccountController.updateCurrentAccountBalance();
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
      this.currentAccountController.updateCurrentAccountBalance()
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

    this.addressBookController = new AddressBookController({
      extensionStorage: this.extensionStorage,
    });

    // Messages. Transaction message pipeline. Adds new tx, user approve/reject tx.
    // Delegates different signing to walletController, broadcast and getMatcherPublicKey to networkController,
    // assetInfo for assetInfoController
    this.messageController = new MessageController({
      extensionStorage: this.extensionStorage,
      networkController: this.networkController,
      assetInfoController: this.assetInfoController,
      setPermission: this.permissionsController.setPermission.bind(
        this.permissionsController
      ),
      getAccountBalance: this.currentAccountController.getAccountBalance.bind(
        this.currentAccountController
      ),
      remoteConfigController: this.remoteConfigController,
      walletController: this.walletController,
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

    this.idleController = new IdleController({
      extensionStorage: this.extensionStorage,
      preferencesController: this.preferencesController,
      vaultController: this.vaultController,
    });
  }

  getApi() {
    // RPC API object. Only async functions allowed
    return {
      // state
      getState: async <K extends keyof StorageLocalState>(params?: K[]) =>
        this.extensionStorage.getState(params),
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
      addWallet: this.walletController.addWallet.bind(this.walletController),
      batchAddWallets: this.walletController.batchAddWallets.bind(
        this.walletController
      ),

      removeWallet: this.walletController.removeWallet.bind(
        this.walletController
      ),

      lock: async () => this.vaultController.lock(),
      unlock: this.vaultController.unlock.bind(this.vaultController),

      initVault: async (password: string) => {
        await this.vaultController.init(password);
        this.statisticsController.track({ eventType: 'initVault' });
      },

      deleteVault: async () => {
        this.messageController.clearMessages();
        await this.vaultController.clear();
      },

      newPassword: this.vaultController.update.bind(this.vaultController),

      assertPasswordIsValid: this.walletController.assertPasswordIsValid.bind(
        this.walletController
      ),

      getAccountSeed: this.walletController.getAccountSeed.bind(
        this.walletController
      ),

      getAccountEncodedSeed: this.walletController.getAccountEncodedSeed.bind(
        this.walletController
      ),

      getAccountPrivateKey: this.walletController.getAccountPrivateKey.bind(
        this.walletController
      ),

      // messages
      getMessageById: async (id: string) =>
        this.messageController.getMessageById(id),
      clearMessages: async () => this.messageController.clearMessages(),
      approve: async (messageId: string) => {
        const message = await this.messageController.approve(messageId);

        const trackMessageEvent = (msg: Message) => {
          if (msg.type === 'transactionPackage') {
            msg.data.forEach((data, index) => {
              trackMessageEvent({
                ...msg,
                broadcast: false,
                data,
                result: msg.result?.[index],
                type: 'transaction',
                input: {
                  account: msg.account,
                  broadcast: false,
                  data: msg.input.data[index],
                  type: 'transaction',
                },
              });
            });
          } else if ('data' in msg && 'type' in msg.data) {
            this.statisticsController.track({
              eventType: 'approve',
              origin: msg.origin,
              msgType: msg.type,
              type: msg.data.type,
              dApp:
                msg.data.type === TRANSACTION_TYPE.INVOKE_SCRIPT
                  ? msg.data.dApp
                  : undefined,
            });
          } else {
            this.statisticsController.track({
              eventType: 'approve',
              origin: msg.origin,
              msgType: msg.type,
            });
          }
        };

        trackMessageEvent(message);
        return message.result;
      },
      reject: async (messageId: string, forever?: boolean) =>
        this.messageController.reject(messageId, forever),
      updateTransactionFee: this.messageController.updateTransactionFee.bind(
        this.messageController
      ),
      // notifications
      deleteNotifications: async (ids: string[]) =>
        this.notificationsController.deleteNotifications(ids),

      // network
      setNetwork: async (network: NetworkName) =>
        this.networkController.setNetwork(network),
      setCustomNode: async (url: string | null, network: NetworkName) =>
        this.networkController.setCustomNode(url, network),
      setCustomCode: async (code: string | null, network: NetworkName) => {
        await this.walletController.updateNetworkCode(network, code);
        this.networkController.setCustomCode(code, network);
        this.currentAccountController.restartPolling();
      },
      setCustomMatcher: async (url: string | null, network: NetworkName) =>
        this.networkController.setCustomMatcher(url, network),

      // asset information
      assetInfo: this.assetInfoController.assetInfo.bind(
        this.assetInfoController
      ),
      updateAssets: this.assetInfoController.updateAssets.bind(
        this.assetInfoController
      ),
      updateUsdPricesByAssetIds:
        this.assetInfoController.updateUsdPricesByAssetIds.bind(
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
        this.statisticsController.track({ eventType: 'allowOrigin', origin });
        this.messageController.rejectByOrigin(origin);
        this.permissionsController.deletePermission(
          origin,
          PERMISSIONS.REJECTED
        );
        this.permissionsController.setPermission(origin, PERMISSIONS.APPROVED);
      },

      disableOrigin: async (origin: string) => {
        this.statisticsController.track({ eventType: 'disableOrigin', origin });
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
        canUse: boolean | null;
      }) => {
        this.permissionsController.setNotificationPermissions(
          origin,
          canUse,
          0
        );
      },
      track: async (event: AnalyticsEvent) =>
        this.statisticsController.track(event),
      updateCurrentAccountBalance:
        this.currentAccountController.updateCurrentAccountBalance.bind(
          this.currentAccountController
        ),
      updateOtherAccountsBalances:
        this.currentAccountController.updateOtherAccountsBalances.bind(
          this.currentAccountController
        ),
      signAndPublishTransaction: async (
        data: MessageInputOfType<'transaction'>['data']
      ) => {
        const { selectedAccount } =
          this.extensionStorage.getState('selectedAccount');
        invariant(selectedAccount);

        const message = await this.messageController.newMessage({
          account: selectedAccount,
          broadcast: true,
          data,
          type: 'transaction',
        });

        await this.messageController.getMessageResult(message.id);
      },
      signTransaction: async (account: PreferencesAccount, tx: MessageTx) => {
        const signature = await this.walletController
          .getWallet(account.address, account.network)
          .signTx(makeTxBytes(tx), tx);

        return base58Encode(signature);
      },
      broadcastTransaction: (tx: MessageTx) =>
        this.networkController.broadcastTransaction(tx),
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
      identityRestore: this.identityController.restoreSession.bind(
        this.identityController
      ),
      identityUpdate: this.identityController.updateSession.bind(
        this.identityController
      ),
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
    const { initialized, selectedAccount } = this.extensionStorage.getState([
      'initialized',
      'selectedAccount',
    ]);

    if (!selectedAccount) {
      throw !initialized ? ERRORS.INIT_KEEPER() : ERRORS.EMPTY_KEEPER();
    }

    const hasPermission = this.permissionsController.hasPermission(
      origin,
      PERMISSIONS.APPROVED
    );

    if (hasPermission) {
      return { selectedAccount };
    }

    if (hasPermission === false) {
      throw ERRORS.API_DENIED();
    }

    let messageId = this.permissionsController.getMessageIdAccess(origin);

    if (messageId) {
      try {
        const message = this.messageController.getMessageById(messageId);

        if (!message || message.account.address !== selectedAccount.address) {
          messageId = null;
        }
      } catch {
        messageId = null;
      }
    }

    if (!messageId) {
      const message = await this.messageController.newMessage({
        account: selectedAccount,
        connectionId,
        data: { origin },
        origin,
        type: 'authOrigin',
      });

      messageId = message.id;
      this.permissionsController.setMessageIdAccess(origin, message.id);
    }

    this.emit('Show notification');

    try {
      await this.messageController.getMessageResult(messageId);
      this.messageController.setPermission(origin, PERMISSIONS.APPROVED);
    } catch (err) {
      if (err instanceof KeeperError) {
        if (err.data === MessageStatus.Rejected) {
          this.permissionsController.setMessageIdAccess(origin, null);
        } else if (err.data === MessageStatus.RejectedForever) {
          this.messageController.setPermission(origin, PERMISSIONS.REJECTED);
        }
      }

      throw err;
    }

    return { selectedAccount };
  }

  getInpageApi(
    origin: string,
    connectionId: string,
    port: Browser.Runtime.Port
  ) {
    const showNotification = () => {
      this.emit('Show notification');
    };

    const canAutoSign = (
      message:
        | MessageOfType<'transaction'>
        | MessageOfType<'transactionPackage'>
    ) => {
      const { locked } = this.extensionStorage.getState(['locked']);

      return (
        !locked &&
        message.account.type !== 'ledger' &&
        this.permissionsController.canAutoSign(origin, message.data)
      );
    };

    const commonMessageInput = { connectionId, origin };

    const publicStateUpdates = (() => {
      let lastPublicState: PublicState | undefined;

      return pipe(
        storageChangesSource,
        takeUntil(fromWebExtensionEvent(port.onDisconnect)),
        switchMap(([, areaName]) =>
          areaName === 'local' &&
          this.preferencesController.getSelectedAccount() != null &&
          this.permissionsController.hasPermission(origin, PERMISSIONS.APPROVED)
            ? fromPromise(this.getPublicState(origin, connectionId))
            : empty
        ),
        onStart(async () => {
          if (
            this.preferencesController.getSelectedAccount() != null &&
            this.permissionsController.hasPermission(
              origin,
              PERMISSIONS.APPROVED
            )
          ) {
            lastPublicState = await this.getPublicState(origin, connectionId);
          }
        }),
        filter(publicState => !deepEqual(publicState, lastPublicState)),
        tap(publicState => {
          lastPublicState = publicState;
        }),
        share
      );
    })();

    return {
      signOrder: async (
        data: MessageInputOfType<'order'>['data'],
        options?: MessageInputOfType<'order'>['options']
      ) => {
        const { selectedAccount } = await this.validatePermission(
          origin,
          connectionId
        );

        const message = await this.messageController.newMessage({
          ...commonMessageInput,
          account: selectedAccount,
          broadcast: false,
          data,
          options,
          type: 'order',
        });

        showNotification();

        return this.messageController.getMessageResult(message.id);
      },
      signAndPublishOrder: async (
        data: MessageInputOfType<'order'>['data'],
        options: MessageInputOfType<'order'>['options']
      ) => {
        const { selectedAccount } = await this.validatePermission(
          origin,
          connectionId
        );

        const message = await this.messageController.newMessage({
          ...commonMessageInput,
          account: selectedAccount,
          broadcast: true,
          data,
          options,
          type: 'order',
        });

        showNotification();

        return this.messageController.getMessageResult(message.id);
      },
      signCancelOrder: async (
        data: MessageInputOfType<'cancelOrder'>['data'],
        options?: MessageInputOfType<'cancelOrder'>['options']
      ) => {
        const { selectedAccount } = await this.validatePermission(
          origin,
          connectionId
        );

        const message = await this.messageController.newMessage({
          ...commonMessageInput,
          account: selectedAccount,
          broadcast: false,
          data,
          options,
          type: 'cancelOrder',
        });

        showNotification();

        return this.messageController.getMessageResult(message.id);
      },
      signAndPublishCancelOrder: async (
        data: MessageInputOfType<'cancelOrder'>['data'],
        options: MessageInputOfType<'cancelOrder'>['options']
      ) => {
        const { selectedAccount } = await this.validatePermission(
          origin,
          connectionId
        );

        const message = await this.messageController.newMessage({
          ...commonMessageInput,
          account: selectedAccount,
          broadcast: true,
          data,
          options,
          type: 'cancelOrder',
        });

        showNotification();

        return this.messageController.getMessageResult(message.id);
      },
      signTransaction: async (
        data: MessageInputOfType<'transaction'>['data'],
        options?: MessageInputOfType<'transaction'>['options']
      ) => {
        const { selectedAccount } = await this.validatePermission(
          origin,
          connectionId
        );

        const message = await this.messageController.newMessage({
          ...commonMessageInput,
          account: selectedAccount,
          broadcast: false,
          data,
          options,
          type: 'transaction',
        });

        if (canAutoSign(message)) {
          this.messageController.approve(message.id);
        } else {
          showNotification();
        }

        return this.messageController.getMessageResult(message.id);
      },
      signTransactionPackage: async (
        data: MessageInputOfType<'transactionPackage'>['data'],
        title: string | undefined,
        options?: MessageInputOfType<'transactionPackage'>['options']
      ) => {
        const { selectedAccount } = await this.validatePermission(
          origin,
          connectionId
        );

        const message = await this.messageController.newMessage({
          ...commonMessageInput,
          account: selectedAccount,
          data,
          options,
          title,
          type: 'transactionPackage',
        });

        if (canAutoSign(message)) {
          this.messageController.approve(message.id);
        } else {
          showNotification();
        }

        return this.messageController.getMessageResult(message.id);
      },
      signAndPublishTransaction: async (
        data: MessageInputOfType<'transaction'>['data'],
        options?: MessageInputOfType<'transaction'>['options']
      ) => {
        const { selectedAccount } = await this.validatePermission(
          origin,
          connectionId
        );

        const message = await this.messageController.newMessage({
          ...commonMessageInput,
          account: selectedAccount,
          broadcast: true,
          data,
          options,
          type: 'transaction',
        });

        if (canAutoSign(message)) {
          this.messageController.approve(message.id);
        } else {
          showNotification();
        }

        return this.messageController.getMessageResult(message.id);
      },
      auth: async (
        data: MessageInputOfType<'auth'>['data'],
        options?: MessageInputOfType<'auth'>['options']
      ) => {
        const { selectedAccount } = await this.validatePermission(
          origin,
          connectionId
        );

        const message = await this.messageController.newMessage({
          ...commonMessageInput,
          account: selectedAccount,
          data,
          options,
          type: 'auth',
        });

        showNotification();

        return this.messageController.getMessageResult(message.id);
      },
      wavesAuth: async (
        {
          publicKey,
          timestamp = Date.now(),
        }: { publicKey?: string; timestamp?: number } = {},
        options?: MessageInputOfType<'wavesAuth'>['options']
      ) => {
        const { selectedAccount } = await this.validatePermission(
          origin,
          connectionId
        );

        const message = await this.messageController.newMessage({
          ...commonMessageInput,
          account: selectedAccount,
          data: { publicKey, timestamp },
          options,
          type: 'wavesAuth',
        });

        showNotification();

        return this.messageController.getMessageResult(message.id);
      },
      signRequest: async (
        data: MessageInputOfType<'request'>['data'],
        options?: MessageInputOfType<'request'>['options']
      ) => {
        const { selectedAccount } = await this.validatePermission(
          origin,
          connectionId
        );

        const message = await this.messageController.newMessage({
          ...commonMessageInput,
          account: selectedAccount,
          data,
          options,
          type: 'request',
        });

        showNotification();

        return this.messageController.getMessageResult(message.id);
      },
      signCustomData: async (
        data: MessageInputOfType<'customData'>['data'],
        options?: MessageInputOfType<'customData'>['options']
      ) => {
        const { selectedAccount } = await this.validatePermission(
          origin,
          connectionId
        );

        const message = await this.messageController.newMessage({
          ...commonMessageInput,
          account: selectedAccount,
          data,
          options,
          type: 'customData',
        });

        showNotification();

        return this.messageController.getMessageResult(message.id);
      },
      verifyCustomData: (data: MessageCustomDataSigned) =>
        verifySignature(
          base58Decode(data.publicKey),
          makeCustomDataBytes(data),
          base58Decode(data.signature)
        ),
      notification: async (data?: { message?: string; title?: string }) => {
        const { selectedAccount } = await this.validatePermission(
          origin,
          connectionId
        );

        const notificationId = this.notificationsController.newNotification({
          address: selectedAccount.address,
          message: data?.message,
          origin,
          timestamp: Date.now(),
          title: data?.title,
          type: 'simple',
        });

        this.emit('Show notification');

        return notificationId;
      },

      publicState: () => this.getPublicState(origin, connectionId),

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
        const { selectedAccount } = await this.validatePermission(
          origin,
          connectionId
        );

        if (!prefix || typeof prefix !== 'string') {
          throw ERRORS.INVALID_FORMAT(undefined, 'prefix is invalid');
        }

        if (!publicKey || typeof publicKey !== 'string') {
          throw ERRORS.INVALID_FORMAT(undefined, 'publicKey is invalid');
        }

        const wallet = this.walletController.getWallet(
          selectedAccount.address,
          selectedAccount.network
        );

        const sharedKey = await wallet.createSharedKey(publicKey, prefix);

        return base58Encode(sharedKey);
      },

      encryptMessage: async (
        message: string,
        publicKey: string,
        prefix: string
      ) => {
        const { selectedAccount } = await this.validatePermission(
          origin,
          connectionId
        );

        if (!message || typeof message !== 'string') {
          throw ERRORS.INVALID_FORMAT(undefined, 'message is invalid');
        }

        if (!publicKey || typeof publicKey !== 'string') {
          throw ERRORS.INVALID_FORMAT(undefined, 'publicKey is invalid');
        }

        const wallet = this.walletController.getWallet(
          selectedAccount.address,
          selectedAccount.network
        );

        return wallet.encryptMessage(message, publicKey, prefix);
      },

      decryptMessage: async (
        message: string,
        publicKey: string,
        prefix: string
      ) => {
        const { selectedAccount } = await this.validatePermission(
          origin,
          connectionId
        );

        if (!message || typeof message !== 'string') {
          throw ERRORS.INVALID_FORMAT(undefined, 'message is invalid');
        }

        if (!publicKey || typeof publicKey !== 'string') {
          throw ERRORS.INVALID_FORMAT(undefined, 'publicKey is invalid');
        }

        const wallet = this.walletController.getWallet(
          selectedAccount.address,
          selectedAccount.network
        );

        return wallet.decryptMessage(message, publicKey, prefix);
      },
      subscribeToPublicState: async () => {
        pipe(
          publicStateUpdates,
          subscribe(publicState => {
            port.postMessage({ event: 'updatePublicState', publicState });
          })
        );
      },
    };
  }

  setupUiConnection(sourcePort: Browser.Runtime.Port) {
    let port: Browser.Runtime.Port | null = sourcePort;
    const api = this.getApi();

    pipe(
      fromWebExtensionPort(port),
      handleMethodCallRequests(api, result => port?.postMessage(result)),
      onEnd(() => {
        port = null;
        this.off('ledger:signRequest', ui.ledgerSignRequest);
        this.off('closePopupWindow', ui.closePopupWindow);
      }),
      publish
    );

    const ui = createIpcCallProxy<keyof UiApi, UiApi>(
      request => port?.postMessage(request),
      fromWebExtensionPort(port)
    );

    this.on('ledger:signRequest', ui.ledgerSignRequest);
    this.on('closePopupWindow', ui.closePopupWindow);

    this.statisticsController.track({ eventType: 'openKeeper' });
  }

  async getPublicState(origin: string, connectionId: string) {
    const { selectedAccount } = await this.validatePermission(
      origin,
      connectionId
    );

    const state = this.extensionStorage.getState();

    return {
      account: {
        ...selectedAccount,
        balance: collectBalances(state)[selectedAccount.address] || 0,
      },
      initialized: state.initialized,
      locked: state.locked,
      messages: state.messages
        .filter(
          message =>
            message.account.address === selectedAccount.address &&
            message.origin === origin
        )
        .map(message => ({
          id: message.id,
          status: message.status,
          uid: message.ext_uuid,
        })),
      network: {
        code: this.networkController.getNetworkCode(),
        matcher: this.networkController.getMatcher(),
        server: this.networkController.getNode(),
      },
      txVersion: getTxVersions(selectedAccount ? selectedAccount.type : 'seed'),
      version: Browser.runtime.getManifest().version,
    };
  }

  setupPageConnection(sourcePort: Browser.Runtime.Port) {
    let port: Browser.Runtime.Port | null = sourcePort;
    const { sender } = port;

    if (!sender || !sender.url) {
      return;
    }

    const origin = new URL(sender.url).hostname;
    const connectionId = nanoid();
    const inpageApi = this.getInpageApi(origin, connectionId, port);

    pipe(
      fromWebExtensionPort(port),
      handleMethodCallRequests(inpageApi, result => port?.postMessage(result)),
      onEnd(() => {
        port = null;
        this.messageController.removeMessagesFromConnection(connectionId);

        const selectedAccount = this.preferencesController.getSelectedAccount();

        const notificationsCount = selectedAccount
          ? this.notificationsController.getNotifications(selectedAccount)
              .length
          : 0;

        const unapprovedMessagesCount =
          this.messageController.getUnapproved().length;

        if (unapprovedMessagesCount === 0 && notificationsCount === 0) {
          this.emit('Close notification');
        }
      }),
      publish
    );
  }

  ledgerSign(type: string, data: unknown) {
    return new Promise<string>((resolve, reject) => {
      const requestId = nanoid();

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

export interface UiApi {
  closePopupWindow: () => Promise<void>;
  ledgerSignRequest: (request: LedgerSignRequest) => Promise<void>;
}

export type __BackgroundUiApiDirect = ReturnType<BackgroundService['getApi']>;

export type __BackgroundPageApiDirect = ReturnType<
  BackgroundService['getInpageApi']
>;

export type PublicState = Awaited<
  ReturnType<__BackgroundPageApiDirect['publicState']>
>;
