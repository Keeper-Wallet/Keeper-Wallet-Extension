import * as React from 'react';
import { RouteObject } from 'react-router-dom';
import { Bottom } from './components/bottom';
import { Menu } from './components/menu/Menu';
import { AccountInfo } from './components/pages/accountInfo';
import { AddressBook } from './components/pages/AddressBook';
import { ChangeAccountName } from './components/pages/changeAccountName';
import { ChangePassword } from './components/pages/ChangePassword';
import { DeleteAccount } from './components/pages/deleteAccount';
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
import { Root } from './components/Root';

export const routes: RouteObject[] = [
  {
    element: <Root />,
    children: [
      {
        path: '/',
        element: (
          <>
            <Menu hasLogo hasSettings />
            <PopupHome />
            <Bottom allowChangingNetwork />
          </>
        ),
      },
      {
        path: '/qr-code',
        element: (
          <>
            <Menu hasBack hasLogo />
            <SelectedAccountQr />
          </>
        ),
      },
      {
        path: '/account-info/:address',
        element: (
          <>
            <Menu hasBack hasLogo />
            <AccountInfo />
          </>
        ),
      },
      {
        path: '/change-account-name/:address',
        element: (
          <>
            <Menu hasBack hasLogo />
            <ChangeAccountName />
            <Bottom />
          </>
        ),
      },
      {
        path: '/delete-account/:address',
        element: (
          <>
            <Menu hasBack hasLogo />
            <DeleteAccount />
          </>
        ),
      },
      {
        path: '/other-accounts',
        element: (
          <>
            <Menu hasBack hasLogo />
            <OtherAccountsPage />
          </>
        ),
      },
      {
        path: '/send/:assetId',
        element: (
          <>
            <Menu hasBack hasLogo />
            <Send />
          </>
        ),
      },
      {
        path: '/swap',
        element: (
          <>
            <Menu hasBack hasLogo />
            <Swap />
          </>
        ),
      },
      {
        path: '/nft-collection/:creator',
        element: (
          <>
            <Menu hasBack hasLogo />
            <NftCollection />
          </>
        ),
      },
      {
        path: '/nft/:assetId',
        element: (
          <>
            <Menu hasBack hasLogo />
            <NftInfo />
          </>
        ),
      },
      {
        path: '/about',
        element: (
          <>
            <Menu hasBack />
            <Info />
          </>
        ),
      },
      {
        path: '/settings',
        element: (
          <>
            <Menu hasClose hasLogo />
            <Settings />
          </>
        ),
      },
      {
        path: '/address-book',
        element: (
          <>
            <Menu hasBack hasLogo />
            <AddressBook />
          </>
        ),
      },
      {
        path: '/settings/general',
        element: (
          <>
            <Menu hasBack hasLogo />
            <SettingsGeneral />
          </>
        ),
      },
      {
        path: '/change-password',
        element: (
          <>
            <Menu hasBack hasLogo />
            <ChangePassword />
          </>
        ),
      },
      {
        path: '/settings/permissions',
        element: (
          <>
            <Menu hasBack hasLogo />
            <PermissionsSettings />
          </>
        ),
      },
      {
        path: '/settings/language',
        element: (
          <>
            <Menu hasBack hasLogo />
            <LangsSettings />
          </>
        ),
      },
      {
        path: '/settings/network',
        element: (
          <>
            <Menu hasBack hasLogo />
            <NetworksSettings />
          </>
        ),
      },
      {
        path: '/settings/export-and-import',
        element: (
          <>
            <Menu hasBack hasLogo />
            <ExportAndImport />
          </>
        ),
      },
      {
        path: '/export-accounts',
        element: (
          <>
            <Menu hasBack hasLogo />
            <ExportAccounts />
          </>
        ),
      },
      {
        path: '/export-address-book',
        element: (
          <>
            <Menu hasBack hasLogo />
            <ExportAddressBook />
          </>
        ),
      },
      {
        path: '/delete-all-accounts',
        element: (
          <>
            <Menu hasBack hasLogo />
            <DeleteAllAccounts />
          </>
        ),
      },
      {
        path: '/active-notification',
        element: (
          <>
            <Menu hasLogo />
            <Notifications />
          </>
        ),
      },
      {
        path: '/active-message',
        element: (
          <>
            <Menu hasLogo />
            <Messages />
          </>
        ),
      },
      {
        path: '/messages-and-notifications',
        element: <MessageList />,
      },
      {
        path: '/change-tx-account',
        element: <SelectTxAccount />,
      },
      {
        path: '/forgot-password',
        element: <DeleteAllAccounts />,
      },
    ],
  },
];
