import * as React from 'react';
import { useAppSelector } from 'ui/store';
import { useNavigate } from '../../../router';
import { downloadKeystore } from '../../../../keystore/utils';
import { ExportKeystoreChooseItems } from './chooseItems';
import { ExportPasswordModal } from './passwordModal';
import { PreferencesAccount } from 'preferences/types';

export function ExportAccounts() {
  const navigate = useNavigate();
  const allNetworksAccounts = useAppSelector(
    state => state.allNetworksAccounts
  );

  const [accountsToExport, setAccountsToExport] = React.useState<
    PreferencesAccount[] | null
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
          showAttention
          onClose={() => {
            setAccountsToExport(null);
          }}
          onSubmit={async password => {
            await downloadKeystore(accountsToExport, undefined, password);
            navigate(-2);
          }}
        />
      )}
    </>
  );
}
