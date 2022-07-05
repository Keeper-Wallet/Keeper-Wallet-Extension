import * as React from 'react';
import { useAppSelector, useAppDispatch } from 'ui/store';
import { addBackTab, setTab } from '../../../actions';
import { PAGES } from '../../../pageConfig';
import { getNetworkByAddress } from 'ui/utils/waves';
import { isEthereumAddress } from 'ui/utils/ethereum';
import { downloadKeystore } from '../../../utils/keystore';
import { ExportKeystoreChooseItems } from './chooseItems';
import { ExportPasswordModal } from './passwordModal';

export function ExportAddressBook() {
  const dispatch = useAppDispatch();
  const currentNetwork = useAppSelector(state => state.currentNetwork);
  const addresses = useAppSelector(state => state.addresses);

  const [addressesToExport, setAddressesToExport] = React.useState(null);

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
            network: isEthereumAddress(address)
              ? currentNetwork
              : getNetworkByAddress(address),
          }))}
        type="contacts"
        onSubmit={async contacts => {
          const addressesSelected = contacts.reduce(
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
            dispatch(setTab(PAGES.SETTINGS));
          }}
        />
      )}
    </>
  );
}
