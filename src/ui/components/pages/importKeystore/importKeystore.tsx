import {
  base58Decode,
  base58Encode,
  base64Decode,
  createAddress,
  createPrivateKey,
  createPublicKey,
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

import { BLOCKCHAIN_TYPES } from '../../../../assets/constants';
import { NetworkName } from '../../../../networks/types';
import { type PreferencesAccount } from '../../../../preferences/types';
import Background from '../../../services/Background';
import { WalletTypes } from '../../../services/Background';
import { ImportKeystoreChooseAccounts } from './chooseAccounts';

/**
 * Helper function to generate publicKey and addresses from seed
 */
async function generateDataFromSeed(seed: string): Promise<{
  publicKey: string;
  mainnetAddress: string;
  testnetAddress: string;
  stagenetAddress: string;
}> {
  const privateKey = await createPrivateKey(utf8Encode(seed));
  const publicKeyBytes = await createPublicKey(privateKey);
  const publicKey = base58Encode(publicKeyBytes);

  return {
    publicKey,
    mainnetAddress: base58Encode(
      createAddress(publicKeyBytes, 'W'.charCodeAt(0)),
    ),
    testnetAddress: base58Encode(
      createAddress(publicKeyBytes, 'T'.charCodeAt(0)),
    ),
    stagenetAddress: base58Encode(
      createAddress(publicKeyBytes, 'S'.charCodeAt(0)),
    ),
  };
}

/**
 * Helper function to generate publicKey and addresses from encodedSeed
 */
async function generateDataFromEncodedSeed(encodedSeed: string): Promise<{
  publicKey: string;
  mainnetAddress: string;
  testnetAddress: string;
  stagenetAddress: string;
}> {
  const decodedSeed = base58Decode(encodedSeed.replace(/^base58:/, ''));
  const privateKey = await createPrivateKey(decodedSeed);
  const publicKeyBytes = await createPublicKey(privateKey);
  const publicKey = base58Encode(publicKeyBytes);

  return {
    publicKey,
    mainnetAddress: base58Encode(
      createAddress(publicKeyBytes, 'W'.charCodeAt(0)),
    ),
    testnetAddress: base58Encode(
      createAddress(publicKeyBytes, 'T'.charCodeAt(0)),
    ),
    stagenetAddress: base58Encode(
      createAddress(publicKeyBytes, 'S'.charCodeAt(0)),
    ),
  };
}

/**
 * Helper function to generate publicKey and addresses from privateKey
 */
async function generateDataFromPrivateKey(privateKey: string): Promise<{
  publicKey: string;
  mainnetAddress: string;
  testnetAddress: string;
  stagenetAddress: string;
}> {
  const privateKeyBytes = base58Decode(privateKey);
  const publicKeyBytes = await createPublicKey(privateKeyBytes);
  const publicKeyBase58 = base58Encode(publicKeyBytes);

  return {
    publicKey: publicKeyBase58,
    mainnetAddress: base58Encode(
      createAddress(publicKeyBytes, 'W'.charCodeAt(0)),
    ),
    testnetAddress: base58Encode(
      createAddress(publicKeyBytes, 'T'.charCodeAt(0)),
    ),
    stagenetAddress: base58Encode(
      createAddress(publicKeyBytes, 'S'.charCodeAt(0)),
    ),
  };
}

class KeystoreDecryptError extends Error {
  code = 'KEYSTORE_DECRYPT_FAILED';

  constructor(message = 'Failed to decrypt keystore content') {
    super(message);
    this.name = 'KeystoreDecryptError';
  }
}
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
      base64Decode(encryptedContent),
      utf8Encode(password),
    );
    return JSON.parse(utf8Decode(decrypted));
  } catch (err) {
    throw new KeystoreDecryptError();
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
          // Try new format first (single base64 encoding)
          try {
            return await decrypt<MultiWallet[]>(accounts, password);
          } catch (err) {
            // Try old format (double encoding: btoa(base64Encode(encrypted)))
            try {
              const innerBase64 = atob(accounts);
              const decoded = base64Decode(innerBase64);
              const decrypted = await decryptSeed(
                decoded,
                utf8Encode(password),
              );
              const result = JSON.parse(utf8Decode(decrypted)) as MultiWallet[];
              return result;
            } catch (oldErr) {
              throw new KeystoreDecryptError();
            }
          }
        },
      };
    }

    // Old Keeper Wallet keystore format with profiles
    if ('profiles' in parsedJson && typeof parsedJson.profiles === 'string') {
      const { profiles } = parsedJson;

      return {
        type: WalletTypes.Keystore,
        decrypt: async password => {
          try {
            // The profiles field is double-encoded: btoa(base64Encode(encrypted))
            const innerBase64 = atob(profiles);
            const decoded = base64Decode(innerBase64);
            const decrypted = await decryptSeed(decoded, utf8Encode(password));
            const decryptedString = utf8Decode(decrypted);

            const profilesData = JSON.parse(decryptedString) as Record<
              string,
              {
                accounts: Array<
                  PreferencesAccount & {
                    seed?: string;
                    encodedSeed?: string;
                    privateKey?: string;
                  }
                >;
              }
            >;

            const multiwallets: MultiWallet[] = [];

            // Process all profiles
            for (const profile of Object.values(profilesData)) {
              if (!profile.accounts || !Array.isArray(profile.accounts)) {
                continue;
              }

              // Process accounts with proper async handling
              const accountPromises = profile.accounts.map(async account => {
                try {
                  let publicKey: string;
                  let mainnetAddress: string;
                  let testnetAddress: string;
                  let stagenetAddress: string;

                  // Generate data based on account type
                  if (account.seed) {
                    const data = await generateDataFromSeed(account.seed);
                    publicKey = data.publicKey;
                    mainnetAddress = data.mainnetAddress;
                    testnetAddress = data.testnetAddress;
                    stagenetAddress = data.stagenetAddress;
                  } else if (account.encodedSeed) {
                    const data = await generateDataFromEncodedSeed(
                      account.encodedSeed,
                    );
                    publicKey = data.publicKey;
                    mainnetAddress = data.mainnetAddress;
                    testnetAddress = data.testnetAddress;
                    stagenetAddress = data.stagenetAddress;
                  } else if (account.privateKey) {
                    const data = await generateDataFromPrivateKey(
                      account.privateKey,
                    );
                    publicKey = data.publicKey;
                    mainnetAddress = data.mainnetAddress;
                    testnetAddress = data.testnetAddress;
                    stagenetAddress = data.stagenetAddress;
                  } else {
                    return null;
                  }

                  const accountType = account.type || 'seed';

                  const multiwallet: MultiWallet = {
                    id: crypto.randomUUID(),
                    name: account.name,
                    type: accountType,
                    createdAt: Date.now(),
                    ...(account.seed && { seed: account.seed }),
                    ...(account.encodedSeed && {
                      encodedSeed: account.encodedSeed,
                    }),
                    ...(account.privateKey && {
                      privateKey: account.privateKey,
                    }),
                    coins: {
                      waves: {
                        publicKey,
                        networks: {
                          mainnet: {
                            address: mainnetAddress,
                            networkCode: 'W',
                          },
                          testnet: {
                            address: testnetAddress,
                            networkCode: 'T',
                          },
                          stagenet: {
                            address: stagenetAddress,
                            networkCode: 'S',
                          },
                        },
                      },
                    },
                  };

                  return multiwallet;
                } catch (error) {
                  return null;
                }
              });

              const processedAccounts = await Promise.all(accountPromises);
              multiwallets.push(
                ...processedAccounts.filter(
                  (wallet): wallet is MultiWallet => wallet !== null,
                ),
              );
            }

            return multiwallets.length > 0 ? multiwallets : null;
          } catch {
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
                setError(t('importKeystore.errorDecrypt'));
                setLoading(false);
                return;
              }

              setMultiwallets(importedWallets);
              setWalletType(keystoreParser.type);
            } catch (decryptErr) {
              if (decryptErr instanceof KeystoreDecryptError) {
                setError(t('newAccountName.errorFailedToDecryptKeystore'));
              } else {
                setError(t('importKeystore.errorDecrypt'));
              }
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

        // Switch to Waves mainnet before importing accounts
        // This ensures selectAccount can find the account in the correct network
        await Background.setNetwork(NetworkName.Mainnet);
        await Background.setCurrentBlockchainType(BLOCKCHAIN_TYPES.WAVES);

        for (const account of selectedAccounts.values()) {
          const wallet = account as unknown as MultiWallet;

          // Extract Waves data
          const wavesData = wallet.coins?.waves;
          const wavesNetworks = wavesData?.networks || {};
          const wavesPublicKey = wavesData?.publicKey || '';
          const wavesMainnetAddress = wavesNetworks.mainnet?.address || '';
          const wavesTestnetAddress = wavesNetworks.testnet?.address || '';
          const wavesStagenetAddress = wavesNetworks.stagenet?.address || '';
          if (!wallet.seed && (!wavesMainnetAddress || !wavesPublicKey)) {
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
            ...(wallet.type === 'encodedSeed'
              ? { encodedSeed: wallet.encodedSeed as string }
              : wallet.type === 'privateKey'
              ? { privateKey: wallet.privateKey as string }
              : wallet.type === 'ledger'
              ? { ledgerId: wallet.ledgerId, address: wavesMainnetAddress }
              : wallet.type === 'wx'
              ? {
                  uuid: wallet.wxUuid,
                  username: wallet.wxUsername,
                  address: wavesMainnetAddress,
                }
              : { seed: wallet.seed as string }),
            type: wallet.type,
            publicKey: wavesPublicKey,
            mainnetAddress: wavesMainnetAddress,
            testnetAddress: wavesTestnetAddress,
            stagenetAddress: wavesStagenetAddress,
          };

          if (hasUnit0Data && wallet.type === 'seed') {
            // Only SEED wallets can have Unit0 data - create specific seed params
            const seedParams = {
              name: wallet.name,
              seed: wallet.seed as string,
              type: wallet.type,
              publicKey: wavesPublicKey,
              mainnetAddress: wavesMainnetAddress,
              testnetAddress: wavesTestnetAddress,
              stagenetAddress: wavesStagenetAddress,
              unit0PublicKey,
              unit0Address: unit0MainnetAddress,
            };

            await dispatch(createFullMultiWallet(seedParams));
          } else {
            // All other wallet types (privateKey, encodedSeed, ledger, wx) or seed without Unit0
            await dispatch(createWavesOnlyMultiWallet(baseParams));
          }
        }

        navigate('/import-keystore/success');
      }}
    />
  );
}
