import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { seedUtils } from '@waves/waves-transactions';
import { ImportKeystoreChooseFile } from './chooseFile';
import {
  ImportKeystoreChooseAccounts,
  ImportKeystoreExistingAccount,
  ImportKeystoreNetwork,
  ImportKeystoreProfiles,
} from './chooseAccounts';
import { connect } from 'react-redux';
import { batchAddAccounts } from 'ui/actions/user';
import { WalletTypes } from '../../../services/Background';

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
  Exclude<ImportKeystoreNetwork, 'custom'>
> = {
  S: 'stagenet',
  T: 'testnet',
  W: 'mainnet',
};

function findNetworkByNetworkCode(networkCode: string): ImportKeystoreNetwork {
  return networkCodeToNetworkMap[networkCode] || 'custom';
}

interface ExchangeKeystoreAccount {
  address: string;
  name: string;
  networkByte: number;
  seed: string;
}

interface EncryptedKeystore {
  type: WalletTypes;
  decrypt: (password: string) => Record<
    ImportKeystoreNetwork,
    {
      accounts: Array<{
        address: string;
        name: string;
        networkCode: string;
        seed: string;
      }>;
    }
  >;
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

              const profiles: ImportKeystoreProfiles = {
                custom: { accounts: [] },
                mainnet: { accounts: [] },
                stagenet: { accounts: [] },
                testnet: { accounts: [] },
              };

              accounts.forEach(acc => {
                const networkCode = String.fromCharCode(acc.networkByte);
                const network = findNetworkByNetworkCode(networkCode);

                profiles[network].accounts.push({
                  address: acc.address,
                  name: acc.name,
                  networkCode,
                  seed: acc.seed,
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
  batchAddAccounts: (
    accounts: Array<{
      hasBackup: boolean;
      name: string;
      network: string;
      seed: string;
      type: string;
    }>,
    type: WalletTypes
  ) => void;
  allNetworksAccounts: ImportKeystoreExistingAccount[];
  setTab: (newTab: string) => void;
}

const mapStateToProps = (store: any) => ({
  allNetworksAccounts: store.allNetworksAccounts,
});

const actions = {
  batchAddAccounts,
};

export const ImportKeystore = connect(
  mapStateToProps,
  actions
)(function ImportKeystore({
  allNetworksAccounts,
  batchAddAccounts,
  setTab,
}: Props) {
  const { t } = useTranslation();
  const [error, setError] = React.useState<string | null>(null);
  const [profiles, setProfiles] = React.useState<ImportKeystoreProfiles | null>(
    null
  );
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
        batchAddAccounts(
          selectedAccounts.map(acc => ({
            seed: acc.seed,
            type: 'seed',
            name: acc.name,
            network: findNetworkByNetworkCode(acc.networkCode),
            hasBackup: true,
          })),
          walletType
        );
      }}
    />
  );
});
