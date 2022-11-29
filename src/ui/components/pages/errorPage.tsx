import { captureException } from '@sentry/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouteError } from 'react-router-dom';
import { ExportButton, ResetButton } from 'ui/components/ui';

import { HeadLogo } from '../head';
import * as styles from './errorPage.module.css';

export function ErrorPage() {
  const error = useRouteError();
  const { t } = useTranslation();

  useEffect(() => {
    captureException(error);
  }, [error]);

  return (
    <div className={styles.wrapper}>
      <HeadLogo className={styles.logo} />
      <div className={styles.content}>
        <h2 className={styles.title}>{t('errorPage.title')}</h2>
        <p className={styles.name}>
          {error instanceof Error ? error.message : String(error)}
        </p>
      </div>

      <div className={styles.footer}>
        <ExportButton />

        <div className={styles.buttons}>
          <ResetButton />
        </div>
      </div>
    </div>
  );
}
