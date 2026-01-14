import clsx from 'clsx';
import { type KeystoreAccount } from 'keystore/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type MultiWallet } from 'services/types';
import { Button } from 'ui/components/ui';

import { type MultiWalletAccount } from '../../../../controllers/MultiWalletController';
import * as styles from './chooseAccounts.styl';

interface Props {
  allNetworksAccounts: MultiWallet[];
  accounts: MultiWallet[];
  onSkip: () => void;
  onSubmit: (selectedAccounts: KeystoreAccount[]) => void;
}

type AccountsForCompare = {
  address: string;
  network: string;
  networkCode: string;
  isUnit0?: boolean;
};

// Check if wallet type can be imported
function isImportableType(wallet: MultiWallet): boolean {
  // Types that can be imported: seed, encodedSeed, privateKey, debug
  // Types that cannot be imported: ledger, wx
  return ['seed', 'encodedSeed', 'privateKey', 'debug'].includes(wallet.type);
}

export function ImportKeystoreChooseAccounts({
  allNetworksAccounts,
  accounts,
  onSkip,
  onSubmit,
}: Props) {
  const { t } = useTranslation();

  const groupedAccounts = accounts;

  // Initialize with all wallet IDs by default
  const [selectedWallets, setSelectedWallets] = useState<Set<string>>(
    () => new Set(groupedAccounts.map(wallet => wallet.id)),
  );

  // Build a comprehensive set of existing addresses from all networks
  const existingAddresses = new Set<string>();
  const existingNetworkAddresses: Record<string, Set<string>> = {};
  const existingWalletNames = new Set<string>();
  const addressToWalletName: Record<string, string> = {};

  allNetworksAccounts.forEach(wallet => {
    existingWalletNames.add(wallet.name);

    // Extract addresses from Waves networks
    if (wallet.coins?.waves?.networks) {
      const wavesNetworks = wallet.coins.waves.networks;

      if (wavesNetworks.mainnet?.address) {
        existingAddresses.add(wavesNetworks.mainnet.address);
        addressToWalletName[wavesNetworks.mainnet.address] = wallet.name;
        if (!existingNetworkAddresses.mainnet) {
          existingNetworkAddresses.mainnet = new Set();
        }
        existingNetworkAddresses.mainnet.add(wavesNetworks.mainnet.address);
      }

      if (wavesNetworks.testnet?.address) {
        existingAddresses.add(wavesNetworks.testnet.address);
        addressToWalletName[wavesNetworks.testnet.address] = wallet.name;
        if (!existingNetworkAddresses.testnet) {
          existingNetworkAddresses.testnet = new Set();
        }
        existingNetworkAddresses.testnet.add(wavesNetworks.testnet.address);
      }

      if (wavesNetworks.stagenet?.address) {
        existingAddresses.add(wavesNetworks.stagenet.address);
        addressToWalletName[wavesNetworks.stagenet.address] = wallet.name;
        if (!existingNetworkAddresses.stagenet) {
          existingNetworkAddresses.stagenet = new Set();
        }
        existingNetworkAddresses.stagenet.add(wavesNetworks.stagenet.address);
      }

      if (wavesNetworks.custom?.address) {
        existingAddresses.add(wavesNetworks.custom.address);
        addressToWalletName[wavesNetworks.custom.address] = wallet.name;
        if (!existingNetworkAddresses.custom) {
          existingNetworkAddresses.custom = new Set();
        }
        existingNetworkAddresses.custom.add(wavesNetworks.custom.address);
      }
    }

    // Extract addresses from Unit0 networks
    if (wallet.coins?.unit0?.networks) {
      const unit0Networks = wallet.coins.unit0.networks;

      if (unit0Networks.mainnet?.address) {
        existingAddresses.add(unit0Networks.mainnet.address);
        addressToWalletName[unit0Networks.mainnet.address] = wallet.name;
        if (!existingNetworkAddresses.mainnet) {
          existingNetworkAddresses.mainnet = new Set();
        }
        existingNetworkAddresses.mainnet.add(unit0Networks.mainnet.address);
      }

      if (unit0Networks.testnet?.address) {
        existingAddresses.add(unit0Networks.testnet.address);
        addressToWalletName[unit0Networks.testnet.address] = wallet.name;
        if (!existingNetworkAddresses.testnet) {
          existingNetworkAddresses.testnet = new Set();
        }
        existingNetworkAddresses.testnet.add(unit0Networks.testnet.address);
      }
    }
  });

  // Function to check if an account exists in its specific network
  const accountExistsInNetwork = (account: MultiWalletAccount): boolean => {
    // Check direct address match first
    if (existingAddresses.has(account.address)) {
      return true;
    }

    // Then check network-specific match
    return (
      existingNetworkAddresses[account.network]?.has(account.address) || false
    );
  };

  // Function to get the existing wallet name for an address
  const getExistingWalletName = (
    allWalletAccounts: AccountsForCompare[],
  ): string | null => {
    for (const account of allWalletAccounts) {
      if (addressToWalletName[account.address]) {
        return addressToWalletName[account.address];
      }
    }
    return null;
  };

  // Function to generate unique wallet name
  const getUniqueWalletName = (originalName: string): string => {
    if (!existingWalletNames.has(originalName)) {
      return originalName;
    }

    let counter = 1;
    let newName = `${originalName} (${counter})`;

    while (existingWalletNames.has(newName)) {
      counter++;
      newName = `${originalName} (${counter})`;
    }

    return newName;
  };

  // Calculate importable wallets (only for counting and selection logic)
  const importableWallets = groupedAccounts.filter(wallet => {
    // Check if wallet type is importable
    if (!isImportableType(wallet)) {
      return false;
    }

    const allWalletAccounts = [] as AccountsForCompare[];

    // Collect all accounts from all networks in this wallet
    if (wallet.coins?.waves?.networks) {
      const wavesNetworks = wallet.coins.waves.networks;
      if (wavesNetworks.mainnet?.address) {
        allWalletAccounts.push({
          address: wavesNetworks.mainnet.address,
          network: 'mainnet',
          networkCode: wavesNetworks.mainnet.networkCode,
        });
      }
      if (wavesNetworks.testnet?.address) {
        allWalletAccounts.push({
          address: wavesNetworks.testnet.address,
          network: 'testnet',
          networkCode: wavesNetworks.testnet.networkCode,
        });
      }
      if (wavesNetworks.stagenet?.address) {
        allWalletAccounts.push({
          address: wavesNetworks.stagenet.address,
          network: 'stagenet',
          networkCode: wavesNetworks.stagenet.networkCode,
        });
      }
    }

    if (wallet.coins?.unit0?.networks) {
      const unit0Networks = wallet.coins.unit0.networks;
      if (unit0Networks.mainnet?.address) {
        allWalletAccounts.push({
          address: unit0Networks.mainnet.address,
          network: 'mainnet',
          networkCode: unit0Networks.mainnet.networkCode,
          isUnit0: true,
        });
      }
      if (unit0Networks.testnet?.address) {
        allWalletAccounts.push({
          address: unit0Networks.testnet.address,
          network: 'testnet',
          networkCode: unit0Networks.testnet.networkCode,
          isUnit0: true,
        });
      }
    }

    // Check if any of the wallet's accounts already exist
    const hasExistingAccounts = allWalletAccounts.some(account =>
      accountExistsInNetwork(account as MultiWalletAccount),
    );

    // A wallet is importable only if NONE of its addresses exist
    return !hasExistingAccounts;
  }) as MultiWallet[];

  // Count importable wallets
  const importableWalletsCount = importableWallets.length;

  // Track if all importable wallets are selected
  const allImportableSelected =
    importableWalletsCount > 0 &&
    importableWallets.every(wallet => selectedWallets.has(wallet.id));

  // Function to toggle all importable wallets selection
  const toggleAllWallets = (selectAll: boolean) => {
    setSelectedWallets(prevSelected => {
      const newSelected = new Set(prevSelected);

      importableWallets.forEach(wallet => {
        if (selectAll) {
          newSelected.add(wallet.id);
        } else {
          newSelected.delete(wallet.id);
        }
      });

      return newSelected;
    });
  };

  // Toggle wallet selection
  function toggleWalletSelected(walletId: string, isSelected: boolean) {
    setSelectedWallets(prevSelected => {
      const newSelected = new Set(prevSelected);

      if (isSelected) {
        newSelected.add(walletId);
      } else {
        newSelected.delete(walletId);
      }

      return newSelected;
    });
  }

  // Get all accounts from selected wallets
  function getSelectedAccounts(): KeystoreAccount[] {
    const selectedAccounts: MultiWallet[] = [];

    importableWallets.forEach(account => {
      const walletId = account.id;

      // Only include accounts from selected wallets and that don't exist
      if (selectedWallets.has(walletId)) {
        const uniqueName = getUniqueWalletName(account.name);
        selectedAccounts.push({
          ...account,
          name: uniqueName,
        });
      }
    });

    return selectedAccounts as unknown as KeystoreAccount[];
  }

  return (
    <form
      data-testid="chooseAccountsForm"
      className={styles.root}
      onSubmit={event => {
        event.preventDefault();
        onSubmit(getSelectedAccounts());
      }}
    >
      <h2 className={clsx(styles.title, 'title1')}>
        {t('importKeystore.chooseAccountsTitle')}
      </h2>

      <p className={clsx(styles.description, 'body1', 'disabled500')}>
        {t('importKeystore.chooseAccountsDesc')}
      </p>

      {importableWalletsCount > 0 && (
        <div className={styles.selectAllContainer}>
          <label className={styles.selectAllLabel}>
            <input
              type="checkbox"
              className={styles.accountsGroupCheckbox}
              checked={allImportableSelected}
              onChange={e => toggleAllWallets(e.target.checked)}
            />
            <span className={clsx('body1')}>
              {allImportableSelected
                ? t('common.deselectAll')
                : t('common.selectAll')}
            </span>
          </label>
        </div>
      )}

      <div className={styles.accounts}>
        {groupedAccounts
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(wallet => {
            const allWalletAccounts = [];

            // Collect all accounts from all networks in this wallet
            if (wallet.coins?.waves?.networks) {
              const wavesNetworks = wallet.coins.waves.networks;
              if (wavesNetworks.mainnet?.address) {
                allWalletAccounts.push({
                  address: wavesNetworks.mainnet.address,
                  network: 'mainnet',
                  networkCode: wavesNetworks.mainnet.networkCode,
                });
              }
              if (wavesNetworks.testnet?.address) {
                allWalletAccounts.push({
                  address: wavesNetworks.testnet.address,
                  network: 'testnet',
                  networkCode: wavesNetworks.testnet.networkCode,
                });
              }
              if (wavesNetworks.stagenet?.address) {
                allWalletAccounts.push({
                  address: wavesNetworks.stagenet.address,
                  network: 'stagenet',
                  networkCode: wavesNetworks.stagenet.networkCode,
                });
              }
            }

            if (wallet.coins?.unit0?.networks) {
              const unit0Networks = wallet.coins.unit0.networks;
              if (unit0Networks.mainnet?.address) {
                allWalletAccounts.push({
                  address: unit0Networks.mainnet.address,
                  network: 'mainnet',
                  networkCode: unit0Networks.mainnet.networkCode,
                  isUnit0: true,
                });
              }
              if (unit0Networks.testnet?.address) {
                allWalletAccounts.push({
                  address: unit0Networks.testnet.address,
                  network: 'testnet',
                  networkCode: unit0Networks.testnet.networkCode,
                  isUnit0: true,
                });
              }
            }

            // Check if any of the wallet's accounts already exist
            const hasExistingAccounts = allWalletAccounts.some(account =>
              accountExistsInNetwork(account as MultiWalletAccount),
            );

            // Check if wallet type is importable
            const isTypeImportable = isImportableType(wallet);

            // A wallet is importable only if type is importable AND NONE of its addresses exist
            const isImportable = isTypeImportable && !hasExistingAccounts;

            // Get unique name for display
            const displayName = isImportable
              ? getUniqueWalletName(wallet.name)
              : wallet.name;

            // Get the existing wallet name if this wallet already exists
            const existingWalletName = hasExistingAccounts
              ? getExistingWalletName(allWalletAccounts as AccountsForCompare[])
              : null;

            return (
              <div
                key={wallet.id}
                className={styles.accountsGroup}
                data-testid="accountsGroup"
              >
                <header className={styles.accountsGroupHeader}>
                  <i
                    className={clsx(styles.accountsGroupIcon, 'accountIcon')}
                  />

                  <div className={styles.accountInfoText}>
                    <div
                      className={styles.accountName}
                      data-testid="accountsGroupLabel"
                    >
                      {displayName}
                      <span className={styles.walletTypeLabel}>
                        {wallet.type}
                      </span>
                    </div>
                    {!isImportable && (
                      <div
                        className={clsx(
                          styles.accountInfoNote,
                          'body3',
                          'disabled500',
                        )}
                      >
                        {!isTypeImportable
                          ? t('importKeystore.importNotSupported')
                          : t(
                              'importKeystore.chooseAccountsExistingAccountNote',
                              {
                                existingName: existingWalletName || wallet.name,
                              },
                            )}
                      </div>
                    )}
                  </div>

                  {isImportable && (
                    <input
                      checked={selectedWallets.has(wallet.id)}
                      className={styles.accountsGroupCheckbox}
                      type="checkbox"
                      onChange={event => {
                        toggleWalletSelected(
                          wallet.id,
                          event.currentTarget.checked,
                        );
                      }}
                    />
                  )}
                </header>
              </div>
            );
          })}
      </div>

      <div className={styles.buttons}>
        {importableWalletsCount === 0 || getSelectedAccounts().length === 0 ? (
          <Button
            data-testid="skipButton"
            type="button"
            view="simple"
            onClick={onSkip}
          >
            {t('importKeystore.chooseAccountsSkipBtn')}
          </Button>
        ) : (
          <Button data-testid="submitButton" type="submit" view="submit">
            {t('importKeystore.chooseAccountsImportBtn', {
              count: getSelectedAccounts().length,
            })}
          </Button>
        )}
      </div>
    </form>
  );
}
