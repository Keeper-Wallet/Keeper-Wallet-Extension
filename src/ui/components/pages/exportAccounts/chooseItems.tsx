import clsx from 'clsx';
import { NetworkName } from 'networks/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BlockchainType,
  MultiWallet,
  NetworkType,
  NETWORK_NAME_MAP,
} from 'services/types';
import { Button } from 'ui/components/ui/buttons/Button';
import { Modal } from 'ui/components/ui/modal/Modal';

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

const networkLabels: Record<NetworkName, string> = {
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
    // For MultiWallet, check if it has a seed or privateKey
    return (
      ['seed', 'encodedSeed', 'privateKey', 'debug'].includes(item.type) &&
      (('seed' in item && item.seed) ||
        ('privateKey' in item && item.privateKey))
    );
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
          networkLabel: `Unit0 ${networkLabels[networkName]}`,
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

  // Flatten and group MultiWallet items by wallet ID
  const groupedAccounts =
    items[0] && 'coins' in items[0]
      ? flattenMultiWallets(items as MultiWallet[])
      : {};

  // Selection state uses wallet IDs
  const [selectedWallets, setSelectedWallets] = useState<Set<string>>(
    () => new Set(Object.keys(groupedAccounts)),
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

  // Map selected wallets back to MultiWallet items for submission
  const getSelectedWallets = (): T[] => {
    if (items[0] && 'coins' in items[0]) {
      // For MultiWallets, return the original wallets that are selected
      return (items as MultiWallet[]).filter(wallet =>
        selectedWallets.has(wallet.id),
      ) as T[];
    } else {
      // For contacts (not implemented in this example)
      return items as T[];
    }
  };

  // Check if any wallets aren't exportable
  const hasNonExportableWallets = items.some(item => !isExportable(item));
  const [showWarningModal, setShowWarningModal] = useState(
    hasNonExportableWallets,
  );

  return (
    <form
      className={styles.root}
      onSubmit={event => {
        event.preventDefault();
        onSubmit(getSelectedWallets());
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

      <div className={styles.accounts}>
        {Object.entries(groupedAccounts).map(([walletId, networks]) => {
          // Get wallet info from the first network item
          const walletInfo = networks[0];
          const isExportableWallet = items.some(
            item => 'id' in item && item.id === walletId && isExportable(item),
          );

          return (
            <div key={walletId} className={styles.accountsGroup}>
              <header className={styles.accountsGroupHeader}>
                <i className={clsx(styles.accountsGroupIcon, 'accountIcon')} />

                <h2 className={styles.accountsGroupLabel}>{walletInfo.name}</h2>

                {isExportableWallet && (
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
                )}
              </header>

              <ul className={styles.accountList}>
                {networks.map(network => (
                  <li
                    key={network.id}
                    className={styles.accountListItem}
                    title={network.address}
                  >
                    <div className={styles.accountInfo}>
                      <div className={styles.accountInfoText}>
                        <div className={styles.accountName}>
                          {network.networkLabel}
                        </div>
                        <div className={styles.accountInfoNote}>
                          {network.address}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className={styles.buttons}>
        <Button
          data-testid="exportButton"
          disabled={selectedWallets.size === 0}
          type="submit"
          view="submit"
        >
          {type === 'contacts'
            ? t('exportKeystore.chooseContactsExportBtn')
            : t('exportKeystore.chooseAccountsExportBtn', {
                count: selectedWallets.size,
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
