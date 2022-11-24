import cn from 'classnames';
import { PreferencesAccount } from 'preferences/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Avatar, Button, Copy, Ellipsis, Modal } from '../ui';
import { Tooltip } from '../ui/tooltip';
import * as styles from './wallet.styl';

export const TransactionWallet = ({
  className = '',
  onSelect,
  onActive,
  account,
  active = false,
  hideButton = false,
  children,
  type = 'small',
}: ITransactionWalletProps) => {
  const { t } = useTranslation();
  const [showCopied, setCopied] = useState(false);
  let copyTimeout: ReturnType<typeof setTimeout>;
  const onCopy = () => {
    clearTimeout(copyTimeout);
    setCopied(true);
    copyTimeout = setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  const avatarSize = 28;
  className = cn(styles.wallet, className, {
    [styles.walletClean]: type === 'clean',
    [styles.activeWallet]: active,
  });

  const iconClass = cn(styles.accountIcon, 'change-account-icon');

  const clickHandler = () => {
    if (onSelect) {
      onSelect(account);
    }
  };
  const selectHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onActive) {
      e.preventDefault();
      e.stopPropagation();
      onActive(account);
    }
  };

  return (
    <div className={`${className} ${styles.inner} ${styles.txWallet} flex`}>
      <div className={styles.avatar}>
        <Avatar
          size={avatarSize}
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          address={account.address!}
          type={account.type}
        />
      </div>

      <div className={`body3 ${styles.accountData}`}>
        <Tooltip
          content={
            <>
              <Ellipsis text={account.address} />
              <div>{t('accountInfo.copyToClipboard')}</div>
            </>
          }
          placement="top-start"
        >
          {props => (
            <Copy text={account.address} onCopy={onCopy}>
              <div className={styles.accountName} {...props}>
                {account.name}
              </div>
            </Copy>
          )}
        </Tooltip>
      </div>

      <div className={styles.controls} onClick={clickHandler}>
        {children}
        {hideButton ? null : (
          <Button
            type="button"
            view="custom"
            onClick={selectHandler}
            className={iconClass}
          />
        )}
      </div>

      <Modal animation={Modal.ANIMATION.FLASH_SCALE} showModal={showCopied}>
        <div className="modal notification">{t('accountInfo.copied')}</div>
      </Modal>
    </div>
  );
};

interface ITransactionWalletProps {
  className?: string;
  onSelect?: (account: Partial<PreferencesAccount>) => void;
  onActive?: (account: Partial<PreferencesAccount>) => void;
  account: Partial<PreferencesAccount>;
  active?: boolean;
  hideButton?: boolean;
  children?: React.ReactNode;
  type?: 'small' | 'clean';
}
