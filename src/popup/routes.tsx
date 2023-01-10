import { RouteObject } from 'react-router-dom';

import { Bottom } from '../ui/components/bottom/bottom';
import { Menu } from '../ui/components/menu/Menu';
import { AccountInfo } from '../ui/components/pages/accountInfo';
import { ActiveMessagePage } from '../ui/components/pages/activeMessage';
import { ActiveNotificationPage } from '../ui/components/pages/activeNotification';
import { AddressBook } from '../ui/components/pages/AddressBook';
import { ChangeAccountName } from '../ui/components/pages/changeAccountName';
import { ChangePassword } from '../ui/components/pages/ChangePassword';
import { DeleteAccount } from '../ui/components/pages/deleteAccount';
import { DeleteAllAccounts } from '../ui/components/pages/deleteAllAccounts/deleteAllAccounts';
import { ErrorPage } from '../ui/components/pages/errorPage';
import { ExportAccounts } from '../ui/components/pages/exportAccounts/exportAccounts';
import { ExportAddressBook } from '../ui/components/pages/exportAccounts/exportAddressBook';
import { ExportAndImport } from '../ui/components/pages/ExportAndImport';
import { Info } from '../ui/components/pages/Info';
import { LangsSettings } from '../ui/components/pages/LangsSettings';
import { MessagesAndNotificationsPage } from '../ui/components/pages/messagesAndNotifications';
import { NetworkSettings } from '../ui/components/pages/networkSettings';
import { NftCollection } from '../ui/components/pages/nfts/nftCollection';
import { NftInfo } from '../ui/components/pages/nfts/nftInfo';
import { OtherAccountsPage } from '../ui/components/pages/otherAccounts';
import { PermissionsSettings } from '../ui/components/pages/PermissionsSettings/PermissionSettings';
import { PopupHome } from '../ui/components/pages/popupHome';
import { SelectedAccountQr } from '../ui/components/pages/SelectedAccountQr';
import { Send } from '../ui/components/pages/send';
import { Settings } from '../ui/components/pages/Settings';
import { SettingsGeneral } from '../ui/components/pages/SettingsGeneral';
import { Swap } from '../ui/components/pages/swap/swap';
import { Root } from '../ui/components/Root';

export const routes: RouteObject[] = [
  {
    element: <Root />,
    errorElement: <ErrorPage />,
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
            <NetworkSettings />
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
            <ActiveNotificationPage />
          </>
        ),
      },
      {
        path: '/active-message',
        element: (
          <>
            <Menu hasLogo />
            <ActiveMessagePage />
          </>
        ),
      },
      {
        path: '/messages-and-notifications',
        element: <MessagesAndNotificationsPage />,
      },
      {
        path: '/forgot-password',
        element: <DeleteAllAccounts />,
      },
    ],
  },
];
