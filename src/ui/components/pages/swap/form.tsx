import BigNumber from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { useIMask } from 'react-imask';
import { SwopFiExchangerData } from 'ui/reducers/updateState';
import { useAppSelector } from 'ui/store';
import { useDebouncedValue } from 'ui/utils/useDebouncedValue';
import {
  calcExchangeDetails,
  getAssetBalance,
  getDefaultExchanger,
} from './utils';
import { Button } from '../../ui/buttons/Button';
import { Loader } from '../../ui/loader/Loader';
import { Select } from '../../ui/select/Select';
import * as styles from './form.module.css';
import { SwapAssetLogo } from './assetLogo';
import { Error } from 'ui/components/ui';

const SLIPPAGE_TOLERANCE_PERCENTS = new BigNumber(0.1);

interface Props {
  exchangers: { [exchangerId: string]: SwopFiExchangerData };
  isSwapFailed: boolean;
  isSwapInProgress: boolean;
  onSwap: (data: {
    exchangerId: string;
    fromAssetId: string;
    fromCoins: string;
    minReceivedCoins: string;
    toCoins: string;
  }) => void;
}

interface State {
  directionSwapped: boolean;
  exchangerId: string;
  feeCoins: BigNumber;
  fromAmount: string;
  minReceivedCoins: BigNumber;
  priceImpact: number;
  swapRate: BigNumber | undefined;
  toAmountTokens: BigNumber;
}

