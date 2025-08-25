import clsx from 'clsx';
import { type KeystoreAccount } from 'keystore/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui/components/ui';
import { MultiWallet } from 'services/types';

import * as styles from './chooseAccounts.styl';

interface Props {
  allNetworksAccounts: Array<{
    address: string;
    name: string;
    [key: string]: any;
  }>;
  accounts: MultiWallet[];
  onSkip: () => void;
  onSubmit: (selectedAccounts: KeystoreAccount[]) => void;
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

  // Simple check for existing accounts
  const existingAddresses = new Set(
    allNetworksAccounts.map(acc => acc.address),
  );

  // Track network-specific addresses by wallet ID for better detection
  const existingNetworkAddresses: Record<string, Set<string>> = {};
  allNetworksAccounts.forEach(acc => {
    if (!existingNetworkAddresses[acc.network]) {
      existingNetworkAddresses[acc.network] = new Set();
    }
    existingNetworkAddresses[acc.network].add(acc.address);
  });

  // Function to check if an account exists in its specific network
  const accountExistsInNetwork = (account): boolean => {
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
      accountExistsInNetwork(account),
    );

    // A wallet is importable only if NONE of its addresses exist
    return !hasExistingAccounts;
  });

  // Count importable wallets
  const importableWalletsCount = importableWallets.length;

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
    const selectedAccounts: KeystoreAccount[] = [];

    importableWallets.forEach(account => {
      const walletId = account.id || account.address;

      // Only include accounts from selected wallets and that don't exist
      if (
        selectedWallets.has(walletId) &&
        !existingAddresses.has(account.address)
      ) {
        selectedAccounts.push(account);
      }
    });

    return selectedAccounts;
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

      {importableWalletsCount > 0 && getSelectedAccounts().length === 0 && (
        <div className={styles.emptyState}>
          <p className={clsx('body1', 'disabled500')}>
            {t('importKeystore.selectAccountsToImport')}
          </p>
        </div>
      )}

      <div className={styles.accounts}>
        {groupedAccounts.map(wallet => {
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
            accountExistsInNetwork(account as Props['accounts'][0]),
          );

          // A wallet is importable only if NONE of its addresses exist
          const isImportable = !hasExistingAccounts;

          return (
            <div key={wallet.id} className={styles.accountsGroup}>
              <header className={styles.accountsGroupHeader}>
                <i className={clsx(styles.accountsGroupIcon, 'accountIcon')} />

                <h2 className={styles.accountsGroupLabel}>{wallet.name}</h2>

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
                  <span className={clsx(styles.existingAccountBadge, 'body3')}>
                    {t('importKeystore.alreadyExists')}
                  </span>
                )}
              </header>

              <ul className={styles.accountList}>
                {wallet.coins?.waves && (
                  <>
                    {wallet.coins.waves.networks.mainnet?.address && (
                      <li
                        className={clsx(styles.accountListItem, {
                          [styles.accountListItemDisabled]: !isImportable,
                        })}
                        key={wallet.coins.waves.networks.mainnet.address}
                      >
                        <span className="body1 input300">Waves</span>
                        <div className={styles.accountListItemRight}>
                          <span className="monospace1 input300">
                            {wallet.coins.waves.networks.mainnet.address}
                          </span>
                        </div>
                      </li>
                    )}

                    {wallet.coins.waves.networks.testnet?.address && (
                      <li
                        className={clsx(styles.accountListItem, {
                          [styles.accountListItemDisabled]: !isImportable,
                        })}
                        key={wallet.coins.waves.networks.testnet.address}
                      >
                        <span className="body1 input300">Waves Testnet</span>
                        <div className={styles.accountListItemRight}>
                          <span className="monospace1 input300">
                            {wallet.coins.waves.networks.testnet.address}
                          </span>
                        </div>
                      </li>
                    )}

                    {wallet.coins.waves.networks.stagenet?.address && (
                      <li
                        className={clsx(styles.accountListItem, {
                          [styles.accountListItemDisabled]: !isImportable,
                        })}
                        key={wallet.coins.waves.networks.stagenet.address}
                      >
                        <span className="body1 input300">Waves Stagenet</span>
                        <div className={styles.accountListItemRight}>
                          <span className="monospace1 input300">
                            {wallet.coins.waves.networks.stagenet.address}
                          </span>
                        </div>
                      </li>
                    )}
                  </>
                )}

                {wallet.coins?.unit0 && (
                  <>
                    {wallet.coins.unit0.networks.mainnet?.address && (
                      <li
                        className={clsx(styles.accountListItem, {
                          [styles.accountListItemDisabled]: !isImportable,
                        })}
                        key={wallet.coins.unit0.networks.mainnet.address}
                      >
                        <span className="body1 input300">Unit0 Mainnet</span>
                        <div className={styles.accountListItemRight}>
                          <span className="monospace1 input300">
                            {wallet.coins.unit0.networks.mainnet.address}
                          </span>
                        </div>
                      </li>
                    )}

                    {wallet.coins.unit0.networks.testnet?.address && (
                      <li
                        className={clsx(styles.accountListItem, {
                          [styles.accountListItemDisabled]: !isImportable,
                        })}
                        key={wallet.coins.unit0.networks.testnet.address}
                      >
                        <span className="body1 input300">Unit0 Testnet</span>
                        <div className={styles.accountListItemRight}>
                          <span className="monospace1 input300">
                            {wallet.coins.unit0.networks.testnet.address}
                          </span>
                        </div>
                      </li>
                    )}
                  </>
                )}
              </ul>
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
