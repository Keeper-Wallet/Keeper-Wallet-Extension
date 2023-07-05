import {
  base64Decode,
  decryptSeed,
  utf8Decode,
  utf8Encode,
} from '@keeper-wallet/waves-crypto';
import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { setAddresses } from 'store/actions/addresses';
import {
  fromEthereumToWavesAddress,
  isEthereumAddress,
} from 'ui/utils/ethereum';

import { ImportKeystoreChooseFile } from './chooseFile';

interface EncryptedAddressBook {
  decrypt: (password?: string) => Promise<Record<string, string>>;
}

function parseAddressBook(json: string): EncryptedAddressBook | null {
  const parsedJson: unknown = JSON.parse(json);

  if (
    !parsedJson ||
    typeof parsedJson !== 'object' ||
    !('addresses' in parsedJson) ||
    typeof parsedJson.addresses !== 'string'
  ) {
    return null;
  }

  const { addresses } = parsedJson;

  return {
    decrypt: async password => {
      try {
        if (password) {
          const decrypted = await decryptSeed(
            base64Decode(atob(addresses)),
            utf8Encode(password),
          );

          return JSON.parse(utf8Decode(decrypted));
        }

        return JSON.parse(decodeURIComponent(atob(addresses)));
      } catch (err) {
        return null;
      }
    },
  };
}

const suffixRe = /\((\d+)\)$/;

function getFormattedAddresses(
  addresses: Record<string, string>,
  keystoreAddresses: Record<string, string>,
) {
  return Object.fromEntries(
    Object.entries(keystoreAddresses).map(([keystoreAddress, keystoreName]) => {
      let sameName = Object.values(addresses || {}).find(
        name => keystoreName === name,
      );

      while (sameName) {
        const suffixMatch = keystoreName.match(suffixRe);

        if (suffixMatch) {
          keystoreName = keystoreName.replace(
            suffixRe,
            `(${Number(suffixMatch[1]) + 1})`,
          );
        } else {
          keystoreName += ' (1)';
        }

        sameName = Object.values<string>(keystoreAddresses).find(
          name => keystoreName === name,
        );
      }

      return [
        isEthereumAddress(keystoreAddress)
          ? fromEthereumToWavesAddress(keystoreAddress)
          : keystoreAddress,
        keystoreName,
      ];
    }),
  );
}

export function ImportAddressBook() {
  const navigate = useNavigate();
  const dispatch = usePopupDispatch();
  const addresses = usePopupSelector(state => state.addresses);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <ImportKeystoreChooseFile
      title={t('importKeystore.chooseAddressBookFileTitle')}
      label={t('importKeystore.addressBookLabel')}
      placeholder={t('importKeystore.addressBookPasswordPlaceholder')}
      loading={loading}
      error={error}
      setError={setError}
      onSubmit={async (result, password) => {
        setError(null);
        setLoading(true);

        try {
          const addressBook = parseAddressBook(result);

          if (!addressBook) {
            setError(t('importKeystore.errorFormat'));
            setLoading(false);
            return;
          }

          const keystoreAddresses = await addressBook.decrypt(password);

          if (!keystoreAddresses) {
            setError(t('importKeystore.errorDecrypt'));
            setLoading(false);
            return;
          }

          dispatch(
            setAddresses(getFormattedAddresses(addresses, keystoreAddresses)),
          );
          navigate('/import-address-book/success');
        } catch (err) {
          setError(t('importKeystore.errorUnexpected'));
        }

        setLoading(false);
      }}
    />
  );
}
