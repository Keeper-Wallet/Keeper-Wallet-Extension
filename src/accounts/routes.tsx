import * as React from 'react';
import { Bottom } from '../ui/components/bottom';
import { Menu } from '../ui/components/menu/Menu';
import { BackUpSeed } from '../ui/components/pages/BackupSeed';
import { ConfirmBackup } from '../ui/components/pages/ConfirmBackup';
import { DeleteAllAccounts } from '../ui/components/pages/deleteAllAccounts/deleteAllAccounts';
import { ImportTab } from '../ui/components/pages/Import';
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
import { Welcome } from '../ui/components/pages/Welcome';
import { PAGES } from '../ui/pages';

export const routes: Array<{
  path: string;
  element: React.ReactElement;
}> = [
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
    path: PAGES.IMPORT_LEDGER,
    element: (
      <>
        <Menu hasBack hasLogo />
        <ImportLedger />
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
    path: PAGES.IMPORT_ADDRESS_BOOK,
    element: (
      <>
        <Menu hasLogo />
        <ImportAddressBook />
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
    path: PAGES.WELCOME,
    element: <Welcome />,
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
    path: PAGES.FORGOT,
    element: <DeleteAllAccounts />,
  },
];
