import * as Sentry from '@sentry/react';
import BigNumber from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import { swappableAssetIds } from 'assets/constants';
import { AssetDetail } from 'assets/types';
import { useAssetIdByTicker } from 'assets/utils';
import { convertFeeToAsset } from 'fee/utils';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { updateAssets } from 'ui/actions/assets';
import { SignWrapper } from 'ui/components/pages/importEmail/signWrapper';
import background from 'ui/services/Background';
import { useAppDispatch, useAppSelector } from 'ui/store';

import { OnSwapParams, SwapForm } from './form';
import { SwapResult } from './result';
import * as styles from './swap.module.css';

export function Swap() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const selectedAccount = useAppSelector(state => state.selectedAccount);
  const currentNetwork = useAppSelector(state => state.currentNetwork);
  const feeConfig = useAppSelector(state => state.feeConfig);

  const usdnAssetId = useAssetIdByTicker(currentNetwork, 'USDN');

  const initialFromAssetId = searchParams.get('fromAssetId') || usdnAssetId;

  const initialToAssetId =
    initialFromAssetId === usdnAssetId ? 'WAVES' : usdnAssetId;

  const [isSwapInProgress, setIsSwapInProgress] = useState(false);
  const [swapErrorMessage, setSwapErrorMessage] = useState<string | null>(null);

  const rules = feeConfig.calculate_fee_rules;

  const minimumFee = rules[TRANSACTION_TYPE.INVOKE_SCRIPT]
    ? rules[TRANSACTION_TYPE.INVOKE_SCRIPT].fee
    : rules.default.fee;

  const [wavesFeeCoins, setWavesFeeCoins] = useState(minimumFee);

  useEffect(() => {
    let cancelled = false;
    let timeout: number;

    background
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
      .getExtraFee(selectedAccount?.address!, currentNetwork)
      .then(feeExtra => {
        if (!cancelled) {
          setWavesFeeCoins(minimumFee + feeExtra);
        }
      });

    return () => {
      cancelled = true;

      if (timeout) {
        window.clearTimeout(timeout);
      }
    };
  }, [currentNetwork, minimumFee, selectedAccount?.address]);

  const assets = useAppSelector(state => state.assets);

  const swappableAssetEntries = useMemo(
    () =>
      swappableAssetIds.mainnet.map((assetId): [string, AssetDetail] => [
        assetId,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        assets[assetId]!,
      ]),
    [assets]
  );

  useEffect(() => {
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
    state => state.balances[state.selectedAccount?.address!]
  );

  const [performedSwapData, setPerformedSwapData] = useState<{
    fromMoney: Money;
    transactionId: string;
  } | null>(null);

  const swappableAssets = swappableAssetEntries.map(([, asset]) => asset);

  if (!accountBalance?.assets || swappableAssets.some(asset => asset == null)) {
    return <div className={styles.loader} />;
  }

  if (performedSwapData != null) {
    return (
      <SwapResult
        fromMoney={performedSwapData.fromMoney}
        transactionId={performedSwapData.transactionId}
        onClose={() => {
          navigate('/');
        }}
      />
    );
  }

  return (
    <SignWrapper
      onConfirm={
        (async ({
          feeAssetId,
          fromAssetId,
          fromCoins,
          minReceivedCoins,
          slippageTolerance,
          toAssetId,
          toCoins,
          tx,
          vendor,
        }: OnSwapParams) => {
          setSwapErrorMessage(null);
          setIsSwapInProgress(true);

          const wavesFee = new Money(wavesFeeCoins, new Asset(assets.WAVES));
          const fee = convertFeeToAsset(
            wavesFee,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            new Asset(assets[feeAssetId]!),
            feeConfig
          );

          try {
            const swapResult = await background.swapAssets({
              feeAssetId,
              feeCoins: fee.toCoins(),
              tx,
            });

            background.sendEvent('swapAssets', {
              fromAssetId,
              fromCoins: fromCoins.toFixed(),
              minReceivedCoins: minReceivedCoins.toFixed(),
              slippageTolerance,
              status: 'success',
              toAssetId,
              toCoins: toCoins.toFixed(),
              vendor,
            });

            setPerformedSwapData({
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              fromMoney: new Money(fromCoins, new Asset(assets[fromAssetId]!)),
              transactionId: swapResult.transactionId,
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (err: any) {
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

                match = msg.match(
                  /Swap result (\d+) is less then expected (\d+)/i
                );

                if (match) {
                  capture = false;

                  const actualAmountCoins = new BigNumber(match[1]);
                  const expectedAmountCoins = new BigNumber(match[2]);

                  background.sendEvent('swapAssets', {
                    actualAmountCoins: actualAmountCoins.toFixed(),
                    expectedAmountCoins: expectedAmountCoins.toFixed(),
                    expectedActualDelta: expectedAmountCoins
                      .sub(actualAmountCoins)
                      .toFixed(),
                    fromAssetId,
                    fromCoins: fromCoins.toFixed(),
                    minReceivedCoins: minReceivedCoins.toFixed(),
                    slippageTolerance,
                    status: 'lessThanExpected',
                    toAssetId,
                    toCoins: toCoins.toFixed(),
                    vendor,
                  });
                }

                match = msg.match(
                  /amount to receive is lower than expected one (\d+)/i
                );

                if (match) {
                  capture = false;

                  const expectedAmountCoins = new BigNumber(match[1]);

                  background.sendEvent('swapAssets', {
                    expectedAmountCoins: expectedAmountCoins.toFixed(),
                    fromAssetId,
                    fromCoins: fromCoins.toFixed(),
                    minReceivedCoins: minReceivedCoins.toFixed(),
                    slippageTolerance,
                    status: 'lessThanExpected',
                    toAssetId,
                    toCoins: toCoins.toFixed(),
                    vendor,
                  });
                }

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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }) as any
      }
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
