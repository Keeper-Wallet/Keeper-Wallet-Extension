import { Asset, Money } from '@waves/data-entities';
import clsx from 'clsx';
import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import { isMultichainAccount } from 'preferences/types';
import { compareAccountsByLastUsed } from 'preferences/utils';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { selectAccount } from 'store/actions/localState';
import { SearchInput } from 'ui/components/ui/searchInput/searchInput';
import background from 'ui/services/Background';
import { getActiveAccount } from 'ui/utils/getActiveAccount';

import { startPolling } from '../../../_core/polling';
import { AccountCard } from '../accounts/accountCard';
import { Tooltip } from '../ui/tooltip';
import * as styles from './otherAccounts.module.css';

export function OtherAccountsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = usePopupDispatch();
  const accounts = usePopupSelector(state => state.allNetworksAccounts);
  const currentNetwork = usePopupSelector(state => state.currentNetwork);
  const activeAccount = usePopupSelector(state =>
    getActiveAccount(state.accounts, state.selectedAccount),
  );
  const assets = usePopupSelector(state => state.assets);
  const balances = usePopupSelector(state => state.balances);

  const [term, setTerm] = useState<string>('');

  const otherAccounts = accounts
    .filter(account => {
      if (
        activeAccount &&
        account.id === activeAccount.id &&
        account.accountType === activeAccount.accountType
      ) {
        return false;
      }

      if (!term) {
        return true;
      }

      const lowerTerm = term.toLowerCase();

      if (account.name.toLowerCase().includes(lowerTerm)) {
        return true;
      }

      if (account.accountType === 'waves') {
        if (account.address === term || account.publicKey === term) {
          return true;
        }
        if (
          account.type === 'wx' &&
          'username' in account &&
          account.username &&
          account.username.toLowerCase().includes(lowerTerm)
        ) {
          return true;
        }
      }

      if (isMultichainAccount(account)) {
        if (
          account.accounts.waves?.address === term ||
          account.accounts.ethereum?.address === term
        ) {
          return true;
        }
      }

      return false;
    })
    .sort(compareAccountsByLastUsed);

  const balancesMoney = Object.fromEntries(
    Object.entries(balances).map(([key, balance]) => {
      if (!balance) return [key, undefined];
      if (balance.assets && balance.assets.unit0) {
        const unit0Asset = assets.unit0;
        if (unit0Asset) {
          return [
            key,
            new Money(balance.assets.unit0.balance, new Asset(unit0Asset)),
          ];
        }
      }
      if (typeof balance?.regular !== 'undefined' && assets.WAVES) {
        return [key, new Money(balance.regular, new Asset(assets.WAVES))];
      }
      return [key, undefined];
    }),
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
          otherAccounts.map(account => {
            let balance;
            if (isMultichainAccount(account)) {
              const chainAccount = account.accounts.ethereum;
              balance = chainAccount
                ? balancesMoney[chainAccount.address]
                : undefined;
            } else {
              balance = balancesMoney[account.address];
            }
            return (
              <AccountCard
                key={account.id + account.accountType}
                account={account}
                balance={balance}
                onClick={clickedAccount => {
                  dispatch(selectAccount(clickedAccount));
                  navigate('/', { replace: true });
                }}
                onInfoClick={clickedAccount => {
                  if (isMultichainAccount(account)) {
                    navigate(`/account-info/${account.id}?type=multichain`);
                  } else {
                    navigate(`/account-info/${account.address}`);
                  }
                }}
              />
            );
          })
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
