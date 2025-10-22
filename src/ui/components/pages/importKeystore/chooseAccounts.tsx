import clsx from 'clsx';
import { type KeystoreAccount } from 'keystore/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type MultiWallet } from 'services/types';
import { Button } from 'ui/components/ui';

import { type MultiWalletAccount } from '../../../../controllers/MultiWalletController';
import { type PreferencesAccount } from '../../../../preferences/types';
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

  // Simple check for existing accounts
  const existingAddresses = new Set(
    allNetworksAccounts.map(acc => {
      return (
        acc.coins?.waves.networks.mainnet.address ||
        (acc as unknown as PreferencesAccount).address
      );
    }),
  );

  // TODO : Track network-specific addresses by wallet ID for better detection
  const existingNetworkAddresses: Record<string, Set<string>> = {};
  (allNetworksAccounts as unknown as PreferencesAccount[]).forEach(acc => {
    if (!existingNetworkAddresses[acc.network]) {
      existingNetworkAddresses[acc.network] = new Set();
    }
    existingNetworkAddresses[acc.network].add(acc.address);
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

  // Calculate importable wallets directly without useEffect
  const importableWallets = groupedAccounts.filter(wallet => {
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
        selectedAccounts.push(account);
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

            // A wallet is importable only if NONE of its addresses exist
            const isImportable = !hasExistingAccounts;

            return (
              <div key={wallet.id} className={styles.accountsGroup}>
                <header className={styles.accountsGroupHeader}>
                  <i
                    className={clsx(styles.accountsGroupIcon, 'accountIcon')}
                  />

                  <h2 className={styles.accountsGroupLabel}>
                    {wallet.name}
                    <span className={styles.walletTypeLabel}>
                      {wallet.type}
                    </span>
                  </h2>

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
                  {!isImportable && (
                    <span
                      className={clsx(styles.existingAccountBadge, 'body3')}
                    >
                      {t('importKeystore.alreadyExists')}
                    </span>
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
