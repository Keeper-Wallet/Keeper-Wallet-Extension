import { Asset, Money } from '@waves/data-entities';
import { useAppDispatch, useAppSelector } from 'popup/store/react';
import { compareAccountsByLastUsed } from 'preferences/utils';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { selectAccount } from 'store/actions/localState';
import { SearchInput } from 'ui/components/ui/searchInput/searchInput';
import background from 'ui/services/Background';

import { AccountCard } from '../accounts/accountCard';
import * as styles from './otherAccounts.module.css';

export function OtherAccountsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const accounts = useAppSelector(state => state.accounts);
  const activeAccount = useAppSelector(state =>
    state.accounts.find(
      ({ address }) => address === state.selectedAccount?.address
    )
  );
  const assets = useAppSelector(state => state.assets);
  const balances = useAppSelector(state => state.balances);

  const [term, setTerm] = useState<string>('');

  const otherAccounts = accounts
    .filter(
      account =>
        account.address !== activeAccount?.address &&
        (!term ||
          account.name.toLowerCase().indexOf(term.toLowerCase()) !== -1 ||
          account.address === term ||
          account.publicKey === term ||
          (account.type === 'wx' &&
            account.username.toLowerCase().indexOf(term.toLowerCase()) !== -1))
    )
    .sort(compareAccountsByLastUsed);

  const balancesMoney: Record<string, Money> = {};

  const assetInfo = assets.WAVES;

  if (assetInfo) {
    const asset = new Asset(assetInfo);

    Object.entries(balances).forEach(([key, balance]) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { available } = balance!;

      balancesMoney[key] = new Money(available, asset);
    });
  }

  return (
    <div className={styles.root} data-testid="otherAccountsPage">
      <header className={styles.header}>
        <h2 className={styles.title}>{t('otherAccounts.title')}</h2>
      </header>

      <div className={styles.accounts}>
        <div className="margin1 margin-min-top">
          <SearchInput
            autoFocus
            value={term ?? ''}
            onInput={e => setTerm(e.currentTarget.value)}
            onClear={() => setTerm('')}
            data-testid="accountsSearchInput"
          />
        </div>

        {otherAccounts.length === 0 ? (
          <p className={styles.noAccountsNote} data-testid="accountsNote">
            {t(
              !term
                ? 'otherAccounts.noAccountsNote'
                : 'otherAccounts.noAccountsFound'
            )}
          </p>
        ) : (
          otherAccounts.map(account => (
            <AccountCard
              key={account.address}
              account={account}
              balance={balancesMoney[account.address]}
              onClick={clickedAccount => {
                dispatch(selectAccount(clickedAccount));
                navigate('/', { replace: true });
              }}
              onInfoClick={clickedAccount => {
                navigate(`/account-info/${clickedAccount.address}`);
              }}
            />
          ))
        )}

        <div className={styles.addAccount}>
          <button
            className={styles.addAccountButton}
            data-testid="addAccountButton"
            type="button"
            onClick={() => {
              background.showTab(
                `${window.location.origin}/accounts.html`,
                'accounts'
              );
              navigate('/', { replace: true });
            }}
          >
            {t('otherAccounts.addAccount')}
          </button>
        </div>
      </div>
    </div>
  );
}
