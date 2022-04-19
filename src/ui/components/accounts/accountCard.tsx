import * as React from 'react';
import { Trans } from 'react-i18next';
import { Money } from '@waves/data-entities';
import { BigNumber } from '@waves/bignumber';
import { Avatar } from '../ui/avatar/Avatar';
import { Balance } from '../ui/balance/Balance';
import * as styles from './accountCard.module.css';
import { Tooltip } from '../ui/tooltip';
import { Account } from '../../../accounts/types';

interface Props {
  account: Account;
  balance: string | BigNumber | Money;
  onClick: (account: Account) => void;
  onInfoClick: (account: Account) => void;
}

export function AccountCard({ account, balance, onClick, onInfoClick }: Props) {
  return (
    <div className={styles.root} data-testid="accountCard">
      <div className={styles.accountInfo}>
        <Avatar size={40} address={account.address} type={account.type} />

        <div className={styles.accountInfoText}>
          <div className={styles.accountName} data-testid="accountName">
            {account.name}
          </div>

          <Balance
            balance={balance}
            isShortFormat={false}
            showAsset
            showUsdAmount
            split
          />
        </div>
      </div>

      <div
        className={styles.selectableOverlay}
        onClick={() => {
          onClick(account);
        }}
      />

      <Tooltip content={<Trans i18nKey="accountCard.infoTooltip" />}>
        {props => (
          <button
            className={styles.infoButton}
            data-testid="accountInfoButton"
            type="button"
            onClick={() => {
              onInfoClick(account);
            }}
            {...props}
          >
            <svg className={styles.infoIcon} viewBox="0 0 28 26">
              <path d="M25 13c0 6.075-4.925 11-11 11S3 19.075 3 13 7.925 2 14 2s11 4.925 11 11ZM4 13c0 5.523 4.477 10 10 10s10-4.477 10-10S19.523 3 14 3 4 7.477 4 13Z" />
              <path d="M14 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm0 1a.75.75 0 0 0-.75.75v5.5a.75.75 0 0 0 1.5 0v-5.5A.75.75 0 0 0 14 11Z" />
            </svg>
          </button>
        )}
      </Tooltip>
    </div>
  );
}
