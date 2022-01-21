import BigNumber from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import cn from 'classnames';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { AssetAmountInput } from 'assets/amountInput';
import { AssetSelectModal } from 'assets/selectModal';
import { convertToSponsoredAssetFee } from 'assets/utils';
import { Tooltip } from 'ui/components/ui/tooltip';
import { AssetBalance, SwopFiExchangerData } from 'ui/reducers/updateState';
import { useAppDispatch, useAppSelector } from 'ui/store';
import {
  calcExchangeDetails,
  getAssetBalance,
  getDefaultExchanger,
} from './utils';
import { Button } from '../../ui/buttons/Button';
import { Loader } from '../../ui/loader/Loader';
import { Select } from '../../ui/select/Select';
import * as styles from './form.module.css';
import { Modal } from 'ui/components/ui/modal/Modal';
import { resetSwapScreenInitialState } from 'ui/actions';

const SLIPPAGE_TOLERANCE_PERCENTS = new BigNumber(0.1);

interface Props {
  exchangers: { [exchangerId: string]: SwopFiExchangerData };
  isSwapInProgress: boolean;
  swapErrorMessage: string;
  wavesFeeCoins: number;
  onSwap: (data: {
    exchangerId: string;
    feeAssetId: string;
    fromAssetId: string;
    fromCoins: string;
    minReceivedCoins: string;
    toAssetId: string;
    toCoins: string;
  }) => void;
}

interface State {
  detailsUpdateIsPending: boolean;
  directionSwapped: boolean;
  exchangerId: string;
  feeCoins: BigNumber;
  fromAmount: string;
  minReceivedCoins: BigNumber;
  priceImpact: number;
  swapRate: BigNumber | undefined;
  toAmountTokens: BigNumber;
  txFeeAssetId: string;
}

const ASSETS_FORMAT = {
  fractionGroupSeparator: '',
  fractionGroupSize: 0,
  decimalSeparator: '.',
  groupSeparator: ' ',
  groupSize: 3,
  prefix: '',
  secondaryGroupSize: 0,
  suffix: '',
};

