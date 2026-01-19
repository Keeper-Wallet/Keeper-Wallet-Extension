import clsx from 'clsx';
import { NetworkName } from 'networks/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type BlockchainType,
  type MultiWallet,
  NETWORK_NAME_MAP,
  type NetworkType,
} from 'services/types';
import { Avatar } from 'ui/components/ui';
import { Button } from 'ui/components/ui/buttons/Button';
import { Modal } from 'ui/components/ui/modal/Modal';
import { isValidEthereumAddress } from 'ui/utils/ethereum';

import * as styles from './chooseItems.styl';

// Define a flattened account structure for internal use
interface FlattenedAccount {
  id: string;
  name: string;
  address: string;
  network: NetworkName;
  networkCode: string;
  publicKey?: string;
  type: string;
  blockchainType: BlockchainType;
  walletId: string;
  networkLabel: string;
}

const networkLabels: {
  custom: string;
  mainnet: string;
  testnet: string;
  stagenet: string;
} = {
  custom: 'Custom',
  mainnet: 'Mainnet',
  testnet: 'Testnet',
  stagenet: 'Stagenet',
};

interface Contact {
  name: string;
  address: string;
  network: NetworkName;
}

type Type = 'accounts' | 'contacts' | 'all';

interface Props<T> {
  items: T[];
  type: Type;
  onSubmit: (items: T[]) => void;
}

export function isExportable(item: MultiWallet | Contact) {
  if ('type' in item) {
    // For MultiWallet, check if it's an exportable type
    // Types that can be exported: seed, encodedSeed, privateKey, multichain
    // Types that cannot be exported: ledger, wx, debug
    const exportable = [
      'seed',
      'encodedSeed',
      'privateKey',
      'multichain',
    ].includes(item.type);
    return exportable;
  }
  // For Contact, always exportable
  return true;
}

// Helper to flatten MultiWallet into account items for display
function flattenMultiWallets(
  wallets: MultiWallet[],
): Record<string, FlattenedAccount[]> {
  const result: Record<string, FlattenedAccount[]> = {};

  wallets.forEach(wallet => {
    const walletNetworks: FlattenedAccount[] = [];

    // Process Waves accounts
    if (wallet.coins?.waves) {
      const { waves } = wallet.coins;
      Object.entries(waves.networks).forEach(([networkKey, networkData]) => {
        // Skip if no address
        if (!networkData.address) return;

        const network = networkKey as NetworkType;
        // Map to network name using NETWORK_NAME_MAP reverse lookup
        let networkName: NetworkName = NetworkName.Mainnet; // Default

        Object.entries(NETWORK_NAME_MAP).forEach(([name, config]) => {
          if (config.blockchain === 'waves' && config.network === network) {
            networkName = name as NetworkName;
          }
        });

        walletNetworks.push({
          id: `${wallet.id}-waves-${network}`,
          name: wallet.name,
          address: networkData.address,
          network: networkName,
          networkCode: networkData.networkCode,
          publicKey: waves.publicKey,
          type: wallet.type,
          blockchainType: 'waves',
          walletId: wallet.id,
          networkLabel: networkLabels[networkName],
        });
      });
    }

    // Process Unit0 accounts if available
    if (wallet.coins?.unit0) {
      const { unit0 } = wallet.coins;
      Object.entries(unit0.networks).forEach(([networkKey, networkData]) => {
        // Skip if no address
        if (!networkData.address) return;

        const network = networkKey as NetworkType;
        // For Unit0, we map to mainnet/testnet
        const networkName =
          network === 'mainnet' ? NetworkName.Mainnet : NetworkName.Testnet;

        walletNetworks.push({
          id: `${wallet.id}-unit0-${network}`,
          name: wallet.name,
          address: networkData.address,
          network: networkName,
          networkCode: networkData.networkCode,
          publicKey: unit0.publicKey,
          type: wallet.type,
          blockchainType: 'unit0',
          walletId: wallet.id,
          networkLabel: networkLabels[networkName], // Will be translated in the component
        });
      });
    }

    if (walletNetworks.length > 0) {
      result[wallet.id] = walletNetworks;
    }
  });

  return result;
}

