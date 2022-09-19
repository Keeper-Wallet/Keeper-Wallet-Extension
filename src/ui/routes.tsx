import * as React from 'react';
import { Bottom } from './components/bottom';
import { Menu } from './components/menu/Menu';
import { AccountInfo } from './components/pages/AccountInfo';
import { AddressBook } from './components/pages/AddressBook';
import { ChangeAccountName } from './components/pages/ChangeName';
import { ChangePassword } from './components/pages/ChangePassword';
import { DeleteActiveAccount } from './components/pages/deleteActiveAccount';
import { DeleteAllAccounts } from './components/pages/deleteAllAccounts/deleteAllAccounts';
import { ExportAccounts } from './components/pages/exportAccounts/exportAccounts';
import { ExportAddressBook } from './components/pages/exportAccounts/exportAddressBook';
import { ExportAndImport } from './components/pages/ExportAndImport';
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
import { PopupHome } from './components/pages/popupHome';
import { SelectedAccountQr } from './components/pages/SelectedAccountQr';
import { SelectTxAccount } from './components/pages/SelectTxAccount';
import { Send } from './components/pages/send';
import { Settings } from './components/pages/Settings';
import { SettingsGeneral } from './components/pages/SettingsGeneral';
import { Swap } from './components/pages/swap/swap';
import { Welcome } from './components/pages/Welcome';
import { POPUP_PAGES } from './pages';

export const routes: Array<{
  path: string;
  element: React.ReactElement;
}> = [
  {
    path: POPUP_PAGES.HOME,
    element: (
      <>
        <Menu hasLogo hasSettings />
        <PopupHome />
        <Bottom allowChangingNetwork />
      </>
    ),
  },
  {
    path: POPUP_PAGES.QR_CODE_SELECTED,
    element: (
      <>
        <Menu hasBack hasLogo />
        <SelectedAccountQr />
      </>
    ),
  },
  {
    path: POPUP_PAGES.ACCOUNT_INFO,
    element: (
      <>
        <Menu hasBack hasLogo />
        <AccountInfo />
      </>
    ),
  },
  {
    path: POPUP_PAGES.CHANGE_ACCOUNT_NAME,
    element: (
      <>
        <Menu hasBack hasLogo />
        <ChangeAccountName />
        <Bottom />
      </>
    ),
  },
  {
    path: POPUP_PAGES.DELETE_ACTIVE_ACCOUNT,
    element: (
      <>
        <Menu hasBack hasLogo />
        <DeleteActiveAccount />
      </>
    ),
  },
  {
    path: POPUP_PAGES.OTHER_ACCOUNTS,
    element: (
      <>
        <Menu hasBack hasLogo />
        <OtherAccountsPage />
      </>
    ),
  },
  {
    path: POPUP_PAGES.SEND,
    element: (
      <>
        <Menu hasBack hasLogo />
        <Send />
      </>
    ),
  },
  {
    path: POPUP_PAGES.SWAP,
    element: (
      <>
        <Menu hasBack hasLogo />
        <Swap />
      </>
    ),
  },
  {
    path: POPUP_PAGES.NFT_COLLECTION,
    element: (
      <>
        <Menu hasBack hasLogo />
        <NftCollection />
      </>
    ),
  },
  {
    path: POPUP_PAGES.NFT_INFO,
    element: (
      <>
        <Menu hasBack hasLogo />
        <NftInfo />
      </>
    ),
  },
  {
    path: POPUP_PAGES.INFO,
    element: (
      <>
        <Menu hasBack />
        <Info />
      </>
    ),
  },
  {
    path: POPUP_PAGES.SETTINGS,
    element: (
      <>
        <Menu hasClose hasLogo />
        <Settings />
      </>
    ),
  },
  {
    path: POPUP_PAGES.ADDRESS_BOOK,
    element: (
      <>
        <Menu hasBack hasLogo />
        <AddressBook />
      </>
    ),
  },
  {
    path: POPUP_PAGES.GENERAL_SETTINGS,
    element: (
      <>
        <Menu hasBack hasLogo />
        <SettingsGeneral />
      </>
    ),
  },
  {
    path: POPUP_PAGES.CHANGE_PASSWORD,
    element: (
      <>
        <Menu hasBack hasLogo />
        <ChangePassword />
      </>
    ),
  },
  {
    path: POPUP_PAGES.PERMISSIONS,
    element: (
      <>
        <Menu hasBack hasLogo />
        <PermissionsSettings />
      </>
    ),
  },
  {
    path: POPUP_PAGES.LANGS_SETTINGS,
    element: (
      <>
        <Menu hasBack hasLogo />
        <LangsSettings />
      </>
    ),
  },
  {
    path: POPUP_PAGES.NETWORK_SETTINGS,
    element: (
      <>
        <Menu hasBack hasLogo />
        <NetworksSettings />
      </>
    ),
  },
  {
    path: POPUP_PAGES.EXPORT_AND_IMPORT,
    element: (
      <>
        <Menu hasBack hasLogo />
        <ExportAndImport />
      </>
    ),
  },
  {
    path: POPUP_PAGES.EXPORT_ACCOUNTS,
    element: (
      <>
        <Menu hasBack hasLogo />
        <ExportAccounts />
      </>
    ),
  },
  {
    path: POPUP_PAGES.EXPORT_ADDRESS_BOOK,
    element: (
      <>
        <Menu hasBack hasLogo />
        <ExportAddressBook />
      </>
    ),
  },
  {
    path: POPUP_PAGES.DELETE_ACCOUNT,
    element: (
      <>
        <Menu hasBack hasLogo />
        <DeleteAllAccounts />
      </>
    ),
  },
  {
    path: POPUP_PAGES.NOTIFICATIONS,
    element: (
      <>
        <Menu hasLogo />
        <Notifications />
      </>
    ),
  },
  {
    path: POPUP_PAGES.MESSAGES,
    element: (
      <>
        <Menu hasLogo />
        <Messages />
      </>
    ),
  },
  {
    path: POPUP_PAGES.MESSAGES_LIST,
    element: <MessageList />,
  },
  {
    path: POPUP_PAGES.CHANGE_TX_ACCOUNT,
    element: <SelectTxAccount />,
  },
  {
    path: POPUP_PAGES.WELCOME,
    element: <Welcome isPopup />,
  },
  {
    path: POPUP_PAGES.FORGOT,
    element: <DeleteAllAccounts />,
  },
];