function useAssetMask({
  asset,
  value,
  onChange,
}: {
  asset: Asset;
  value: string;
  onChange: (newValue: string) => void;
}) {
  const mask = useIMask(
    {
      mapToRadix: ['.', ','],
      mask: Number,
      radix: '.',
      scale: asset.precision,
      thousandsSeparator: ' ',
    },
    {
      onAccept: (_value, mask) => {
        onChange(mask.unmaskedValue);
      },
    }
  );

  React.useEffect(() => {
    const input = mask.ref.current;
    const maskInstance = mask.maskRef.current;

    if (input && maskInstance && maskInstance.unmaskedValue !== value) {
      input.value = value;
      maskInstance.updateValue();
      maskInstance.updateControl();
    }
  }, [value]);

  return mask;
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
  isSwapFailed,
  isSwapInProgress,
  onSwap,
}: Props) {
  const assets = useAppSelector(state => state.assets);

  const accountBalance = useAppSelector(
    state => state.balances[state.selectedAccount.address]
  );

  const currentNetwork = useAppSelector(state => state.currentNetwork);

  const [state, dispatch] = React.useReducer(
    (
      prevState: State,
      action:
        | { type: 'SET_EXCHANGER'; exchangerId: string }
        | { type: 'SWAP_DIRECTION' }
        | { type: 'CHANGE_FROM_AMOUNT'; value: string }
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
        case 'SET_EXCHANGER':
          return {
            ...prevState,
            directionSwapped: false,
            exchangerId: action.exchangerId,
          };
        case 'SWAP_DIRECTION':
          return {
            ...prevState,
            directionSwapped: !prevState.directionSwapped,
            fromAmount: prevState.toAmountTokens.toFixed(),
            toAmountTokens: new BigNumber(prevState.fromAmount),
          };
        case 'CHANGE_FROM_AMOUNT':
          return {
            ...prevState,
            fromAmount: action.value,
          };
        case 'SET_EXCHANGE_DETAILS':
          return {
            ...prevState,
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

      return {
        directionSwapped: false,
        exchangerId: defaultExchanger.id,
        feeCoins: new BigNumber(0),
        fromAmount: '',
        priceImpact: 0,
        minReceivedCoins: new BigNumber(0),
        swapRate: undefined,
        toAmountTokens: new BigNumber(0),
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

  const debouncedFromAmount = useDebouncedValue(state.fromAmount, 500);

  React.useEffect(() => {
    let cancelled = false;

    calcExchangeDetails({
      commission,
      exchangerVersion,
      fromAmountCoins: Money.fromTokens(
        new BigNumber(debouncedFromAmount || '0'),
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
        if (!cancelled) {
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

    return () => {
      cancelled = true;
    };
  }, [
    commission,
    debouncedFromAmount,
    exchangerVersion,
    fromAsset,
    fromBalance,
    toAsset,
    toBalance,
  ]);

  const fromMask = useAssetMask({
    asset: fromAsset,
    value: state.fromAmount,
    onChange: newValue => {
      dispatch({ type: 'CHANGE_FROM_AMOUNT', value: newValue });
    },
  });

  const fromAssetBalance = getAssetBalance(fromAsset, accountBalance);
  const toAssetBalance = getAssetBalance(toAsset, accountBalance);

  return (
    <form
      className={styles.root}
      onSubmit={event => {
        event.preventDefault();

        onSwap({
          exchangerId: state.exchangerId,
          fromAssetId: fromAsset.id,
          fromCoins: Money.fromTokens(
            new BigNumber(state.fromAmount),
            fromAsset
          )
            .getCoins()
            .toFixed(),
          minReceivedCoins: state.minReceivedCoins.toFixed(),
          toCoins: Money.fromTokens(state.toAmountTokens, toAsset)
            .getCoins()
            .toFixed(),
        });
      }}
    >
      <div className={styles.pairSelect}>
        <div className="input-title basic500 tag1">
          <Trans i18nKey="swap.pairInputLabel" />
        </div>

        <Select
          className="fullwidth"
          selected={state.exchangerId}
          selectList={Object.values(exchangers)
            .sort((exchangerA, exchangerB) => {
              const a = new BigNumber(exchangerA.totalLiquidity);
              const b = new BigNumber(exchangerB.totalLiquidity);

              const diff = b.sub(a);

              return diff.isNegative() ? -1 : diff.isPositive() ? 1 : 0;
            })
            .map(exchanger => ({
              id: exchanger.id,
              text: `${assets[exchanger.A_asset_id].displayName}/${
                assets[exchanger.B_asset_id].displayName
              }`,
              value: exchanger.id,
            }))}
          onSelectItem={(_id, value) => {
            dispatch({
              type: 'SET_EXCHANGER',
              exchangerId: value,
            });
          }}
        />
      </div>

      <div>
        <div className={styles.swapBox}>
          <SwapAssetLogo asset={fromAsset} network={currentNetwork} />

          <div className={styles.swapBoxLeft}>
            <div className={styles.swapBoxLabel}>
              <Trans i18nKey="swap.fromInputLabel" />
            </div>

            <div className={styles.swapBoxAsset}>{fromAsset.displayName}</div>
          </div>

          <div className={styles.swapBoxRight}>
            <div className={styles.swapBoxBalance}>
              {fromAssetBalance.toTokens()}
            </div>

            <input
              className={styles.swapBoxInput}
              placeholder="0.0"
              ref={fromMask.ref as React.MutableRefObject<HTMLInputElement>}
            />
          </div>
        </div>

        <div className={styles.swapDirectionBtnWrapper}>
          <button
            className={styles.swapDirectionBtn}
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

        <div className={styles.swapBox}>
          <SwapAssetLogo asset={toAsset} network={currentNetwork} />

          <div className={styles.swapBoxLeft}>
            <div className={styles.swapBoxLabel}>
              <Trans i18nKey="swap.toInputLabel" />
            </div>

            <div className={styles.swapBoxAsset}>{toAsset.displayName}</div>
          </div>

          <div className={styles.swapBoxRight}>
            <div className={styles.swapBoxBalance}>
              {toAssetBalance.toTokens()}
            </div>

            <div className={styles.swapBoxResult}>
              {state.toAmountTokens.toFormat(
                toAsset.precision,
                BigNumber.ROUND_MODE.ROUND_FLOOR,
                ASSETS_FORMAT
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.priceRow}>
        <div className={styles.priceRowLabel}>
          <Trans i18nKey="swap.priceLabel" />
        </div>

        <div className={styles.priceRowValue}>
          {state.swapRate ? (
            <div>
              1 {fromAsset.displayName} ~ {state.swapRate.toFixed()}{' '}
              {toAsset.displayName}
            </div>
          ) : (
            <Loader />
          )}
        </div>
      </div>

      <Button className="fullwidth" disabled={isSwapInProgress} type="submit">
        <Trans i18nKey="swap.submitButtonText" />
      </Button>

      {isSwapFailed && (
        <Error show>
          <Trans i18nKey="swap.failMessage" />
        </Error>
      )}

      <table className={styles.summaryTable}>
        <tbody>
          <tr>
            <th>
              <Trans i18nKey="swap.minimumReceived" />
            </th>

            <td>
              {Money.fromCoins(state.minReceivedCoins, toAsset)
                .getTokens()
                .toFormat(
                  toAsset.precision,
                  BigNumber.ROUND_MODE.ROUND_FLOOR,
                  ASSETS_FORMAT
                )}{' '}
              {toAsset.displayName}
            </td>
          </tr>

          <tr>
            <th>
              <Trans i18nKey="swap.priceImpact" />
            </th>

            <td>{state.priceImpact}%</td>
          </tr>

          <tr>
            <th>
              <Trans i18nKey="swap.fee" />
            </th>

            <td>
              {Money.fromCoins(state.feeCoins, toAsset)
                .getTokens()
                .toFormat(
                  toAsset.precision,
                  BigNumber.ROUND_MODE.ROUND_FLOOR,
                  ASSETS_FORMAT
                )}{' '}
              {toAsset.displayName} ({commission.mul(100).toFormat()}
              %)
            </td>
          </tr>

          <tr>
            <th>
              <Trans i18nKey="swap.transactionFee" />
            </th>

            <td>0.005 WAVES</td>
          </tr>
        </tbody>
      </table>
    </form>
  );
}
