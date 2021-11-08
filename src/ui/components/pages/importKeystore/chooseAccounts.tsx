import * as styles from './chooseAccounts.styl';
import cn from 'classnames';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { Avatar } from 'ui/components/ui/avatar/Avatar';
import { Button } from 'ui/components/ui';

export interface ImportKeystoreExistingAccount {
  address: string;
  name: string;
  network: string;
}

export interface ImportKeystoreAccount {
  address: string;
  name: string;
  networkCode: string;
  seed: string;
}

export type ImportKeystoreNetwork =
  | 'mainnet'
  | 'testnet'
  | 'stagenet'
  | 'custom';
export type ImportKeystoreProfiles = Record<
  ImportKeystoreNetwork,
  { accounts: ImportKeystoreAccount[] }
>;

const allNetworks: ImportKeystoreNetwork[] = [
  'mainnet',
  'testnet',
  'stagenet',
  'custom',
];

const networkLabels: Record<ImportKeystoreNetwork, string> = {
  custom: 'Custom',
  mainnet: 'Mainnet',
  testnet: 'Testnet',
  stagenet: 'Stagenet',
};

interface Props {
  allNetworksAccounts: ImportKeystoreExistingAccount[];
  profiles: ImportKeystoreProfiles;
  onSkip: () => void;
  onSubmit: (selectedAccounts: ImportKeystoreAccount[]) => void;
}

export function ImportKeystoreChooseAccounts({
  allNetworksAccounts,
  profiles,
  onSkip,
  onSubmit,
}: Props) {
  const existingAccounts = new Set(allNetworksAccounts.map(acc => acc.address));

  const [selected, setSelected] = React.useState(
    () =>
      new Set(
        Object.values(profiles)
          .reduce(
            (accounts, profile) => accounts.concat(profile.accounts),
            [] as ImportKeystoreAccount[]
          )
          .filter(({ address }) => !existingAccounts.has(address))
          .map(({ address }) => address)
      )
  );

  function toggleSelected(
    accounts: ImportKeystoreAccount[],
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

        onSubmit(
          Object.values(profiles)
            .reduce(
              (accounts, profile) => accounts.concat(profile.accounts),
              [] as ImportKeystoreAccount[]
            )
            .filter(({ address }) => selected.has(address))
        );
      }}
    >
      <h2 className={cn(styles.centered, 'margin1', 'title1')}>
        <Trans i18nKey="importKeystore.chooseAccountsTitle" />
      </h2>

      <p className={cn(styles.centered, 'margin1', 'body1', 'disabled500')}>
        <Trans i18nKey="importKeystore.chooseAccountsDesc" />
      </p>

      <div className={styles.accounts}>
        {allNetworks
          .map(network => [network, profiles[network].accounts] as const)
          .filter(([_, accounts]) => accounts.length !== 0)
          .map(([network, accounts]) => {
            const newAccounts = accounts.filter(
              acc => !existingAccounts.has(acc.address)
            );

            return (
              <div
                key={network}
                className={styles.accountsGroup}
                data-testid="accountsGroup"
              >
                <header className={styles.accountsGroupHeader}>
                  <i className={cn(styles.accountsGroupIcon, 'networkIcon')} />

                  <h2
                    className={styles.accountsGroupLabel}
                    data-testid="accountsGroupLabel"
                  >
                    {networkLabels[network]}
                  </h2>

                  {newAccounts.length !== 0 && (
                    <input
                      checked={newAccounts.every(acc =>
                        selected.has(acc.address)
                      )}
                      className={styles.checkbox}
                      type="checkbox"
                      onChange={event => {
                        toggleSelected(
                          accounts.filter(
                            acc => !existingAccounts.has(acc.address)
                          ),
                          event.currentTarget.checked
                        );
                      }}
                    />
                  )}
                </header>

                <ul className={styles.accountList}>
                  {accounts.map(account => {
                    const existingAccount = allNetworksAccounts.find(
                      acc => acc.address === account.address
                    );

                    return (
                      <li
                        key={account.address}
                        className={styles.accountListItem}
                        data-testid="accountCard"
                        title={account.address}
                      >
                        <div className={styles.accountInfo}>
                          <Avatar size={40} address={account.address} />

                          <div className={styles.accountInfoText}>
                            <div
                              className={styles.accountName}
                              data-testid="accountName"
                            >
                              {account.name}
                            </div>

                            {existingAccount && (
                              <div
                                className={cn(
                                  styles.accountName,
                                  'body3',
                                  'disabled500'
                                )}
                              >
                                <Trans
                                  i18nKey="importKeystore.chooseAccountsExistingAccountNote"
                                  values={{
                                    existingName: existingAccount.name,
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {!existingAccount && (
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
            );
          })}
      </div>

      <div className={styles.buttons}>
        {selected.size === 0 ? (
          <Button
            data-testid="skipButton"
            type="interface"
            onClick={() => {
              onSkip();
            }}
          >
            <Trans i18nKey="importKeystore.chooseAccountsSkipBtn" />
          </Button>
        ) : (
          <Button data-testid="submitButton" type="submit">
            <Trans
              i18nKey="importKeystore.chooseAccountsImportBtn"
              count={selected.size}
            />
          </Button>
        )}
      </div>
    </form>
  );
}
