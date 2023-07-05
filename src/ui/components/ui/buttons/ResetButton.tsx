import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui/components/ui';
import Browser from 'webextension-polyfill';

import * as styles from './ResetButton.module.css';

const SAFE_FIELDS = new Set([
  'WalletController',
  'accounts',
  'addresses',
  'backup',
  'lastIdleKeeper',
  'lastInstallKeeper',
  'lastOpenKeeper',
  'userId',
]);

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
                onClick={async () => {
                  setLoading(true);

                  const state = await Browser.storage.local.get();

                  await Browser.storage.local.remove(
                    Object.keys(state).reduce<string[]>(
                      (acc, key) =>
                        SAFE_FIELDS.has(key) ? acc : [...acc, key],
                      [],
                    ),
                  );

                  Browser.runtime.reload();
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
