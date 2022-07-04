import { Account, KeystoreProfiles } from 'accounts/types';
import { seedUtils } from '@waves/waves-transactions';
import background from '../services/Background';

const encryptProfiles = async (
  accountsToExport: Account[],
  password: string
) => {
  const accounts = await Promise.all(
    accountsToExport.map(async acc => {
      const commonData = {
        address: acc.address,
        name: acc.name,
        network: acc.network,
        networkCode: acc.networkCode,
      };

      switch (acc.type) {
        case 'seed':
          return {
            ...commonData,
            type: acc.type,
            seed: await background.getAccountSeed(
              acc.address,
              acc.network,
              password
            ),
          };
        case 'encodedSeed':
          return {
            ...commonData,
            type: acc.type,
            encodedSeed: await background.getAccountEncodedSeed(
              acc.address,
              acc.network,
              password
            ),
          };
        case 'privateKey':
          return {
            ...commonData,
            type: acc.type,
            privateKey: await background.getAccountPrivateKey(
              acc.address,
              acc.network,
              password
            ),
          };
        case 'debug':
          return {
            ...commonData,
            type: acc.type,
          };
      }
    })
  );

  const profiles = accounts.reduce<KeystoreProfiles>(
    (result, { network, ...acc }) => {
      result[network].accounts.push(acc);

      return result;
    },
    {
      custom: { accounts: [] },
      mainnet: { accounts: [] },
      stagenet: { accounts: [] },
      testnet: { accounts: [] },
    }
  );

  return btoa(seedUtils.encryptSeed(JSON.stringify(profiles), password));
};

const encryptAddresses = async (
  addresses: Record<string, string>,
  password?: string,
  encrypted?: boolean
) => {
  return encrypted
    ? btoa(seedUtils.encryptSeed(JSON.stringify(addresses), password))
    : btoa(unescape(encodeURIComponent(JSON.stringify(addresses))));
};

function download(json: string, filename: string) {
  const anchorEl = document.createElement('a');
  anchorEl.download = filename;
  anchorEl.href = URL.createObjectURL(
    new Blob([json], { type: 'application/json' })
  );
  anchorEl.click();
}

export async function downloadKeystore(
  accounts?: Account[],
  addresses?: Record<string, string>,
  password?: string,
  encrypted?: boolean
) {
  const correctPassword = await background.checkPassword(password);

  if (!correctPassword) {
    throw new Error('Invalid password');
  }

  const now = new Date();
  const pad = (zeroes: number, value: number) =>
    value.toString().padStart(zeroes, '0');
  const nowStr = `${pad(2, now.getFullYear() % 100)}${pad(
    2,
    now.getMonth() + 1
  )}${pad(2, now.getDate())}${pad(2, now.getHours())}${pad(
    2,
    now.getMinutes()
  )}`;

  if (accounts) {
    download(
      JSON.stringify({ profiles: await encryptProfiles(accounts, password) }),
      `keystore-accounts-keeper-${nowStr}.json`
    );
  }

  if (addresses) {
    download(
      JSON.stringify({
        addresses: await encryptAddresses(addresses, password, encrypted),
      }),
      `keystore-address-book-keeper-${nowStr}.json`
    );
  }
}
