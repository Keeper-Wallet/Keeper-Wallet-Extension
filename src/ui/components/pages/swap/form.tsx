import { useDebouncedValue } from '_core/useDebouncedValue';
import {
  SwapClient,
  SwapClientErrorCode,
  type SwapClientInvokeTransaction,
} from '@keeper-wallet/swap-client';
import BigNumber from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import { AssetAmountInput } from 'assets/amountInput';
import { AssetSelect, type AssetSelectOption } from 'assets/assetSelect';
import { type AssetDetail } from 'assets/types';
import { type BalancesItem } from 'balances/types';
import clsx from 'clsx';
import { useFeeOptions } from 'fee/useFeeOptions';
import { convertFeeToAsset } from 'fee/utils';
import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { setUiState } from 'store/actions/uiState';
import { SwapVendor } from 'swap/constants';
import { getSwapVendorLogo } from 'swap/utils';
import { Button } from 'ui/components/ui/buttons/Button';
import { Loader } from 'ui/components/ui/loader/Loader';
import { Modal } from 'ui/components/ui/modal/Modal';
import { Select } from 'ui/components/ui/select/Select';
import { Tooltip } from 'ui/components/ui/tooltip';
import { UsdAmount } from 'ui/components/ui/UsdAmount';

import { InfoIcon } from '../../../../icons/info';
import * as styles from './form.module.css';
import { SwapLayout } from './layout';

const SLIPPAGE_TOLERANCE_OPTIONS = [0.1, 0.5, 1, 3];

function getAssetBalance(asset: Asset, accountBalance: BalancesItem) {
  return asset.id === 'WAVES'
    ? new Money(accountBalance.available || '0', asset)
    : new Money(accountBalance.assets?.[asset.id]?.balance || '0', asset);
}

export interface OnSwapParams {
  feeAssetId: string;
  fromAssetId: string;
  fromCoins: BigNumber;
  minReceivedCoins: BigNumber;
  slippageTolerance: number;
  toAssetId: string;
  toCoins: BigNumber;
  tx: SwapClientInvokeTransaction;
  vendor: SwapVendor;
}

interface Props {
  initialFromAssetId: string;
  initialToAssetId: string;
  isSwapInProgress: boolean;
  swapErrorMessage: string | null;
  swappableAssets: AssetDetail[];
  wavesFeeCoins: number;
  onSwap: (params: OnSwapParams) => void;
}

type SwapInfoVendorState =
  | {
      type: 'loading';
    }
  | {
      type: 'error';
      code: SwapClientErrorCode;
    }
  | {
      type: 'data';
      minimumReceivedTokens: BigNumber;
      priceImpact: number;
      toAmountTokens: BigNumber;
      tx: SwapClientInvokeTransaction;
    };

type SwapInfoState = {
  [K in SwapVendor]: SwapInfoVendorState;
};

const swapInfoLoadingState: SwapInfoState = {
  [SwapVendor.Keeper]: { type: 'loading' },
  [SwapVendor.Puzzle]: { type: 'loading' },
  [SwapVendor.Swopfi]: { type: 'loading' },
};

const swapInfoErrorState: SwapInfoState = {
  [SwapVendor.Keeper]: {
    type: 'error',
    code: SwapClientErrorCode.UNEXPECTED,
  },
  [SwapVendor.Puzzle]: {
    type: 'error',
    code: SwapClientErrorCode.UNEXPECTED,
  },
  [SwapVendor.Swopfi]: {
    type: 'error',
    code: SwapClientErrorCode.UNEXPECTED,
  },
};

function formatFeeOption(money: Money) {
  return `${money.toFormat()} ${money.asset.displayName}`;
}

