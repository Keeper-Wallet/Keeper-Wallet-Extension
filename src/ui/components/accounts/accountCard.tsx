import { BigNumber } from '@waves/bignumber';
import { Money } from '@waves/data-entities';
import { PreferencesAccount } from 'preferences/types';
import { useTranslation } from 'react-i18next';

import { Avatar } from '../ui/avatar/Avatar';
import { Balance } from '../ui/balance/Balance';
import { Tooltip } from '../ui/tooltip';
import * as styles from './accountCard.module.css';

interface Props {
  account: PreferencesAccount;
  balance: string | BigNumber | Money | undefined;
  onClick: (account: PreferencesAccount) => void;
  onInfoClick: (account: PreferencesAccount) => void;
}

export function AccountCard({ account, balance, onClick, onInfoClick }: Props) {
  const { t } = useTranslation();
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

      <Tooltip content={t('accountCard.infoTooltip')}>
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
