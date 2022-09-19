import * as React from 'react';
import {
  AccountInfo,
  AddressBook,
  Assets,
  BackUpSeed,
  ChangeAccountName,
  ChangePassword,
  ConfirmBackup,
  DeleteAllAccounts,
  ExportAndImport,
  ImportPopup,
  ImportTab,
  Info,
  LangsSettings,
  Login,
  MessageList,
  Messages,
  NetworksSettings,
  NewAccount,
  NewWallet,
  NewWalletName,
  Notifications,
  PermissionsSettings,
  SelectedAccountQr,
  SelectTxAccount,
  Settings,
  SettingsGeneral,
  Welcome,
} from './components/pages';
import { ImportLedger } from './components/pages/importLedger/importLedger';
import { ImportSeed } from './components/pages/importSeed';
import { Swap } from './components/pages/swap/swap';
import { ExportAccounts } from './components/pages/exportAccounts/exportAccounts';
import { ExportAddressBook } from './components/pages/exportAccounts/exportAddressBook';
import { ImportKeystore } from './components/pages/importKeystore/importKeystore';
import { ImportAddressBook } from './components/pages/importKeystore/importAddressBook';
import { ImportEmail } from './components/pages/importEmail/importEmail';
import { OtherAccountsPage } from './components/pages/otherAccounts';
import { Send } from './components/pages/send';
import {
  ImportSuccess,
  ImportSuccessAddressBook,
  ImportSuccessKeystore,
} from 'ui/components/pages/importSuccess';
import { ImportDebug } from 'ui/components/pages/importDebug';
import { NftCollection } from 'ui/components/pages/nfts/nftCollection';
import { NftInfo } from 'ui/components/pages/nfts/nftInfo';
import { DeleteActiveAccount } from './components/pages/deleteActiveAccount';

export const PAGES = {
  WELCOME: 'welcome',
  LOGIN: 'login',
  NEW: 'new',
  IMPORT_POPUP: 'import_popup',
  IMPORT_TAB: 'import_tab',
  NEW_ACCOUNT: 'new_account',
  ACCOUNT_NAME: 'account_name',
  ADDRESS_BOOK: 'address_book',
  SAVE_BACKUP: 'safe_backup',
  CONFIRM_BACKUP: 'confirm_backup',
  IMPORT_ADDRESS_BOOK: 'import_address_book',
  IMPORT_DEBUG: 'import_debug',
  IMPORT_EMAIL: 'import_email',
  IMPORT_KEYSTORE: 'import_keystore',
  IMPORT_LEDGER: 'import_ledger',
  IMPORT_SEED: 'import_seed',
  IMPORT_SEED_BACK: 'import_seed_back',
  IMPORT_SUCCESS: 'import_success',
  IMPORT_SUCCESS_KEYSTORE: 'import_success_keystore',
  IMPORT_SUCCESS_ADDRESS_BOOK: 'import_success_address_book',
  EXPORT_ACCOUNTS: 'export_accounts',
  EXPORT_ADDRESS_BOOK: 'export_address_book',
  EXPORT_AND_IMPORT: 'export_and_import',
  ASSETS: 'assets',
  OTHER_ACCOUNTS: 'other_accounts',
  SETTINGS: 'settings',
  INFO: 'info',
  ACCOUNT_INFO: 'account_info',
  DELETE_ACTIVE_ACCOUNT: 'delete_active_account',
  CHANGE_ACCOUNT_NAME: 'change_account_name',
  QR_CODE_SELECTED: 'qr_code_selected_account',
  NETWORK_SETTINGS: 'networks_select',
  GENERAL_SETTINGS: 'general_settings',
  LANGS_SETTINGS: 'langs_settings',
  CHANGE_PASSWORD: 'change_password_settings',
  DELETE_ACCOUNT: 'delete_account',
  PERMISSIONS: 'origin_permisiions',
  NOTIFICATIONS: 'notifications',
  MESSAGES: 'messages',
  MESSAGES_LIST: 'messages_list',
  FORGOT: 'forgot_password',
  CHANGE_TX_ACCOUNT: 'change_tx_account',
  SEND: 'send',
  SWAP: 'swap',
  NFT_COLLECTION: 'nft_collection',
  NFT_INFO: 'nft_details',
};

interface PageMenuConfig {
  hasLogo?: true;
  hasSettings?: true;
  back?: true;
  close?: true;
}

interface PageBottomConfig {
  hide?: true;
  noChangeNetwork?: true;
}

type PageConfig =
  | {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component: React.ComponentType<any>;
      bottom?: PageBottomConfig;
      menu?: PageMenuConfig;
    }
  | {
      element: React.ReactElement;
    };

