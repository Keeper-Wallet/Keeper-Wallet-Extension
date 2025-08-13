import { type RouteObject } from 'react-router-dom';
import { ErrorPage } from 'ui/components/pages/errorPage';
import { RootAccounts } from 'ui/components/RootAccounts';

import { BottomPanel } from '../layout/bottomPanel';
import { Menu } from '../ui/components/menu/Menu';
import { AccountOnboarding } from '../ui/components/pages/AccountOnboarding';
import { BackUpSeed } from '../ui/components/pages/BackupSeed';
import { ConfirmBackup } from '../ui/components/pages/ConfirmBackup';
import { CreateMultichainAccount } from '../ui/components/pages/CreateMultichainAccount';
import { DeleteAllAccounts } from '../ui/components/pages/deleteAllAccounts/deleteAllAccounts';
import { AccountsHome } from '../ui/components/pages/import/ImportWaves';
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
import { ImportChoose } from '../ui/components/pages/import/importChoose';
import { ImportSeedMultichain } from '../ui/components/pages/import/ImportSeedMultichain';

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
            <BottomPanel allowChangingNetwork />
          </>
        ),
      },
      {
        path: '/account-onboarding',
        element: (
          <>
            <Menu hasBack hasLogo />
            <AccountOnboarding />
            <BottomPanel />
          </>
        ),
      },
      {
        path: '/create-multichain-account',
        element: (
          <>
            <Menu hasBack hasLogo />
            <CreateMultichainAccount />
            <BottomPanel />
          </>
        ),
      },
      {
        path: '/create-waves-account',
        element: (
          <>
            <Menu hasBack hasLogo />
            <NewWallet />
            <BottomPanel />
          </>
        ),
      },
      {
        path: '/create-account/save-backup',
        element: (
          <>
            <Menu hasBack hasLogo />
            <BackUpSeed />
            <BottomPanel />
          </>
        ),
      },
      {
        path: '/create-account/confirm-backup',
        element: (
          <>
            <Menu hasBack hasLogo />
            <ConfirmBackup />
            <BottomPanel />
          </>
        ),
      },
      {
        path: '/import-debug',
        element: (
          <>
            <Menu hasBack hasLogo />
            <ImportDebug />
            <BottomPanel />
          </>
        ),
      },
      {
        path: '/import-choose',
        element: (
          <>
            <Menu hasBack hasLogo />
            <ImportChoose />
            <BottomPanel />
          </>
        ),
      },
      {
        path: '/import-wave-seed',
        element: (
          <>
            <Menu hasBack hasLogo />
            <ImportSeed />
            <BottomPanel />
          </>
        ),
      },
      {
        path: '/import-multi-seed',
        element: (
          <>
            <Menu hasBack hasLogo />
            <ImportSeedMultichain />
            <BottomPanel />
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
            <BottomPanel />
          </>
        ),
      },
      {
        path: '/account-name',
        element: (
          <>
            <Menu hasBack hasLogo />
            <NewWalletName />
            <BottomPanel />
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
