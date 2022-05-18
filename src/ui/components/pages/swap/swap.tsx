import * as Sentry from '@sentry/react';
import BigNumber from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import { swappableAssetIds } from 'assets/constants';
import { convertToSponsoredAssetFee, getAssetIdByTicker } from 'assets/utils';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { updateAssets } from 'ui/actions/assets';
import { resetSwapScreenInitialState } from 'ui/actions/localState';
import { SignWrapper } from 'ui/components/pages/importEmail/signWrapper';
import { PAGES } from 'ui/pageConfig';
import background, { AssetDetail } from 'ui/services/Background';
import { useAppDispatch, useAppSelector } from 'ui/store';
import { SwapForm, SwapParams } from './form';
import { SwapResult } from './result';
import * as styles from './swap.module.css';

interface Props {
  setTab: (newTab: string) => void;
}

export function Swap({ setTab }: Props) {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const selectedAccount = useAppSelector(state => state.selectedAccount);
  const currentNetwork = useAppSelector(state => state.currentNetwork);

  const initialStateFromRedux = useAppSelector(
    state => state.localState.swapScreenInitialState
  );

  const [initialState] = React.useState(initialStateFromRedux);

  React.useEffect(() => {
    dispatch(resetSwapScreenInitialState());
  }, [dispatch]);

  const usdnAssetId = getAssetIdByTicker(currentNetwork, 'USDN');

  const initialFromAssetId = initialState.fromAssetId || usdnAssetId;

  const initialToAssetId =
    initialFromAssetId === usdnAssetId ? 'WAVES' : usdnAssetId;

  const [isSwapInProgress, setIsSwapInProgress] = React.useState(false);
  const [swapErrorMessage, setSwapErrorMessage] = React.useState<string | null>(
    null
  );
  const [wavesFeeCoins, setWavesFeeCoins] = React.useState<number | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    let timeout: number;

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

  const swappableAssetEntries = React.useMemo(
    () =>
      swappableAssetIds[currentNetwork as 'mainnet'].map(
        (assetId): [string, AssetDetail | undefined] => [
          assetId,
          assets[assetId],
        ]
      ),
    [assets, currentNetwork]
  );

  React.useEffect(() => {
    const assetsToUpdate = Array.from(
      new Set(
        swappableAssetEntries
          .filter(([, asset]) => asset == null)
          .map(([assetId]) => assetId)
      )
    );

    if (assetsToUpdate.length !== 0) {
      dispatch(updateAssets(assetsToUpdate));
    }
  }, [swappableAssetEntries, dispatch]);

  const accountBalance = useAppSelector(
    state => state.balances[state.selectedAccount.address]
  );

  const [performedSwapData, setPerformedSwapData] = React.useState<{
    fromMoney: Money;
    transactionId: string;
  } | null>(null);

  const swappableAssets = swappableAssetEntries.map(([, asset]) => asset);

  if (
    wavesFeeCoins == null ||
    !accountBalance.assets ||
    swappableAssets.some(asset => asset == null)
  ) {
    return <div className={styles.loader} />;
  }

  if (performedSwapData != null) {
    return (
      <SwapResult
        fromMoney={performedSwapData.fromMoney}
        transactionId={performedSwapData.transactionId}
        onClose={() => {
          setTab(PAGES.ROOT);
        }}
      />
    );
  }

  return (
    <SignWrapper
      onConfirm={async ({
        feeAssetId,
        fromAssetId,
        fromCoins,
        invoke,
      }: SwapParams) => {
        setSwapErrorMessage(null);
        setIsSwapInProgress(true);

        const fee = convertToSponsoredAssetFee(
          new BigNumber(wavesFeeCoins),
          new Asset(assets[feeAssetId]),
          accountBalance.assets[feeAssetId]
        );

        try {
          const swapResult = await background.swapAssets({
            feeAssetId,
            feeCoins: fee.toCoins(),
            fromAssetId,
            fromCoins: fromCoins.toFixed(),
            invoke,
          });

          setPerformedSwapData({
            fromMoney: new Money(fromCoins, new Asset(assets[fromAssetId])),
            transactionId: swapResult.transactionId,
          });
        } catch (err) {
          const errMessage = err?.message;
          let capture = true;

          if (typeof errMessage === 'string') {
            // errors from nested invokes
            let match = errMessage.match(
              /error\s+while\s+executing\s+account-script:\s*\w+\(code\s*=\s*(?:.+),\s*error\s*=\s*([\s\S]+)\s*,\s*log\s*=/im
            );

            if (match) {
              let msg = match[1];

              if (
                /something\s+went\s+wrong\s+while\s+working\s+with\s+amountToSend/i.test(
                  msg
                )
              ) {
                msg = t('swap.amountToSendError');
                capture = false;
              } else if (
                /only\s+swap\s+of\s+[\d.]+\s+or\s+more\s+tokens\s+is\s+allowed/i.test(
                  msg
                )
              ) {
                capture = false;
              }

              setSwapErrorMessage(msg);
              setIsSwapInProgress(false);

              if (capture) {
                Sentry.captureException(new Error(msg));
              }
              return;
            }

            // errors from contract itself
            match = errMessage.match(
              /error\s+while\s+executing\s+account-script:\s*([\s\S]+)/im
            );

            if (match) {
              const msg = match[1];

              setSwapErrorMessage(msg);
              setIsSwapInProgress(false);

              if (capture) {
                Sentry.captureException(new Error(msg));
              }
              return;
            }

            if (/Request is rejected on ledger/i.test(errMessage)) {
              setSwapErrorMessage(errMessage);
              setIsSwapInProgress(false);
              return;
            }
          }

          setSwapErrorMessage(errMessage || t('swap.failMessage'));
          setIsSwapInProgress(false);

          if (capture) {
            Sentry.captureException(new Error(errMessage));
          }
        }
      }}
    >
      {({ onPrepare, pending }) => (
        <SwapForm
          initialFromAssetId={initialFromAssetId}
          initialToAssetId={initialToAssetId}
          isSwapInProgress={pending || isSwapInProgress}
          swapErrorMessage={swapErrorMessage}
          swappableAssets={swappableAssets}
          wavesFeeCoins={wavesFeeCoins}
          onSwap={onPrepare}
        />
      )}
    </SignWrapper>
  );
}
