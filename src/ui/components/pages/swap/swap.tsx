import { isNotNull } from '_core/isNotNull';
import { useSign } from '_core/signContext';
import { base58Encode } from '@keeper-wallet/waves-crypto';
import { captureException } from '@sentry/browser';
import BigNumber from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import { type AssetDetail } from 'assets/types';
import { useAssetIdByTicker } from 'assets/utils';
import { convertFeeToAsset } from 'fee/utils';
import { computeTxHash, makeTxBytes } from 'messages/utils';
import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import invariant from 'tiny-invariant';
import background from 'ui/services/Background';
import Background from 'ui/services/Background';

import { type OnSwapParams, SwapForm } from './form';
import { SwapResult } from './result';
import * as styles from './swap.module.css';

export function Swap() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { t } = useTranslation();

  const dispatch = usePopupDispatch();
  const selectedAccount = usePopupSelector(state => state.selectedAccount);
  invariant(selectedAccount);

  const currentNetwork = usePopupSelector(state => state.currentNetwork);

  const usdnAssetId = useAssetIdByTicker(currentNetwork, 'USDN');

  const initialFromAssetId = searchParams.get('fromAssetId') || usdnAssetId;

  const initialToAssetId =
    initialFromAssetId === usdnAssetId ? 'WAVES' : usdnAssetId;

  const [isSwapInProgress, setIsSwapInProgress] = useState(false);
  const [swapErrorMessage, setSwapErrorMessage] = useState<string | null>(null);

  const minimumFee = 50_0000;

  const [wavesFeeCoins, setWavesFeeCoins] = useState(minimumFee);

  useEffect(() => {
    let cancelled = false;
    let timeout: number;

    background
      .getExtraFee(selectedAccount.address, currentNetwork)
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

  const assets = usePopupSelector(state => state.assets);
  const swappableAssetIdsByVendor = usePopupSelector(
    state => state.swappableAssetIdsByVendor,
  );

  const swappableAssetEntries = useMemo(
    () =>
      Array.from(new Set(Object.values(swappableAssetIdsByVendor).flat())).map(
        (assetId): [string, AssetDetail | undefined] => [
          assetId,
          assets[assetId],
        ],
      ),
    [assets, swappableAssetIdsByVendor],
  );

  useEffect(() => {
    Background.updateAssets(swappableAssetEntries.map(([assetId]) => assetId));
  }, [swappableAssetEntries, dispatch]);

  const accountBalance = usePopupSelector(
    state => state.balances[selectedAccount.address],
  );

  const [performedSwapData, setPerformedSwapData] = useState<{
    fromMoney: Money;
    transactionId: string;
  } | null>(null);

  const swappableAssets = swappableAssetEntries.map(([, asset]) => asset);

  const onConfirm = useCallback(
    async ({
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
      const feeAsset = assets[feeAssetId];
      invariant(feeAsset);

      try {
        const fee = convertFeeToAsset(wavesFee, new Asset(feeAsset)).toCoins();

        const fullSwapTx = {
          ...tx,
          type: TRANSACTION_TYPE.INVOKE_SCRIPT,
          chainId: selectedAccount.networkCode.charCodeAt(0),
          fee,
          feeAssetId: feeAssetId === 'WAVES' ? null : feeAssetId,
          initialFee: fee,
          initialFeeAssetId: feeAssetId === 'WAVES' ? null : feeAssetId,
          proofs: [],
          senderPublicKey: selectedAccount.publicKey,
          timestamp: Date.now(),
          version: 2 as const,
        };

        const id = base58Encode(computeTxHash(makeTxBytes(fullSwapTx)));

        const signature = await background.signTransaction(selectedAccount, {
          ...fullSwapTx,
          id,
        });

        const broadcastedTx = await background.broadcastTransaction({
          ...fullSwapTx,
          id,
          proofs: [signature],
        });

        background.track({
          eventType: 'swapAssets',
          fromAssetId,
          fromCoins: fromCoins.toFixed(),
          minReceivedCoins: minReceivedCoins.toFixed(),
          slippageTolerance,
          status: 'success',
          toAssetId,
          toCoins: toCoins.toFixed(),
          vendor,
        });

        const fromAsset = assets[fromAssetId];
        invariant(fromAsset);

        setPerformedSwapData({
          fromMoney: new Money(fromCoins, new Asset(fromAsset)),
          transactionId: broadcastedTx.id,
        });
      } catch (err) {
        const errMessage = String(
          err && typeof err === 'object' && 'message' in err
            ? err.message
            : err,
        );

        let capture = true;

        // errors from nested invokes
        let match = errMessage.match(
          /Error while executing dApp: \w+\(code\s*=\s*(?:.+),\s*error\s*=\s*([\s\S]+)\s*,\s*log\s*=/im,
        );

        if (match) {
          let [, msg] = match;

          if (
            /something\s+went\s+wrong\s+while\s+working\s+with\s+amountToSend/i.test(
              msg,
            )
          ) {
            msg = t('swap.amountToSendError');
            capture = false;
          } else if (
            /only\s+swap\s+of\s+[\d.]+\s+or\s+more\s+tokens\s+is\s+allowed/i.test(
              msg,
            )
          ) {
            capture = false;
          }

          setSwapErrorMessage(msg);
          setIsSwapInProgress(false);

          if (capture) {
            captureException(new Error(msg));
          }
          return;
        }

        // errors from contract itself
        match = errMessage.match(/Error while executing dApp: ([\s\S]+)/im);

        if (match) {
          const [, msg] = match;

          setSwapErrorMessage(msg);
          setIsSwapInProgress(false);

          match = msg.match(/Swap result (\d+) is less then expected (\d+)/i);

          if (match) {
            capture = false;

            const actualAmountCoins = new BigNumber(match[1]);
            const expectedAmountCoins = new BigNumber(match[2]);

            background.track({
              eventType: 'swapAssets',
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
            /amount to receive is lower than expected one (\d+)/i,
          );

          if (match) {
            capture = false;

            const expectedAmountCoins = new BigNumber(match[1]);

            background.track({
              eventType: 'swapAssets',
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
            captureException(new Error(msg));
          }
          return;
        }

        if (errMessage === 'Request is rejected on ledger') {
          setIsSwapInProgress(false);
          return;
        }

        setSwapErrorMessage(errMessage || t('swap.failMessage'));
        setIsSwapInProgress(false);

        if (capture) {
          captureException(new Error(errMessage));
        }
      }
    },
    [assets, selectedAccount, t, wavesFeeCoins],
  );

  const { sign, isSignPending } = useSign(onConfirm);

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
    <SwapForm
      initialFromAssetId={initialFromAssetId}
      initialToAssetId={initialToAssetId}
      isSwapInProgress={isSignPending || isSwapInProgress}
      swapErrorMessage={swapErrorMessage}
      swappableAssets={swappableAssets.filter(isNotNull)}
      wavesFeeCoins={wavesFeeCoins}
      onSwap={sign}
    />
  );
}
