import { usePopupSelector } from 'popup/store/react';
import { useTranslation } from 'react-i18next';

import { SwapAccountInfoHeader } from './accountInfoHeader';
import * as styles from './layout.module.css';

interface Props {
  children: React.ReactNode;
}

export function SwapLayout({ children }: Props) {
  const selectedAccount = usePopupSelector(state => state.selectedAccount);
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
