import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui/components/ui';

import { resetStorage } from '../../../../storage/storage';
import * as styles from './ResetButton.module.css';

interface Props {
  className?: string;
}

export const ResetButton = ({ className }: Props) => {
  const { t } = useTranslation();

  const [showResetModal, setShowResetModal] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <Button
        className={`${styles.reset} ${className}`}
        onClick={() => {
          setShowResetModal(true);
        }}
      >
        {t('errorPage.reset')}
      </Button>

      <Modal animation={Modal.ANIMATION.FLASH} showModal={showResetModal}>
        <div className={`modal cover ${styles.resetModal}`}>
          <div className={styles.resetModalContent}>
            <Button
              className="modal-close"
              type="button"
              view="transparent"
              onClick={() => {
                setShowResetModal(false);
              }}
            />
            <p className={styles.resetModalTitle}>
              {t('errorPage.resetTitle')}
            </p>
            <p className={styles.resetModalDescription}>
              {t('errorPage.resetDescription')}
            </p>
            {loading ? (
              <div className={styles.resetModalLoader} />
            ) : (
              <Button
                view="submit"
                onClick={() => {
                  resetStorage();
                  setLoading(true);
                }}
              >
                {t('errorPage.resetButton')}
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};
