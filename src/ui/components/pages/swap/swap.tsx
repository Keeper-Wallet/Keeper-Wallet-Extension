import { Asset } from '@waves/data-entities';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { useAppSelector } from 'ui/store';
import * as styles from './swap.module.css';
import { fetchAssets, fetchExchangers, SwopFiExchangerData } from './api';
import { SwapForm } from './form';

const REFRESH_INTERVAL_MS = 10000;

export function Swap() {
  const currentNetwork = useAppSelector(state => state.currentNetwork);

  const [assetsMap, setAssetsMap] = React.useState<{
    [assetId: string]: Asset;
  } | null>(null);

  const [exchangersMap, setExchangersMap] = React.useState<{
    [exchangerId: string]: SwopFiExchangerData;
  } | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    let timeout: number;

    function updateData() {
      Promise.all([
        fetchAssets(currentNetwork),
        fetchExchangers(currentNetwork),
      ]).then(([fetchAssetsResponse, fetchExchangersResponse]) => {
        if (!cancelled) {
          setAssetsMap(fetchAssetsResponse);
          setExchangersMap(fetchExchangersResponse);
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

        {!assetsMap || !exchangersMap ? (
          <div className={styles.loader} />
        ) : (
          <div className={styles.content}>
            <SwapForm assetsMap={assetsMap} exchangersMap={exchangersMap} />
          </div>
        )}
      </div>
    </div>
  );
}
