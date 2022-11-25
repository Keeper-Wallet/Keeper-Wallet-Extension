import { useTranslation } from 'react-i18next';
import { Button, ExportButton, ResetButton } from 'ui/components/ui';

import { HeadLogo } from '../head';
import * as styles from './errorPage.module.css';

interface Props {
  error: Error;
  resetError(): void;
}

export function ErrorPage({ error, resetError }: Props) {
  const { t } = useTranslation();

  return (
    <div className={styles.wrapper}>
      <HeadLogo className={styles.logo} />
      <div className={styles.content}>
        <h2 className={styles.title}>{t('errorPage.title')}</h2>
        <p className={styles.name}>{error.toString()}</p>
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
