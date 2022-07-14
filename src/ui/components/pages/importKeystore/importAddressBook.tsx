import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { seedUtils } from '@waves/waves-transactions';
import { ImportKeystoreChooseFile } from './chooseFile';
import { setAddresses } from 'ui/actions';
import { PAGES } from '../../../pageConfig';
import { WalletTypes } from '../../../services/Background';
import { useAppDispatch, useAppSelector } from 'ui/store';
import {
  fromEthereumToWavesAddress,
  isEthereumAddress,
} from 'ui/utils/ethereum';

interface EncryptedAddressBook {
  type: WalletTypes;
  decrypt: (password?: string) => Record<string, string>;
}

function parseAddressBook(json: string): EncryptedAddressBook | null {
  const { addresses } = JSON.parse(json);

  return addresses && typeof addresses === 'string'
    ? {
        type: WalletTypes.Keystore,
        decrypt: password => {
          try {
            return password
              ? JSON.parse(seedUtils.decryptSeed(atob(addresses), password))
              : JSON.parse(decodeURIComponent(atob(addresses)));
          } catch (err) {
            return null;
          }
        },
      }
    : null;
}

const suffixRe = /\((\d+)\)$/;

export function getFormattedAddresses(
  addresses: Record<string, string>,
  keystoreAddresses?: Record<string, string>
) {
  return Object.entries(keystoreAddresses).reduce(
    (acc, [keystoreAddress, keystoreName]) => {
      let sameName = Object.values(addresses || {}).find(
        name => keystoreName === name
      );

      while (sameName) {
        const suffixMatch = keystoreName.match(suffixRe);

        if (suffixMatch) {
          keystoreName = keystoreName.replace(
            suffixRe,
            `(${Number(suffixMatch[1]) + 1})`
          );
        } else {
          keystoreName += ' (1)';
        }

        sameName = Object.values<string>(keystoreAddresses).find(
          name => keystoreName === name
        );
      }

      return {
        ...acc,
        [isEthereumAddress(keystoreAddress)
          ? fromEthereumToWavesAddress(keystoreAddress)
          : keystoreAddress]: keystoreName,
      };
    },
    {}
  );
}

interface Props {
  setTab: (newTab: string) => void;
}

export function ImportAddressBook({ setTab }: Props) {
  const dispatch = useAppDispatch();
  const addresses = useAppSelector(state => state.addresses);
  const { t } = useTranslation();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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

          const keystoreAddresses = addressBook.decrypt(password);

          if (!keystoreAddresses) {
            setError(t('importKeystore.errorDecrypt'));
            setLoading(false);
            return;
          }

          dispatch(
            setAddresses(getFormattedAddresses(addresses, keystoreAddresses))
          );
          setTab(PAGES.IMPORT_SUCCESS_ADDRESS_BOOK);
        } catch (err) {
          setError(t('importKeystore.errorUnexpected'));
        }

        setLoading(false);
      }}
    />
  );
}
