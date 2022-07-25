import * as styles from './Tooltip.module.css';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '../tooltip';
import { Modal, Copy, Ellipsis } from '..';

export interface Props {
  className?: string;
  address: string;
}

export function AddressTooltip({ className, address }: Props) {
  const { t } = useTranslation();

  const [showCopyNotification, setShowCopyNotification] = React.useState(false);

  return (
    <>
      <Tooltip
        content={
          <>
            <p>{address}</p>
            <p className={styles.copy}>{t('address.copyToClipboard')}</p>
          </>
        }
      >
        {props => (
          <Copy
            text={address}
            onCopy={() => {
              setShowCopyNotification(true);
              setTimeout(() => setShowCopyNotification(false), 1000);
            }}
          >
            <div className={className} {...props}>
              <Ellipsis className={styles.address} text={address} size={8} />
            </div>
          </Copy>
        )}
      </Tooltip>
      <Modal
        animation={Modal.ANIMATION.FLASH_SCALE}
        showModal={showCopyNotification}
      >
        <div className="modal notification">
          <div>{t('address.copied')}</div>
        </div>
      </Modal>
    </>
  );
}
