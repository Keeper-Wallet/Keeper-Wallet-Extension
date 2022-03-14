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
import { Button, BUTTON_TYPE, Input } from '../ui';
import cn from 'classnames';

interface SearchProps extends React.HTMLProps<HTMLInputElement> {
  onInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
}

function SearchInput({ value, onInput, onClear, ...restProps }: SearchProps) {
  const inputRef = React.createRef<HTMLInputElement>();

  return (
    <div className={styles.searchInputWrapper}>
      <Input
        {...restProps}
        ref={inputRef}
        className={cn(styles.searchInput, 'font300')}
        onInput={onInput}
        value={value}
        spellCheck={false}
      />
      {typeof onClear === 'function' && value && (
        <Button
          className={styles.searchClear}
          type={BUTTON_TYPE.CUSTOM}
          onClick={() => {
            inputRef.current.focus();
            onClear();
          }}
        >
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
            <path
              d="M10.1523 9L14.7614 4.39091C15.0795 4.07272 15.0795 3.55683 14.7614 3.23864C14.4432 2.92045 13.9273 2.92045 13.6091 3.23864L9 7.84773L4.39091 3.23864C4.07272 2.92045 3.55683 2.92045 3.23864 3.23864C2.92045 3.55683 2.92045 4.07272 3.23864 4.39091L7.84773 9L3.23864 13.6091C2.92045 13.9273 2.92045 14.4432 3.23864 14.7614C3.55683 15.0795 4.07272 15.0795 4.39091 14.7614L9 10.1523L13.6091 14.7614C13.9273 15.0795 14.4432 15.0795 14.7614 14.7614C15.0795 14.4432 15.0795 13.9273 14.7614 13.6091L10.1523 9Z"
              fill="currentColor"
            />
          </svg>
        </Button>
      )}
    </div>
  );
}

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
          account.publicKey === term)
      // todo search by alias and email
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
          />
        </div>

        {otherAccounts.length === 0 ? (
          <p className={styles.noAccountsNote}>
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
