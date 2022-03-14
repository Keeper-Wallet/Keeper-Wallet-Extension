import {
  AccountInfo,
  Assets,
  BackUpSeed,
  ChangeAccountName,
  ChangePassword,
  Conditions,
  ConfirmBackup,
  DeleteActiveAccount,
  DeleteAllAccounts,
  Import,
  Info,
  Intro,
  LangsSettings,
  Login,
  MessageList,
  Messages,
  NetworksSettings,
  NewAccount,
  NewWallet,
  NewWalletName,
  Notifications,
  PairingAccountQr,
  PermissionsSettings,
  QRCodeSelectedAccount,
  SelectTxAccount,
  Settings,
  SettingsGeneral,
  Welcome,
} from './components/pages';
import { ImportSeed } from './components/pages/importSeed';
import { Swap } from './components/pages/swap/swap';
import { ExportAccounts } from './components/pages/exportAccounts/exportAccounts';
import { ImportKeystore } from './components/pages/importKeystore/importKeystore';
import { OtherAccountsPage } from './components/pages/otherAccounts';
import { Send } from './components/pages/send';

export const PAGES = {
  WELCOME: 'welcome',
  CONDITIONS: 'conditions',
  LOGIN: 'login',
  NEW: 'new',
  IMPORT: 'import',
  IMPORT_FROM_ASSETS: 'import_and_back_to_assets',
  NEW_ACCOUNT: 'new_account',
  NEW_ACCOUNT_BACK: 'new_account_back',
  ACCOUNT_NAME: 'account_name',
  ACCOUNT_NAME_SEED: 'account_name_seed',
  SAVE_BACKUP: 'safe_backup',
  CONFIRM_BACKUP: 'confirm_backup',
  IMPORT_KEYSTORE: 'import_keystore',
  IMPORT_SEED: 'import_seed',
  IMPORT_SEED_BACK: 'import_seed_back',
  EXPORT_ACCOUNTS: 'export_accounts',
  ASSETS: 'assets',
  OTHER_ACCOUNTS: 'other_accounts',
  SETTINGS: 'settings',
  INFO: 'info',
  ACCOUNT_INFO: 'account_info',
  DELETE_ACTIVE_ACCOUNT: 'delete_active_account',
  CHANGE_ACCOUNT_NAME: 'change_account_name',
  QR_CODE_SELECTED: 'qr_code_selected_account',
  INTRO: 'intro',
  NETWORK_SETTINGS: 'networks_select',
  GENERAL_SETTINGS: 'general_settings',
  LANGS_SETTINGS: 'langs_settings',
  LANGS_SETTINGS_INTRO: 'langs_settings_intro',
  CHANGE_PASSWORD: 'change_password_settings',
  DELETE_ACCOUNT: 'delete_account',
  PAIRING: 'pairing',
  PERMISSIONS: 'origin_permisiions',
  NOTIFICATIONS: 'notifications',
  MESSAGES: 'messages',
  MESSAGES_LIST: 'messages_list',
  FORGOT: 'forgot_password',
  CHANGE_TX_ACCOUNT: 'change_tx_account',
  SEND: 'send',
  SWAP: 'swap',
  ROOT: '',
};

