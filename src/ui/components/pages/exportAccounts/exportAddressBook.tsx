import { usePopupSelector } from 'popup/store/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNetworkByAddress } from 'ui/utils/waves';

import { downloadKeystore } from '../../../../keystore/utils';
import { ExportKeystoreChooseItems } from './chooseItems';
import { ExportPasswordModal } from './passwordModal';

export function ExportAddressBook() {
  const navigate = useNavigate();
  const addresses = usePopupSelector(state => state.addresses);

  const [addressesToExport, setAddressesToExport] = useState<Record<
    string,
    string
  > | null>(null);

  return (
    <>
      <ExportKeystoreChooseItems
        items={Object.entries(addresses)
          .sort(([, firstName], [, secondName]) =>
            firstName.localeCompare(secondName),
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
            {},
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
              encrypted,
            );
            navigate(-2);
          }}
        />
      )}
    </>
  );
}
