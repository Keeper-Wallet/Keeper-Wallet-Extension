import {
  base64Decode,
  decryptSeed,
  utf8Decode,
  utf8Encode,
} from '@keeper-wallet/waves-crypto';
import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { type MultiWallet } from 'services/types';
import {
  createFullMultiWallet,
  createWavesOnlyMultiWallet,
} from 'store/actions/user';
import invariant from 'tiny-invariant';

import { type PreferencesAccount } from '../../../../preferences/types';
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
  decrypt: (password: string) => Promise<MultiWallet[] | null>;
}

async function decrypt<T>(
  encryptedContent: string,
  password: string,
): Promise<T> {
  try {
    const decrypted = await decryptSeed(
      base64Decode(atob(encryptedContent)),
      utf8Encode(password),
    );
    return JSON.parse(utf8Decode(decrypted));
  } catch (err) {
    throw new Error('Failed to decrypt keystore content');
  }
}

function parseKeystore(json: string): EncryptedKeystore | null {
  try {
    const parsedJson: unknown = JSON.parse(json);

    if (!parsedJson || typeof parsedJson !== 'object') {
      return null;
    }

    if ('accounts' in parsedJson && typeof parsedJson.accounts === 'string') {
      const { accounts } = parsedJson;

      return {
        type: WalletTypes.Keystore,
        decrypt: async password => {
          try {
            return await decrypt<MultiWallet[]>(accounts, password);
          } catch (err) {
            return null;
          }
        },
      };
    }

    // TODO: Need to check for old accounts
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

            const profilesData = JSON.parse(utf8Decode(decrypted)) as Record<
              string,
              { accounts: Array<PreferencesAccount & { seed: string }> }
            >;

            const multiwallets: MultiWallet[] = [];

            Object.values(profilesData).forEach(profile => {
              if (!profile.accounts || !Array.isArray(profile.accounts)) {
                return;
              }

              profile.accounts.forEach(account => {
                if (!account.seed || account.type !== 'seed') {
                  return;
                }
                const networkCode = account.networkCode || 'W';

                const multiwallet: MultiWallet = {
                  id: Date.now().toString(),
                  name: account.name,
                  type: account.type,
                  createdAt: Date.now(),
                  seed: account.seed,
                  coins: {
                    waves: {
                      publicKey: account.publicKey || '',
                      networks: {
                        mainnet: {
                          address: networkCode === 'W' ? account.address : '',
                          networkCode: 'W',
                        },
                        testnet: {
                          address: networkCode === 'T' ? account.address : '',
                          networkCode: 'T',
                        },
                        stagenet: {
                          address: networkCode === 'S' ? account.address : '',
                          networkCode: 'S',
                        },
                      },
                    },
                  },
                };

                multiwallets.push(multiwallet);
              });
            });

            return multiwallets;
          } catch (err) {
            return null;
          }
        },
      };
    }

    // TODO: Need to check for old accounts
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

              const exchangeAccounts: ExchangeKeystoreAccount[] = JSON.parse(
                utf8Decode(decrypted),
              );

              const multiwallets: MultiWallet[] = [];

              exchangeAccounts
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

                  const multiwallet: MultiWallet = {
                    id: Date.now().toString(),
                    name: acc.name,
                    type: 'seed',
                    createdAt: Date.now(),
                    seed: acc.seed,
                    coins: {
                      waves: {
                        networks: {
                          mainnet: {
                            address: networkCode === 'W' ? acc.address : '',
                            networkCode: 'W',
                          },
                          testnet: {
                            address: networkCode === 'T' ? acc.address : '',
                            networkCode: 'T',
                          },
                          stagenet: {
                            address: networkCode === 'S' ? acc.address : '',
                            networkCode: 'S',
                          },
                        },
                      },
                    },
                  };

                  multiwallets.push(multiwallet);
                });

              return multiwallets;
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

export function ImportKeystore() {
  const navigate = useNavigate();
  const dispatch = usePopupDispatch();
  const allNetworksAccounts = usePopupSelector(state => {
    return state.allNetworksAccounts;
  });
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [multiwallets, setMultiwallets] = useState<MultiWallet[] | null>(null);
  const [walletType, setWalletType] = useState<WalletTypes | null>(null);

  if (multiwallets == null) {
    return (
      <ImportKeystoreChooseFile
        title={t('importKeystore.chooseFileTitle')}
        label={t('importKeystore.keystoreLabel')}
        placeholder={t('importKeystore.passwordPlaceholder')}
        loading={loading}
        error={error}
        setError={setError}
        onSubmit={async (keystoreContent, password) => {
          setError(null);
          setLoading(true);

          try {
            const keystoreParser = parseKeystore(keystoreContent);

            if (!keystoreParser) {
              setError(t('importKeystore.errorInvalidFormat'));
              setLoading(false);
              return;
            }

            try {
              const importedWallets = await keystoreParser.decrypt(password);

              if (!importedWallets || importedWallets.length === 0) {
                setError(t('importKeystore.errorNoAccounts'));
                setLoading(false);
                return;
              }

              setMultiwallets(importedWallets);
              setWalletType(keystoreParser.type);
            } catch (decryptErr) {
              setError(t('importKeystore.errorDecrypt'));
            }
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
      allNetworksAccounts={allNetworksAccounts as unknown as MultiWallet[]}
      accounts={multiwallets}
      onSkip={() => {
        navigate('/');
      }}
      onSubmit={async selectedAccounts => {
        invariant(walletType);

        for (const account of selectedAccounts.values()) {
          const wallet = account as unknown as MultiWallet;
          // Extract Waves data
          const wavesData = wallet.coins?.waves;
          const wavesNetworks = wavesData?.networks || {};
          const wavesPublicKey = wavesData?.publicKey || '';
          const wavesMainnetAddress = wavesNetworks.mainnet?.address || '';
          const wavesTestnetAddress = wavesNetworks.testnet?.address || '';
          const wavesStagenetAddress = wavesNetworks.stagenet?.address || '';

          // Skip if essential Waves data is missing
          if (!wavesMainnetAddress || !wavesPublicKey) {
            continue;
          }

          // Extract Unit0 data
          const unit0Data = wallet.coins?.unit0;
          const unit0Networks = (unit0Data?.networks || {}) as {
            mainnet: { address: string };
          };
          const unit0PublicKey = unit0Data?.publicKey || '';
          const unit0MainnetAddress = unit0Networks.mainnet?.address || '';

          // Check if we have valid Unit0 data
          const hasUnit0Data = !!unit0MainnetAddress && !!unit0PublicKey;

          // Common parameters for both types of wallets
          const baseParams = {
            name: wallet.name,
            seed: wallet.seed as string,
            type: wallet.type,
            publicKey: wavesPublicKey,
            mainnetAddress: wavesMainnetAddress,
            testnetAddress: wavesTestnetAddress,
            stagenetAddress: wavesStagenetAddress,
          };

          if (hasUnit0Data) {
            // We have Unit0 data, create a full multi-wallet
            const fullParams = {
              ...baseParams,
              unit0PublicKey,
              unit0Address: unit0MainnetAddress,
            };

            await dispatch(createFullMultiWallet(fullParams));
          } else {
            // No Unit0 data, create a Waves-only wallet
            await dispatch(createWavesOnlyMultiWallet(baseParams));
          }
        }

        navigate('/import-keystore/success');
      }}
    />
  );
}
