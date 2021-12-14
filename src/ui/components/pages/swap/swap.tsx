import { Asset } from '@waves/data-entities';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { useAppSelector } from 'ui/store';
import background from 'ui/services/Background';
import { SwapForm } from './form';
import * as styles from './swap.module.css';

const REFRESH_INTERVAL_MS = 10000;

export function Swap() {
  const currentNetwork = useAppSelector(state => state.currentNetwork);
  const exchangers = useAppSelector(state => state.exchangers);

  React.useEffect(() => {
    let timeout: number;

    async function updateData() {
      await background.updateExchangers(currentNetwork);
      timeout = window.setTimeout(updateData, REFRESH_INTERVAL_MS);
    }

    updateData();

    return () => {
      if (timeout) {
        window.clearTimeout(timeout);
      }
    };
  }, [currentNetwork]);

  return (
    <div className={styles.root}>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <Trans i18nKey="swap.title" />
          </h1>
        </header>

        {!exchangers ? (
          <div className={styles.loader} />
        ) : (
          <div className={styles.content}>
            <SwapForm exchangers={exchangers} />
          </div>
        )}
      </div>
    </div>
  );
}
