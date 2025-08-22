import {
  base64Decode,
  decryptSeed,
  utf8Decode,
  utf8Encode,
} from '@keeper-wallet/waves-crypto';
import { StageKeys } from 'popup/constants';
import { setStage } from 'popup/store/actions';
import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  createWavesOnlyMultiWallet,
  batchAddAccounts,
} from 'store/actions/user';
import invariant from 'tiny-invariant';
import { getNetworkByNetworkCode } from 'ui/utils/waves';
import { MultiWallet } from 'services/types';
import { NETWORK_CONFIG } from '../../../../constants';
import { NetworkName } from '../../../../networks/types';

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

// Helper function to decrypt keystore content
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
    console.error('Decryption error:', err);
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
            // Decrypt and parse the multi-wallet format
            const decrypted = await decrypt<MultiWallet[]>(accounts, password);
            return decrypted;
          } catch (err) {
            console.error('Decryption error:', err);
            return null;
          }
        },
      };
    }

    // Legacy format handling
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

            // Parse profiles data
            const profilesData = JSON.parse(utf8Decode(decrypted));

            // Convert legacy profiles to MultiWallet format
            const multiwallets: MultiWallet[] = [];

            // Process each profile
            Object.values(profilesData).forEach((profile: any) => {
              if (!profile.accounts || !Array.isArray(profile.accounts)) {
                return;
              }

              // Process each account in the profile
              profile.accounts.forEach((account: any) => {
                if (!account.seed || account.type !== 'seed') {
                  // For now, we only handle seed accounts
                  return;
                }

                // Create a MultiWallet structure for this account
                const networkCode = account.networkCode || 'W';
                const network = getNetworkByNetworkCode(networkCode);

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
            console.error('Legacy format conversion error:', err);
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

              const exchangeAccounts: ExchangeKeystoreAccount[] = JSON.parse(
                utf8Decode(decrypted),
              );

              // Convert exchange accounts to MultiWallet format
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
              console.error('Exchange format conversion error:', err);
              return null;
            }
          },
        };
      }
    }

    return null;
  } catch (err) {
    console.error('Keystore parsing error:', err);
    return null;
  }
}

