import * as React from 'react';
import { Account } from 'accounts/types';
import { useAppSelector, useAppDispatch } from 'ui/store';
import { setTab } from '../../../actions';
import { PAGES } from '../../../pageConfig';
import { downloadKeystore } from '../../../utils/keystore';
import { ExportKeystoreChooseItems } from './chooseItems';
import { ExportPasswordModal } from './passwordModal';

export function ExportAccounts() {
  const dispatch = useAppDispatch();
  const allNetworksAccounts = useAppSelector(
    state => state.allNetworksAccounts
  );

  const [accountsToExport, setAccountsToExport] = React.useState<
    Account[] | null
  >(null);

  return (
    <>
      <ExportKeystoreChooseItems
        items={allNetworksAccounts}
        type="accounts"
        onSubmit={accounts => {
          setAccountsToExport(accounts);
        }}
      />

      {accountsToExport != null && (
        <ExportPasswordModal
          onClose={() => {
            setAccountsToExport(null);
          }}
          onSubmit={async password => {
            await downloadKeystore(accountsToExport, undefined, password);
            dispatch(setTab(PAGES.SETTINGS));
          }}
        />
      )}
    </>
  );
}
