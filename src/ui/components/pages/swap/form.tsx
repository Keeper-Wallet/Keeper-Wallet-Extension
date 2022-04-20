import BigNumber from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import cn from 'classnames';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AssetAmountInput } from 'assets/amountInput';
import { AssetSelect } from 'assets/assetSelect';
import { convertToSponsoredAssetFee } from 'assets/utils';
import { setUiState } from 'ui/actions/uiState';
import { Button } from 'ui/components/ui/buttons/Button';
import { Loader } from 'ui/components/ui/loader/Loader';
import { Modal } from 'ui/components/ui/modal/Modal';
import { Select } from 'ui/components/ui/select/Select';
import { Tooltip } from 'ui/components/ui/tooltip';
import { AccountBalance, AssetBalance } from 'ui/reducers/updateState';
import { AssetDetail } from 'ui/services/Background';
import { useAppDispatch, useAppSelector } from 'ui/store';
import { proto } from './channel.proto.compiled';
import { ExchangeChannelClient } from './channelClient';
import * as styles from './form.module.css';
import { SwapLayout } from './layout';
import { UsdAmount } from 'ui/components/ui/UsdAmount';

const SLIPPAGE_TOLERANCE_OPTIONS = [
  new BigNumber(0.1),
  new BigNumber(0.5),
  new BigNumber(1),
  new BigNumber(3),
];

const KEEPER_FEE = new BigNumber(0.1);

function getAssetBalance(asset: Asset, accountBalance: AccountBalance) {
  return asset.id === 'WAVES'
    ? new Money(accountBalance.available, asset)
    : new Money(accountBalance.assets?.[asset.id]?.balance || '0', asset);
}

interface Props {
  initialFromAssetId: string;
  initialToAssetId: string;
  isSwapInProgress: boolean;
  swapErrorMessage: string;
  swappableAssets: AssetDetail[];
  wavesFeeCoins: number;
  onSwap: (data: {
    feeAssetId: string;
    fromAssetId: string;
    fromCoins: BigNumber;
    minReceivedCoins: BigNumber;
    slippageTolerance: number;
  }) => void;
}

enum ExchangeInfoVendor {
  Keeper = 'keeper',
  Puzzle = 'puzzle',
}

type ExchangeInfoVendorState =
  | {
      type: 'loading';
    }
  | {
      type: 'error';
      code: proto.Response.Error.CODES;
    }
  | {
      type: 'data';
      priceImpact: number;
      toAmountTokens: BigNumber;
      worstAmountTokens: BigNumber;
    };

type ExchangeInfoState = {
  [K in ExchangeInfoVendor]: ExchangeInfoVendorState;
};

const exchangeInfoInitialState: ExchangeInfoState = {
  [ExchangeInfoVendor.Keeper]: { type: 'loading' },
  [ExchangeInfoVendor.Puzzle]: { type: 'loading' },
};

