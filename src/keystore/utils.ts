import {
  base64Encode,
  encryptSeed,
  utf8Encode,
} from '@keeper-wallet/waves-crypto';
import { type PreferencesAccount } from 'preferences/types';

import { MultiWallet } from '../services/types';
import background from '../ui/services/Background';

async function encryptProfiles(
  accountsToExport: PreferencesAccount[],
  password: string,
): Promise<string> {
  const accounts = await Promise.all(
    accountsToExport.map(async (acc): Promise<MultiWallet[]> => {
      const commonData = {
        address: acc.address,
        name: acc.name,
        network: acc.network,
        networkCode: acc.networkCode,
      };
      switch (acc.type) {
        case 'seed':
        case 'multichain':
        case 'privateKey':
          return acc as unknown as MultiWallet[];
        case 'encodedSeed':
          return {
            ...commonData,
            type: acc.type,
            encodedSeed: await background.getAccountEncodedSeed(
              acc.address,
              acc.network,
              password,
            ),
          };
        case 'debug':
          return {
            ...commonData,
            type: acc.type,
          };
        default:
          throw new Error(
            `Trying to export unsupported account type: ${acc.type}`,
          );
      }
    }),
  );

  const encrypted = await encryptSeed(
    utf8Encode(JSON.stringify(accounts)),
    utf8Encode(password),
  );

  return btoa(base64Encode(encrypted));
}

async function encryptAddresses(
  addresses: Record<string, string>,
  password: string,
  shouldEncrypt: boolean,
) {
  if (shouldEncrypt) {
    const encrypted = await encryptSeed(
      utf8Encode(JSON.stringify(addresses)),
      utf8Encode(password),
    );

    return btoa(base64Encode(encrypted));
  }

  return btoa(encodeURIComponent(JSON.stringify(addresses)));
}

function download(json: string, filename: string) {
  const anchorEl = document.createElement('a');
  anchorEl.download = filename;
  anchorEl.href = URL.createObjectURL(
    new Blob([json], { type: 'application/json' }),
  );
  anchorEl.click();
}

export async function downloadKeystore(
  accounts: MultiWallet[] | undefined,
  addresses: Record<string, string> | undefined,
  password: string,
  encrypted = false,
) {
  await background.assertPasswordIsValid(password);

  const now = new Date();

  const pad = (zeroes: number, value: number) =>
    value.toString().padStart(zeroes, '0');

  const nowStr = `${pad(2, now.getFullYear() % 100)}${pad(
    2,
    now.getMonth() + 1,
  )}${pad(2, now.getDate())}${pad(2, now.getHours())}${pad(
    2,
    now.getMinutes(),
  )}`;

  if (accounts) {
    download(
      JSON.stringify({
        accounts: await encryptProfiles(
          accounts as unknown as PreferencesAccount[],
          password,
        ),
      }),
      `keystore-accounts-keeper-${nowStr}.json`,
    );
  }

  if (addresses) {
    download(
      JSON.stringify({
        addresses: await encryptAddresses(addresses, password, encrypted),
      }),
      `keystore-address-book-keeper-${nowStr}.json`,
    );
  }
}
