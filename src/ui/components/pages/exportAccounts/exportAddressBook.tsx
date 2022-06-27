import * as React from 'react';
import { useAppSelector, useAppDispatch } from 'ui/store';
import { addBackTab, setTab } from '../../../actions';
import { PAGES } from '../../../pageConfig';
import { getNetworkByAddress } from 'ui/utils/waves';
import { downloadKeystore } from '../../../utils/keystore';
import { ExportKeystoreChooseItems } from './chooseItems';
import { ExportPasswordModal } from './passwordModal';

export function ExportAddressBook() {
  const dispatch = useAppDispatch();
  const addresses = useAppSelector(state => state.addresses);

  const [addressesToExport, setAddressesToExport] = React.useState(null);

  return (
    <>
      <ExportKeystoreChooseItems
        items={Object.entries(addresses).map(([address, name]) => ({
          name,
          address,
          network: getNetworkByAddress(address),
        }))}
        type="contacts"
        onSubmit={async (contacts, encrypted) => {
          const addressesSelected = contacts.reduce(
            (acc, contact) => ({ ...acc, [contact.address]: contact.name }),
            {}
          );

          if (!encrypted) {
            await downloadKeystore(undefined, addressesSelected);
            dispatch(setTab(PAGES.SETTINGS));
            return;
          }

          setAddressesToExport(addressesSelected);
        }}
      />

      {addressesToExport != null && (
        <ExportPasswordModal
          onClose={() => {
            setAddressesToExport(null);
          }}
          onSubmit={async password => {
            await downloadKeystore(undefined, addressesToExport, password);
            dispatch(addBackTab(PAGES.ROOT));
            dispatch(setTab(PAGES.SETTINGS));
          }}
        />
      )}
    </>
  );
}
