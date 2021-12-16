import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { PAGES } from 'ui/pageConfig';
import { useAppSelector } from 'ui/store';
import background from 'ui/services/Background';
import { SwapForm } from './form';
import * as styles from './swap.module.css';
import { TRANSACTION_TYPE } from '@waves/waves-transactions/dist/transactions';

const REFRESH_INTERVAL_MS = 10000;

interface Props {
  setTab: (newTab: string) => void;
}

export function Swap({ setTab }: Props) {
  const { t } = useTranslation();
  const selectedAccountAddress = useAppSelector(
    state => state.selectedAccount.address
  );
  const currentNetwork = useAppSelector(state => state.currentNetwork);
  const exchangers = useAppSelector(state => state.exchangers);

  const [isSwapInProgress, setIsSwapInProgress] = React.useState(false);
  const [swapErrorMessage, setSwapErrorMessage] = React.useState<string | null>(
    null
  );
  const [totalFee, setTotalFee] = React.useState<number | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    let timeout: number;

    async function updateData() {
      await background.updateExchangers(currentNetwork);
      timeout = window.setTimeout(updateData, REFRESH_INTERVAL_MS);
    }

    updateData();

    Promise.all([
      background.getMinimumFee(TRANSACTION_TYPE.INVOKE_SCRIPT),
      background.getExtraFee(selectedAccountAddress, currentNetwork),
    ]).then(([feeMinimum, feeExtra]) => {
      if (!cancelled) {
        setTotalFee(feeMinimum + feeExtra);
      }
    });

    return () => {
      cancelled = true;

      if (timeout) {
        window.clearTimeout(timeout);
      }
    };
  }, [currentNetwork, selectedAccountAddress]);

  return (
    <div className={styles.root}>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <Trans i18nKey="swap.title" />
          </h1>
        </header>

        {!exchangers || totalFee == null ? (
          <div className={styles.loader} />
        ) : (
          <div className={styles.content}>
            <SwapForm
              exchangers={exchangers}
              totalFee={totalFee}
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
                    fee: totalFee,
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
