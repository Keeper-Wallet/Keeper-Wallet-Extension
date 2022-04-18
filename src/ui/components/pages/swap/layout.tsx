import * as React from 'react';
import { Trans } from 'react-i18next';
import * as styles from './layout.module.css';

interface Props {
  children: React.ReactNode;
}

export function SwapLayout({ children }: Props) {
  return (
    <div className={styles.root}>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <Trans i18nKey="swap.title" />
          </h1>
        </header>

        {children}
      </div>
    </div>
  );
}
