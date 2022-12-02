import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import * as styles from './head.styl';

export const BigLogo = ({
  className = '',
  noTitle = false,
}: {
  className?: string;
  noTitle?: boolean;
}) => {
  const { t } = useTranslation();
  className = clsx(styles.bigLogo, className, 'center');

  return (
    <div className={className}>
      <div className={styles.bigLogoImg} />
      {noTitle ? null : (
        <div className={styles.bigLogoTitle}>{t('ui.logoTitle')}</div>
      )}
    </div>
  );
};
