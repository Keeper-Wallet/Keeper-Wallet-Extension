import { Asset, Money } from '@waves/data-entities';
import clsx from 'clsx';
import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import { compareAccountsByLastUsed } from 'preferences/utils';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { selectAccount } from 'store/actions/localState';
import { SearchInput } from 'ui/components/ui/searchInput/searchInput';
import background from 'ui/services/Background';

import { startPolling } from '../../../_core/polling';
import { AccountCard } from '../accounts/accountCard';
import { Tooltip } from '../ui/tooltip';
import * as styles from './otherAccounts.module.css';

export function OtherAccountsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = usePopupDispatch();
  const accounts = usePopupSelector(state => state.accounts);
  const activeAccount = usePopupSelector(state =>
    state.accounts.find(
      ({ address }) => address === state.selectedAccount?.address,
    ),
  );
  const assets = usePopupSelector(state => state.assets);
  const balances = usePopupSelector(state => state.balances);

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
            account.username.toLowerCase().indexOf(term.toLowerCase()) !== -1)),
    )
    .sort(compareAccountsByLastUsed);

  const wavesAsset = new Asset(assets.WAVES);

  const balancesMoney = Object.fromEntries(
    Object.entries(balances).map(([key, balance]) => [
      key,
      typeof balance?.regular !== 'undefined'
        ? new Money(balance.regular, wavesAsset)
        : undefined,
    ]),
  );

  const addAccount = () => {
    background.showTab(`${window.location.origin}/accounts.html`, 'accounts');
    navigate('/', { replace: true });
  };

  useEffect(
    () => startPolling(10000, () => background.updateOtherAccountsBalances()),
    [],
  );

  return (
    <div className={styles.root} data-testid="otherAccountsPage">
      <header className={styles.header}>
        <h2 className={styles.title}>{t('otherAccounts.title')}</h2>

        <Tooltip content={t('otherAccounts.addAccount')}>
          {props => (
            <button
              {...props}
              className={clsx(
                styles.addAccountButton,
                styles.addAccountButton_small,
              )}
              type="button"
              onClick={addAccount}
            />
          )}
        </Tooltip>
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
                : 'otherAccounts.noAccountsFound',
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
            className={clsx(
              styles.addAccountButton,
              styles.addAccountButton_full,
            )}
            data-testid="addAccountButton"
            type="button"
            onClick={addAccount}
          >
            {t('otherAccounts.addAccount')}
          </button>
        </div>
      </div>
    </div>
  );
}
