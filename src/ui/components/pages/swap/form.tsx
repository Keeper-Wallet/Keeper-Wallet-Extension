import BigNumber from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import cn from 'classnames';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { AssetAmountInput } from 'assets/amountInput';
import { AssetSelectModal } from 'assets/selectModal';
import { convertToSponsoredAssetFee } from 'assets/utils';
import { Button } from 'ui/components/ui/buttons/Button';
import { Loader } from 'ui/components/ui/loader/Loader';
import { Modal } from 'ui/components/ui/modal/Modal';
import { Select } from 'ui/components/ui/select/Select';
import { Tooltip } from 'ui/components/ui/tooltip';
import { AccountBalance, AssetBalance } from 'ui/reducers/updateState';
import { AssetDetail } from 'ui/services/Background';
import { useAppDispatch, useAppSelector } from 'ui/store';
import {
  ExchangeChannelClient,
  ExchangeChannelError,
  ExchangeChannelErrorCode,
  ExchangeChannelErrorType,
  ExchangePool,
} from './channelClient';
import * as styles from './form.module.css';
import { updateAssets } from 'ui/actions/assets';
import { setUiState } from 'ui/actions/uiState';

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
    route: ExchangePool[];
    slippageTolerance: number;
  }) => void;
}

interface ExchangeInfoState {
  priceImpact: number;
  route: ExchangePool[];
  toAmountTokens: BigNumber;
  worstAmountTokens: BigNumber;
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
  const { t } = useTranslation();

  const assets = useAppSelector(state => state.assets);
  const accountBalance = useAppSelector(
    state => state.balances[state.selectedAccount.address]
  );

  const currentNetwork = useAppSelector(state => state.currentNetwork);

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

  const [exchangeInfo, setExchangeInfo] =
    React.useState<ExchangeInfoState | null>(null);

  const channelClientRef = React.useRef<ExchangeChannelClient | null>(null);

  React.useEffect(() => {
    channelClientRef.current = new ExchangeChannelClient('ws://localhost:8765');

    return () => {
      channelClientRef.current.close();
      channelClientRef.current = null;
    };
  }, []);

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

