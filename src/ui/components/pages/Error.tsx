import * as styles from './Error.module.css';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { HeadLogo } from '../head';
import {
  Button,
  ExportButton,
  ResetButton,
  Highlight,
  Modal,
  Copy,
} from 'ui/components/ui';

interface Props {
  error: Error;
  componentStack: string | null;
  resetError(): void;
}

export function Error({ error, componentStack, resetError }: Props) {
  const { t } = useTranslation();

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
        <ExportButton />
        <div className={styles.buttons}>
          <ResetButton />
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
    </div>
  );
}
