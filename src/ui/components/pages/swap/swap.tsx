import BigNumber from '@waves/bignumber';
import { Money, Asset } from '@waves/data-entities';
import { TRANSACTION_TYPE } from '@waves/waves-transactions/dist/transactions';
import { convertToSponsoredAssetFee } from 'assets/utils';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Avatar } from 'ui/components/ui/avatar/Avatar';
import { PAGES } from 'ui/pageConfig';
import background from 'ui/services/Background';
import { useAppSelector } from 'ui/store';
import { SwapForm } from './form';
import { SwapResult } from './result';
import * as styles from './swap.module.css';

const REFRESH_INTERVAL_MS = 10000;

interface Props {
  setTab: (newTab: string) => void;
}

export function Swap({ setTab }: Props) {
  const { t } = useTranslation();
  const selectedAccount = useAppSelector(state => state.selectedAccount);
  const currentNetwork = useAppSelector(state => state.currentNetwork);
  const exchangers = useAppSelector(state => state.exchangers);

  const [isSwapInProgress, setIsSwapInProgress] = React.useState(false);
  const [swapErrorMessage, setSwapErrorMessage] = React.useState<string | null>(
    null
  );
  const [wavesFeeCoins, setWavesFeeCoins] = React.useState<number | null>(null);

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
      background.getExtraFee(selectedAccount.address, currentNetwork),
    ]).then(([feeMinimum, feeExtra]) => {
      if (!cancelled) {
        setWavesFeeCoins(feeMinimum + feeExtra);
      }
    });

    return () => {
      cancelled = true;

      if (timeout) {
        window.clearTimeout(timeout);
      }
    };
  }, [currentNetwork, selectedAccount.address]);

  const assets = useAppSelector(state => state.assets);

  const accountBalance = useAppSelector(
    state => state.balances[state.selectedAccount.address]
  );

  const [performedSwapData, setPerformedSwapData] = React.useState<{
    fromMoney: Money;
    transactionId: string;
  } | null>(null);

  return (
    <div className={styles.root}>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <Trans i18nKey="swap.title" />
          </h1>
        </header>

        {!exchangers || wavesFeeCoins == null || !accountBalance.assets ? (
          <div className={styles.loader} />
        ) : (
          <div className={styles.content}>
            <div className={styles.accountInfoHeader}>
              <Avatar address={selectedAccount.address} size={28} />
              <div className={styles.accountName}>{selectedAccount.name}</div>
              <i className="networkIcon" />

              <div className={styles.currentNetwork}>
                <Trans i18nKey={`bottom.${currentNetwork}`} />
              </div>
            </div>

            {performedSwapData == null ? (
              <SwapForm
                exchangers={exchangers}
                isSwapInProgress={isSwapInProgress}
                swapErrorMessage={swapErrorMessage}
                wavesFeeCoins={wavesFeeCoins}
                onSwap={async ({
                  exchangerId,
                  feeAssetId,
                  fromAssetId,
                  fromCoins,
                  minReceivedCoins,
                  toAssetId,
                  toCoins,
                }) => {
                  setSwapErrorMessage(null);
                  setIsSwapInProgress(true);

                  try {
                    const result = await background.performSwap({
                      exchangerId,
                      fee: convertToSponsoredAssetFee(
                        new BigNumber(wavesFeeCoins),
                        new Asset(assets[feeAssetId]),
                        accountBalance.assets[feeAssetId]
                      ).toCoins(),
                      feeAssetId,
                      fromAssetId,
                      fromCoins,
                      minReceivedCoins,
                      toAssetId,
                      toCoins,
                    });

                    setPerformedSwapData({
                      fromMoney: new Money(
                        new BigNumber(fromCoins),
                        new Asset(assets[fromAssetId])
                      ),
                      transactionId: result.transactionId,
                    });
                  } catch (err) {
                    setSwapErrorMessage(err.message || t('swap.failMessage'));
                    setIsSwapInProgress(false);
                  }
                }}
              />
            ) : (
              <SwapResult
                fromMoney={performedSwapData.fromMoney}
                transactionId={performedSwapData.transactionId}
                onClose={() => {
                  setTab(PAGES.ROOT);
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