    return channelClientRef.current?.exchange(
      {
        fromAmountCoins: Money.fromTokens(fromTokens, fromAsset).getCoins(),
        fromAsset,
        toAsset,
      },
      (err, response) => {
        if (err) {
          if (err instanceof ExchangeChannelError) {
            if (err.type === ExchangeChannelErrorType.ConnectionError) {
              setExchangeChannelError(t('swap.exchangeChannelConnectionError'));
              return;
            } else if (err.type === ExchangeChannelErrorType.ExchangeError) {
              if (err.code === ExchangeChannelErrorCode.INVALID_ASSET_PAIR) {
                setExchangeChannelError(
                  t('swap.exchangeChannelInvalidAssetPairError')
                );
                return;
              }
            }
          }

          setExchangeChannelError(t('swap.exchangeChannelUnknownError'));
          return;
        }

        const { priceImpact, route, toAmountCoins, worstAmountCoins } =
          response;

        setExchangeChannelError(null);

        setExchangeInfo({
          priceImpact,
          route,
          toAmountTokens: new Money(toAmountCoins, toAsset).getTokens(),
          worstAmountTokens: new Money(worstAmountCoins, toAsset).getTokens(),
        });
      }
    );
  }, [fromAsset, toAsset]);

  React.useEffect(watchExchange, [watchExchange]);

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
      setExchangeInfo(null);

      if (watchExchangeTimeoutRef.current != null) {
        window.clearTimeout(watchExchangeTimeoutRef.current);
      }

      watchExchangeTimeoutRef.current = window.setTimeout(() => {
        watchExchangeRef.current();
      }, 500);
    }
  }

  const [showSelectAsset, setShowSelectAsset] = React.useState<'from' | 'to'>(
    null
  );

  const slippageToleranceIndex = useAppSelector(
    state => state.uiState.slippageToleranceIndex ?? 2
  );

  const slippageTolerance = SLIPPAGE_TOLERANCE_OPTIONS[slippageToleranceIndex];

  const minReceived = exchangeInfo
    ? Money.fromTokens(
        fromAmountTokens.eq(0)
          ? new BigNumber(0)
          : exchangeInfo.toAmountTokens
              .mul(new BigNumber(100).sub(slippageTolerance).sub(KEEPER_FEE))
              .div(100)
              .roundTo(toAsset.precision, BigNumber.ROUND_MODE.ROUND_FLOOR),
        toAsset
      )
    : null;

  const routeAssets = React.useMemo(
    () =>
      (exchangeInfo ? exchangeInfo.route : [])
        .flatMap((pool, index) =>
          index === 0 ? [pool.fromAssetId, pool.toAssetId] : [pool.toAssetId]
        )
        .map(assetId => new Asset(assets[assetId])),
    [assets, exchangeInfo]
  );

  const dispatch = useAppDispatch();

  React.useEffect(() => {
    const assetsToUpdate = Array.from(
      new Set(routeAssets.filter(asset => asset == null))
    );

    if (assetsToUpdate.length !== 0) {
      dispatch(updateAssets(assetsToUpdate));
    }
  }, [dispatch, routeAssets]);

  return (
    <form
      onSubmit={event => {
        event.preventDefault();

        onSwap({
          feeAssetId,
          fromAssetId,
          fromCoins: Money.fromTokens(fromAmountTokens, fromAsset).getCoins(),
          minReceivedCoins: minReceived.getCoins(),
          route: exchangeInfo.route,
          slippageTolerance: slippageTolerance.toNumber() * 10,
        });
      }}
    >
      <AssetAmountInput
        balance={fromAssetBalance}
        label={t('swap.fromInputLabel', {
          asset: fromAssetBalance.asset.displayName,
        })}
        value={fromAmountValue}
        onChange={newValue => {
          setFromAmount(newValue);
        }}
        onMaxClick={() => {
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
        onLogoClick={() => {
          setShowSelectAsset('from');
        }}
      />

      <div className={styles.swapDirectionBtnWrapper}>
        <button
          className={styles.swapDirectionBtn}
          disabled={exchangeInfo == null}
          type="button"
          onClick={() => {
            if (!exchangeInfo) {
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
                : exchangeInfo.toAmountTokens.toFixed();

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

      <div className={styles.toAmountInput}>
        <AssetAmountInput
          balance={toAssetBalance}
          label={t('swap.toInputLabel', {
            asset: toAssetBalance.asset.displayName,
          })}
          loading={exchangeInfo == null}
          value={
            exchangeInfo == null
              ? ''
              : (fromAmountTokens.eq(0)
                  ? new BigNumber(0)
                  : exchangeInfo.toAmountTokens
                ).toFixed()
          }
          onLogoClick={() => {
            setShowSelectAsset('to');
          }}
        />

        {exchangeInfo == null || fromAmountTokens.eq(0) ? null : (
          <div className={styles.toAmountInputGainBadge}>
            {exchangeInfo.toAmountTokens.eq(exchangeInfo.worstAmountTokens) ? (
              <Trans i18nKey="swap.gainBestPrice" />
            ) : (
              `+${exchangeInfo.toAmountTokens
                .sub(exchangeInfo.worstAmountTokens)
                .toFixed(
                  toAsset.precision,
                  BigNumber.ROUND_MODE.ROUND_FLOOR
                )} ${toAsset.displayName} (${exchangeInfo.toAmountTokens
                .div(exchangeInfo.worstAmountTokens)
                .sub(1)
                .mul(100)
                .toFixed(2, BigNumber.ROUND_MODE.ROUND_HALF_EVEN)}%)`
            )}
          </div>
        )}
      </div>

      {exchangeChannelError && (
        <div className={styles.error}>{exchangeChannelError}</div>
      )}

      <div className={styles.summary}>
        <div className={styles.summaryRow}>
          <div className={styles.summaryLabel}>
            <Tooltip
              className={styles.summaryTooltipContent}
              content={<Trans i18nKey="swap.slippageToleranceTooltip" />}
            >
              {props => (
                <span className={styles.summaryLabelTooltip} {...props}>
                  <Trans i18nKey="swap.slippageTolerance" />
                </span>
              )}
            </Tooltip>
          </div>

          <div className={styles.summaryValue}>
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
                      dispatch(setUiState({ slippageToleranceIndex: index }));
                    }}
                  />

                  <label className={styles.slippageToleranceLabel} htmlFor={id}>
                    <span className={styles.slippageToleranceLabelInner}>
                      {slippageTolerance.toFixed()}%
                    </span>
                  </label>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className={styles.summaryRow}>
          <div className={styles.summaryLabel}>
            <Tooltip
              className={styles.summaryTooltipContent}
              content={<Trans i18nKey="swap.minimumReceivedTooltip" />}
            >
              {props => (
                <span className={styles.summaryLabelTooltip} {...props}>
                  <Trans i18nKey="swap.minimumReceived" />
                </span>
              )}
            </Tooltip>
          </div>

          <div className={styles.summaryValue}>
            {exchangeInfo == null ? (
              <Loader />
            ) : (
              <span className={styles.summaryValueText}>
                {minReceived
                  .getTokens()
                  .toFormat(
                    toAsset.precision,
                    BigNumber.ROUND_MODE.ROUND_FLOOR
                  )}{' '}
                {toAsset.displayName}
              </span>
            )}
          </div>
        </div>

        <div className={styles.summaryRow}>
          <div className={styles.summaryLabel}>
            <Trans i18nKey="swap.priceLabel" />
          </div>

          <div className={styles.summaryValue}>
            {exchangeInfo == null ? (
              <Loader />
            ) : (
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
                    1 {toAsset.displayName} ~{' '}
                    {(fromAmountTokens.eq(0)
                      ? new BigNumber(1)
                      : fromAmountTokens
                    )
                      .div(exchangeInfo.toAmountTokens)
                      .toFixed(
                        fromAsset.precision,
                        BigNumber.ROUND_MODE.ROUND_FLOOR
                      )}{' '}
                    {fromAsset.displayName}
                  </span>
                ) : (
                  <span>
                    1 {fromAsset.displayName} ~{' '}
                    {exchangeInfo.toAmountTokens
                      .div(fromAmountTokens.eq(0) ? 1 : fromAmountTokens)
                      .toFixed(
                        toAsset.precision,
                        BigNumber.ROUND_MODE.ROUND_FLOOR
                      )}{' '}
                    {toAsset.displayName}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Button
        className="fullwidth"
        disabled={
          fromAmountTokens.eq(0) ||
          validationErrorMessage != null ||
          exchangeInfo == null ||
          isSwapInProgress
        }
        loading={isSwapInProgress}
        type="submit"
      >
        <Trans i18nKey="swap.submitButtonText" />
      </Button>

      {(validationErrorMessage || swapErrorMessage) && (
        <div className={styles.error}>
          {validationErrorMessage || swapErrorMessage}
        </div>
      )}

      <div className={styles.summary}>
        <div className={styles.summaryRow}>
          <div className={styles.summaryLabel}>
            <Tooltip
              className={styles.summaryTooltipContent}
              content={<Trans i18nKey="swap.routeTooltip" />}
            >
              {props => (
                <span className={styles.summaryLabelTooltip} {...props}>
                  <Trans i18nKey="swap.route" />
                </span>
              )}
            </Tooltip>
          </div>

          <div className={styles.summaryValue}>
            {exchangeInfo == null ||
            routeAssets.some(asset => asset == null) ? (
              <Loader />
            ) : (
              <div className={styles.route}>
                {routeAssets.map((asset, index) => (
                  <React.Fragment key={asset.id}>
                    {index !== 0 && (
                      <svg className={styles.routeItemArrow} viewBox="0 0 7 12">
                        <path d="M1.115 12L0 10.863L4.768 6L0 1.137L1.115 0L7 6L1.115 12Z" />
                      </svg>
                    )}

                    <div className={styles.routeItemName}>
                      {asset.displayName}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.summaryRow}>
          <div className={styles.summaryLabel}>
            <Tooltip
              className={styles.summaryTooltipContent}
              content={<Trans i18nKey="swap.priceImpactTooltip" />}
            >
              {props => (
                <span className={styles.summaryLabelTooltip} {...props}>
                  <Trans i18nKey="swap.priceImpact" />
                </span>
              )}
            </Tooltip>
          </div>

          <div className={styles.summaryValue}>
            {exchangeInfo == null ? (
              <Loader />
            ) : (
              <span className={styles.summaryValueText}>
                {(fromAmountTokens.eq(0)
                  ? new BigNumber(0)
                  : new BigNumber(exchangeInfo.priceImpact)
                ).toFixed(3, BigNumber.ROUND_MODE.ROUND_FLOOR)}
                %
              </span>
            )}
          </div>
        </div>

        <div className={cn(styles.summaryRow, styles.summaryRow_center)}>
          <div className={styles.summaryLabel}>
            <Tooltip
              className={styles.summaryTooltipContent}
              content={<Trans i18nKey="swap.transactionFeeTooltip" />}
            >
              {props => (
                <span className={styles.summaryLabelTooltip} {...props}>
                  <Trans i18nKey="swap.transactionFee" />
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

      <Modal
        showModal={showSelectAsset != null}
        animation={Modal.ANIMATION.FLASH}
      >
        <AssetSelectModal
          assetBalances={accountBalance.assets}
          assets={
            showSelectAsset === 'from'
              ? swappableAssets.filter(asset => asset.id !== toAssetId)
              : showSelectAsset === 'to'
              ? swappableAssets.filter(asset => asset.id !== fromAssetId)
              : []
          }
          network={currentNetwork}
          onClose={() => {
            setShowSelectAsset(null);
          }}
          onSelect={assetId => {
            setShowSelectAsset(null);

            if (showSelectAsset === 'from') {
              setAssetIds(prevState => ({
                ...prevState,
                fromAssetId: assetId,
              }));
            } else {
              setAssetIds(prevState => ({
                ...prevState,
                toAssetId: assetId,
              }));
            }
          }}
        />
      </Modal>
    </form>
  );
}