export const PAGES_CONF: Record<string, PageConfig> = {
  [PAGES.WELCOME]: {
    element: <Welcome />,
  },
  [PAGES.LOGIN]: {
    component: Login,
    bottom: {
      hide: true,
    },
  },
  [PAGES.NEW]: {
    component: NewAccount,
    menu: {
      hasLogo: true,
    },
  },
  [PAGES.IMPORT_POPUP]: {
    component: ImportPopup,
    menu: {
      hasLogo: true,
      hasSettings: true,
    },
  },
  [PAGES.IMPORT_TAB]: {
    component: ImportTab,
    menu: {
      hasLogo: true,
    },
  },
  [PAGES.NEW_ACCOUNT]: {
    component: NewWallet,
    bottom: {
      noChangeNetwork: true,
    },
    menu: {
      hasLogo: true,
      back: true,
    },
  },
  [PAGES.ACCOUNT_NAME]: {
    component: NewWalletName,
    bottom: {
      noChangeNetwork: true,
    },
    menu: {
      hasLogo: true,
      back: true,
    },
  },
  [PAGES.IMPORT_SUCCESS]: {
    component: ImportSuccess,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
    },
  },
  [PAGES.IMPORT_SUCCESS_KEYSTORE]: {
    component: ImportSuccessKeystore,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
    },
  },
  [PAGES.IMPORT_SUCCESS_ADDRESS_BOOK]: {
    component: ImportSuccessAddressBook,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
    },
  },

  [PAGES.CHANGE_ACCOUNT_NAME]: {
    component: ChangeAccountName,
    bottom: {
      noChangeNetwork: true,
    },
    menu: {
      hasLogo: true,
      back: true,
    },
  },
  [PAGES.SAVE_BACKUP]: {
    component: BackUpSeed,
    bottom: {
      noChangeNetwork: true,
    },
    menu: {
      hasLogo: true,
      back: true,
    },
  },
  [PAGES.CONFIRM_BACKUP]: {
    component: ConfirmBackup,
    bottom: {
      noChangeNetwork: true,
    },
    menu: {
      hasLogo: true,
      back: true,
    },
  },
  [PAGES.IMPORT_ADDRESS_BOOK]: {
    component: ImportAddressBook,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
      back: true,
    },
  },
  [PAGES.IMPORT_DEBUG]: {
    component: ImportDebug,
    bottom: {
      noChangeNetwork: true,
    },
    menu: {
      hasLogo: true,
      back: true,
    },
  },
  [PAGES.IMPORT_EMAIL]: {
    component: ImportEmail,
    bottom: {
      noChangeNetwork: true,
    },
    menu: {
      hasLogo: true,
      back: true,
    },
  },
  [PAGES.IMPORT_KEYSTORE]: {
    component: ImportKeystore,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
      back: true,
    },
  },
  [PAGES.IMPORT_LEDGER]: {
    component: ImportLedger,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
      back: true,
    },
  },
  [PAGES.IMPORT_SEED]: {
    component: ImportSeed,
    bottom: {
      noChangeNetwork: true,
    },
    menu: {
      hasLogo: true,
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
      back: true,
    },
  },
  [PAGES.EXPORT_ADDRESS_BOOK]: {
    component: ExportAddressBook,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
      back: true,
    },
  },
  [PAGES.EXPORT_AND_IMPORT]: {
    component: ExportAndImport,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
      back: true,
    },
  },
  [PAGES.ASSETS]: {
    component: Assets,
    menu: {
      hasLogo: true,
      hasSettings: true,
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
      close: true,
    },
  },
  [PAGES.INFO]: {
    component: Info,
    bottom: {
      hide: true,
    },
    menu: {
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
      back: true,
    },
  },
  [PAGES.DELETE_ACTIVE_ACCOUNT]: {
    component: DeleteActiveAccount,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
      back: true,
    },
  },
  [PAGES.QR_CODE_SELECTED]: {
    component: SelectedAccountQr,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
      back: true,
    },
  },
  [PAGES.GENERAL_SETTINGS]: {
    component: SettingsGeneral,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
      back: true,
    },
  },
  [PAGES.ADDRESS_BOOK]: {
    component: AddressBook,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
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
      back: true,
    },
  },
  [PAGES.CHANGE_PASSWORD]: {
    component: ChangePassword,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
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
      back: true,
    },
  },
  [PAGES.FORGOT]: {
    component: DeleteAllAccounts,
    bottom: {
      hide: true,
    },
  },
  [PAGES.NOTIFICATIONS]: {
    component: Notifications,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
    },
  },
  [PAGES.MESSAGES]: {
    component: Messages,
    bottom: {
      hide: true,
    },
    menu: {
      hasLogo: true,
    },
  },
  [PAGES.MESSAGES_LIST]: {
    component: MessageList,
    bottom: {
      hide: true,
    },
  },
  [PAGES.CHANGE_TX_ACCOUNT]: {
    component: SelectTxAccount,
    bottom: {
      hide: true,
    },
    menu: {
      hasSettings: true,
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
  [PAGES.NFT_COLLECTION]: {
    component: NftCollection,
    bottom: {
      hide: true,
    },
    menu: {
      back: true,
      hasLogo: true,
    },
  },
  [PAGES.NFT_INFO]: {
    component: NftInfo,
    bottom: {
      hide: true,
    },
    menu: {
      back: true,
      hasLogo: true,
    },
  },
};
