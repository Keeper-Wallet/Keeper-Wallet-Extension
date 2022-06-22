import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { seedUtils } from '@waves/waves-transactions';
import { KeystoreProfiles } from 'accounts/types';
import { getNetworkByNetworkCode } from 'ui/utils/waves';
import { PAGES } from '../../../pageConfig';
import { ImportKeystoreChooseFile } from './chooseFile';
import { ImportKeystoreChooseAccounts } from './chooseAccounts';
import { batchAddAccounts } from 'ui/actions/user';
import { WalletTypes } from '../../../services/Background';
import { useAppDispatch, useAppSelector } from 'ui/store';

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
    const { profiles, data } = JSON.parse(json);

    if (profiles) {
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
                  const network = getNetworkByNetworkCode(networkCode);

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

const suffixRe = /\((\d+)\)$/;

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
        title={t('importKeystore.chooseFileTitle')}
        label={t('importKeystore.keystoreLabel')}
        placeholder={t('importKeystore.passwordPlaceholder')}
        error={error}
        setError={setError}
        onSubmit={async (result, password) => {
          setError(null);

          try {
            const keystore = parseKeystore(result);

            if (!keystore) {
              setError(t('importKeystore.errorFormat'));
              return;
            }

            const newProfiles = keystore.decrypt(password);

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
        setTab(PAGES.ROOT);
      }}
      onSubmit={selectedAccounts => {
        dispatch(
          batchAddAccounts(
            selectedAccounts.map(acc => ({
              type: 'seed',
              ...acc,
              network: getNetworkByNetworkCode(acc.networkCode),
            })),
            walletType
          )
        );
      }}
    />
  );
}