export function SwapForm({
  initialFromAssetId,
  initialToAssetId,
  isSwapInProgress,
  swapErrorMessage,
  swappableAssets,
  wavesFeeCoins,
  onSwap,
}: Props) {
  const { t } = useTranslation();

  const assets = useAppSelector(state => state.assets);
  const accountBalance = useAppSelector(
    state => state.balances[state.selectedAccount.address]
  );

  const currentNetwork = useAppSelector(state => state.currentNetwork);

  const swapChannel = useAppSelector(
    state => state.config.network_config[state.currentNetwork].swapChannel
  );

  const wavesFeeCoinsBN = new BigNumber(wavesFeeCoins);

  const sponsoredAssetBalanceEntries = Object.entries(
    accountBalance.assets
  ).filter(([assetId, assetBalance]) => {
    const sponsoredAssetFee = convertToSponsoredAssetFee(
      wavesFeeCoinsBN,
      new Asset(assets[assetId]),
      assetBalance
    );

    return (
      assetBalance.minSponsoredAssetFee != null &&
      new BigNumber(assetBalance.sponsorBalance).gte(wavesFeeCoinsBN) &&
      new BigNumber(assetBalance.balance).gte(sponsoredAssetFee.getCoins())
    );
  });

  if (sponsoredAssetBalanceEntries.length === 0) {
    sponsoredAssetBalanceEntries.push([
      'WAVES',
      accountBalance.assets['WAVES'],
    ]);
  }

  const [{ fromAssetId, toAssetId }, setAssetIds] = React.useState({
    fromAssetId: initialFromAssetId,
    toAssetId: initialToAssetId,
  });

  const [feeAssetId, setFeeAssetId] = React.useState(
    sponsoredAssetBalanceEntries[0][0]
  );

  const fromAsset = React.useMemo(
    () => new Asset(assets[fromAssetId]),
    [assets, fromAssetId]
  );

  const toAsset = React.useMemo(
    () => new Asset(assets[toAssetId]),
    [assets, toAssetId]
  );

  const feeAsset = new Asset(assets[feeAssetId]);

  const fromAssetBalance = getAssetBalance(fromAsset, accountBalance);
  const toAssetBalance = getAssetBalance(toAsset, accountBalance);
  const feeAssetBalance = getAssetBalance(feeAsset, accountBalance);

  function formatSponsoredAssetBalanceEntry([assetId, assetBalance]: [
    string,
    AssetBalance
  ]) {
    const fee = convertToSponsoredAssetFee(
      new BigNumber(wavesFeeCoins),
      new Asset(assets[assetId]),
      assetBalance
    );

    return `${fee.getTokens().toFormat()} ${fee.asset.displayName}`;
  }

  const [fromAmountValue, setFromAmountValue] = React.useState('');
  const [isPriceDirectionSwapped, setIsPriceDirectionSwapped] =
    React.useState(false);

  const fromAmountTokens = new BigNumber(fromAmountValue || '0');

  const [exchangeInfo, setExchangeInfo] = React.useState<ExchangeInfoState>(
    exchangeInfoInitialState
  );

  const [channelClient, setChannelClient] =
    React.useState<ExchangeChannelClient | null>(null);

  React.useEffect(() => {
    const client = new ExchangeChannelClient('ws://localhost:8765');

    setChannelClient(client);

    return () => {
      client.close();
    };
  }, [swapChannel]);

  const latestFromAmountValueRef = React.useRef(fromAmountValue);

  React.useEffect(() => {
    latestFromAmountValueRef.current = fromAmountValue;
  }, [fromAmountValue]);

  const [exchangeChannelError, setExchangeChannelError] = React.useState<
    string | null
  >(null);

  const watchExchange = React.useCallback(() => {
    let fromTokens = new BigNumber(latestFromAmountValueRef.current || '0');

    if (fromTokens.eq(0)) {
      fromTokens = new BigNumber(1);
    }

    return channelClient?.exchange(
      {
        fromAmountCoins: Money.fromTokens(fromTokens, fromAsset).getCoins(),
        fromAsset,
        toAsset,
      },
      (err, vendor, response) => {
        if (err) {
          setExchangeInfo(exchangeInfoInitialState);
          setExchangeChannelError(t('swap.exchangeChannelConnectionError'));
          return;
        }

        setExchangeChannelError(null);

        const typedVendor = vendor as ExchangeInfoVendor;

        if (!Object.values(ExchangeInfoVendor).includes(typedVendor)) {
          return;
        }

        let vendorState: ExchangeInfoVendorState;

        if (response.type === 'error') {
          vendorState = {
            type: 'error',
            code: response.code,
          };
        } else {
          vendorState = {
            type: 'data',
            priceImpact: response.priceImpact,
            toAmountTokens: new Money(
              response.toAmountCoins,
              toAsset
            ).getTokens(),
            worstAmountTokens: new Money(
              response.worstAmountCoins,
              toAsset
            ).getTokens(),
          };
        }

        setExchangeInfo(prevState => ({
          ...prevState,
          [typedVendor]: vendorState,
        }));
      }
    );
  }, [channelClient, fromAsset, toAsset]);

  React.useEffect(() => {
    setExchangeInfo(exchangeInfoInitialState);
    watchExchange();
  }, [watchExchange]);

  const watchExchangeRef = React.useRef(watchExchange);

  React.useEffect(() => {
    watchExchangeRef.current = watchExchange;
  }, [watchExchange]);

  const sponsoredAssetFee = convertToSponsoredAssetFee(
    wavesFeeCoinsBN,
    feeAsset,
    accountBalance.assets[feeAssetId]
  );

  const validationErrorMessage =
    fromAmountTokens.gt(fromAssetBalance.getTokens()) ||
    feeAssetBalance.getTokens().lt(sponsoredAssetFee.getTokens()) ||
    (fromAssetId === feeAssetId &&
      fromAmountTokens
        .add(sponsoredAssetFee.getTokens())
        .gt(fromAssetBalance.getTokens()))
      ? t('swap.insufficientFundsError')
      : null;

  const watchExchangeTimeoutRef = React.useRef<number | null>(null);

  function setFromAmount(newValue: string) {
    if (newValue !== fromAmountValue) {
      setFromAmountValue(newValue);
      setExchangeInfo(exchangeInfoInitialState);

      if (watchExchangeTimeoutRef.current != null) {
        window.clearTimeout(watchExchangeTimeoutRef.current);
      }

      watchExchangeTimeoutRef.current = window.setTimeout(() => {
        watchExchangeRef.current();
      }, 500);
    }
  }

  const [showSlippageToleranceModal, setShowSlippageToleranceModal] =
    React.useState(false);

  const slippageToleranceIndex = useAppSelector(
    state => state.uiState.slippageToleranceIndex ?? 2
  );

  const slippageTolerance = SLIPPAGE_TOLERANCE_OPTIONS[slippageToleranceIndex];

  const [selectedExchangeVendor, setSelectedExchangeVendor] = React.useState(
    ExchangeInfoVendor.Keeper
  );

  const vendorExchangeInfo = exchangeInfo[selectedExchangeVendor];

  const minReceived =
    vendorExchangeInfo.type === 'data'
      ? Money.fromTokens(
          fromAmountTokens.eq(0)
            ? new BigNumber(0)
            : vendorExchangeInfo.toAmountTokens
                .mul(new BigNumber(100).sub(slippageTolerance).sub(KEEPER_FEE))
                .div(100)
                .roundTo(toAsset.precision, BigNumber.ROUND_MODE.ROUND_FLOOR),
          toAsset
        )
      : null;

  const dispatch = useAppDispatch();

  const priceImpact =
    fromAmountTokens.eq(0) || vendorExchangeInfo.type !== 'data'
      ? new BigNumber(0)
      : new BigNumber(vendorExchangeInfo.priceImpact);

  const sortedExchangeInfoEntries = (
    Object.entries(exchangeInfo) as Array<
      [ExchangeInfoVendor, ExchangeInfoVendorState]
    >
  ).sort(([aVendor, aInfo], [bVendor, bInfo]) => {
    if (aInfo.type !== 'data' && bInfo.type !== 'data') {
      return 0;
    }

    if (aInfo.type !== 'data') {
      return -1;
    }

    if (bInfo.type !== 'data') {
      return 1;
    }

    const aAmount = aInfo.toAmountTokens;
    const bAmount = bInfo.toAmountTokens;

    return aAmount.gt(bAmount)
      ? -1
      : bAmount.gt(aAmount)
      ? 1
      : aVendor === ExchangeInfoVendor.Keeper
      ? -1
      : bVendor === ExchangeInfoVendor.Keeper
      ? 1
      : 0;
  });

  return (
    <SwapLayout>
      <div className={styles.root}>
        <form
          id="swapForm"
          onSubmit={event => {
            event.preventDefault();

            onSwap({
              feeAssetId,
              fromAssetId,
              fromCoins: Money.fromTokens(
                fromAmountTokens,
                fromAsset
              ).getCoins(),
              minReceivedCoins: minReceived.getCoins(),
              slippageTolerance: slippageTolerance.toNumber() * 10,
            });
          }}
        >
          <AssetAmountInput
            assetBalances={accountBalance.assets}
            assetOptions={swappableAssets.filter(
              asset => asset.id !== toAssetId
            )}
            balance={fromAssetBalance}
            label={t('swap.fromInputLabel')}
            showUsdAmount
            value={fromAmountValue}
            onAssetChange={newAssetId => {
              setAssetIds(prevState => ({
                ...prevState,
                fromAssetId: newAssetId,
              }));
            }}
            onBalanceClick={() => {
              let max = fromAssetBalance;

              if (feeAssetId === fromAssetId) {
                const fee = convertToSponsoredAssetFee(
                  new BigNumber(wavesFeeCoins),
                  new Asset(assets[feeAssetId]),
                  accountBalance.assets[feeAssetId]
                );

                max = max.gt(fee) ? max.minus(fee) : max.cloneWithCoins(0);
              }

              setFromAmount(max.getTokens().toFixed());
            }}
            onChange={newValue => {
              setFromAmount(newValue);
            }}
          />

          <div className={styles.swapDirectionBtnWrapper}>
            <button
              className={styles.swapDirectionBtn}
              disabled={vendorExchangeInfo.type !== 'data'}
              type="button"
              onClick={() => {
                if (vendorExchangeInfo.type !== 'data') {
                  return;
                }

                setAssetIds(prevState => ({
                  fromAssetId: prevState.toAssetId,
                  toAssetId: prevState.fromAssetId,
                }));

                const newFromAmount =
                  fromAmountValue === ''
                    ? ''
                    : fromAmountTokens.eq(0)
                    ? '0'
                    : vendorExchangeInfo.toAmountTokens.toFixed();

                setFromAmount(newFromAmount);
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
                assetBalances={accountBalance.assets}
                network={currentNetwork}
                options={swappableAssets.filter(
                  asset => asset.id !== fromAssetId
                )}
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
              {sortedExchangeInfoEntries.map(([vendor, info], index) => {
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

                const nextInfo =
                  sortedExchangeInfoEntries.length > index + 1
                    ? sortedExchangeInfoEntries[index + 1][1]
                    : null;

                const profitTokens =
                  info.type === 'data' &&
                  !fromAmountTokens.eq(0) &&
                  index === 0 &&
                  nextInfo != null &&
                  nextInfo.type === 'data'
                    ? info.toAmountTokens.sub(nextInfo.toAmountTokens)
                    : null;

                const toAssetDetail = assets[toAssetId];

                return (
                  <button
                    key={vendor}
                    className={cn(styles.toAmountCard, {
                      [styles.toAmountCard_selected]:
                        selectedExchangeVendor === vendor,
                    })}
                    type="button"
                    onClick={() => {
                      setSelectedExchangeVendor(vendor);
                    }}
                  >
                    <div className={styles.toAmountCardLabel}>{vendor}</div>

                    {info.type === 'loading' ? (
                      <Loader />
                    ) : info.type === 'data' ? (
                      <>
                        <div
                          className={styles.toAmountCardValue}
                          title={formattedValue}
                        >
                          {formattedValue}
                        </div>

                        <UsdAmount
                          asset={toAssetDetail}
                          className={styles.toAmountCardUsdAmount}
                          tokens={amountTokens}
                        />
                      </>
                    ) : (
                      <div className={styles.toAmountCardError}>
                        {info.code ===
                        proto.Response.Error.CODES.INVALID_ASSET_PAIR
                          ? t('swap.exchangeChannelInvalidAssetPairError')
                          : info.code === proto.Response.Error.CODES.UNAVAILABLE
                          ? t('swap.exchangeChannelUnavailableError')
                          : t('swap.exchangeChannelUnknownError')}
                      </div>
                    )}

                    {profitTokens != null && (
                      <div className={styles.toAmountCardBadge}>
                        <Trans i18nKey="swap.profitLabel" />: +
                        {profitTokens.toFixed(
                          toAsset.precision,
                          BigNumber.ROUND_MODE.ROUND_FLOOR
                        )}{' '}
                        {toAsset.displayName}
                        {toAssetDetail.usdPrice &&
                          toAssetDetail.usdPrice !== '1' && (
                            <>
                              {' '}
                              (≈ $
                              {new BigNumber(toAssetDetail.usdPrice)
                                .mul(profitTokens)
                                .toFixed(2)}
                              )
                            </>
                          )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {exchangeChannelError && (
            <div className={styles.error}>{exchangeChannelError}</div>
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
                {vendorExchangeInfo.type === 'loading' ? (
                  <Loader />
                ) : vendorExchangeInfo.type === 'data' ? (
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
                {vendorExchangeInfo.type === 'loading' ? (
                  <Loader />
                ) : vendorExchangeInfo.type === 'data' ? (
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
                        {(fromAmountTokens.eq(0)
                          ? new BigNumber(1)
                          : fromAmountTokens
                        )
                          .div(vendorExchangeInfo.toAmountTokens)
                          .toFixed(
                            fromAsset.precision,
                            BigNumber.ROUND_MODE.ROUND_FLOOR
                          )}{' '}
                        {fromAsset.displayName}
                      </span>
                    ) : (
                      <span>
                        1 {fromAsset.displayName} ~{' '}
                        {vendorExchangeInfo.toAmountTokens
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
                      {
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
                                3,
                                BigNumber.ROUND_MODE.ROUND_FLOOR
                              )}
                              %
                            </span>
                          )}
                        </Tooltip>
                      }
                      )
                    </span>
                  </div>
                ) : (
                  t('swap.notAvailable')
                )}
              </div>
            </div>

            <div className={cn(styles.summaryRow, styles.summaryRow_center)}>
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
                {sponsoredAssetBalanceEntries.length > 1 ? (
                  <Select
                    listPlacement="top"
                    selected={feeAssetId}
                    selectList={sponsoredAssetBalanceEntries.map(
                      ([assetId, assetBalance]) => ({
                        id: assetId,
                        text: formatSponsoredAssetBalanceEntry([
                          assetId,
                          assetBalance,
                        ]),
                        value: assetId,
                      })
                    )}
                    theme="compact"
                    onSelectItem={(_id, value) => {
                      setFeeAssetId(value);
                    }}
                  />
                ) : (
                  <span className={styles.summaryValueText}>
                    {formatSponsoredAssetBalanceEntry(
                      sponsoredAssetBalanceEntries[0]
                    )}
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
                {SLIPPAGE_TOLERANCE_OPTIONS.map((slippageTolerance, index) => {
                  const id = `slippageTolerance-${index}`;

                  return (
                    <React.Fragment key={index}>
                      <input
                        checked={index === slippageToleranceIndex}
                        className={styles.slippageToleranceInput}
                        id={id}
                        name="slippageTolerance"
                        type="radio"
                        value={index}
                        onChange={() => {
                          dispatch(
                            setUiState({ slippageToleranceIndex: index })
                          );
                        }}
                      />

                      <label
                        className={styles.slippageToleranceLabel}
                        htmlFor={id}
                      >
                        {slippageTolerance.toFixed()}%
                      </label>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        </Modal>
      </div>

      <div className={styles.stickyBottomPanel}>
        {(validationErrorMessage || swapErrorMessage) && (
          <div className={styles.stickyBottomPanelError}>
            {validationErrorMessage || swapErrorMessage}
          </div>
        )}

        <Button
          className="fullwidth"
          disabled={
            fromAmountTokens.eq(0) ||
            validationErrorMessage != null ||
            vendorExchangeInfo.type !== 'data' ||
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
