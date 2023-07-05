import clsx from 'clsx';
import { type KeystoreAccount, type KeystoreProfiles } from 'keystore/types';
import { NetworkName } from 'networks/types';
import { type PreferencesAccount } from 'preferences/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui/components/ui';
import { Avatar } from 'ui/components/ui/avatar/Avatar';

import * as styles from './chooseAccounts.styl';

const allNetworks: NetworkName[] = Object.values(NetworkName);

const networkLabels: Record<NetworkName, string> = {
  custom: 'Custom',
  mainnet: 'Mainnet',
  testnet: 'Testnet',
  stagenet: 'Stagenet',
};

interface Props {
  allNetworksAccounts: PreferencesAccount[];
  profiles: KeystoreProfiles;
  onSkip: () => void;
  onSubmit: (selectedAccounts: KeystoreAccount[]) => void;
}

export function ImportKeystoreChooseAccounts({
  allNetworksAccounts,
  profiles,
  onSkip,
  onSubmit,
}: Props) {
  const { t } = useTranslation();
  const existingAccounts = new Set(allNetworksAccounts.map(acc => acc.address));

  const [selected, setSelected] = useState(
    () =>
      new Set(
        Object.values(profiles)
          .flatMap(profile => profile.accounts)
          .filter(({ address }) => !existingAccounts.has(address))
          .map(({ address }) => address),
      ),
  );

  function toggleSelected(accounts: KeystoreAccount[], isSelected: boolean) {
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
      data-testid="chooseAccountsForm"
      className={styles.root}
      onSubmit={event => {
        event.preventDefault();

        onSubmit(
          Object.values(profiles)
            .flatMap(profile => profile.accounts)
            .filter(({ address }) => selected.has(address)),
        );
      }}
    >
      <h2 className={clsx(styles.title, 'title1')}>
        {t('importKeystore.chooseAccountsTitle')}
      </h2>

      <p className={clsx(styles.description, 'body1', 'disabled500')}>
        {t('importKeystore.chooseAccountsDesc')}
      </p>

      <div className={styles.accounts}>
        {allNetworks
          .map(network => [network, profiles[network].accounts] as const)
          .filter(([, accounts]) => accounts.length !== 0)
          .map(([network, accounts]) => {
            const newAccounts = accounts.filter(
              acc => !existingAccounts.has(acc.address),
            );

            return (
              <div
                key={network}
                className={styles.accountsGroup}
                data-testid="accountsGroup"
              >
                <header className={styles.accountsGroupHeader}>
                  <i
                    className={clsx(styles.accountsGroupIcon, 'networkIcon')}
                  />

                  <h2
                    className={styles.accountsGroupLabel}
                    data-testid="accountsGroupLabel"
                  >
                    {networkLabels[network]}
                  </h2>

                  {newAccounts.length !== 0 && (
                    <input
                      checked={newAccounts.every(acc =>
                        selected.has(acc.address),
                      )}
                      type="checkbox"
                      onChange={event => {
                        toggleSelected(
                          accounts.filter(
                            acc => !existingAccounts.has(acc.address),
                          ),
                          event.currentTarget.checked,
                        );
                      }}
                    />
                  )}
                </header>

                <ul className={styles.accountList}>
                  {accounts.map(account => {
                    const existingAccount = allNetworksAccounts.find(
                      acc => acc.address === account.address,
                    );

                    return (
                      <li
                        key={account.address}
                        className={styles.accountListItem}
                        data-testid="accountCard"
                        title={account.address}
                      >
                        <div className={styles.accountInfo}>
                          <Avatar
                            size={32}
                            address={account.address}
                            type={account.type}
                          />

                          <div className={styles.accountInfoText}>
                            <div
                              className={styles.accountName}
                              data-testid="accountName"
                            >
                              {account.name}
                            </div>

                            {existingAccount && (
                              <div
                                className={clsx(
                                  styles.accountName,
                                  'body3',
                                  'disabled500',
                                )}
                              >
                                {t(
                                  'importKeystore.chooseAccountsExistingAccountNote',
                                  { existingName: existingAccount.name },
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {!existingAccount && (
                          <input
                            checked={selected.has(account.address)}
                            name="selected"
                            type="checkbox"
                            value={account.address}
                            onChange={event => {
                              toggleSelected(
                                [account],
                                event.currentTarget.checked,
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
            onClick={() => {
              onSkip();
            }}
          >
            {t('importKeystore.chooseAccountsSkipBtn')}
          </Button>
        ) : (
          <Button data-testid="submitButton" type="submit" view="submit">
            {t('importKeystore.chooseAccountsImportBtn', {
              count: selected.size,
            })}
          </Button>
        )}
      </div>
    </form>
  );
}
