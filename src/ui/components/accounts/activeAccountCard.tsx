import * as React from 'react';
import BigNumber from '@waves/bignumber';
import { Money } from '@waves/data-entities';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import { useAppSelector } from 'ui/store';
import { Avatar } from '../ui/avatar/Avatar';
import { Balance } from '../ui/balance/Balance';
import { Copy } from '../ui/copy/Copy';
import * as styles from './activeAccountCard.module.css';
import { Tooltip } from '../ui/tooltip';
import { Loader } from '../ui/loader';
import { PreferencesAccount } from 'preferences/types';

const UsdAmount = ({ amount }: { amount: BigNumber | null }) =>
  amount !== null ? (
    <p className={styles.accountAmount}>{`$${amount.toFixed(2)}`}</p>
  ) : (
    <Loader />
  );

interface Props {
  account: PreferencesAccount;
  wavesBalance?: string | BigNumber | Money;
  amountInUsd: BigNumber | null;
  onClick: (account: PreferencesAccount) => void;
  onCopy: () => void;
  onOtherAccountsClick: () => void;
  onShowQr: () => void;
  onSwapClick: () => void;
}

export function ActiveAccountCard({
  account,
  wavesBalance,
  amountInUsd,
  onClick,
  onCopy,
  onOtherAccountsClick,
  onShowQr,
  onSwapClick,
}: Props) {
  const { t } = useTranslation();
  const currentNetwork = useAppSelector(state => state.currentNetwork);
  const isMainnet = currentNetwork === 'mainnet';

  return (
    <div className={styles.root} data-testid="activeAccountCard">
      <div className={styles.accountInfo}>
        <Avatar size={40} address={account.address} type={account.type} />

        <div className={styles.accountInfoText}>
          <div className={styles.accountName} data-testid="accountName">
            {account.name}
          </div>

          {isMainnet ? (
            <UsdAmount amount={amountInUsd} />
          ) : (
            <Balance
              balance={wavesBalance}
              isShortFormat={false}
              showAsset
              split
            />
          )}
        </div>

        <Tooltip content={t('assets.inStorage')}>
          {props => (
            <button
              className={cn(styles.iconButton, styles.otherAccountsButton)}
              data-testid="otherAccountsButton"
              type="button"
              onClick={onOtherAccountsClick}
              {...props}
            />
          )}
        </Tooltip>
      </div>

      <div
        className={styles.selectableOverlay}
        onClick={() => {
          onClick(account);
        }}
      />

      <div className={styles.controls}>
        {isMainnet && (
          <button className={styles.button} onClick={onSwapClick}>
            <svg width="14" height="14" fill="currentColor">
              <path d="m11.56 4.01-1.266-1.268a.6.6 0 0 1 .848-.848l2.291 2.29a.6.6 0 0 1 0 .85l-2.29 2.29a.6.6 0 1 1-.85-.848l1.268-1.267H4.99a.6.6 0 0 1 0-1.2h6.57ZM2.44 9.99l1.266 1.268a.6.6 0 1 1-.848.848L.567 9.816a.6.6 0 0 1 0-.85l2.29-2.29a.6.6 0 1 1 .849.848L2.439 8.791h6.57a.6.6 0 0 1 0 1.2h-6.57Z" />
            </svg>

            <span>{t('activeAccountCard.swapButton')}</span>
          </button>
        )}

        <span className={styles.controlsExpand} />

        <Tooltip content={t('copyAddress')}>
          {props => (
            <Copy text={account.address} onCopy={onCopy}>
              <button
                className={cn(styles.iconButton, 'copyIconBlack')}
                {...props}
              />
            </Copy>
          )}
        </Tooltip>

        <Tooltip content={t('showQR')} placement="bottom-end">
          {props => (
            <button
              className={cn(styles.iconButton, 'showQrIcon')}
              onClick={onShowQr}
              {...props}
            />
          )}
        </Tooltip>
      </div>
    </div>
  );
}
