import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { seedUtils } from '@waves/waves-transactions';
import { NetworkName, KeystoreProfiles } from 'accounts/types';
import { ImportKeystoreChooseFile } from './chooseFile';
import { ImportKeystoreChooseAccounts } from './chooseAccounts';
import { batchAddAccounts } from 'ui/actions/user';
import { setAddresses } from 'ui/actions';
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
  decrypt: (password: string) => [KeystoreProfiles, Record<string, string>];
}

function parseKeystore(json: string): EncryptedKeystore | null {
  try {
    const { profiles, addresses, data } = JSON.parse(json);

    if (profiles) {
      if (typeof profiles === 'string') {
        return {
          type: WalletTypes.Keystore,
          decrypt: password => {
            try {
              return [
                JSON.parse(seedUtils.decryptSeed(atob(profiles), password)),
                addresses && typeof addresses === 'string'
                  ? JSON.parse(seedUtils.decryptSeed(atob(addresses), password))
                  : {},
              ];
            } catch (err) {
              return null;
            }
          },
        };
      }
    } else if (data) {
      const { encryptionRounds, saveUsers } = JSON.parse(atob(data));

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

              return [profiles, {}];
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

const suffixRe = /\((\d+)\)$/;

interface Props {
  setTab: (newTab: string) => void;
}

export function ImportKeystore({ setTab }: Props) {
  const dispatch = useAppDispatch();
  const addresses = useAppSelector(state => state.addresses);
  const allNetworksAccounts = useAppSelector(
    state => state.allNetworksAccounts
  );
  const { t } = useTranslation();
  const [error, setError] = React.useState<string | null>(null);
  const [profiles, setProfiles] = React.useState<KeystoreProfiles | null>(null);
  const [keystoreAddresses, setKeystoreAddresses] = React.useState({});
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

            const [newProfiles, newAddresses] = keystore.decrypt(password);

            if (!newProfiles) {
              setError(t('importKeystore.errorDecrypt'));
              return;
            }

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
            setKeystoreAddresses(newAddresses);
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
          setAddresses(
            Object.entries<string>(keystoreAddresses).reduce(
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

                return { ...acc, [keystoreAddress]: keystoreName };
              },
              {}
            )
          )
        );
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
