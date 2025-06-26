import {
  base64Encode,
  encryptSeed,
  utf8Encode,
} from '@keeper-wallet/waves-crypto';
import { type NetworkProfile } from 'networks/types';
import { type PreferencesAccount } from 'preferences/types';

import background from '../ui/services/Background';
import { type KeystoreAccount, type KeystoreProfiles } from './types';

async function encryptProfiles(
  accountsToExport: PreferencesAccount[],
  password: string,
) {
  const filteredAccounts = accountsToExport.filter(
    isExportableKeystoreAccount,
  ) as Array<
    Extract<
      PreferencesAccount,
      {
        accountType: 'waves';
        type: 'seed' | 'encodedSeed' | 'privateKey' | 'debug';
      }
    >
  >;

  const accounts: Array<KeystoreAccount & { network: NetworkProfile }> = [];
  for (const acc of filteredAccounts) {
    const typedAcc: Extract<
      PreferencesAccount,
      {
        accountType: 'waves';
        type: 'seed' | 'encodedSeed' | 'privateKey' | 'debug';
      }
    > = acc;
    const { address, name, network, networkCode, chain, type } = typedAcc;
    const commonData = {
      address,
      name,
      network,
      networkCode,
    };
    switch (type) {
      case 'seed':
        accounts.push({
          ...commonData,
          type,
          seed: await background.getAccountSeed(
            address,
            network,
            password,
            chain,
          ),
        });
        break;
      case 'encodedSeed':
        accounts.push({
          ...commonData,
          type,
          encodedSeed: await background.getAccountEncodedSeed(
            address,
            network,
            password,
            chain,
          ),
        });
        break;
      case 'privateKey':
        accounts.push({
          ...commonData,
          type,
          privateKey: await background.getAccountPrivateKey(
            address,
            network,
            password,
            chain,
          ),
        });
        break;
      case 'debug':
        accounts.push({
          ...commonData,
          type,
        });
        break;
      default:
        throw new Error(`Trying to export unsupported account type: ${type}`);
    }
  }

  const profiles: KeystoreProfiles = {
    custom: { accounts: [] },
    mainnet: { accounts: [] },
    stagenet: { accounts: [] },
    testnet: { accounts: [] },
  };

  accounts.forEach(({ network, ...acc }) => {
    profiles[network].accounts.push(acc);
  });

  const encrypted = await encryptSeed(
    utf8Encode(JSON.stringify(profiles)),
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
  accounts: PreferencesAccount[] | undefined,
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
      JSON.stringify({ profiles: await encryptProfiles(accounts, password) }),
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

function isExportableKeystoreAccount(acc: PreferencesAccount): acc is Extract<
  PreferencesAccount,
  {
    accountType: 'waves';
    type: 'seed' | 'encodedSeed' | 'privateKey' | 'debug';
  }
> {
  return (
    acc &&
    acc.accountType === 'waves' &&
    typeof acc.type === 'string' &&
    (acc.type === 'seed' ||
      acc.type === 'encodedSeed' ||
      acc.type === 'privateKey' ||
      acc.type === 'debug') &&
    'address' in acc &&
    'name' in acc &&
    'network' in acc &&
    'networkCode' in acc &&
    'chain' in acc
  );
}
