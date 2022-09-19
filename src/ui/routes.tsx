import * as React from 'react';
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
import { Welcome } from './components/pages/Welcome';
import { Login } from './components/pages/Login';
import { NewAccount } from './components/pages/NewAccount';
import { ImportPopup, ImportTab } from './components/pages/Import';
import { NewWallet } from './components/pages/NewWallet';
import { NewWalletName } from './components/pages/NewWalletName';
import { ChangeAccountName } from './components/pages/ChangeName';
import { BackUpSeed } from './components/pages/BackupSeed';
import { ConfirmBackup } from './components/pages/ConfirmBackup';
import { ExportAndImport } from './components/pages/ExportAndImport';
import { Assets } from './components/pages/Assets';
import { Settings } from './components/pages/Settings';
import { Info } from './components/pages/Info';
import { AccountInfo } from './components/pages/AccountInfo';
import { SelectedAccountQr } from './components/pages/SelectedAccountQr';
import { SettingsGeneral } from './components/pages/SettingsGeneral';
import { AddressBook } from './components/pages/AddressBook';
import { NetworksSettings } from './components/pages/NetworksSettings';
import { PermissionsSettings } from './components/pages/PermissionsSettings/PermissionSettings';
import { LangsSettings } from './components/pages/LangsSettings';
import { ChangePassword } from './components/pages/ChangePassword';
import { DeleteAllAccounts } from './components/pages/deleteAllAccounts/deleteAllAccounts';
import { Notifications } from './components/pages/Notifications';
import { Messages } from './components/pages/Messages';
import { MessageList } from './components/pages/MessagesList';
import { SelectTxAccount } from './components/pages/SelectTxAccount';

