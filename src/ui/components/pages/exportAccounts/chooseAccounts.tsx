import * as styles from './chooseAccounts.styl';
import cn from 'classnames';
import * as React from 'react';
import { Button } from 'ui/components/ui/buttons/Button';
import { Trans } from 'react-i18next';
import { Avatar } from 'ui/components/ui/avatar/Avatar';

type Network = 'mainnet' | 'testnet' | 'stagenet' | 'custom';

export interface ExportKeystoreAccount {
  address: string;
  name: string;
  network: Network;
  networkCode: string;
}

const allNetworks: Network[] = ['mainnet', 'testnet', 'stagenet', 'custom'];

const networkLabels: Record<Network, string> = {
  custom: 'Custom',
  mainnet: 'Mainnet',
  testnet: 'Testnet',
  stagenet: 'Stagenet',
};

interface Props {
  accounts: ExportKeystoreAccount[];
  onSubmit: (selectedAccounts: ExportKeystoreAccount[]) => void;
}

export function ExportKeystoreChooseAccounts({ accounts, onSubmit }: Props) {
  const [selected, setSelected] = React.useState(
    () => new Set(accounts.map(({ address }) => address))
  );

  function toggleSelected(
    accounts: ExportKeystoreAccount[],
    isSelected: boolean
  ) {
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

  return (
    <form
      className={styles.root}
      onSubmit={event => {
        event.preventDefault();

        onSubmit(accounts.filter(({ address }) => selected.has(address)));
      }}
    >
      <h1 className={cn(styles.centered, 'margin1', 'title1')}>
        <Trans i18nKey="exportKeystore.chooseAccountsTitle" />
      </h1>

      <p className={cn(styles.centered, 'margin1', 'body1', 'disabled500')}>
        <Trans i18nKey="exportKeystore.chooseAccountsDesc" />
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
          .filter(([_, accounts]) => accounts.length !== 0)
          .map(([network, accounts]) => (
            <div key={network} className={styles.accountsGroup}>
              <header className={styles.accountsGroupHeader}>
                <i className={cn(styles.accountsGroupIcon, 'networkIcon')} />

                <h2 className={styles.accountsGroupLabel}>
                  {networkLabels[network]}
                </h2>

                <input
                  checked={accounts.every(acc => selected.has(acc.address))}
                  className={styles.checkbox}
                  type="checkbox"
                  onChange={event => {
                    toggleSelected(accounts, event.currentTarget.checked);
                  }}
                />
              </header>

              <ul className={styles.accountList}>
                {accounts.map(account => (
                  <li
                    key={account.address}
                    className={styles.accountListItem}
                    title={account.address}
                  >
                    <div className={styles.accountInfo}>
                      <Avatar size={40} address={account.address} />

                      <div className={styles.accountInfoText}>
                        <div className={styles.accountName}>{account.name}</div>
                      </div>
                    </div>

                    <input
                      checked={selected.has(account.address)}
                      className={styles.checkbox}
                      name="selected"
                      type="checkbox"
                      value={account.address}
                      onChange={event => {
                        toggleSelected([account], event.currentTarget.checked);
                      }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>

      <div className={styles.buttons}>
        <Button
          data-testid="exportButton"
          disabled={selected.size === 0}
          type="submit"
        >
          <Trans
            i18nKey="exportKeystore.chooseAccountsExportBtn"
            count={selected.size}
          />
        </Button>
      </div>
    </form>
  );
}