export function SwapForm({
  initialFromAssetId,
  initialToAssetId,
  isSwapInProgress,
  swapErrorMessage,
  swappableAssets,
  wavesFeeCoins,
  onSwap,
}: Props) {
  const dispatch = usePopupDispatch();
  const { t } = useTranslation();

  const assets = usePopupSelector(state => state.assets);
  const swappableAssetIdsByVendor = usePopupSelector(
    state => state.swappableAssetIdsByVendor
  );
  const usdPrices = usePopupSelector(state => state.usdPrices);
  const accountBalance = usePopupSelector(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
    state => state.balances[state.selectedAccount?.address!]
  );

  const currentNetwork = usePopupSelector(state => state.currentNetwork);
  const wavesFee = new Money(wavesFeeCoins, new Asset(assets.WAVES));

  const feeOptions = useFeeOptions({
    initialFee: wavesFee,
    txType: TRANSACTION_TYPE.INVOKE_SCRIPT,
  });

  const [{ fromAssetId, toAssetId }, setAssetIds] = useState({
    fromAssetId: initialFromAssetId,
    toAssetId: initialToAssetId,
  });

  const [feeAssetId, setFeeAssetId] = useState(() => {
    const defaultOption =
      feeOptions.find(option => option.money.asset.id === 'WAVES') ||
      feeOptions[0];

    return defaultOption?.money.asset.id || 'WAVES';
  });

  const fromAsset = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    () => new Asset(assets[fromAssetId]!),
    [assets, fromAssetId]
  );

  const toAsset = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    () => new Asset(assets[toAssetId]!),
    [assets, toAssetId]
  );

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const feeAsset = new Asset(assets[feeAssetId]!);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const fromAssetBalance = getAssetBalance(fromAsset, accountBalance!);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const toAssetBalance = getAssetBalance(toAsset, accountBalance!);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const feeAssetBalance = getAssetBalance(feeAsset, accountBalance!);

  const [fromAmountValue, setFromAmountValue] = useState('');
  const [fromAmountValueMasked, setFromAmountValueMasked] = useState('');
  const fromAmountTokens = new BigNumber(fromAmountValue || '0');

  const finalFeeOptions = feeOptions
    .filter(option => {
      if (
        option.money.asset.id !== fromAssetId ||
        option.money.asset.id === feeAssetId
      ) {
        return true;
      }

      const fromAmount = Money.fromTokens(fromAmountTokens, fromAsset);

      return new BigNumber(option.assetBalance.balance).gte(
        fromAmount.getCoins().add(option.money.getCoins())
      );
    })
    .map(({ money }) => money);

  if (finalFeeOptions.length === 0) {
    finalFeeOptions.push(wavesFee);
  }

  const [swapVendor, setSwapVendor] = useState(SwapVendor.Keeper);
  const [swapVendorTouched, setSwapVendorTouched] = useState(false);

  const slippageToleranceIndex = usePopupSelector(
    state => state.uiState.slippageToleranceIndex ?? 2
  );

  function setSlippageToleranceIndex(index: number) {
    dispatch(setUiState({ slippageToleranceIndex: index }));
  }

  const slippageTolerance = SLIPPAGE_TOLERANCE_OPTIONS[slippageToleranceIndex];

  const [swapInfo, setSwapInfo] = useState(swapInfoLoadingState);

  const [swapClient] = useState(() => new SwapClient());

  const [swapClientError, setSwapClientError] = useState<string | null>(null);

  const maxTokens = new Money(BigNumber.MAX_VALUE, fromAsset).getTokens();

  const maxAmountExceededErrorMessage = fromAmountTokens.gt(maxTokens)
    ? t('swap.maxAmountExceeded', {
        maxAmount: maxTokens.toFixed(),
      })
    : null;

  const accountAddress = usePopupSelector(
    state => state.selectedAccount?.address
  );

  const isValidAssetPairSelected = useMemo(
    () =>
      Object.values(swappableAssetIdsByVendor).some(
        ids => ids.includes(fromAsset.id) && ids.includes(toAsset.id)
      ),
    [swappableAssetIdsByVendor, fromAsset.id, toAsset.id]
  );

  const swapParams = useMemo(() => {
    if (!isValidAssetPairSelected) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
    let fromAmountTokens = new BigNumber(fromAmountValue || '0');

    if (fromAmountTokens.eq(0)) {
      fromAmountTokens = new BigNumber(1);
    }

    const fromAmount = Money.fromTokens(fromAmountTokens, fromAsset);

    if (fromAmount.getCoins().gt(BigNumber.MAX_VALUE)) {
      return null;
    }

    return {
      address: accountAddress,
      amountCoins: fromAmount.toCoins(),
      fromAssetId: fromAsset.id,
      slippageTolerance,
      toAssetId: toAsset.id,
    };
  }, [
    accountAddress,
    fromAmountValue,
    fromAsset,
    slippageTolerance,
    toAsset.id,
    isValidAssetPairSelected,
  ]);

  useEffect(() => {
    setSwapVendorTouched(false);

    if (swapParams) {
      setSwapInfo(swapInfoLoadingState);
    } else {
      setSwapInfo(swapInfoErrorState);
    }
  }, [swapParams]);

  const debouncedSwapParams = useDebouncedValue(swapParams, 500);

  useEffect(() => {
    if (!debouncedSwapParams) {
      return;
    }

    swapClient.setSwapParams(debouncedSwapParams);
  }, [debouncedSwapParams, swapClient]);

  useEffect(() => {
    if (!swapParams) {
      return;
    }

    return swapClient.subscribe({
      onError: () => {
        setSwapInfo(swapInfoLoadingState);
        setSwapClientError(t('swap.exchangeChannelConnectionError'));
      },
      onData: (vendor, response) => {
        setSwapClientError(null);

        const typedVendor = vendor as SwapVendor;

        if (!Object.values(SwapVendor).includes(typedVendor)) {
          return;
        }

        let vendorState: SwapInfoVendorState;

        if (response.type === 'error') {
          vendorState = {
            type: 'error',
            code: response.code,
          };
        } else {
          vendorState = {
            type: 'data',
            minimumReceivedTokens: new Money(
              response.minimumReceivedCoins,
              toAsset
            ).getTokens(),
            priceImpact: response.priceImpact,
            toAmountTokens: new Money(
              response.amountCoins,
              toAsset
            ).getTokens(),
            tx: response.tx,
          };
        }

        setSwapInfo(prevState => ({
          ...prevState,
          [typedVendor]: vendorState,
        }));
      },
    });
  }, [swapClient, swapParams, t, toAsset]);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const sponsoredAssetFee = accountBalance!.assets![feeAssetId]
    ? convertFeeToAsset(wavesFee, feeAsset)
    : null;

  const balanceErrorMessage =
    !sponsoredAssetFee ||
    fromAmountTokens.gt(fromAssetBalance.getTokens()) ||
    feeAssetBalance.getTokens().lt(sponsoredAssetFee.getTokens()) ||
    (fromAssetId === feeAssetId &&
      fromAmountTokens
        .add(sponsoredAssetFee.getTokens())
        .gt(fromAssetBalance.getTokens()))
      ? t('swap.insufficientFundsError')
      : null;

  const [showSlippageToleranceModal, setShowSlippageToleranceModal] =
    useState(false);

  const swapVendorInfo = swapInfo[swapVendor];

  const defaultPriceDirectionSwapped =
    swapVendorInfo.type === 'data' &&
    +swapVendorInfo.toAmountTokens
      .div(fromAmountTokens.eq(0) ? 1 : fromAmountTokens)
      .toFixed(toAsset.precision, BigNumber.ROUND_MODE.ROUND_FLOOR) < 1;
  const [isPriceDirectionSwapped, setIsPriceDirectionSwapped] = useState(
    defaultPriceDirectionSwapped
  );
  useEffect(() => {
    setIsPriceDirectionSwapped(defaultPriceDirectionSwapped);
  }, [defaultPriceDirectionSwapped]);

  const minReceived =
    swapVendorInfo.type === 'data'
      ? Money.fromTokens(
          fromAmountTokens.eq(0)
            ? new BigNumber(0)
            : swapVendorInfo.minimumReceivedTokens,
          toAsset
        )
      : null;

  const priceImpact =
    fromAmountTokens.eq(0) || swapVendorInfo.type !== 'data'
      ? new BigNumber(0)
      : new BigNumber(swapVendorInfo.priceImpact);

  const [nonProfitVendor, profitVendor] = (
    Object.keys(swapInfo) as SwapVendor[]
  ).reduce<[SwapVendor | null, SwapVendor]>(
    ([nonProfit, profit], next) => {
      const nonProfitInfo = swapInfo[nonProfit as SwapVendor];
      const minAmount =
        nonProfitInfo?.type === 'data'
          ? nonProfitInfo.toAmountTokens
          : BigNumber.MAX_VALUE;

      const profitInfo = swapInfo[profit];
      const maxAmount =
        profitInfo?.type === 'data'
          ? profitInfo.toAmountTokens
          : new BigNumber(0);

      const nextInfo = swapInfo[next];
      const nextAmount =
        nextInfo?.type === 'data' && fromAmountTokens.gt(0)
          ? nextInfo.toAmountTokens
          : null;

      return [
        (nextAmount || BigNumber.MAX_VALUE).lt(minAmount) ? next : nonProfit,
        (nextAmount || new BigNumber(0)).gt(maxAmount) ? next : profit,
      ];
    },
    [null, SwapVendor.Keeper]
  );

  useEffect(() => {
    if (!swapVendorTouched) {
      setSwapVendor(profitVendor);
    }
  }, [swapVendorTouched, profitVendor]);

  const fromSwappableAssets = useMemo(() => {
    const availableIds = new Set(
      Object.values(swappableAssetIdsByVendor)
        .filter(ids => ids.includes(toAsset.id))
        .flat()
    );

    return swappableAssets
      .filter(asset => asset.id !== toAsset.id)
      .map((asset): AssetSelectOption => {
        const isAvailable = availableIds.has(asset.id);

        return {
          ...asset,
          disabled: !isAvailable,
          disabledTooltip: isAvailable
            ? undefined
            : t('swap.notSwappablePairTooltip', {
                assetDisplayName1: toAsset.displayName,
                assetDisplayName2: asset.displayName,
              }),
        };
      });
  }, [swappableAssets, swappableAssetIdsByVendor, toAsset, t]);

  const toSwappableAssets = useMemo(() => {
    const availableIds = new Set(
      Object.values(swappableAssetIdsByVendor)
        .filter(ids => ids.includes(fromAsset.id))
        .flat()
    );

    return swappableAssets
      .filter(asset => asset.id !== fromAsset.id)
      .map((asset): AssetSelectOption => {
        const isAvailable = availableIds.has(asset.id);

        return {
          ...asset,
          disabled: !isAvailable,
          disabledTooltip: isAvailable
            ? undefined
            : t('swap.notSwappablePairTooltip', {
                assetDisplayName1: fromAsset.displayName,
                assetDisplayName2: asset.displayName,
              }),
        };
      });
  }, [swappableAssets, swappableAssetIdsByVendor, fromAsset, t]);

  return (
    <SwapLayout>
      <div className={styles.root}>
        <form
          id="swapForm"
          onSubmit={event => {
            event.preventDefault();

            if (swapVendorInfo.type !== 'data' || !minReceived) {
              return;
            }

            onSwap({
              feeAssetId,
              fromAssetId,
              fromCoins: Money.fromTokens(
                fromAmountTokens,
                fromAsset
              ).getCoins(),
              minReceivedCoins: minReceived.getCoins(),
              slippageTolerance,
              toAssetId,
              toCoins: Money.fromTokens(
                swapVendorInfo.toAmountTokens,
                toAsset
              ).getCoins(),
              tx: swapVendorInfo.tx,
              vendor: swapVendor,
            });
          }}
        >
          <AssetAmountInput
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            assetBalances={accountBalance!.assets!}
            assetOptions={fromSwappableAssets}
            balance={fromAssetBalance}
            label={t('swap.fromInputLabel')}
            maskedValue={fromAmountValueMasked}
            value={fromAmountValue}
            showUsdAmount
            onAssetChange={newAssetId => {
              setAssetIds(prevState => ({
                ...prevState,
                fromAssetId: newAssetId,
              }));
            }}
            onBalanceClick={() => {
              let max = fromAssetBalance;

              if (
                feeAssetId === fromAssetId &&
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                accountBalance!.assets![feeAssetId]
              ) {
                const fee = convertFeeToAsset(
                  wavesFee,
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  new Asset(assets[feeAssetId]!)
                );

                max = max.gt(fee) ? max.minus(fee) : max.cloneWithCoins(0);
              }

              const newValue = max.getTokens().toFixed();
              setFromAmountValueMasked(newValue);
              setFromAmountValue(newValue);
            }}
            onChange={(newValue, newValueMasked) => {
              setFromAmountValueMasked(newValueMasked);
              setFromAmountValue(newValue);
            }}
          />

          <div className={styles.swapDirectionBtnWrapper}>
            <button
              className={styles.swapDirectionBtn}
              type="button"
              onClick={() => {
                setAssetIds(prevState => ({
                  fromAssetId: prevState.toAssetId,
                  toAssetId: prevState.fromAssetId,
                }));

                const newFromAmount =
                  fromAmountValue === '' || swapVendorInfo.type !== 'data'
                    ? ''
                    : fromAmountTokens.eq(0)
                    ? '0'
                    : swapVendorInfo.toAmountTokens.toFixed();

                setFromAmountValue(newFromAmount);
                setFromAmountValueMasked(newFromAmount);
                setIsPriceDirectionSwapped(prevState => !prevState);
              }}
            >
              <svg
                className={styles.swapDirectionBtnIcon}
                width="14"
                height="14"
                fill="currentColor"
              >
                <path d="M3.4 3.43 2.131 4.697a.6.6 0 0 1-.848-.849l2.29-2.29a.6.6 0 0 1 .85 0l2.29 2.29a.6.6 0 0 1-.848.849L4.599 3.43V12a.6.6 0 0 1-1.2 0V3.43ZM10.6 10.551l1.266-1.266a.6.6 0 1 1 .848.848l-2.29 2.291a.6.6 0 0 1-.85 0l-2.29-2.29a.6.6 0 0 1 .848-.85L9.4 10.552v-8.57a.6.6 0 0 1 1.2 0v8.57Z" />
              </svg>
            </button>
          </div>

          <div className={styles.toAmount}>
            <div className={styles.toAmountHead}>
              <div className={styles.toAmountLabel}>
                {t('swap.toInputLabel')}
              </div>
              <div className={styles.toAmountBalance}>
                {t('assetAmountInput.balanceLabel')}:{' '}
                {toAssetBalance.toTokens()}
              </div>
            </div>

            <div className={styles.toAmountSelect}>
              <AssetSelect
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                assetBalances={accountBalance!.assets!}
                network={currentNetwork}
                options={toSwappableAssets}
                value={toAssetId}
                onChange={newAssetId => {
                  setAssetIds(prevState => ({
                    ...prevState,
                    toAssetId: newAssetId,
                  }));
                }}
              />
            </div>

            <div className={styles.toAmountCards}>
              {(
                Object.entries(swapInfo) as Array<
                  [SwapVendor, SwapInfoVendorState]
                >
              ).map(([vendor, info]) => {
                const amountTokens = new BigNumber(
                  info.type !== 'data'
                    ? '0'
                    : (fromAmountTokens.eq(0)
                        ? new BigNumber(0)
                        : info.toAmountTokens
                      ).toFixed()
                );

                const formattedValue = amountTokens.toFormat(
                  toAssetBalance.asset.precision,
                  BigNumber.ROUND_MODE.ROUND_FLOOR,
                  {
                    fractionGroupSeparator: '',
                    fractionGroupSize: 0,
                    decimalSeparator: '.',
                    groupSeparator: ' ',
                    groupSize: 3,
                    prefix: '',
                    secondaryGroupSize: 0,
                    suffix: '',
                  }
                );

                const nextInfo = swapInfo[nonProfitVendor as SwapVendor];

                const profitTokens =
                  info.type === 'data' &&
                  !fromAmountTokens.eq(0) &&
                  nextInfo != null &&
                  nextInfo.type === 'data'
                    ? info.toAmountTokens.sub(nextInfo.toAmountTokens)
                    : null;

                const usdPrice = usdPrices[toAssetId];

                return (
                  <button
                    key={vendor}
                    className={clsx(styles.toAmountCard, {
                      [styles.toAmountCardSelected]: swapVendor === vendor,
                    })}
                    type="button"
                    onClick={() => {
                      setSwapVendorTouched(true);
                      setSwapVendor(vendor);
                    }}
                  >
                    <div className={styles.toAmountCardVendor}>
                      <img
                        src={getSwapVendorLogo(vendor)}
                        className={styles.toAmountCardVendorLogo}
                      />

                      <div className={styles.toAmountCardVendorLabel}>
                        {vendor}
                      </div>
                    </div>

                    {info.type === 'loading' ? (
                      <Loader />
                    ) : info.type === 'data' ? (
                      <div className={styles.toAmountCardValue}>
                        <div
                          className={styles.toAmountCardFormattedValue}
                          title={formattedValue}
                        >
                          {formattedValue}
                        </div>

                        <UsdAmount
                          id={toAssetId}
                          className={styles.toAmountCardUsdAmount}
                          tokens={amountTokens}
                        />
                      </div>
                    ) : (
                      <div className={styles.toAmountCardError}>
                        {info.code === SwapClientErrorCode.INVALID_ASSET_PAIR ||
                        !isValidAssetPairSelected
                          ? t('swap.exchangeChannelInvalidAssetPairError')
                          : info.code === SwapClientErrorCode.UNAVAILABLE
                          ? t('swap.exchangeChannelUnavailableError')
                          : t('swap.exchangeChannelUnknownError')}
                      </div>
                    )}

                    {vendor === profitVendor && (
                      <div className={styles.toAmountCardBadge}>
                        {profitTokens != null && !profitTokens.eq(0) ? (
                          <>
                            {t('swap.profitLabel')}:
                            {usdPrice && usdPrice !== '1' && (
                              <>
                                {' '}
                                $
                                {new BigNumber(usdPrice)
                                  .mul(profitTokens)
                                  .toFixed(2)}
                              </>
                            )}{' '}
                            <Tooltip
                              content={`${profitTokens.toFixed(
                                toAsset.precision,
                                BigNumber.ROUND_MODE.ROUND_FLOOR
                              )} ${toAsset.displayName}`}
                              placement="top"
                            >
                              {props => (
                                <span
                                  {...props}
                                  className={styles.profitInfoIcon}
                                >
                                  <InfoIcon />
                                </span>
                              )}
                            </Tooltip>
                          </>
                        ) : (
                          t('swap.primaryLabel')
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {swapClientError && (
            <div className={styles.error}>{swapClientError}</div>
          )}

          <div className={styles.summary}>
            <div className={styles.summaryRow}>
              <div className={styles.summaryLabel}>
                <Tooltip
                  className={styles.tooltipContent}
                  content={t('swap.minimumReceivedTooltip')}
                >
                  {props => (
                    <span className={styles.summaryTooltipTarget} {...props}>
                      {t('swap.minimumReceived')}
                    </span>
                  )}
                </Tooltip>
              </div>

              <div className={styles.summaryValue}>
                {swapVendorInfo.type === 'loading' ? (
                  <Loader />
                ) : !minReceived ? (
                  t('swap.notAvailable')
                ) : swapVendorInfo.type === 'data' ? (
                  <div>
                    <button
                      className={styles.slippageToleranceBtn}
                      type="button"
                      onClick={() => {
                        setShowSlippageToleranceModal(true);
                      }}
                    >
                      <svg
                        className={styles.slippageToleranceBtnIcon}
                        width="14"
                        height="14"
                        fill="currentColor"
                        viewBox="0 0 18 18"
                      >
                        <path d="M16.47 8.215 15.21 8a.889.889 0 0 1-.738-.666 6.88 6.88 0 0 0-.428-1.047.956.956 0 0 1 .047-.976l.738-1.047a.472.472 0 0 0-.048-.618l-.428-.428a.472.472 0 0 0-.618-.048l-1.047.738c-.286.214-.666.214-.976.047a4.41 4.41 0 0 0-1.047-.428A.96.96 0 0 1 10 2.79l-.214-1.26a.484.484 0 0 0-.476-.405h-.618a.484.484 0 0 0-.476.404L8 2.79a.889.889 0 0 1-.666.738 6.88 6.88 0 0 0-1.047.428.956.956 0 0 1-.976-.047L4.265 3.17a.472.472 0 0 0-.618.048l-.428.428a.472.472 0 0 0-.048.618l.738 1.047c.214.286.214.666.047.976a4.41 4.41 0 0 0-.428 1.047A.96.96 0 0 1 2.79 8l-1.26.214a.484.484 0 0 0-.405.476v.618c0 .238.167.429.404.476L2.79 10a.89.89 0 0 1 .738.666c.119.381.262.714.428 1.047.167.31.143.69-.047.976l-.738 1.047a.472.472 0 0 0 .048.618l.428.428c.166.167.428.19.618.048l1.047-.738c.286-.214.666-.214.976-.047.333.19.69.333 1.047.428A.96.96 0 0 1 8 15.21l.214 1.26a.484.484 0 0 0 .476.405h.618a.484.484 0 0 0 .476-.404L10 15.21a.889.889 0 0 1 .666-.738 6.88 6.88 0 0 0 1.047-.428.956.956 0 0 1 .976.047l1.047.738a.47.47 0 0 0 .618-.048l.428-.428a.472.472 0 0 0 .048-.618l-.738-1.047c-.214-.286-.214-.666-.047-.976.19-.333.333-.69.428-1.047A.96.96 0 0 1 15.21 10l1.26-.214a.484.484 0 0 0 .405-.476v-.618a.484.484 0 0 0-.404-.476zm-7.446 5.067A4.295 4.295 0 0 1 4.74 9a4.295 4.295 0 0 1 4.283-4.282A4.295 4.295 0 0 1 13.306 9a4.295 4.295 0 0 1-4.282 4.282z" />
                      </svg>
                    </button>

                    <span>
                      {minReceived
                        .getTokens()
                        .toFormat(
                          toAsset.precision,
                          BigNumber.ROUND_MODE.ROUND_FLOOR
                        )}{' '}
                      {toAsset.displayName}
                    </span>
                  </div>
                ) : (
                  t('swap.notAvailable')
                )}
              </div>
            </div>

            <div className={styles.summaryRow}>
              <div className={styles.summaryLabel}>{t('swap.priceLabel')}</div>

              <div className={styles.summaryValue}>
                {swapVendorInfo.type === 'loading' ? (
                  <Loader />
                ) : swapVendorInfo.type === 'data' ? (
                  <div>
                    <button
                      className={styles.swapPriceDirectionBtn}
                      type="button"
                      onClick={() => {
                        setIsPriceDirectionSwapped(prevState => !prevState);
                      }}
                    >
                      <svg
                        className={styles.swapPriceDirectionBtnIcon}
                        width="14"
                        height="14"
                        fill="currentColor"
                        viewBox="0 0 14 14"
                      >
                        <path d="m9.293 2.124 1.267 1.267H1.99a.6.6 0 0 0 0 1.2h8.57L9.293 5.858a.6.6 0 1 0 .849.848l2.29-2.29a.6.6 0 0 0 0-.85l-2.29-2.29a.6.6 0 0 0-.849.848Zm-4.588 9.733L3.44 10.591h8.57a.6.6 0 1 0 0-1.2h-8.57l1.266-1.267a.6.6 0 0 0-.848-.848l-2.291 2.29a.6.6 0 0 0 0 .85l2.29 2.29a.6.6 0 0 0 .85-.848Z" />
                      </svg>
                    </button>
                    {isPriceDirectionSwapped ? (
                      <span>
                        1 {toAsset.displayName} ≈{' '}
                        {(swapVendorInfo.toAmountTokens.eq(0)
                          ? new BigNumber(0)
                          : (fromAmountTokens.eq(0)
                              ? new BigNumber(1)
                              : fromAmountTokens
                            ).div(swapVendorInfo.toAmountTokens)
                        ).toFixed(
                          fromAsset.precision,
                          BigNumber.ROUND_MODE.ROUND_FLOOR
                        )}{' '}
                        {fromAsset.displayName}
                      </span>
                    ) : (
                      <span>
                        1 {fromAsset.displayName} ~{' '}
                        {swapVendorInfo.toAmountTokens
                          .div(fromAmountTokens.eq(0) ? 1 : fromAmountTokens)
                          .toFixed(
                            toAsset.precision,
                            BigNumber.ROUND_MODE.ROUND_FLOOR
                          )}{' '}
                        {toAsset.displayName}
                      </span>
                    )}{' '}
                    <span
                      style={{
                        color: priceImpact.gte(10)
                          ? 'var(--color-error400)'
                          : priceImpact.gte(5)
                          ? 'var(--color-warning400)'
                          : undefined,
                      }}
                    >
                      (
                      <Tooltip
                        className={styles.tooltipContent}
                        content={t('swap.priceImpactTooltip')}
                      >
                        {props => (
                          <span
                            className={styles.summaryTooltipTarget}
                            {...props}
                          >
                            {priceImpact.toFixed(
                              priceImpact.eq(100) ? 0 : 3,
                              BigNumber.ROUND_MODE.ROUND_FLOOR
                            )}
                            %
                          </span>
                        )}
                      </Tooltip>
                      )
                    </span>
                  </div>
                ) : (
                  t('swap.notAvailable')
                )}
              </div>
            </div>

            <div className={clsx(styles.summaryRow, styles.summaryRowCenter)}>
              <div className={styles.summaryLabel}>
                <Tooltip
                  className={styles.tooltipContent}
                  content={t('swap.transactionFeeTooltip')}
                >
                  {props => (
                    <span className={styles.summaryTooltipTarget} {...props}>
                      {t('swap.transactionFee')}
                    </span>
                  )}
                </Tooltip>
              </div>

              <div className={styles.summaryValue}>
                {finalFeeOptions.length > 1 ? (
                  <Select
                    listPlacement="top"
                    selected={feeAssetId}
                    selectList={finalFeeOptions.map(money => ({
                      id: money.asset.id,
                      text: formatFeeOption(money),
                      value: money.asset.id,
                    }))}
                    theme="compact"
                    onSelectItem={(_id, value) => {
                      setFeeAssetId(value);
                    }}
                  />
                ) : (
                  <span className={styles.summaryValueText}>
                    {formatFeeOption(finalFeeOptions[0])}
                  </span>
                )}
              </div>
            </div>
          </div>
        </form>

        <Modal
          animation={Modal.ANIMATION.FLASH}
          showModal={showSlippageToleranceModal}
        >
          <div className="modal cover">
            <div className="modal-form">
              <Button
                className="modal-close"
                onClick={() => {
                  setShowSlippageToleranceModal(false);
                }}
                view="transparent"
              />

              <div className={styles.slippageToleranceModalTitle}>
                {t('swap.slippageToleranceModalTitle')}
              </div>

              <p className={styles.slippageToleranceModalDescription}>
                {t('swap.slippageToleranceModalDescription')}
              </p>

              <div className={styles.slippageToleranceControl}>
                {
                  // eslint-disable-next-line @typescript-eslint/no-shadow
                  SLIPPAGE_TOLERANCE_OPTIONS.map((slippageTolerance, index) => {
                    const id = `slippageTolerance-${index}`;

                    return (
                      <Fragment key={index}>
                        <input
                          checked={index === slippageToleranceIndex}
                          className={styles.slippageToleranceInput}
                          id={id}
                          name="slippageTolerance"
                          type="radio"
                          value={index}
                          onChange={() => {
                            setSlippageToleranceIndex(index);
                          }}
                        />

                        <label
                          className={styles.slippageToleranceLabel}
                          htmlFor={id}
                        >
                          {slippageTolerance.toString()}%
                        </label>
                      </Fragment>
                    );
                  })
                }
              </div>
            </div>
          </div>
        </Modal>
      </div>

      <div className={styles.stickyBottomPanel}>
        {(maxAmountExceededErrorMessage ||
          balanceErrorMessage ||
          swapErrorMessage) && (
          <div className={styles.stickyBottomPanelError}>
            {maxAmountExceededErrorMessage ||
              balanceErrorMessage ||
              swapErrorMessage}
          </div>
        )}

        <Button
          className="fullwidth"
          disabled={
            fromAmountTokens.eq(0) ||
            maxAmountExceededErrorMessage != null ||
            balanceErrorMessage != null ||
            swapVendorInfo.type !== 'data' ||
            isSwapInProgress
          }
          form="swapForm"
          loading={isSwapInProgress}
          type="submit"
          view="submit"
        >
          {t('swap.submitButtonText')}
        </Button>
      </div>
    </SwapLayout>
  );
}