export function SwapForm({
  exchangers,
  isSwapInProgress,
  swapErrorMessage,
  wavesFeeCoins,
  onSwap,
}: Props) {
  const { t } = useTranslation();

  const appDispatch = useAppDispatch();

  const assets = useAppSelector(state => state.assets);
  const accountBalance = useAppSelector(
    state => state.balances[state.selectedAccount.address]
  );

  const initialState = useAppSelector(
    state => state.localState.swapScreenInitialState
  );

  React.useEffect(() => {
    appDispatch(resetSwapScreenInitialState());
  }, []);

  console.log(initialState);

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

  const [state, dispatch] = React.useReducer(
    (
      prevState: State,
      action:
        | { type: 'SWAP_DIRECTION' }
        | { type: 'SET_FROM_AMOUNT'; value: string }
        | { type: 'SET_TX_FEE_ASSET_ID'; value: string }
        | {
            type: 'SET_EXCHANGE_DETAILS';
            feeCoins: BigNumber;
            minReceivedCoins: BigNumber;
            priceImpact: number;
            swapRate: BigNumber;
            toAmountTokens: BigNumber;
          }
    ): State => {
      switch (action.type) {
        case 'SWAP_DIRECTION':
          return {
            ...prevState,
            detailsUpdateIsPending: true,
            directionSwapped: !prevState.directionSwapped,
            fromAmount: prevState.toAmountTokens.toFixed(),
            toAmountTokens: new BigNumber(prevState.fromAmount),
          };
        case 'SET_FROM_AMOUNT':
          return {
            ...prevState,
            detailsUpdateIsPending: true,
            fromAmount: action.value,
          };
        case 'SET_TX_FEE_ASSET_ID':
          return {
            ...prevState,
            txFeeAssetId: action.value,
          };
        case 'SET_EXCHANGE_DETAILS':
          return {
            ...prevState,
            detailsUpdateIsPending: false,
            feeCoins: action.feeCoins,
            minReceivedCoins: action.minReceivedCoins,
            priceImpact: action.priceImpact,
            swapRate: action.swapRate,
            toAmountTokens: action.toAmountTokens,
          };
      }
    },
    undefined,
    (): State => {
      const defaultExchanger = getDefaultExchanger(currentNetwork, exchangers);
      const txFeeAssetId = sponsoredAssetBalanceEntries[0][0];

      return {
        detailsUpdateIsPending: false,
        directionSwapped: false,
        exchangerId: defaultExchanger.id,
        feeCoins: new BigNumber(0),
        fromAmount: '',
        priceImpact: 0,
        minReceivedCoins: new BigNumber(0),
        swapRate: undefined,
        toAmountTokens: new BigNumber(0),
        txFeeAssetId,
      };
    }
  );

  const exchanger = exchangers[state.exchangerId];
  const exchangerVersion = Number(exchanger.version.split('.')[0]);

  const commission = React.useMemo(
    () =>
      new BigNumber(exchanger.commission).div(
        new BigNumber(exchanger.commission_scale_delimiter)
      ),
    [exchanger.commission, exchanger.commission_scale_delimiter]
  );

  const [fromAssetId, toAssetId] = state.directionSwapped
    ? [exchanger.B_asset_id, exchanger.A_asset_id]
    : [exchanger.A_asset_id, exchanger.B_asset_id];

  const [fromBalance, toBalance] = state.directionSwapped
    ? [exchanger.B_asset_balance, exchanger.A_asset_balance]
    : [exchanger.A_asset_balance, exchanger.B_asset_balance];

  const fromAssetDetail = assets[fromAssetId];
  const toAssetDetail = assets[toAssetId];

  const fromAsset = React.useMemo(
    () => new Asset(fromAssetDetail),
    [fromAssetDetail]
  );
  const toAsset = React.useMemo(
    () => new Asset(toAssetDetail),
    [toAssetDetail]
  );

  const txFeeAsset = new Asset(assets[state.txFeeAssetId]);

  const latestFromAmountRef = React.useRef(state.fromAmount);

  React.useEffect(() => {
    latestFromAmountRef.current = state.fromAmount;
  });

  const updateExchangeDetailsTimeoutRef = React.useRef<number | null>(null);

  const updateExchangeDetailsPromiseRef = React.useRef<Promise<void> | null>(
    null
  );

  const updateExchangeDetails = React.useCallback(async () => {
    const currentPromise = calcExchangeDetails({
      commission,
      exchangerVersion,
      fromAmountCoins: Money.fromTokens(
        new BigNumber(latestFromAmountRef.current || '0'),
        fromAsset
      ).getCoins(),
      fromAsset,
      fromBalanceCoins: new BigNumber(fromBalance),
      slippageTolerancePercents: SLIPPAGE_TOLERANCE_PERCENTS,
      toAsset,
      toBalanceCoins: new BigNumber(toBalance),
    }).then(
      ({
        feeCoins,
        minReceivedCoins,
        priceImpact,
        swapRate,
        toAmountCoins,
      }) => {
        if (updateExchangeDetailsPromiseRef.current === currentPromise) {
          dispatch({
            type: 'SET_EXCHANGE_DETAILS',
            feeCoins,
            minReceivedCoins,
            priceImpact,
            swapRate,
            toAmountTokens: Money.fromCoins(toAmountCoins, toAsset).getTokens(),
          });
        }
      }
    );

    updateExchangeDetailsPromiseRef.current = currentPromise;
  }, [
    commission,
    exchangerVersion,
    fromAsset,
    fromBalance,
    toAsset,
    toBalance,
  ]);

  const updateExchangeDetailsRef = React.useRef(updateExchangeDetails);

  React.useEffect(() => {
    updateExchangeDetails();
    updateExchangeDetailsRef.current = updateExchangeDetails;

    return () => {
      updateExchangeDetailsPromiseRef.current = null;
    };
  }, [updateExchangeDetails]);

  const fromAssetBalance = getAssetBalance(fromAsset, accountBalance);
  const toAssetBalance = getAssetBalance(toAsset, accountBalance);
  const txFeeAssetBalance = getAssetBalance(txFeeAsset, accountBalance);

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

  const fromAmountTokens = new BigNumber(state.fromAmount || '0');

  const sponsoredAssetFee = convertToSponsoredAssetFee(
    wavesFeeCoinsBN,
    txFeeAsset,
    accountBalance.assets[state.txFeeAssetId]
  );

  const validationErrorMessage =
    fromAmountTokens.gt(fromAssetBalance.getTokens()) ||
    txFeeAssetBalance.getTokens().lt(sponsoredAssetFee.getTokens()) ||
    (fromAsset.id === txFeeAsset.id &&
      fromAmountTokens
        .add(sponsoredAssetFee.getTokens())
        .gt(fromAssetBalance.getTokens()))
      ? t('swap.insufficientFundsError')
      : null;

  function setFromAmount(newFromAmount: string) {
    if (newFromAmount !== state.fromAmount) {
      dispatch({ type: 'SET_FROM_AMOUNT', value: newFromAmount });

      if (updateExchangeDetailsTimeoutRef.current != null) {
        window.clearTimeout(updateExchangeDetailsTimeoutRef.current);
      }

      updateExchangeDetailsTimeoutRef.current = window.setTimeout(() => {
        updateExchangeDetailsRef.current();
      }, 500);
    }
  }

  const [showSelectAsset, setShowSelectAsset] = React.useState<'from' | 'to'>(
    null
  );

  return (
    <form
      onSubmit={event => {
        event.preventDefault();

        onSwap({
          exchangerId: state.exchangerId,
          feeAssetId: state.txFeeAssetId,
          fromAssetId: fromAsset.id,
          fromCoins: Money.fromTokens(fromAmountTokens, fromAsset)
            .getCoins()
            .toFixed(),
          minReceivedCoins: state.minReceivedCoins.toFixed(),
          toAssetId: toAsset.id,
          toCoins: Money.fromTokens(state.toAmountTokens, toAsset)
            .getCoins()
            .toFixed(),
        });
      }}
    >
      <AssetAmountInput
        balance={fromAssetBalance}
        label={t('swap.fromInputLabel', {
          asset: fromAssetBalance.asset.displayName,
        })}
        value={state.fromAmount}
        onChange={newValue => {
          setFromAmount(newValue);
        }}
        onMaxClick={() => {
          let max = fromAssetBalance;

          if (state.txFeeAssetId === fromAssetId) {
            const fee = convertToSponsoredAssetFee(
              new BigNumber(wavesFeeCoins),
              new Asset(assets[state.txFeeAssetId]),
              accountBalance.assets[state.txFeeAssetId]
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
          disabled={state.detailsUpdateIsPending}
          type="button"
          onClick={() => {
            dispatch({ type: 'SWAP_DIRECTION' });
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

      <AssetAmountInput
        balance={toAssetBalance}
        label={t('swap.toInputLabel', {
          asset: toAssetBalance.asset.displayName,
        })}
        loading={state.detailsUpdateIsPending}
        value={state.toAmountTokens.toFixed()}
        onLogoClick={() => {
          setShowSelectAsset('to');
        }}
      />

      <div className={styles.priceRow}>
        <div className={styles.priceRowLabel}>
          <Trans i18nKey="swap.priceLabel" />
        </div>

        <div className={styles.priceRowValue}>
          {state.swapRate && !state.detailsUpdateIsPending ? (
            <div>
              1 {fromAsset.displayName} ~ {state.swapRate.toFixed()}{' '}
              {toAsset.displayName}
            </div>
          ) : (
            <Loader />
          )}
        </div>
      </div>

      <Button
        className="fullwidth"
        disabled={
          fromAmountTokens.eq(0) ||
          validationErrorMessage != null ||
          state.detailsUpdateIsPending ||
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
              content={<Trans i18nKey="swap.youSaveTooltip" />}
            >
              {props => (
                <span className={styles.summaryLabelTooltip} {...props}>
                  <Trans i18nKey="swap.youSave" />
                </span>
              )}
            </Tooltip>
          </div>

          <div className={styles.summaryValue}>
            {state.detailsUpdateIsPending ? (
              <Loader />
            ) : (
              <span className={styles.summaryValueText}>0.6%</span>
            )}
          </div>
        </div>

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
            {state.detailsUpdateIsPending ? (
              <Loader />
            ) : (
              <div className={styles.route}>
                {[
                  'BTC',
                  'WAVES',
                  'USDN',
                  'EURN',
                  'USDT',
                  'EGG',
                  'RACE',
                  'WX',
                  'SCOneX',
                ].map((ticker, index) => (
                  <React.Fragment key={ticker}>
                    {index !== 0 && (
                      <svg className={styles.routeItemArrow} viewBox="0 0 7 12">
                        <path d="M1.115 12L0 10.863L4.768 6L0 1.137L1.115 0L7 6L1.115 12Z" />
                      </svg>
                    )}

                    <div className={styles.routeItemName}>{ticker}</div>
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
            {state.detailsUpdateIsPending ? (
              <Loader />
            ) : (
              <span className={styles.summaryValueText}>
                {Money.fromCoins(state.minReceivedCoins, toAsset)
                  .getTokens()
                  .toFormat(
                    toAsset.precision,
                    BigNumber.ROUND_MODE.ROUND_FLOOR,
                    ASSETS_FORMAT
                  )}{' '}
                {toAsset.displayName}
              </span>
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
            {state.detailsUpdateIsPending ? (
              <Loader />
            ) : (
              <span className={styles.summaryValueText}>
                {state.priceImpact}%
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
                selected={state.txFeeAssetId}
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
                  dispatch({ type: 'SET_TX_FEE_ASSET_ID', value });
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
          assets={Object.values(assets)}
          network={currentNetwork}
          onClose={() => {
            setShowSelectAsset(null);
          }}
          onSelect={assetId => {
            console.log('onSelect', assetId);
            setShowSelectAsset(null);
          }}
        />
      </Modal>
    </form>
  );
}
