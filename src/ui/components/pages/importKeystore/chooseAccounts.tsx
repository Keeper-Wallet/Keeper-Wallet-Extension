import clsx from 'clsx';
import { type KeystoreAccount } from 'keystore/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui/components/ui';
import { Avatar } from 'ui/components/ui/avatar/Avatar';
import { MultiWallet } from 'services/types';

import * as styles from './chooseAccounts.styl';

interface Props {
  allNetworksAccounts: Array<{
    address: string;
    name: string;
    [key: string]: any;
  }>;
  accounts: Array<{
    address: string;
    name: string;
    type: string;
    networkCode: string;
    network: string;
    id: string;
    multiwallet?: MultiWallet;
    isUnit0?: boolean;
    [key: string]: any;
  }>;
  onSkip: () => void;
  onSubmit: (selectedAccounts: KeystoreAccount[]) => void;
}

// Group accounts by wallet ID
function groupAccountsByWallet(accounts: Array<Props['accounts'][0]>) {
  const groups: Record<
    string,
    {
      name: string;
      networks: {
        waves: Array<Props['accounts'][0]>;
        unit0: Array<Props['accounts'][0]>;
      };
    }
  > = {};

  accounts.forEach(account => {
    const walletId = account.id || account.address;

    if (!groups[walletId]) {
      // Create new wallet group
      groups[walletId] = {
        name: account.name.replace(/ \(.*\)$/, ''), // Remove network suffix
        networks: {
          waves: [],
          unit0: [],
        },
      };
    }

    // Add to appropriate network type
    const networkType = account.isUnit0 ? 'unit0' : 'waves';
    groups[walletId].networks[networkType].push(account);
  });

  return groups;
}

const networkLabels: Record<string, string> = {
  mainnet: 'Mainnet',
  testnet: 'Testnet',
  stagenet: 'Stagenet',
};

export function ImportKeystoreChooseAccounts({
  allNetworksAccounts,
  accounts,
  onSkip,
  onSubmit,
}: Props) {
  const { t } = useTranslation();

  const groupedAccounts = groupAccountsByWallet(accounts);

  // Set of walletIds that are selected
  const [selectedWallets, setSelectedWallets] = useState<Set<string>>(
    () => new Set(Object.keys(groupedAccounts)),
  );

  // Simple check for existing accounts
  const existingAddresses = new Set(
    allNetworksAccounts.map(acc => acc.address),
  );

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

    accounts.forEach(account => {
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

      <div className={styles.accounts}>
        {Object.entries(groupedAccounts).map(([walletId, walletGroup]) => {
          const hasExistingNetworks = [
            ...(walletGroup.networks.waves || []),
            ...(walletGroup.networks.unit0 || []),
          ].some(account => existingAddresses.has(account.address));

          // Check if this wallet has any importable accounts (not already in the wallet)
          const hasImportableAccounts = [
            ...(walletGroup.networks.waves || []),
            ...(walletGroup.networks.unit0 || []),
          ].some(account => !existingAddresses.has(account.address));

          if (!hasImportableAccounts) {
            return null; // Skip wallets with no importable accounts
          }

          return (
            <div key={walletId} className={styles.accountsGroup}>
              <header className={styles.accountsGroupHeader}>
                <i className={clsx(styles.accountsGroupIcon, 'accountIcon')} />

                <h2 className={styles.accountsGroupLabel}>
                  {walletGroup.name}
                </h2>

                <input
                  checked={selectedWallets.has(walletId)}
                  className={styles.checkbox}
                  type="checkbox"
                  onChange={event => {
                    toggleWalletSelected(walletId, event.currentTarget.checked);
                  }}
                />
              </header>

              <ul className={styles.accountList}>
                {/* Waves networks */}
                {walletGroup.networks.waves.map(account => {
                  const isExisting = existingAddresses.has(account.address);
                  const networkLabel =
                    account.network === 'mainnet'
                      ? networkLabels.mainnet
                      : account.network === 'testnet'
                      ? networkLabels.testnet
                      : networkLabels.stagenet;

                  return (
                    <li
                      key={account.address}
                      className={styles.accountListItem}
                      data-testid="accountCard"
                      title={account.address}
                    >
                      <div className={styles.accountInfo}>
                        <div className={styles.accountInfoText}>
                          <div className={styles.accountName}>
                            {networkLabel}
                          </div>
                          <div className={styles.accountInfoNote}>
                            {account.address}
                            {isExisting && (
                              <span className="disabled500">
                                {' - '}
                                {t(
                                  'importKeystore.chooseAccountsExistingAccountNote',
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}

                {/* Unit0 networks */}
                {walletGroup.networks.unit0.map(account => {
                  const isExisting = existingAddresses.has(account.address);
                  const networkLabel =
                    account.network === 'mainnet'
                      ? `Unit0 ${networkLabels.mainnet}`
                      : `Unit0 ${networkLabels.testnet}`;

                  return (
                    <li
                      key={account.address}
                      className={styles.accountListItem}
                      data-testid="accountCard"
                      title={account.address}
                    >
                      <div className={styles.accountInfo}>
                        <div className={styles.accountInfoText}>
                          <div className={styles.accountName}>
                            {networkLabel}
                          </div>
                          <div className={styles.accountInfoNote}>
                            {account.address}
                            {isExisting && (
                              <span className="disabled500">
                                {' - '}
                                {t(
                                  'importKeystore.chooseAccountsExistingAccountNote',
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <div className={styles.buttons}>
        {selectedWallets.size === 0 ? (
          <Button
            data-testid="skipButton"
            type="button"
            view="transparent"
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
