import * as React from 'react';
import * as styles from './ResetButton.module.css';
import { useTranslation } from 'react-i18next';
import { reset } from 'lib/localStore';
import { Button, Modal } from 'ui/components/ui';

interface Props {
  className?: string;
}

export const ResetButton = ({ className }: Props) => {
  const { t } = useTranslation();

  const [showResetModal, setShowResetModal] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

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
                className={styles.resetModalButton}
                onClick={() => {
                  reset();
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
