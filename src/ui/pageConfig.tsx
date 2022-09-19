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
} from 'ui/components/pages/importSuccess';
import { ImportDebug } from 'ui/components/pages/importDebug';
import { NftCollection } from 'ui/components/pages/nfts/nftCollection';
import { NftInfo } from 'ui/components/pages/nfts/nftInfo';
import { DeleteActiveAccount } from './components/pages/deleteActiveAccount';
import { PAGES } from './pages';
import { Menu } from './components/menu/Menu';
import { Bottom } from './components/bottom';

type PageConfig = {
  element: React.ReactElement;
};

export const PAGES_CONF: Record<string, PageConfig> = {
  [PAGES.WELCOME]: {
    element: <Welcome />,
  },
  [PAGES.LOGIN]: {
    element: <Login />,
  },
  [PAGES.NEW]: {
    element: (
      <>
        <Menu hasLogo />
        <NewAccount />
      </>
    ),
  },
  [PAGES.IMPORT_POPUP]: {
    element: (
      <>
        <Menu hasLogo hasSettings />
        <ImportPopup />
        <Bottom />
      </>
    ),
  },
  [PAGES.IMPORT_TAB]: {
    element: (
      <>
        <Menu hasLogo />
        <ImportTab />
        <Bottom />
      </>
    ),
  },
  [PAGES.NEW_ACCOUNT]: {
    element: (
      <>
        <Menu hasBack hasLogo />
        <NewWallet />
        <Bottom noChangeNetwork />
      </>
    ),
  },
  [PAGES.ACCOUNT_NAME]: {
    element: (
      <>
        <Menu hasBack hasLogo />
        <NewWalletName />
        <Bottom noChangeNetwork />
      </>
    ),
  },
  [PAGES.IMPORT_SUCCESS]: {
    element: (
      <>
        <Menu hasLogo />
        <ImportSuccess />
      </>
    ),
  },
  [PAGES.IMPORT_SUCCESS_KEYSTORE]: {
    element: (
      <>
        <Menu hasLogo />
        <ImportSuccess isKeystoreImport />
      </>
    ),
  },
  [PAGES.IMPORT_SUCCESS_ADDRESS_BOOK]: {
    element: (
      <>
        <Menu hasLogo />
        <ImportSuccessAddressBook />
      </>
    ),
  },

  [PAGES.CHANGE_ACCOUNT_NAME]: {
    element: (
      <>
        <Menu hasBack hasLogo />
        <ChangeAccountName />
        <Bottom noChangeNetwork />
      </>
    ),
  },
  [PAGES.SAVE_BACKUP]: {
    element: (
      <>
        <Menu hasBack hasLogo />
        <BackUpSeed />
        <Bottom noChangeNetwork />
      </>
    ),
  },
  [PAGES.CONFIRM_BACKUP]: {
    element: (
      <>
        <Menu hasBack hasLogo />
        <ConfirmBackup />
        <Bottom noChangeNetwork />
      </>
    ),
  },
  [PAGES.IMPORT_ADDRESS_BOOK]: {
    element: (
      <>
        <Menu hasLogo />
        <ImportAddressBook />
      </>
    ),
  },
  [PAGES.IMPORT_DEBUG]: {
    element: (
      <>
        <Menu hasBack hasLogo />
        <ImportDebug />
        <Bottom noChangeNetwork />
      </>
    ),
  },
  [PAGES.IMPORT_EMAIL]: {
    element: (
      <>
        <Menu hasBack hasLogo />
        <ImportEmail />
        <Bottom noChangeNetwork />
      </>
    ),
  },
  [PAGES.IMPORT_KEYSTORE]: {
    element: (
      <>
        <Menu hasBack hasLogo />
        <ImportKeystore />
      </>
    ),
  },
  [PAGES.IMPORT_LEDGER]: {
    element: (
      <>
        <Menu hasBack hasLogo />
        <ImportLedger />
      </>
    ),
  },
  [PAGES.IMPORT_SEED]: {
    element: (
      <>
        <Menu hasBack hasLogo />
        <ImportSeed />
        <Bottom noChangeNetwork />
      </>
    ),
  },
  [PAGES.EXPORT_ACCOUNTS]: {
    element: (
      <>
        <Menu hasBack hasLogo />
        <ExportAccounts />
      </>
    ),
  },
  [PAGES.EXPORT_ADDRESS_BOOK]: {
    element: (
      <>
        <Menu hasBack hasLogo />
        <ExportAddressBook />
      </>
    ),
  },
  [PAGES.EXPORT_AND_IMPORT]: {
    element: (
      <>
        <Menu hasBack hasLogo />
        <ExportAndImport />
      </>
    ),
  },
  [PAGES.ASSETS]: {
    element: (
      <>
        <Menu hasLogo hasSettings />
        <Assets />
        <Bottom />
      </>
    ),
  },
  [PAGES.OTHER_ACCOUNTS]: {
    element: (
      <>
        <Menu hasBack hasLogo />
        <OtherAccountsPage />
      </>
    ),
  },
  [PAGES.SETTINGS]: {
    element: (
      <>
        <Menu hasClose hasLogo />
        <Settings />
      </>
    ),
  },
  [PAGES.INFO]: {
    element: (
      <>
        <Menu hasBack />
        <Info />
      </>
    ),
  },
  [PAGES.ACCOUNT_INFO]: {
    element: (
      <>
        <Menu hasBack hasLogo />
        <AccountInfo />
      </>
    ),
  },
  [PAGES.DELETE_ACTIVE_ACCOUNT]: {
    element: (
      <>
        <Menu hasBack hasLogo />
        <DeleteActiveAccount />
      </>
    ),
  },
  [PAGES.QR_CODE_SELECTED]: {
    element: (
      <>
        <Menu hasBack hasLogo />
        <SelectedAccountQr />
      </>
    ),
  },
  [PAGES.GENERAL_SETTINGS]: {
    element: (
      <>
        <Menu hasBack hasLogo />
        <SettingsGeneral />
      </>
    ),
  },
  [PAGES.ADDRESS_BOOK]: {
    element: (
      <>
        <Menu hasBack hasLogo />
        <AddressBook />
      </>
    ),
  },
  [PAGES.NETWORK_SETTINGS]: {
    element: (
      <>
        <Menu hasBack hasLogo />
        <NetworksSettings />
      </>
    ),
  },
  [PAGES.PERMISSIONS]: {
    element: (
      <>
        <Menu hasBack hasLogo />
        <PermissionsSettings />
      </>
    ),
  },
  [PAGES.LANGS_SETTINGS]: {
    element: (
      <>
        <Menu hasBack hasLogo />
        <LangsSettings />
      </>
    ),
  },
  [PAGES.CHANGE_PASSWORD]: {
    element: (
      <>
        <Menu hasBack hasLogo />
        <ChangePassword />
      </>
    ),
  },
  [PAGES.DELETE_ACCOUNT]: {
    element: (
      <>
        <Menu hasBack hasLogo />
        <DeleteAllAccounts />
      </>
    ),
  },
  [PAGES.FORGOT]: {
    element: <DeleteAllAccounts />,
  },
  [PAGES.NOTIFICATIONS]: {
    element: (
      <>
        <Menu hasLogo />
        <Notifications />
      </>
    ),
  },
  [PAGES.MESSAGES]: {
    element: (
      <>
        <Menu hasLogo />
        <Messages />
      </>
    ),
  },
  [PAGES.MESSAGES_LIST]: {
    element: <MessageList />,
  },
  [PAGES.CHANGE_TX_ACCOUNT]: {
    element: <SelectTxAccount />,
  },
  [PAGES.SEND]: {
    element: (
      <>
        <Menu hasBack hasLogo />
        <Send />
      </>
    ),
  },
  [PAGES.SWAP]: {
    element: (
      <>
        <Menu hasBack hasLogo />
        <Swap />
      </>
    ),
  },
  [PAGES.NFT_COLLECTION]: {
    element: (
      <>
        <Menu hasBack hasLogo />
        <NftCollection />
      </>
    ),
  },
  [PAGES.NFT_INFO]: {
    element: (
      <>
        <Menu hasBack hasLogo />
        <NftInfo />
      </>
    ),
  },
};
