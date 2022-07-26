import { NetworkName } from 'networks/types';
import cn from 'classnames';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar } from 'ui/components/ui/avatar/Avatar';
import { Button } from 'ui/components/ui/buttons/Button';
import { Modal } from 'ui/components/ui/modal/Modal';
import { Ellipsis } from 'ui/components/ui/ellipsis/Ellipsis';
import * as styles from './chooseItems.styl';
import { PreferencesAccount } from 'preferences/types';

const allNetworks: NetworkName[] = Object.values(NetworkName);

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

export function isExportable(item: PreferencesAccount | Contact) {
  return (
    !('type' in item) ||
    ['seed', 'encodedSeed', 'privateKey', 'debug'].includes(item.type)
  );
}

export function ExportKeystoreChooseItems<
  T extends PreferencesAccount | Contact
>({ items, type, onSubmit }: Props<T>) {
  const { t } = useTranslation();

  const [selected, setSelected] = React.useState(
    () => new Set(items.filter(isExportable).map(({ address }) => address))
  );

  function toggleSelected(
    items: (PreferencesAccount | Contact)[],
    isSelected: boolean
  ) {
    setSelected(prevSelected => {
      const newSelected = new Set(prevSelected);

      items.forEach(acc => {
        if (isSelected) {
          newSelected.add(acc.address);
        } else {
          newSelected.delete(acc.address);
        }
      });

      return newSelected;
    });
  }

  const [showWarningModal, setShowWarningModal] = React.useState(
    !items.every(isExportable)
  );

  return (
    <form
      className={styles.root}
      onSubmit={event => {
        event.preventDefault();
        onSubmit(items.filter(({ address }) => selected.has(address)));
      }}
    >
      <h1 className={cn(styles.centered, 'margin1', 'title1')}>
        {t(
          type === 'contacts'
            ? 'exportKeystore.chooseContactsTitle'
            : 'exportKeystore.chooseAccountsTitle'
        )}
      </h1>

      <p className={cn(styles.centered, 'margin1', 'body1', 'disabled500')}>
        {t(
          type === 'contacts'
            ? 'exportKeystore.chooseContactsDesc'
            : 'exportKeystore.chooseAccountsDesc'
        )}
      </p>

      <div className={styles.accounts}>
        {allNetworks
          .map<[NetworkName, (PreferencesAccount | Contact)[]]>(network => [
            network,
            items.filter(acc => acc.network === network),
          ])
          .filter(([, items]) => items.length !== 0)
          .map(([network, items]) => (
            <div key={network} className={styles.accountsGroup}>
              <header className={styles.accountsGroupHeader}>
                <i className={cn(styles.accountsGroupIcon, 'networkIcon')} />

                <h2 className={styles.accountsGroupLabel}>
                  {networkLabels[network]}
                </h2>

                {items.some(isExportable) && (
                  <input
                    checked={items
                      .filter(isExportable)
                      .every(acc => selected.has(acc.address))}
                    className={styles.checkbox}
                    type="checkbox"
                    onChange={event => {
                      toggleSelected(items, event.currentTarget.checked);
                    }}
                  />
                )}
              </header>

              <ul className={styles.accountList}>
                {items.map(item => {
                  const showExportable = isExportable(item);

                  return (
                    <li
                      key={item.address}
                      className={styles.accountListItem}
                      title={item.address}
                    >
                      <div className={styles.accountInfo}>
                        <Avatar
                          size={32}
                          address={item.address}
                          type={'type' in item ? item.type : undefined}
                        />

                        <div className={styles.accountInfoText}>
                          <div className={styles.accountName}>{item.name}</div>

                          {type === 'contacts' && (
                            <Ellipsis text={item.address} size={8} />
                          )}

                          {!showExportable && (
                            <div className={styles.accountInfoNote}>
                              {t('exportKeystore.exportNotSupported')}
                            </div>
                          )}
                        </div>
                      </div>

                      {showExportable && (
                        <input
                          checked={selected.has(item.address)}
                          className={styles.checkbox}
                          name="selected"
                          type="checkbox"
                          value={item.address}
                          onChange={event => {
                            toggleSelected([item], event.currentTarget.checked);
                          }}
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
      </div>

      <div className={styles.buttons}>
        <Button
          data-testid="exportButton"
          disabled={selected.size === 0}
          type="submit"
          view="submit"
        >
          {type === 'contacts'
            ? t('exportKeystore.chooseContactsExportBtn')
            : t('exportKeystore.chooseAccountsExportBtn', {
                count: selected.size,
              })}
        </Button>
      </div>

      <Modal animation={Modal.ANIMATION.FLASH} showModal={showWarningModal}>
        <div className="modal cover">
          <div className="modal-form">
            <h2 className={cn('margin1', 'title1')}>
              {t('exportKeystore.warningModalTitle')}
            </h2>

            <p className={cn('margin1', 'body1', 'disabled500')}>
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
