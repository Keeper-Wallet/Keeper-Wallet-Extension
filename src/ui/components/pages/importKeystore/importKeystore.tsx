import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { seedUtils } from '@waves/waves-transactions';
import { NetworkName, KeystoreProfiles } from 'accounts/types';
import { ImportKeystoreChooseFile } from './chooseFile';
import { ImportKeystoreChooseAccounts } from './chooseAccounts';
import { batchAddAccounts } from 'ui/actions/user';
import { WalletTypes } from '../../../services/Background';
import { useAppDispatch, useAppSelector } from 'ui/store';

function readFileAsText(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the file'));
    reader.onload = () =>
      typeof reader.result === 'string'
        ? resolve(reader.result)
        : reject('Expected result to be a string');
    reader.readAsText(file);
  });
}

const networkCodeToNetworkMap: Record<
  'S' | 'T' | 'W',
  Exclude<NetworkName, 'custom'>
> = {
  S: 'stagenet',
  T: 'testnet',
  W: 'mainnet',
};

function findNetworkByNetworkCode(networkCode: string): NetworkName {
  return networkCodeToNetworkMap[networkCode] || 'custom';
}

type ExchangeKeystoreAccount = {
  address: string;
  name: string;
  networkByte: number;
} & (
  | {
      userType: 'seed';
      seed: string;
    }
  | {
      userType: 'ledger';
      id: number;
    }
  | {
      userType: 'wavesKeeper';
    }
);

interface EncryptedKeystore {
  type: WalletTypes;
  decrypt: (password: string) => KeystoreProfiles;
}

function parseKeystore(json: string): EncryptedKeystore | null {
  try {
    const obj = JSON.parse(json);

    if (obj.profiles) {
      const { profiles } = obj;

      if (typeof profiles === 'string') {
        return {
          type: WalletTypes.Keystore,
          decrypt: password => {
            try {
              return JSON.parse(
                seedUtils.decryptSeed(atob(profiles), password)
              );
            } catch (err) {
              return null;
            }
          },
        };
      }
    } else if (obj.data) {
      const { encryptionRounds, saveUsers } = JSON.parse(atob(obj.data));

      if (
        typeof saveUsers === 'string' &&
        typeof encryptionRounds === 'number'
      ) {
        return {
          type: WalletTypes.KeystoreWx,
          decrypt: password => {
            try {
              const accounts: ExchangeKeystoreAccount[] = JSON.parse(
                seedUtils.decryptSeed(saveUsers, password, encryptionRounds)
              );

              const profiles: KeystoreProfiles = {
                custom: { accounts: [] },
                mainnet: { accounts: [] },
                stagenet: { accounts: [] },
                testnet: { accounts: [] },
              };

              accounts
                .filter(
                  (
                    acc
                  ): acc is Extract<
                    ExchangeKeystoreAccount,
                    { userType: 'seed' }
                  > => acc.userType === 'seed'
                )
                .forEach(acc => {
                  const networkCode = String.fromCharCode(acc.networkByte);
                  const network = findNetworkByNetworkCode(networkCode);

                  profiles[network].accounts.push({
                    address: acc.address,
                    name: acc.name,
                    networkCode,
                    seed: acc.seed,
                    type: 'seed',
                  });
                });

              return profiles;
            } catch (err) {
              return null;
            }
          },
        };
      }
    }

    return null;
  } catch (err) {
    return null;
  }
}

interface Props {
  setTab: (newTab: string) => void;
}

export function ImportKeystore({ setTab }: Props) {
  const dispatch = useAppDispatch();
  const allNetworksAccounts = useAppSelector(
    state => state.allNetworksAccounts
  );
  const { t } = useTranslation();
  const [error, setError] = React.useState<string | null>(null);
  const [profiles, setProfiles] = React.useState<KeystoreProfiles | null>(null);
  const [walletType, setWalletType] = React.useState<WalletTypes | null>(null);

  if (profiles == null) {
    return (
      <ImportKeystoreChooseFile
        error={error}
        onSubmit={async (keystoreFile, password) => {
          setError(null);

          try {
            const text = await readFileAsText(keystoreFile);
            const keystore = parseKeystore(text);

            if (!keystore) {
              setError(t('importKeystore.errorFormat'));
              return;
            }

            const newProfiles = keystore.decrypt(password);

            if (!newProfiles) {
              setError(t('importKeystore.errorDecrypt'));
              return;
            }

            const suffixRe = /\((\d+)\)$/;

            Object.entries(newProfiles).forEach(([network, profile]) => {
              const currentNetworkAccounts = allNetworksAccounts.filter(
                acc => acc.network === network
              );

              profile.accounts.forEach(profileAccount => {
                const accounts = currentNetworkAccounts.filter(
                  acc => acc.address !== profileAccount.address
                );

                let sameNameAccount = accounts.find(
                  existingAccount =>
                    existingAccount.name === profileAccount.name
                );

                while (sameNameAccount) {
                  const suffixMatch = profileAccount.name.match(suffixRe);

                  if (suffixMatch) {
                    profileAccount.name = profileAccount.name.replace(
                      suffixRe,
                      `(${Number(suffixMatch[1]) + 1})`
                    );
                  } else {
                    profileAccount.name += ' (1)';
                  }

                  sameNameAccount = accounts.find(
                    existingAccount =>
                      existingAccount.name === profileAccount.name
                  );
                }
              });
            });
            setWalletType(keystore.type);
            setProfiles(newProfiles);
          } catch (err) {
            setError(t('importKeystore.errorUnexpected'));
          }
        }}
      />
    );
  }

  return (
    <ImportKeystoreChooseAccounts
      allNetworksAccounts={allNetworksAccounts}
      profiles={profiles}
      onSkip={() => {
        setTab('');
      }}
      onSubmit={selectedAccounts => {
        dispatch(
          batchAddAccounts(
            selectedAccounts.map(acc => ({
              type: 'seed',
              ...acc,
              network: findNetworkByNetworkCode(acc.networkCode),
            })),
            walletType
          )
        );
      }}
    />
  );
}
