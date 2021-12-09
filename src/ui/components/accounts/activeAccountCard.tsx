import { Money } from '@waves/data-entities';
import { BigNumber } from '@waves/bignumber';
import * as React from 'react';
import { Trans } from 'react-i18next';
import cn from 'classnames';
import { getExplorerUrls } from '../../utils/waves';
import { Avatar } from '../ui/avatar/Avatar';
import { Balance } from '../ui/balance/Balance';
import { Copy } from '../ui/copy/Copy';
import * as styles from './activeAccountCard.module.css';

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
  const { activeAddressLink, walletLink } = getExplorerUrls(
    account.network,
    account.address
  );

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

        <button
          className={cn(
            'button',
            'button-wallet',
            'button-wallet-iconOnly',
            'showTooltip',
            styles.otherAccountsButton
          )}
          data-testid="otherAccountsButton"
          type="button"
          onClick={onOtherAccountsClick}
        />

        <div className={cn(styles.otherAccountsTooltip, 'tooltip')}>
          <Trans i18nKey="assets.inStorage" />
        </div>
      </div>

      <div
        className={styles.selectableOverlay}
        onClick={() => {
          onClick(account);
        }}
      />

      <div className={styles.controls}>
        <a
          className="walletIconBlack button button-wallet"
          href={walletLink}
          rel="noopener noreferrer"
          target="_blank"
        >
          <Trans i18nKey="ui.wallet" />
        </a>

        <a
          className="transactionsIconBlack button button-wallet"
          href={activeAddressLink}
          rel="noopener noreferrer"
          target="_blank"
        >
          <Trans i18nKey="ui.transactions" />
        </a>

        <span className={styles.controlsExpand} />

        <Copy text={account.address} onCopy={onCopy}>
          <div className="button button-wallet button-wallet-iconOnly copyIconBlack showTooltip" />
        </Copy>

        <div className={cn(styles.copyTooltip, 'tooltip')}>
          <Trans i18nKey="copyAddress" />
        </div>

        <div
          className="button button-wallet button-wallet-iconOnly showQrIcon showTooltip"
          onClick={onShowQr}
        />

        <div className={cn(styles.showQrTooltip, 'tooltip')}>
          <Trans i18nKey="showQR" />
        </div>
      </div>
    </div>
  );
}
