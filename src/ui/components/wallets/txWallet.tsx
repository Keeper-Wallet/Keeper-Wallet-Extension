import { PreferencesAccount } from 'preferences/types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Avatar } from '../ui/avatar/Avatar';
import { Copy } from '../ui/copy/Copy';
import { Ellipsis } from '../ui/ellipsis/Ellipsis';
import { Modal } from '../ui/modal/Modal';
import { Tooltip } from '../ui/tooltip';
import * as styles from './txWallet.module.css';

interface Props {
  account: PreferencesAccount;
}

export function TransactionWallet({ account }: Props) {
  const { t } = useTranslation();
  const [showCopiedNotification, setShowCopiedNotification] = useState(false);

  useEffect(() => {
    if (!showCopiedNotification) return;

    const timeout = setTimeout(() => {
      setShowCopiedNotification(false);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [showCopiedNotification]);

  return (
    <div className={styles.root}>
      <Avatar
        address={account.address}
        className={styles.avatar}
        size={28}
        type={account.type}
      />

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
          <Copy
            text={account.address}
            onCopy={() => {
              setShowCopiedNotification(true);
            }}
          >
            <button className={styles.name} type="button" {...props}>
              {account.name}
            </button>
          </Copy>
        )}
      </Tooltip>

      <Modal
        animation={Modal.ANIMATION.FLASH_SCALE}
        showModal={showCopiedNotification}
      >
        <div className="modal notification">{t('accountInfo.copied')}</div>
      </Modal>
    </div>
  );
}
