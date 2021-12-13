import { Asset } from '@waves/data-entities';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { useAppSelector } from 'ui/store';
import background from 'ui/services/Background';
import { fetchAssets } from './api';
import { SwapForm } from './form';
import * as styles from './swap.module.css';

const REFRESH_INTERVAL_MS = 10000;

export function Swap() {
  const exchangers = useAppSelector(state => state.exchangers);

  const currentNetwork = useAppSelector(state => state.currentNetwork);

  const [assets, setAssetsMap] = React.useState<{
    [assetId: string]: Asset;
  } | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    let timeout: number;

    function updateData() {
      background.updateExchangers(currentNetwork);

      fetchAssets(currentNetwork).then(fetchAssetsResponse => {
        if (!cancelled) {
          setAssetsMap(fetchAssetsResponse);
        }
      });

      timeout = window.setTimeout(updateData, REFRESH_INTERVAL_MS);
    }

    updateData();

    return () => {
      cancelled = true;

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

        {!assets || !exchangers ? (
          <div className={styles.loader} />
        ) : (
          <div className={styles.content}>
            <SwapForm assets={assets} exchangers={exchangers} />
          </div>
        )}
      </div>
    </div>
  );
}
