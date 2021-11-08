import * as React from 'react';
import { Avatar, Button, Copy, Ellipsis, Modal } from '../ui';
import cn from 'classnames';
import * as styles from './wallet.styl';
import { Trans } from 'react-i18next';

export const TransactionWallet = ({
  className = '',
  onSelect = null,
  onActive = null,
  account = null,
  active = false,
  hideButton = false,
  children = null,
  type = 'small',
}: ITransactionWalletProps) => {
  const [showCopied, setCopied] = React.useState(false);
  let copyTimeout;
  const onCopy = () => {
    clearTimeout(copyTimeout);
    setCopied(true);
    copyTimeout = setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  const avatarSize = 28;
  className = cn(styles.wallet, className, {
    [styles.walletClean]: type == 'clean',
    [styles.activeWallet]: active,
  });

  const iconClass = cn(styles.accountIcon, 'change-account-icon');

  const clickHandler = () => {
    if (onSelect) {
      onSelect(account);
    }
  };
  const selectHandler = e => {
    if (onActive) {
      e.preventDefault();
      e.stopPropagation();
      onActive(account);
    }
  };

  return (
    <div className={`${className} ${styles.inner} ${styles.txWallet} flex`}>
      <div className={styles.avatar}>
        <Avatar size={avatarSize} address={account.address} />
      </div>

      <div className={`body3 ${styles.accountData}`}>
        <Copy text={account.address} onCopy={onCopy}>
          <div className={styles.accountName}>
            {account.name}

            <div className={styles.tooltip}>
              <Ellipsis text={account.address} />
              <div>
                <Trans i18nKey="accountInfo.copyToClipboard" />
              </div>
            </div>
          </div>
        </Copy>
      </div>

      <div className={styles.controls} onClick={clickHandler}>
        {children}
        {hideButton ? null : (
          <Button type="custom" onClick={selectHandler} className={iconClass} />
        )}
      </div>

      <Modal animation={Modal.ANIMATION.FLASH_SCALE} showModal={showCopied}>
        <div className="modal notification">
          <Trans i18nKey="accountInfo.copied">Copied!</Trans>
        </div>
      </Modal>
    </div>
  );
};

interface ITransactionWalletProps {
  className?: string;
  onSelect?: (account: any) => void;
  onActive?: (account: any) => void;
  account: any;
  active?: boolean;
  hideButton?: boolean;
  children?: any;
  type?: 'small' | 'clean';
}
