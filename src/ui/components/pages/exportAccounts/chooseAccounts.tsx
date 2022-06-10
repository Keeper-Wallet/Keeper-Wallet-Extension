import { Account, NetworkName } from 'accounts/types';
import cn from 'classnames';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar } from 'ui/components/ui/avatar/Avatar';
import { Button } from 'ui/components/ui/buttons/Button';
import { Modal } from 'ui/components/ui/modal/Modal';
import * as styles from './chooseAccounts.styl';

const allNetworks: NetworkName[] = ['mainnet', 'testnet', 'stagenet', 'custom'];

const networkLabels: Record<NetworkName, string> = {
  custom: 'Custom',
  mainnet: 'Mainnet',
  testnet: 'Testnet',
  stagenet: 'Stagenet',
};

interface Props {
  accounts: Account[];
  onSubmit: (selectedAccounts: Account[]) => void;
}

function isAccountExportable(account: Account) {
  return ['seed', 'encodedSeed', 'privateKey', 'debug'].includes(account.type);
}

export function ExportKeystoreChooseAccounts({ accounts, onSubmit }: Props) {
  const { t } = useTranslation();

  const [selected, setSelected] = React.useState(
    () =>
      new Set(
        accounts.filter(isAccountExportable).map(({ address }) => address)
      )
  );

  function toggleSelected(accounts: Account[], isSelected: boolean) {
    setSelected(prevSelected => {
      const newSelected = new Set(prevSelected);

      accounts.forEach(acc => {
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
    !accounts.every(isAccountExportable)
  );

  return (
    <form
      className={styles.root}
      onSubmit={event => {
        event.preventDefault();

        onSubmit(accounts.filter(({ address }) => selected.has(address)));
      }}
    >
      <h1 className={cn(styles.centered, 'margin1', 'title1')}>
        {t('exportKeystore.chooseAccountsTitle')}
      </h1>

      <p className={cn(styles.centered, 'margin1', 'body1', 'disabled500')}>
        {t('exportKeystore.chooseAccountsDesc')}
      </p>

      <div className={styles.accounts}>
        {allNetworks
          .map(
            network =>
              [
                network,
                accounts.filter(acc => acc.network === network),
              ] as const
          )
          .filter(([, accounts]) => accounts.length !== 0)
          .map(([network, accounts]) => (
            <div key={network} className={styles.accountsGroup}>
              <header className={styles.accountsGroupHeader}>
                <i className={cn(styles.accountsGroupIcon, 'networkIcon')} />

                <h2 className={styles.accountsGroupLabel}>
                  {networkLabels[network]}
                </h2>

                {accounts.some(isAccountExportable) && (
                  <input
                    checked={accounts
                      .filter(isAccountExportable)
                      .every(acc => selected.has(acc.address))}
                    className={styles.checkbox}
                    type="checkbox"
                    onChange={event => {
                      toggleSelected(accounts, event.currentTarget.checked);
                    }}
                  />
                )}
              </header>

              <ul className={styles.accountList}>
                {accounts.map(account => {
                  const isExportable = isAccountExportable(account);

                  return (
                    <li
                      key={account.address}
                      className={styles.accountListItem}
                      title={account.address}
                    >
                      <div className={styles.accountInfo}>
                        <Avatar
                          size={40}
                          address={account.address}
                          type={account.type}
                        />

                        <div className={styles.accountInfoText}>
                          <div className={styles.accountName}>
                            {account.name}
                          </div>

                          {!isExportable && (
                            <div className={styles.accountInfoNote}>
                              {t('exportKeystore.exportNotSupported')}
                            </div>
                          )}
                        </div>
                      </div>

                      {isExportable && (
                        <input
                          checked={selected.has(account.address)}
                          className={styles.checkbox}
                          name="selected"
                          type="checkbox"
                          value={account.address}
                          onChange={event => {
                            toggleSelected(
                              [account],
                              event.currentTarget.checked
                            );
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
          {t('exportKeystore.chooseAccountsExportBtn', {
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