export function ImportKeystore() {
  const navigate = useNavigate();
  const dispatch = usePopupDispatch();
  const allNetworksAccounts = usePopupSelector(state => state.accounts);
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
            const keystore = JSON.parse(keystoreContent);
            console.log(keystore, 'keystore');
            const keystoreParser = parseKeystore(keystoreContent);

            if (!keystoreParser) {
              setError(t('importKeystore.errorInvalidFormat'));
              setLoading(false);
              return;
            }

            try {
              const importedWallets = await keystoreParser.decrypt(password);
              console.log('Imported wallets:', importedWallets);

              // Validate imported wallets
              if (!importedWallets || importedWallets.length === 0) {
                setError(t('importKeystore.errorNoAccounts'));
                setLoading(false);
                return;
              }

              setMultiwallets(importedWallets);
              setWalletType(keystoreParser.type);
            } catch (decryptErr) {
              console.error('Decryption error:', decryptErr);
              setError(t('importKeystore.errorDecrypt'));
            }
          } catch (err) {
            console.error('Keystore parsing error:', err);
            setError(t('importKeystore.errorUnexpected'));
          }

          setLoading(false);
        }}
      />
    );
  }

  // Prepare accounts from multiwallets for display
  const flattenedAccounts = multiwallets.flatMap(wallet => {
    const accounts = [];

    // Add Waves network accounts
    if (wallet.coins?.waves) {
      const networks = wallet.coins.waves.networks;

      // Add mainnet account if available
      if (networks?.mainnet?.address) {
        accounts.push({
          address: networks.mainnet.address,
          name: wallet.name,
          networkCode: networks.mainnet.networkCode,
          network: 'mainnet',
          publicKey: wallet.coins.waves.publicKey,
          type: wallet.type,
          seed: wallet.seed,
          id: wallet.id,
          multiwallet: wallet,
        });
      }

      // Add testnet account if available
      if (networks?.testnet?.address) {
        accounts.push({
          address: networks.testnet.address,
          name: `${wallet.name} (Testnet)`,
          networkCode: networks.testnet.networkCode,
          network: 'testnet',
          publicKey: wallet.coins.waves.publicKey,
          type: wallet.type,
          seed: wallet.seed,
          id: wallet.id,
          multiwallet: wallet,
        });
      }

      // Add stagenet account if available
      if (networks?.stagenet?.address) {
        accounts.push({
          address: networks.stagenet.address,
          name: `${wallet.name} (Stagenet)`,
          networkCode: networks.stagenet.networkCode,
          network: 'stagenet',
          publicKey: wallet.coins.waves.publicKey,
          type: wallet.type,
          seed: wallet.seed,
          id: wallet.id,
          multiwallet: wallet,
        });
      }
    }

    // Add Unit0 accounts if available (for future support)
    if (wallet.coins?.unit0) {
      const networks = wallet.coins.unit0.networks;

      if (networks?.mainnet?.address) {
        accounts.push({
          address: networks.mainnet.address,
          name: `${wallet.name} (Unit0)`,
          networkCode: networks.mainnet.networkCode,
          network: 'mainnet',
          publicKey: wallet.coins.unit0.publicKey,
          type: wallet.type,
          seed: wallet.seed,
          id: wallet.id,
          ethereumAddress: wallet.coins.unit0.networks.mainnet.address,
          isUnit0: true,
          multiwallet: wallet,
        });
      }

      if (networks?.testnet?.address) {
        accounts.push({
          address: networks.testnet.address,
          name: `${wallet.name} (Unit0 Testnet)`,
          networkCode: networks.testnet.networkCode,
          network: 'testnet',
          publicKey: wallet.coins.unit0.publicKey,
          type: wallet.type,
          seed: wallet.seed,
          id: wallet.id,
          ethereumAddress: wallet.coins.unit0.networks.testnet.address,
          isUnit0: true,
          multiwallet: wallet,
        });
      }
    }

    return accounts;
  });

  return (
    <ImportKeystoreChooseAccounts
      allNetworksAccounts={allNetworksAccounts}
      accounts={flattenedAccounts}
      onSkip={() => {
        navigate('/');
      }}
      onSubmit={async selectedAccounts => {
        invariant(walletType);
        console.log('Selected accounts for import:', selectedAccounts);

        // Extract unique MultiWallet objects from selected accounts
        const selectedWallets = new Map<string, MultiWallet>();
        selectedAccounts.forEach(account => {
          if (
            account.multiwallet &&
            !selectedWallets.has(account.multiwallet.id)
          ) {
            selectedWallets.set(account.multiwallet.id, account.multiwallet);
          }
        });

        // Import each selected MultiWallet
        for (const wallet of selectedWallets.values()) {
          try {
            // Extract required properties from the MultiWallet object
            const wavesNetworks = wallet.coins?.waves?.networks || {};
            
            // Handle Waves networks
            if (wallet.coins?.waves) {
              const importParams = {
                name: wallet.name,
                seed: wallet.seed,
                type: wallet.type,
                mainnetAddress: wavesNetworks.mainnet?.address || '',
                publicKey: wallet.coins.waves?.publicKey || '',
                testnetAddress: wavesNetworks.testnet?.address || '',
                stagenetAddress: wavesNetworks.stagenet?.address || '',
              };
              
              // Check if we have the required data before importing
              if (importParams.mainnetAddress && importParams.publicKey) {
                await dispatch(createWavesOnlyMultiWallet(importParams));
                console.log('Imported Waves wallet successfully:', importParams.name);
              } else {
                console.error('Missing required Waves data for import:', wallet);
              }
            } 
            // Handle Unit0 networks if we add support in the future
            else if (wallet.coins?.unit0) {
              // Future implementation for Unit0 specific import
              console.log('Unit0 wallet detected but not yet fully supported for import');
            } 
            else {
              console.error('Wallet has no network data:', wallet);
            }
          } catch (error) {
            console.error('Error importing wallet:', error);
          }
        }

        navigate('/import-keystore/success');
      }}
    />
  );
}
