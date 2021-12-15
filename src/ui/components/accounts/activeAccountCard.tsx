import { Money } from '@waves/data-entities';
import { BigNumber } from '@waves/bignumber';
import * as React from 'react';
import { Trans } from 'react-i18next';
import cn from 'classnames';
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
}

export function ActiveAccountCard({
  account,
  balance,
  onClick,
  onCopy,
  onOtherAccountsClick,
  onShowQr,
}: Props) {
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
          <button
            className={cn(
              'button',
              'button-wallet',
              'button-wallet-iconOnly',
              styles.otherAccountsButton
            )}
            data-testid="otherAccountsButton"
            type="button"
            onClick={onOtherAccountsClick}
          />
        </Tooltip>
      </div>

      <div
        className={styles.selectableOverlay}
        onClick={() => {
          onClick(account);
        }}
      />

      <div className={styles.controls}>
        <span className={styles.controlsExpand} />

        <Copy text={account.address} onCopy={onCopy}>
          <Tooltip content={<Trans i18nKey="copyAddress" />}>
            <div className="button button-wallet button-wallet-iconOnly copyIconBlack" />
          </Tooltip>
        </Copy>

        <Tooltip content={<Trans i18nKey="showQR" />} placement="bottom-end">
          <div
            className="button button-wallet button-wallet-iconOnly showQrIcon"
            onClick={onShowQr}
          />
        </Tooltip>
      </div>
    </div>
  );
}