export function ExportKeystoreChooseItems<T extends MultiWallet | Contact>({
  items,
  type,
  onSubmit,
}: Props<T>) {
  const { t } = useTranslation();

  const isContacts = type === 'contacts';
  const contacts = isContacts ? (items as unknown as Contact[]) : [];

  // Flatten and group MultiWallet items by wallet ID
  const groupedAccounts =
    items[0] && 'coins' in items[0]
      ? flattenMultiWallets(items as MultiWallet[])
      : {};

  // Selection state for wallets - only include exportable wallets initially
  const [selectedWallets, setSelectedWallets] = useState<Set<string>>(() => {
    const exportableWalletIds = Object.keys(groupedAccounts).filter(
      walletId => {
        const originalWallet = (items as MultiWallet[]).find(
          w => w.id === walletId,
        );
        return originalWallet ? isExportable(originalWallet) : true;
      },
    );
    return new Set(exportableWalletIds);
  });

  // Selection state for individual accounts
  const [, setSelectedAccounts] = useState<Set<string>>(() => {
    // Initialize with all accounts from selected wallets
    const initialAccounts = new Set<string>();
    Object.values(groupedAccounts).forEach(networks => {
      networks.forEach(account => {
        initialAccounts.add(account.id);
      });
    });
    return initialAccounts;
  });

  // Selection state for contacts
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(
    () => new Set(isContacts ? contacts.map(c => c.address) : []),
  );

  // Toggle wallet selection - affects all its accounts
  function toggleWalletSelected(walletId: string, isSelected: boolean) {
    // Update wallet selection
    setSelectedWallets(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (isSelected) {
        newSelected.add(walletId);
      } else {
        newSelected.delete(walletId);
      }
      return newSelected;
    });

    // Also update account selections
    setSelectedAccounts(prevSelected => {
      const newSelected = new Set(prevSelected);
      const walletAccounts = groupedAccounts[walletId] || [];

      walletAccounts.forEach(account => {
        if (isSelected) {
          newSelected.add(account.id);
        } else {
          newSelected.delete(account.id);
        }
      });

      return newSelected;
    });
  }

  // Get selected items for export
  const getSelectedItems = (): T[] => {
    if (items[0] && 'coins' in items[0]) {
      // Simply filter wallets based on selectedWallets
      return (items as MultiWallet[]).filter(wallet =>
        selectedWallets.has(wallet.id),
      ) as T[];
    } else {
      // For contacts
      if (!isContacts) return items as T[];
      return (items as unknown as Contact[]).filter(contact =>
        selectedContacts.has(contact.address),
      ) as unknown as T[];
    }
  };

  // Check if there are non-exportable wallets (ledger or wx accounts)
  const hasNonExportableWallets = items.some(item => !isExportable(item));
  const [showWarningModal, setShowWarningModal] = useState(
    hasNonExportableWallets,
  );

  // Count selected accounts
  const selectedAccountsCount = selectedWallets.size;

  // Track if all exportable wallets are selected
  const exportableWalletsCount = Object.keys(groupedAccounts).filter(
    walletId => {
      const originalWallet = (items as MultiWallet[]).find(
        w => w.id === walletId,
      );
      return originalWallet ? isExportable(originalWallet) : true;
    },
  ).length;
  const allSelected = selectedWallets.size === exportableWalletsCount;

  // Function to toggle all wallets selection
  const toggleAllWallets = (selectAll: boolean) => {
    if (selectAll) {
      // Select only exportable wallets
      const exportableWalletIds = Object.keys(groupedAccounts).filter(
        walletId => {
          const originalWallet = (items as MultiWallet[]).find(
            w => w.id === walletId,
          );
          return originalWallet ? isExportable(originalWallet) : true;
        },
      );
      setSelectedWallets(new Set(exportableWalletIds));

      // Also select all accounts from exportable wallets only
      const allAccounts = new Set<string>();
      exportableWalletIds.forEach(walletId => {
        const networks = groupedAccounts[walletId];
        if (networks) {
          networks.forEach(account => {
            allAccounts.add(account.id);
          });
        }
      });
      setSelectedAccounts(allAccounts);
    } else {
      // Deselect all wallets and accounts
      setSelectedWallets(new Set());
      setSelectedAccounts(new Set());
    }
  };

  return (
    <form
      className={styles.root}
      data-testid="chooseAccountsForm"
      onSubmit={event => {
        event.preventDefault();
        onSubmit(getSelectedItems());
      }}
    >
      <h1 className={clsx(styles.centered, 'margin1', 'title1')}>
        {t(
          type === 'contacts'
            ? 'exportKeystore.chooseContactsTitle'
            : 'exportKeystore.chooseAccountsTitle',
        )}
      </h1>

      <p className={clsx(styles.centered, 'margin1', 'body1', 'disabled500')}>
        {t(
          type === 'contacts'
            ? 'exportKeystore.chooseContactsDesc'
            : 'exportKeystore.chooseAccountsDesc',
        )}
      </p>

      {(Object.keys(groupedAccounts).length > 0 || isContacts) && (
        <div className={styles.selectAllContainer}>
          <label className={styles.selectAllLabel}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={
                isContacts
                  ? selectedContacts.size === contacts.length
                  : allSelected
              }
              onChange={e => {
                if (isContacts) {
                  const selectAll = e.target.checked;
                  setSelectedContacts(
                    selectAll
                      ? new Set(contacts.map(c => c.address))
                      : new Set(),
                  );
                } else {
                  toggleAllWallets(e.target.checked);
                }
              }}
            />
            <span className={clsx('body1')}>
              {(
                isContacts
                  ? selectedContacts.size === contacts.length
                  : allSelected
              )
                ? t('common.deselectAll')
                : t('common.selectAll')}
            </span>
          </label>
        </div>
      )}

      <div className={styles.accounts}>
        {Object.entries(groupedAccounts)
          .sort(([, a], [, b]) => a[0].name.localeCompare(b[0].name))
          .map(([walletId, networks]) => {
            // Get wallet info from the first network item
            const walletInfo = networks[0];

            // Find the original wallet to check if it's exportable
            const originalWallet = (items as MultiWallet[]).find(
              w => w.id === walletId,
            );
            const isWalletExportable = originalWallet
              ? isExportable(originalWallet)
              : true;

            return (
              <div key={walletId} className={styles.accountsGroup}>
                <header className={styles.accountsGroupHeader}>
                  <i
                    className={clsx(styles.accountsGroupIcon, 'accountIcon')}
                  />
                  <div className={styles.accountInfoText}>
                    <div
                      className={styles.accountName}
                      data-testid="accountsGroupLabel"
                    >
                      {walletInfo.name}
                      <span className={styles.walletTypeLabel}>
                        {walletInfo.type}
                      </span>
                    </div>
                    {!isWalletExportable && (
                      <div className={styles.accountInfoNote}>
                        {t('exportKeystore.exportNotSupported')}
                      </div>
                    )}
                  </div>
                  {isWalletExportable ? (
                    <input
                      checked={selectedWallets.has(walletId)}
                      className={styles.checkbox}
                      type="checkbox"
                      onChange={event => {
                        toggleWalletSelected(
                          walletId,
                          event.currentTarget.checked,
                        );
                      }}
                    />
                  ) : null}
                </header>
              </div>
            );
          })}

        {isContacts && (
          <div className={styles.accountList}>
            {contacts
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(contact => (
                <div
                  key={contact.address}
                  className={clsx(
                    styles.accountListItem,
                    selectedContacts.has(contact.address) &&
                      styles.accountListItemSelected,
                  )}
                  onClick={() => {
                    setSelectedContacts(prev => {
                      const next = new Set(prev);
                      if (next.has(contact.address))
                        next.delete(contact.address);
                      else next.add(contact.address);
                      return next;
                    });
                  }}
                >
                  <div className={styles.accountInfo}>
                    <Avatar size={28} address={contact.address} />
                    <div className={styles.accountInfoText}>
                      <div className={styles.accountNameRow}>
                        <div className={styles.accountName}>{contact.name}</div>
                        <span className={styles.walletTypeLabel}>
                          {isValidEthereumAddress(contact.address)
                            ? 'Unit0'
                            : 'Waves'}
                        </span>
                        {!isValidEthereumAddress(contact.address) && (
                          <span className={styles.walletTypeLabel}>
                            {networkLabels[contact.network]}
                          </span>
                        )}
                      </div>
                      <div className={styles.accountInfoNote}>
                        {contact.address}
                      </div>
                    </div>
                    <input
                      checked={selectedContacts.has(contact.address)}
                      className={`${styles.checkbox} ${styles.accountCheckbox}`}
                      type="checkbox"
                      onClick={e => e.stopPropagation()}
                      onChange={event => {
                        const checked = event.currentTarget.checked;
                        setSelectedContacts(prev => {
                          const next = new Set(prev);
                          if (checked) next.add(contact.address);
                          else next.delete(contact.address);
                          return next;
                        });
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className={styles.buttons}>
        <Button
          data-testid="exportButton"
          disabled={
            type === 'contacts'
              ? selectedContacts.size === 0
              : selectedWallets.size === 0
          }
          type="submit"
          view="submit"
        >
          {type === 'contacts'
            ? t('exportKeystore.chooseContactsExportBtn')
            : t('exportKeystore.chooseAccountsExportBtn', {
                count: selectedAccountsCount,
              })}
        </Button>
      </div>

      <Modal animation={Modal.ANIMATION.FLASH} showModal={showWarningModal}>
        <div className="modal cover">
          <div className="modal-form">
            <h2 className={clsx('margin1', 'title1')}>
              {t('exportKeystore.warningModalTitle')}
            </h2>

            <p className={clsx('margin1', 'body1', 'disabled500')}>
              {t('exportKeystore.warningModalDesc')}
            </p>

            <Button
              className="margin1"
              view="submit"
              onClick={() => {
                setShowWarningModal(false);
              }}
            >
              {t('exportKeystore.warningModalConfirmButton')}
            </Button>

            <Button
              className="modal-close"
              onClick={() => {
                setShowWarningModal(false);
              }}
              type="button"
              view="transparent"
            />
          </div>
        </div>
      </Modal>
    </form>
  );
}
