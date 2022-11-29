import { RouteObject } from 'react-router-dom';
import { ErrorPage } from 'ui/components/pages/errorPage';
import { RootAccounts } from 'ui/components/RootAccounts';

import { Bottom } from '../ui/components/bottom/bottom';
import { Menu } from '../ui/components/menu/Menu';
import { BackUpSeed } from '../ui/components/pages/BackupSeed';
import { ConfirmBackup } from '../ui/components/pages/ConfirmBackup';
import { DeleteAllAccounts } from '../ui/components/pages/deleteAllAccounts/deleteAllAccounts';
import { AccountsHome } from '../ui/components/pages/Import';
import { ImportDebug } from '../ui/components/pages/importDebug';
import { ImportEmail } from '../ui/components/pages/importEmail/importEmail';
import { ImportAddressBook } from '../ui/components/pages/importKeystore/importAddressBook';
import { ImportKeystore } from '../ui/components/pages/importKeystore/importKeystore';
import { ImportLedger } from '../ui/components/pages/importLedger/importLedger';
import { ImportSeed } from '../ui/components/pages/importSeed';
import {
  ImportSuccess,
  ImportSuccessAddressBook,
} from '../ui/components/pages/importSuccess';
import { NewAccount } from '../ui/components/pages/NewAccount';
import { NewWallet } from '../ui/components/pages/NewWallet';
import { NewWalletName } from '../ui/components/pages/NewWalletName';

export const routes: RouteObject[] = [
  {
    element: <RootAccounts />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
        element: (
          <>
            <Menu hasLogo />
            <AccountsHome />
            <Bottom allowChangingNetwork />
          </>
        ),
      },
      {
        path: '/create-account',
        element: (
          <>
            <Menu hasBack hasLogo />
            <NewWallet />
            <Bottom />
          </>
        ),
      },
      {
        path: '/create-account/save-backup',
        element: (
          <>
            <Menu hasBack hasLogo />
            <BackUpSeed />
            <Bottom />
          </>
        ),
      },
      {
        path: '/create-account/confirm-backup',
        element: (
          <>
            <Menu hasBack hasLogo />
            <ConfirmBackup />
            <Bottom />
          </>
        ),
      },
      {
        path: '/import-debug',
        element: (
          <>
            <Menu hasBack hasLogo />
            <ImportDebug />
            <Bottom />
          </>
        ),
      },
      {
        path: '/import-seed',
        element: (
          <>
            <Menu hasBack hasLogo />
            <ImportSeed />
            <Bottom />
          </>
        ),
      },
      {
        path: '/import-ledger',
        element: (
          <>
            <Menu hasBack hasLogo />
            <ImportLedger />
          </>
        ),
      },
      {
        path: '/import-keystore',
        element: (
          <>
            <Menu hasBack hasLogo />
            <ImportKeystore />
          </>
        ),
      },
      {
        path: '/import-email',
        element: (
          <>
            <Menu hasBack hasLogo />
            <ImportEmail />
            <Bottom />
          </>
        ),
      },
      {
        path: '/account-name',
        element: (
          <>
            <Menu hasBack hasLogo />
            <NewWalletName />
            <Bottom />
          </>
        ),
      },
      {
        path: '/import-success',
        element: (
          <>
            <Menu hasLogo />
            <ImportSuccess />
          </>
        ),
      },
      {
        path: '/import-keystore/success',
        element: (
          <>
            <Menu hasLogo />
            <ImportSuccess isKeystoreImport />
          </>
        ),
      },
      {
        path: '/import-address-book',
        element: (
          <>
            <Menu hasLogo />
            <ImportAddressBook />
          </>
        ),
      },
      {
        path: '/import-address-book/success',
        element: (
          <>
            <Menu hasLogo />
            <ImportSuccessAddressBook />
          </>
        ),
      },
      {
        path: '/init-vault',
        element: (
          <>
            <Menu hasLogo />
            <NewAccount />
          </>
        ),
      },
      {
        path: '/forgot-password',
        element: <DeleteAllAccounts />,
      },
    ],
  },
];
