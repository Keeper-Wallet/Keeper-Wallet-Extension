import * as React from 'react';
import { Bottom } from './components/bottom';
import { Menu } from './components/menu/Menu';
import { AccountInfo } from './components/pages/AccountInfo';
import { AddressBook } from './components/pages/AddressBook';
import { Assets } from './components/pages/Assets';
import { ChangeAccountName } from './components/pages/ChangeName';
import { ChangePassword } from './components/pages/ChangePassword';
import { DeleteActiveAccount } from './components/pages/deleteActiveAccount';
import { DeleteAllAccounts } from './components/pages/deleteAllAccounts/deleteAllAccounts';
import { ExportAccounts } from './components/pages/exportAccounts/exportAccounts';
import { ExportAddressBook } from './components/pages/exportAccounts/exportAddressBook';
import { ExportAndImport } from './components/pages/ExportAndImport';
import { ImportPopup } from './components/pages/Import';
import { Info } from './components/pages/Info';
import { LangsSettings } from './components/pages/LangsSettings';
import { Messages } from './components/pages/Messages';
import { MessageList } from './components/pages/MessagesList';
import { NetworksSettings } from './components/pages/NetworksSettings';
import { NftCollection } from './components/pages/nfts/nftCollection';
import { NftInfo } from './components/pages/nfts/nftInfo';
import { Notifications } from './components/pages/Notifications';
import { OtherAccountsPage } from './components/pages/otherAccounts';
import { PermissionsSettings } from './components/pages/PermissionsSettings/PermissionSettings';
import { SelectedAccountQr } from './components/pages/SelectedAccountQr';
import { SelectTxAccount } from './components/pages/SelectTxAccount';
import { Send } from './components/pages/send';
import { Settings } from './components/pages/Settings';
import { SettingsGeneral } from './components/pages/SettingsGeneral';
import { Swap } from './components/pages/swap/swap';
import { Welcome } from './components/pages/Welcome';
import { PAGES } from './pages';

export const routes: Array<{
  path: string;
  element: React.ReactElement;
}> = [
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
    path: PAGES.QR_CODE_SELECTED,
    element: (
      <>
        <Menu hasBack hasLogo />
        <SelectedAccountQr />
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
    path: PAGES.DELETE_ACTIVE_ACCOUNT,
    element: (
      <>
        <Menu hasBack hasLogo />
        <DeleteActiveAccount />
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
    path: PAGES.SETTINGS,
    element: (
      <>
        <Menu hasClose hasLogo />
        <Settings />
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
    path: PAGES.GENERAL_SETTINGS,
    element: (
      <>
        <Menu hasBack hasLogo />
        <SettingsGeneral />
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
    path: PAGES.NETWORK_SETTINGS,
    element: (
      <>
        <Menu hasBack hasLogo />
        <NetworksSettings />
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
    path: PAGES.DELETE_ACCOUNT,
    element: (
      <>
        <Menu hasBack hasLogo />
        <DeleteAllAccounts />
      </>
    ),
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
    path: PAGES.WELCOME,
    element: <Welcome isPopup />,
  },
  {
    path: PAGES.FORGOT,
    element: <DeleteAllAccounts />,
  },
];
