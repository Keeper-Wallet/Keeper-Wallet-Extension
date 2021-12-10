import { Money } from '@waves/data-entities';
import { BigNumber } from '@waves/bignumber';
import * as React from 'react';
import { Trans } from 'react-i18next';
import cn from 'classnames';
import { useAppSelector } from 'ui/store';
import { Avatar } from '../ui/avatar/Avatar';
import { Balance } from '../ui/balance/Balance';
import { Copy } from '../ui/copy/Copy';
import * as styles from './activeAccountCard.module.css';
import { Tooltip } from '../ui/tooltip';

interface Account {
  address: string;
  name: string;
  network: string;
}

interface Props {
  account: Account;
  balance: string | BigNumber | Money;
  onClick: (account: Account) => void;
  onCopy: () => void;
  onOtherAccountsClick: () => void;
  onShowQr: () => void;
  onSwapClick: () => void;
}

export function ActiveAccountCard({
  account,
  balance,
  onClick,
  onCopy,
  onOtherAccountsClick,
  onShowQr,
  onSwapClick,
}: Props) {
  const currentNetwork = useAppSelector(state => state.currentNetwork);

  return (
    <div className={styles.root} data-testid="activeAccountCard">
      <div className={styles.accountInfo}>
        <Avatar size={40} address={account.address} />

        <div className={styles.accountInfoText}>
          <div className={styles.accountName} data-testid="accountName">
            {account.name}
          </div>

          <Balance balance={balance} isShortFormat={false} showAsset split />
        </div>

        <Tooltip content={<Trans i18nKey="assets.inStorage" />}>
          {props => (
            <button
              className={cn(
                styles.buttonWallet,
                styles.buttonWallet_iconOnly,
                styles.otherAccountsButton
              )}
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
        {['mainnet', 'testnet'].includes(currentNetwork) && (
          <button
            className={cn('swapIconBlack', styles.buttonWallet)}
            onClick={onSwapClick}
          >
            <Trans i18nKey="activeAccountCard.swapButton" />
          </button>
        )}

        <span className={styles.controlsExpand} />

        <Tooltip content={<Trans i18nKey="copyAddress" />}>
          {props => (
            <Copy text={account.address} onCopy={onCopy}>
              <button
                className={cn(
                  styles.buttonWallet,
                  styles.buttonWallet_iconOnly,
                  'copyIconBlack'
                )}
                {...props}
              />
            </Copy>
          )}
        </Tooltip>

        <Tooltip content={<Trans i18nKey="showQR" />} placement="bottom-end">
          {props => (
            <button
              className={cn(
                styles.buttonWallet,
                styles.buttonWallet_iconOnly,
                'showQrIcon'
              )}
              onClick={onShowQr}
              {...props}
            />
          )}
        </Tooltip>
      </div>
    </div>
  );
}
