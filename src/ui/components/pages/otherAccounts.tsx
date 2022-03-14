import * as React from 'react';
import { Trans } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'ui/store';
import { Asset, Money } from '@waves/data-entities';
import { compareAccountsByLastUsed } from 'accounts/utils';
import { setActiveAccount } from 'ui/actions/assets';
import { PAGES } from 'ui/pageConfig';
import { selectAccount } from 'ui/actions/localState';
import { AccountCard } from '../accounts/accountCard';
import * as styles from './otherAccounts.module.css';
import { SearchInput } from 'ui/components/ui/searchInput/searchInput';

interface Props {
  setTab: (newTab: string) => void;
}

export function OtherAccountsPage({ setTab }: Props) {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector(state => state.accounts);
  const activeAccount = useAppSelector(state =>
    state.accounts.find(
      ({ address }) => address === state.selectedAccount.address
    )
  );
  const assets = useAppSelector(state => state.assets);
  const balances = useAppSelector(state => state.balances);

  const [term, setTerm] = React.useState<string>('');

  const otherAccounts = accounts
    .filter(
      account =>
        account.address !== activeAccount.address &&
        (!term ||
          account.name.toLowerCase().indexOf(term.toLowerCase()) !== -1 ||
          account.address === term ||
          account.publicKey === term ||
          (account.type === 'wx' &&
            account.username.toLowerCase().indexOf(term.toLowerCase()) !== -1))
    )
    .sort(compareAccountsByLastUsed);

  const balancesMoney: Record<string, Money> = {};

  const assetInfo = assets['WAVES'];

  if (assetInfo) {
    const asset = new Asset(assetInfo);

    Object.entries<{ available: string; leasedOut: string }>(balances).forEach(
      ([key, { available }]) => {
        balancesMoney[key] = new Money(available, asset);
      }
    );
  }

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h2 className={styles.title}>
          <Trans i18nKey="otherAccounts.title" />
        </h2>
      </header>

      <div className={styles.accounts}>
        <div className="margin1 margin-min-top">
          <SearchInput
            autoFocus
            value={term ?? ''}
            onInput={e => setTerm(e.target.value)}
            onClear={() => setTerm('')}
            data-testid="accountsSearchInput"
          />
        </div>

        {otherAccounts.length === 0 ? (
          <p className={styles.noAccountsNote} data-testid="accountsNote">
            <Trans
              i18nKey={
                !term
                  ? 'otherAccounts.noAccountsNote'
                  : 'otherAccounts.noAccountsFound'
              }
            />
          </p>
        ) : (
          otherAccounts.map(account => (
            <AccountCard
              key={account.address}
              account={account}
              balance={balancesMoney[account.address]}
              onClick={account => {
                dispatch(selectAccount(account));
                setTab(PAGES.ASSETS);
              }}
              onInfoClick={account => {
                dispatch(setActiveAccount(account));
                setTab(PAGES.ACCOUNT_INFO);
              }}
            />
          ))
        )}

        <div className={styles.addAccount}>
          <button
            className={styles.addAccountButton}
            data-testid="addAccountButton"
            type="button"
            onClick={() => setTab(PAGES.IMPORT_FROM_ASSETS)}
          >
            <Trans i18nKey="otherAccounts.addAccount" />
          </button>
        </div>
      </div>
    </div>
  );
}
