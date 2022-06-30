import * as styles from './Error.module.css';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'ui/store';
import { HeadLogo } from '../head';
import { resetState } from 'ui/actions';
import { Button, Highlight, Modal, Copy } from 'ui/components/ui';
import { downloadKeystore } from '../../utils/keystore';
import { ExportPasswordModal } from '../pages/exportAccounts/passwordModal';
import { isExportable } from '../pages/exportAccounts/chooseItems';

interface Props {
  error: Error;
  componentStack: string | null;
  resetError(): void;
}

export function Error({ error, componentStack, resetError }: Props) {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const addresses = useAppSelector(state => state.addresses);
  const allNetworksAccounts = useAppSelector(
    state => state.allNetworksAccounts
  );

  const [showExportModal, setShowExportModal] = React.useState(false);
  const [showResetModal, setShowResetModal] = React.useState(false);

  const [showDetails, setShowDetails] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  return (
    <div className={styles.wrapper}>
      <HeadLogo className={styles.logo} />
      <div className={styles.content}>
        <h2 className={styles.title}>{t('errorPage.title')}</h2>
        <p className={styles.name}>{error.toString()}</p>
        <div className={styles.details}>
          <p className={styles.detailsTitle}>{t('errorPage.details')}</p>
          <button
            className={styles.detailsButton}
            onClick={() => {
              setShowDetails(!showDetails);
            }}
          >
            {t(showDetails ? 'errorPage.hide' : 'errorPage.show')}
          </button>
        </div>
        {showDetails ? (
          <div className={styles.plate}>
            <Highlight
              className={`${styles.highlight} json`}
              data={componentStack}
            />
            <Copy
              text={componentStack}
              onCopy={() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1000);
              }}
            >
              <button className={styles.copy}>
                {t('errorPage.copyToClipboard')}
              </button>
            </Copy>
          </div>
        ) : (
          <div className={styles.plate} />
        )}

        <Modal animation={Modal.ANIMATION.FLASH_SCALE} showModal={copied}>
          <p className="modal notification">{t('errorPage.copied')}</p>
        </Modal>
      </div>

      <div className={styles.footer}>
        <div
          className={styles.export}
          onClick={() => {
            setShowExportModal(true);
          }}
        >
          <span>{t('errorPage.export')}</span>
          <i className={styles.exportIcon} />
        </div>

        {showExportModal && (
          <ExportPasswordModal
            onClose={() => {
              setShowExportModal(false);
            }}
            onSubmit={async password => {
              await downloadKeystore(
                allNetworksAccounts.filter(isExportable),
                addresses,
                password
              );
              setShowExportModal(false);
            }}
          />
        )}
        <div className={styles.buttons}>
          <Button
            className={styles.reset}
            onClick={() => {
              setShowResetModal(true);
            }}
          >
            {t('errorPage.reset')}
          </Button>
          <Button
            view="submit"
            onClick={() => {
              resetError();
            }}
          >
            {t('errorPage.reload')}
          </Button>
        </div>
      </div>

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
            <Button
              view="submit"
              className={styles.resetModalButton}
              onClick={() => {
                dispatch(resetState());
              }}
            >
              {t('errorPage.resetButton')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
