import * as React from 'react';
import { useAppSelector } from 'ui/store';
import { SwapAccountInfoHeader } from './accountInfoHeader';
import styles from './layout.module.css';
import { useTranslation } from 'react-i18next';

interface Props {
  children: React.ReactNode;
}

export function SwapLayout({ children }: Props) {
  const selectedAccount = useAppSelector(state => state.selectedAccount);
  const { t } = useTranslation();

  return (
    <div className={styles.root}>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>{t('swap.title')}</h1>

          <SwapAccountInfoHeader account={selectedAccount} />
        </header>

        {children}
      </div>
    </div>
  );
}