export const routes: Array<{
  path: string;
  element: React.ReactElement;
}> = [
  {
    path: PAGES.WELCOME,
    element: <Welcome />,
  },
  {
    path: PAGES.LOGIN,
    element: <Login />,
  },
  {
    path: PAGES.NEW,
    element: (
      <>
        <Menu hasLogo />
        <NewAccount />
      </>
    ),
  },
  {
    path: PAGES.IMPORT_POPUP,
    element: (
      <>
        <Menu hasLogo hasSettings />
        <ImportPopup />
        <Bottom allowChangingNetwork />
      </>
    ),
  },
  {
    path: PAGES.IMPORT_TAB,
    element: (
      <>
        <Menu hasLogo />
        <ImportTab />
        <Bottom allowChangingNetwork />
      </>
    ),
  },
  {
    path: PAGES.NEW_ACCOUNT,
    element: (
      <>
        <Menu hasBack hasLogo />
        <NewWallet />
        <Bottom />
      </>
    ),
  },
  {
    path: PAGES.ACCOUNT_NAME,
    element: (
      <>
        <Menu hasBack hasLogo />
        <NewWalletName />
        <Bottom />
      </>
    ),
  },
  {
    path: PAGES.IMPORT_SUCCESS,
    element: (
      <>
        <Menu hasLogo />
        <ImportSuccess />
      </>
    ),
  },
  {
    path: PAGES.IMPORT_SUCCESS_KEYSTORE,
    element: (
      <>
        <Menu hasLogo />
        <ImportSuccess isKeystoreImport />
      </>
    ),
  },
  {
    path: PAGES.IMPORT_SUCCESS_ADDRESS_BOOK,
    element: (
      <>
        <Menu hasLogo />
        <ImportSuccessAddressBook />
      </>
    ),
  },
  {
    path: PAGES.CHANGE_ACCOUNT_NAME,
    element: (
      <>
        <Menu hasBack hasLogo />
        <ChangeAccountName />
        <Bottom />
      </>
    ),
  },
  {
    path: PAGES.SAVE_BACKUP,
    element: (
      <>
        <Menu hasBack hasLogo />
        <BackUpSeed />
        <Bottom />
      </>
    ),
  },
  {
    path: PAGES.CONFIRM_BACKUP,
    element: (
      <>
        <Menu hasBack hasLogo />
        <ConfirmBackup />
        <Bottom />
      </>
    ),
  },
  {
    path: PAGES.IMPORT_ADDRESS_BOOK,
    element: (
      <>
        <Menu hasLogo />
        <ImportAddressBook />
      </>
    ),
  },
  {
    path: PAGES.IMPORT_DEBUG,
    element: (
      <>
        <Menu hasBack hasLogo />
        <ImportDebug />
        <Bottom />
      </>
    ),
  },
  {
    path: PAGES.IMPORT_EMAIL,
    element: (
      <>
        <Menu hasBack hasLogo />
        <ImportEmail />
        <Bottom />
      </>
    ),
  },
  {
    path: PAGES.IMPORT_KEYSTORE,
    element: (
      <>
        <Menu hasBack hasLogo />
        <ImportKeystore />
      </>
    ),
  },
  {
    path: PAGES.IMPORT_LEDGER,
    element: (
      <>
        <Menu hasBack hasLogo />
        <ImportLedger />
      </>
    ),
  },
  {
    path: PAGES.IMPORT_SEED,
    element: (
      <>
        <Menu hasBack hasLogo />
        <ImportSeed />
        <Bottom />
      </>
    ),
  },
  {
    path: PAGES.EXPORT_ACCOUNTS,
    element: (
      <>
        <Menu hasBack hasLogo />
        <ExportAccounts />
      </>
    ),
  },
  {
    path: PAGES.EXPORT_ADDRESS_BOOK,
    element: (
      <>
        <Menu hasBack hasLogo />
        <ExportAddressBook />
      </>
    ),
  },
  {
    path: PAGES.EXPORT_AND_IMPORT,
    element: (
      <>
        <Menu hasBack hasLogo />
        <ExportAndImport />
      </>
    ),
  },
  {
    path: PAGES.ASSETS,
    element: (
      <>
        <Menu hasLogo hasSettings />
        <Assets />
        <Bottom allowChangingNetwork />
      </>
    ),
  },
  {
    path: PAGES.OTHER_ACCOUNTS,
    element: (
      <>
        <Menu hasBack hasLogo />
        <OtherAccountsPage />
      </>
    ),
  },
  {
    path: PAGES.SETTINGS,
    element: (
      <>
        <Menu hasClose hasLogo />
        <Settings />
      </>
    ),
  },
  {
    path: PAGES.INFO,
    element: (
      <>
        <Menu hasBack />
        <Info />
      </>
    ),
  },
  {
    path: PAGES.ACCOUNT_INFO,
    element: (
      <>
        <Menu hasBack hasLogo />
        <AccountInfo />
      </>
    ),
  },
  {
    path: PAGES.DELETE_ACTIVE_ACCOUNT,
    element: (
      <>
        <Menu hasBack hasLogo />
        <DeleteActiveAccount />
      </>
    ),
  },
  {
    path: PAGES.QR_CODE_SELECTED,
    element: (
      <>
        <Menu hasBack hasLogo />
        <SelectedAccountQr />
      </>
    ),
  },
  {
    path: PAGES.GENERAL_SETTINGS,
    element: (
      <>
        <Menu hasBack hasLogo />
        <SettingsGeneral />
      </>
    ),
  },
  {
    path: PAGES.ADDRESS_BOOK,
    element: (
      <>
        <Menu hasBack hasLogo />
        <AddressBook />
      </>
    ),
  },
  {
    path: PAGES.NETWORK_SETTINGS,
    element: (
      <>
        <Menu hasBack hasLogo />
        <NetworksSettings />
      </>
    ),
  },
  {
    path: PAGES.PERMISSIONS,
    element: (
      <>
        <Menu hasBack hasLogo />
        <PermissionsSettings />
      </>
    ),
  },
  {
    path: PAGES.LANGS_SETTINGS,
    element: (
      <>
        <Menu hasBack hasLogo />
        <LangsSettings />
      </>
    ),
  },
  {
    path: PAGES.CHANGE_PASSWORD,
    element: (
      <>
        <Menu hasBack hasLogo />
        <ChangePassword />
      </>
    ),
  },
  {
    path: PAGES.DELETE_ACCOUNT,
    element: (
      <>
        <Menu hasBack hasLogo />
        <DeleteAllAccounts />
      </>
    ),
  },
  {
    path: PAGES.FORGOT,
    element: <DeleteAllAccounts />,
  },
  {
    path: PAGES.NOTIFICATIONS,
    element: (
      <>
        <Menu hasLogo />
        <Notifications />
      </>
    ),
  },
  {
    path: PAGES.MESSAGES,
    element: (
      <>
        <Menu hasLogo />
        <Messages />
      </>
    ),
  },
  {
    path: PAGES.MESSAGES_LIST,
    element: <MessageList />,
  },
  {
    path: PAGES.CHANGE_TX_ACCOUNT,
    element: <SelectTxAccount />,
  },
  {
    path: PAGES.SEND,
    element: (
      <>
        <Menu hasBack hasLogo />
        <Send />
      </>
    ),
  },
  {
    path: PAGES.SWAP,
    element: (
      <>
        <Menu hasBack hasLogo />
        <Swap />
      </>
    ),
  },
  {
    path: PAGES.NFT_COLLECTION,
    element: (
      <>
        <Menu hasBack hasLogo />
        <NftCollection />
      </>
    ),
  },
  {
    path: PAGES.NFT_INFO,
    element: (
      <>
        <Menu hasBack hasLogo />
        <NftInfo />
      </>
    ),
  },
];
