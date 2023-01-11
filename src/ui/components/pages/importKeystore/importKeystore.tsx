import { seedUtils } from '@waves/waves-transactions';
import { KeystoreProfiles } from 'keystore/types';
import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { batchAddAccounts } from 'store/actions/user';
import { getNetworkByNetworkCode } from 'ui/utils/waves';

import { WalletTypes } from '../../../services/Background';
import { ImportKeystoreChooseAccounts } from './chooseAccounts';
import { ImportKeystoreChooseFile } from './chooseFile';

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
  decrypt: (password: string) => KeystoreProfiles | null;
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

              // eslint-disable-next-line @typescript-eslint/no-shadow
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

export function ImportKeystore() {
  const navigate = useNavigate();
  const dispatch = usePopupDispatch();
  const allNetworksAccounts = usePopupSelector(
    state => state.allNetworksAccounts
  );
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<KeystoreProfiles | null>(null);
  const [walletType, setWalletType] = useState<WalletTypes | null>(null);

  if (profiles == null) {
    return (
      <ImportKeystoreChooseFile
        title={t('importKeystore.chooseFileTitle')}
        label={t('importKeystore.keystoreLabel')}
        placeholder={t('importKeystore.passwordPlaceholder')}
        loading={loading}
        error={error}
        setError={setError}
        onSubmit={async (result, password) => {
          setError(null);
          setLoading(true);

          try {
            const keystore = parseKeystore(result);

            if (!keystore) {
              setError(t('importKeystore.errorFormat'));
              setLoading(false);
              return;
            }

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const newProfiles = keystore.decrypt(password!);

            if (!newProfiles) {
              setError(t('importKeystore.errorDecrypt'));
              setLoading(false);
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

          setLoading(false);
        }}
      />
    );
  }

  return (
    <ImportKeystoreChooseAccounts
      allNetworksAccounts={allNetworksAccounts}
      profiles={profiles}
      onSkip={() => {
        navigate('/');
      }}
      onSubmit={async selectedAccounts => {
        await dispatch(
          batchAddAccounts(
            selectedAccounts.map(acc => ({
              type: 'seed',
              ...acc,
              network: getNetworkByNetworkCode(acc.networkCode),
            })),
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            walletType!
          )
        );

        navigate('/import-keystore/success');
      }}
    />
  );
}