export const PAGES_CONF = {
  [PAGES.WELCOME]: {
    component: Welcome,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: false,
      hasSettings: false,
      back: null,
    },
  },
  [PAGES.CONDITIONS]: {
    component: Conditions,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
      hasSettings: false,
      back: null,
    },
  },
  [PAGES.LOGIN]: {
    component: Login,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: false,
      hasSettings: false,
      back: null,
    },
  },
  [PAGES.NEW]: {
    component: NewAccount,
    menu: {
      hasLogo: true,
      hasSettings: false,
      back: null,
    },
  },
  [PAGES.IMPORT]: {
    component: Import,
    menu: {
      hasLogo: true,
      hasSettings: true,
      back: null,
    },
  },
  [PAGES.IMPORT_FROM_ASSETS]: {
    component: Import,
    menu: {
      hasLogo: true,
      hasSettings: false,
      back: true,
    },
  },
  [PAGES.NEW_ACCOUNT]: {
    component: NewWallet,
    props: {
      isGenerateNew: true,
    },
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
      hasSettings: false,
      back: true,
    },
  },
  [PAGES.NEW_ACCOUNT_BACK]: {
    component: NewWallet,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
      hasSettings: false,
      back: true,
    },
  },
  [PAGES.ACCOUNT_NAME]: {
    component: NewWalletName,
    props: {
      next: PAGES.SAVE_BACKUP,
    },
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
      hasSettings: false,
      back: PAGES.NEW_ACCOUNT_BACK,
    },
  },
  [PAGES.ACCOUNT_NAME_SEED]: {
    component: NewWalletName,
    props: {
      isCreate: true,
      next: PAGES.SAVE_BACKUP,
    },
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
      hasSettings: false,
      back: PAGES.IMPORT_SEED_BACK,
    },
  },
  [PAGES.CHANGE_ACCOUNT_NAME]: {
    component: ChangeAccountName,
    props: {},
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
      hasSettings: false,
      back: true,
    },
  },
  [PAGES.SAVE_BACKUP]: {
    component: BackUpSeed,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
      hasSettings: false,
      back: PAGES.ACCOUNT_NAME,
    },
  },
  [PAGES.CONFIRM_BACKUP]: {
    component: ConfirmBackup,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
      hasSettings: false,
      back: PAGES.SAVE_BACKUP,
    },
  },
  [PAGES.IMPORT_KEYSTORE]: {
    component: ImportKeystore,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
      hasSettings: false,
      back: true,
    },
  },
  [PAGES.IMPORT_SEED]: {
    component: ImportSeed,
    props: {
      isNew: true,
    },
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
      hasSettings: false,
      back: true,
    },
  },
  [PAGES.IMPORT_SEED_BACK]: {
    component: ImportSeed,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
      hasSettings: false,
      back: true,
    },
  },
  [PAGES.EXPORT_ACCOUNTS]: {
    component: ExportAccounts,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
      hasSettings: false,
      back: true,
    },
  },
  [PAGES.ASSETS]: {
    component: Assets,
    menu: {
      hasLogo: true,
      hasSettings: true,
      back: null,
    },
  },
  [PAGES.OTHER_ACCOUNTS]: {
    component: OtherAccountsPage,
    bottom: {
      hide: true,
    },
    menu: {
      back: true,
      hasLogo: true,
    },
  },
  [PAGES.SETTINGS]: {
    component: Settings,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
      hasSettings: false,
      back: false,
      close: true,
    },
  },
  [PAGES.INFO]: {
    component: Info,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: false,
      hasSettings: false,
      back: true,
    },
  },
  [PAGES.ACCOUNT_INFO]: {
    component: AccountInfo,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
      hasSettings: false,
      back: true,
      deleteAccount: false,
    },
  },
  [PAGES.DELETE_ACTIVE_ACCOUNT]: {
    component: DeleteActiveAccount,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
      hasSettings: false,
      back: true,
    },
  },
  [PAGES.PAIRING]: {
    component: PairingAccountQr,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
      hasSettings: false,
      back: true,
    },
  },
  [PAGES.QR_CODE_SELECTED]: {
    component: QRCodeSelectedAccount,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
      hasSettings: false,
      back: true,
    },
  },
  [PAGES.INTRO]: {
    component: Intro,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: false,
      hasSettings: false,
      back: null,
    },
  },
  [PAGES.GENERAL_SETTINGS]: {
    component: SettingsGeneral,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
      hasSettings: false,
      back: true,
    },
  },
  [PAGES.NETWORK_SETTINGS]: {
    component: NetworksSettings,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
      hasSettings: false,
      back: true,
    },
  },
  [PAGES.PERMISSIONS]: {
    component: PermissionsSettings,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
      hasSettings: false,
      back: true,
    },
  },
  [PAGES.LANGS_SETTINGS]: {
    component: LangsSettings,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
      hasSettings: false,
      back: true,
    },
  },
  [PAGES.LANGS_SETTINGS_INTRO]: {
    component: LangsSettings,
    props: {
      confirm: true,
      hideTitle: true,
    },
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
      hasSettings: false,
      back: false,
    },
  },
  [PAGES.CHANGE_PASSWORD]: {
    component: ChangePassword,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
      hasSettings: false,
      back: true,
    },
  },
  [PAGES.DELETE_ACCOUNT]: {
    component: DeleteAllAccounts,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
      hasSettings: false,
      back: true,
    },
  },
  [PAGES.FORGOT]: {
    component: DeleteAllAccounts,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: false,
      hasSettings: false,
      back: false,
    },
  },
  [PAGES.NOTIFICATIONS]: {
    component: Notifications,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
      hasSettings: false,
      back: false,
    },
  },
  [PAGES.MESSAGES]: {
    component: Messages,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
      hasSettings: false,
      back: false,
    },
  },
  [PAGES.MESSAGES_LIST]: {
    component: MessageList,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: false,
      hasSettings: false,
      back: false,
    },
  },
  [PAGES.CHANGE_TX_ACCOUNT]: {
    component: SelectTxAccount,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: false,
      hasSettings: true,
      back: false,
    },
  },
  [PAGES.SEND]: {
    component: Send,
    bottom: {
      hide: true,
    },
    menu: {
      back: true,
      hasLogo: true,
    },
  },
  [PAGES.SWAP]: {
    component: Swap,
    bottom: {
      hide: true,
    },
    menu: {
      back: true,
      hasLogo: true,
    },
  },
};
