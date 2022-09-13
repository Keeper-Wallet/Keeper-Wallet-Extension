import * as React from 'react';
import { useAppSelector, useAppDispatch } from 'ui/store';
import { addBackTab, navigate } from '../../../actions';
import { PAGES } from '../../../pageConfig';
import { getNetworkByAddress } from 'ui/utils/waves';
import { downloadKeystore } from '../../../../keystore/utils';
import { ExportKeystoreChooseItems } from './chooseItems';
import { ExportPasswordModal } from './passwordModal';

export function ExportAddressBook() {
  const dispatch = useAppDispatch();
  const addresses = useAppSelector(state => state.addresses);

  const [addressesToExport, setAddressesToExport] = React.useState<Record<
    string,
    string
  > | null>(null);

  return (
    <>
      <ExportKeystoreChooseItems
        items={Object.entries(addresses)
          .sort(([, firstName], [, secondName]) =>
            firstName.localeCompare(secondName)
          )
          .map(([address, name]) => ({
            name,
            address,
            network: getNetworkByAddress(address),
          }))}
        type="contacts"
        onSubmit={async contacts => {
          const addressesSelected = contacts.reduce<Record<string, string>>(
            (acc, contact) => ({ ...acc, [contact.address]: contact.name }),
            {}
          );
          setAddressesToExport(addressesSelected);
        }}
      />

      {addressesToExport != null && (
        <ExportPasswordModal
          showEncrypted
          onClose={() => {
            setAddressesToExport(null);
          }}
          onSubmit={async (password, encrypted) => {
            await downloadKeystore(
              undefined,
              addressesToExport,
              password,
              encrypted
            );
            dispatch(addBackTab(PAGES.ROOT));
            dispatch(navigate(PAGES.SETTINGS, { replace: true }));
          }}
        />
      )}
    </>
  );
}
