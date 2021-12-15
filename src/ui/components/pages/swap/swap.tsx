import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const currentNetwork = useAppSelector(state => state.currentNetwork);
  const exchangers = useAppSelector(state => state.exchangers);

  const [isSwapInProgress, setIsSwapInProgress] = React.useState(false);
  const [swapErrorMessage, setSwapErrorMessage] = React.useState<string | null>(
    null
  );

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
              isSwapInProgress={isSwapInProgress}
              swapErrorMessage={swapErrorMessage}
              onSwap={async ({
                exchangerId,
                fromAssetId,
                fromCoins,
                minReceivedCoins,
                toCoins,
              }) => {
                setSwapErrorMessage(null);
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
                } catch (err) {
                  setSwapErrorMessage(err.message || t('swap.failMessage'));
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
