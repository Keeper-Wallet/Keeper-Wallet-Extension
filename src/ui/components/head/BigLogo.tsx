import * as React from 'react';
import * as styles from './head.styl';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';

export const BigLogo = ({ className = '', noTitle = false }) => {
  const { t } = useTranslation();
  className = cn(styles.bigLogo, className, 'center');

  return (
    <div className={className}>
      <div className={styles.bigLogoImg}></div>
      {noTitle ? null : (
        <div className={styles.bigLogoTitle}>{t('ui.logoTitle')}</div>
      )}
    </div>
  );
};
