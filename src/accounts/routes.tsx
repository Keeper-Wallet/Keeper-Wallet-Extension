import { type RouteObject } from 'react-router-dom';
import { ErrorPage } from 'ui/components/pages/errorPage';
import { RootAccounts } from 'ui/components/RootAccounts';

import { Menu } from '../ui/components/menu';
import { AccountsHome } from '../ui/components/pages/accountHome';
import { AccountOnboarding } from '../ui/components/pages/AccountOnboarding';
import { BackUpSeed } from '../ui/components/pages/BackupSeed';
import { ConfirmBackup } from '../ui/components/pages/ConfirmBackup';
import { DeleteAllAccounts } from '../ui/components/pages/deleteAllAccounts/deleteAllAccounts';
import { ImportChoose } from '../ui/components/pages/import/importChoose';
import { ImportSeed } from '../ui/components/pages/import/importSeed';
import { ImportSeedMultichain } from '../ui/components/pages/import/ImportSeedMultichain';
import { ImportDebug } from '../ui/components/pages/importDebug';
import { ImportEmail } from '../ui/components/pages/importEmail/importEmail';
import { ImportAddressBook } from '../ui/components/pages/importKeystore/importAddressBook';
import { ImportKeystore } from '../ui/components/pages/importKeystore/importKeystore';
import { ImportLedger } from '../ui/components/pages/importLedger/importLedger';
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
          </>
        ),
      },
      {
        path: '/account-onboarding',
        element: (
          <>
            <Menu hasBack hasLogo />
            <AccountOnboarding />
          </>
        ),
      },
      {
        path: '/create-account',
        element: (
          <>
            <Menu hasBack hasLogo />
            <NewWallet />
          </>
        ),
      },
      {
        path: '/create-account/save-backup',
        element: (
          <>
            <Menu hasBack hasLogo />
            <BackUpSeed />
          </>
        ),
      },
      {
        path: '/create-account/confirm-backup',
        element: (
          <>
            <Menu hasBack hasLogo />
            <ConfirmBackup />
          </>
        ),
      },
      {
        path: '/import-debug',
        element: (
          <>
            <Menu hasBack hasLogo />
            <ImportDebug />
          </>
        ),
      },
      {
        path: '/import-choose',
        element: (
          <>
            <Menu hasBack hasLogo />
            <ImportChoose />
          </>
        ),
      },
      {
        path: '/import-wave-seed',
        element: (
          <>
            <Menu hasBack hasLogo />
            <ImportSeed />
          </>
        ),
      },
      {
        path: '/import-multi-seed',
        element: (
          <>
            <Menu hasBack hasLogo />
            <ImportSeedMultichain />
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
          </>
        ),
      },
      {
        path: '/account-name',
        element: (
          <>
            <Menu hasBack hasLogo />
            <NewWalletName />
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
