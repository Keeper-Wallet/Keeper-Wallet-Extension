import { useTranslation } from 'react-i18next';
import { ExportButton, ResetButton } from 'ui/components/ui';

import { HeadLogo } from '../head';
import * as styles from './errorPage.module.css';

interface Props {
  error: Error;
}

export function ErrorPage({ error }: Props) {
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
        </div>
      </div>
    </div>
  );
}
