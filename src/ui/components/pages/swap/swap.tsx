import * as React from 'react';
import { Trans } from 'react-i18next';
import { PAGES } from 'ui/pageConfig';
import { useAppSelector } from 'ui/store';
import background from 'ui/services/Background';
import { SwapForm } from './form';
import * as styles from './swap.module.css';

const REFRESH_INTERVAL_MS = 10000;

interface Props {
  setTab: (newTab: string) => void;
}

export function Swap({ setTab }: Props) {
  const currentNetwork = useAppSelector(state => state.currentNetwork);
  const exchangers = useAppSelector(state => state.exchangers);

  const [isSwapInProgress, setIsSwapInProgress] = React.useState(false);
  const [isSwapFailed, setIsSwapFailed] = React.useState(false);

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
            <SwapForm
              exchangers={exchangers}
              isSwapFailed={isSwapFailed}
              isSwapInProgress={isSwapInProgress}
              onSwap={async ({
                exchangerId,
                fromAssetId,
                fromCoins,
                minReceivedCoins,
                toCoins,
              }) => {
                setIsSwapFailed(false);
                setIsSwapInProgress(true);

                try {
                  await background.performSwap({
                    exchangerId,
                    fromAssetId,
                    fromCoins,
                    minReceivedCoins,
                    toCoins,
                  });

                  setTab(PAGES.ROOT);
                } catch {
                  setIsSwapFailed(true);

                  setIsSwapInProgress(false);
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
