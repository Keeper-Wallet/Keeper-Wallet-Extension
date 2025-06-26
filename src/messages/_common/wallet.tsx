import { type PreferencesAccount } from 'preferences/types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAccountAddress, getAccountAvatarAddress } from 'ui/utils/getActiveAccount';

import { Avatar } from '../../ui/components/ui/avatar/Avatar';
import { Copy } from '../../ui/components/ui/copy/Copy';
import { Ellipsis } from '../../ui/components/ui/ellipsis';
import { Modal } from '../../ui/components/ui/modal/Modal';
import { Tooltip } from '../../ui/components/ui/tooltip';
import * as styles from './wallet.module.css';

interface Props {
  account: PreferencesAccount;
}

export function MessageWallet({ account }: Props) {
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

  const address = getAccountAddress(account);
  const avatarAddress = getAccountAvatarAddress(account);

  return (
    <div className={styles.root}>
      <Avatar
        address={avatarAddress || null}
        className={styles.avatar}
        size={28}
        type={account.accountType === 'waves' ? account.type : undefined}
      />

      <Tooltip
        content={
          <>
            <Ellipsis text={address} />
            <div>{t('accountInfo.copyToClipboard')}</div>
          </>
        }
        placement="top-start"
      >
        {props => (
          <Copy
            text={address}
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
