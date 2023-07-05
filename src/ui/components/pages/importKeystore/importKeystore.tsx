import {
  base64Decode,
  decryptSeed,
  utf8Decode,
  utf8Encode,
} from '@keeper-wallet/waves-crypto';
import { type KeystoreProfiles } from 'keystore/types';
import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { batchAddAccounts } from 'store/actions/user';
import invariant from 'tiny-invariant';
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
  decrypt: (password: string) => Promise<KeystoreProfiles | null>;
}

function parseKeystore(json: string): EncryptedKeystore | null {
  try {
    const parsedJson: unknown = JSON.parse(json);

    if (!parsedJson || typeof parsedJson !== 'object') {
      return null;
    }

    if ('profiles' in parsedJson && typeof parsedJson.profiles === 'string') {
      const { profiles } = parsedJson;

      return {
        type: WalletTypes.Keystore,
        decrypt: async password => {
          try {
            const decrypted = await decryptSeed(
              base64Decode(atob(profiles)),
              utf8Encode(password),
            );

            return JSON.parse(utf8Decode(decrypted));
          } catch (err) {
            return null;
          }
        },
      };
    }

    if ('data' in parsedJson && typeof parsedJson.data === 'string') {
      const parsedData: unknown = JSON.parse(atob(parsedJson.data));

      if (
        parsedData &&
        typeof parsedData === 'object' &&
        'encryptionRounds' in parsedData &&
        typeof parsedData.encryptionRounds === 'number' &&
        'saveUsers' in parsedData &&
        typeof parsedData.saveUsers === 'string'
      ) {
        const { encryptionRounds, saveUsers } = parsedData;

        return {
          type: WalletTypes.KeystoreWx,
          decrypt: async password => {
            try {
              const decrypted = await decryptSeed(
                base64Decode(saveUsers),
                utf8Encode(password),
                encryptionRounds,
              );

              const accounts: ExchangeKeystoreAccount[] = JSON.parse(
                utf8Decode(decrypted),
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
                    acc,
                  ): acc is Extract<
                    ExchangeKeystoreAccount,
                    { userType: 'seed' }
                  > => acc.userType === 'seed',
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
            } catch {
              return null;
            }
          },
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

const suffixRe = /\((\d+)\)$/;

export function ImportKeystore() {
  const navigate = useNavigate();
  const dispatch = usePopupDispatch();
  const allNetworksAccounts = usePopupSelector(
    state => state.allNetworksAccounts,
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

            const newProfiles = await keystore.decrypt(password);

            if (!newProfiles) {
              setError(t('importKeystore.errorDecrypt'));
              setLoading(false);
              return;
            }

            Object.entries(newProfiles).forEach(([network, profile]) => {
              const currentNetworkAccounts = allNetworksAccounts.filter(
                acc => acc.network === network,
              );

              profile.accounts.forEach(profileAccount => {
                const accounts = currentNetworkAccounts.filter(
                  acc => acc.address !== profileAccount.address,
                );

                let sameNameAccount = accounts.find(
                  existingAccount =>
                    existingAccount.name === profileAccount.name,
                );

                while (sameNameAccount) {
                  const suffixMatch = profileAccount.name.match(suffixRe);

                  if (suffixMatch) {
                    profileAccount.name = profileAccount.name.replace(
                      suffixRe,
                      `(${Number(suffixMatch[1]) + 1})`,
                    );
                  } else {
                    profileAccount.name += ' (1)';
                  }

                  sameNameAccount = accounts.find(
                    existingAccount =>
                      existingAccount.name === profileAccount.name,
                  );
                }
              });
            });
            setWalletType(keystore.type);
            setProfiles(newProfiles);
          } catch {
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
        invariant(walletType);

        await dispatch(
          batchAddAccounts(
            selectedAccounts.map(acc => ({
              type: 'seed',
              ...acc,
              network: getNetworkByNetworkCode(acc.networkCode),
            })),
            walletType,
          ),
        );

        navigate('/import-keystore/success');
      }}
    />
  );
}
