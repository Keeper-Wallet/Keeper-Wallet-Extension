import BigNumber from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import { getAssetIdByName } from 'assets/utils';
import { AccountBalance, SwopFiExchangerData } from 'ui/reducers/updateState';
import { fetchGetMoney } from './api';

export function getAssetBalance(asset: Asset, accountBalance: AccountBalance) {
  return asset.id === 'WAVES'
    ? new Money(accountBalance.available, asset)
    : new Money(accountBalance.assets?.[asset.id]?.balance || '0', asset);
}

export function getDefaultExchanger(
  network: string,
  exchangersMap: { [exchangerId: string]: SwopFiExchangerData }
) {
  const exchangersArr = Object.values(exchangersMap);

  const usdnAssetId = getAssetIdByName(network, 'USD');
  const wavesAssetId = getAssetIdByName(network, 'WAVES');

  const usdnWavesExchanger = exchangersArr.find(
    exchanger =>
      [exchanger.A_asset_id, exchanger.B_asset_id].includes(usdnAssetId) &&
      [exchanger.A_asset_id, exchanger.B_asset_id].includes(wavesAssetId)
  );

  if (usdnWavesExchanger) {
    return usdnWavesExchanger;
  }

  return exchangersArr[0];
}

async function calcToAmount({
  exchangerVersion,
  fromAmountCoins,
  fromBalanceCoins,
  toBalanceCoins,
}: {
  exchangerVersion: number;
  fromAmountCoins: BigNumber;
  fromBalanceCoins: BigNumber;
  toBalanceCoins: BigNumber;
}) {
  if (exchangerVersion === 2) {
    const toAmount = new BigNumber(
      await fetchGetMoney({
        fromAmount: fromAmountCoins.toFixed(),
        fromBalance: fromBalanceCoins.toFixed(),
        toBalance: toBalanceCoins.toFixed(),
      })
    );

    return toAmount.gte(0) ? toAmount : toBalanceCoins;
  }

  return fromAmountCoins
    .mul(toBalanceCoins)
    .div(fromBalanceCoins.add(fromAmountCoins))
    .roundTo(0, BigNumber.ROUND_MODE.ROUND_FLOOR);
}

function calcSwapRate({
  fromAmountCoins,
  fromAsset,
  toAmountCoins,
  toAsset,
}: {
  fromAmountCoins: BigNumber;
  fromAsset: Asset;
  toAmountCoins: BigNumber;
  toAsset: Asset;
}) {
  return Money.fromCoins(toAmountCoins, toAsset)
    .getTokens()
    .div(Money.fromCoins(fromAmountCoins, fromAsset).getTokens())
    .roundTo(toAsset.precision, BigNumber.ROUND_MODE.ROUND_FLOOR);
}

export const KEEPER_COMMISSION = new BigNumber(0.001);

function applyCommission(commission: BigNumber, amountCoins: BigNumber) {
  return amountCoins
    .mul(new BigNumber(1).sub(commission).sub(KEEPER_COMMISSION))
    .roundTo(0, BigNumber.ROUND_MODE.ROUND_FLOOR);
}

function calcMinReceived(
  toAmountCoins: BigNumber,
  slippageTolerancePercents: BigNumber
) {
  return toAmountCoins
    .mul(new BigNumber(100).sub(slippageTolerancePercents).div(100))
    .roundTo(0, BigNumber.ROUND_MODE.ROUND_DOWN);
}

function calcPriceImpact({
  fromAmountCoins,
  fromAsset,
  fromBalanceCoins,
  toAsset,
  toBalanceCoins,
}: {
  fromAmountCoins: BigNumber;
  fromAsset: Asset;
  fromBalanceCoins: BigNumber;
  toAsset: Asset;
  toBalanceCoins: BigNumber;
}) {
  const fromBalanceTokens = Money.fromCoins(
    fromBalanceCoins,
    fromAsset
  ).getTokens();
  const toBalanceTokens = Money.fromCoins(toBalanceCoins, toAsset).getTokens();

  const fromAmountTokens = Money.fromCoins(
    fromAmountCoins,
    fromAsset
  ).getTokens();
  const newFromBalance = fromBalanceTokens.add(fromAmountTokens);

  const newToBalance = fromBalanceTokens
    .mul(toBalanceTokens)
    .div(newFromBalance);

  const ratioBalance = toBalanceTokens.div(fromBalanceTokens);
  const newRatioBalance = newToBalance.div(newFromBalance);

  return new BigNumber(1)
    .sub(newRatioBalance.div(ratioBalance))
    .mul(100)
    .abs()
    .roundTo(3)
    .toNumber();
}

export async function calcExchangeDetails({
  commission,
  exchangerVersion,
  fromAmountCoins,
  fromAsset,
  fromBalanceCoins,
  slippageTolerancePercents,
  toAsset,
  toBalanceCoins,
}: {
  commission: BigNumber;
  exchangerVersion: number;
  fromAmountCoins: BigNumber;
  fromAsset: Asset;
  fromBalanceCoins: BigNumber;
  slippageTolerancePercents: BigNumber;
  toAsset: Asset;
  toBalanceCoins: BigNumber;
}): Promise<{
  feeCoins: BigNumber;
  minReceivedCoins: BigNumber;
  priceImpact: number;
  swapRate: BigNumber;
  toAmountCoins: BigNumber;
}> {
  let feeCoins: BigNumber;
  let swapRate: BigNumber;
  let toAmountCoins: BigNumber;

  if (fromAmountCoins.isZero()) {
    feeCoins = new BigNumber(0);
    toAmountCoins = new BigNumber(0);

    const fakeFromAmountCoins = Money.fromTokens(
      exchangerVersion === 2 ? 10 : 1,
      fromAsset
    ).getCoins();

    const fakeToAmountCoins = await calcToAmount({
      exchangerVersion,
      fromAmountCoins: fakeFromAmountCoins,
      fromBalanceCoins,
      toBalanceCoins,
    });

    swapRate = calcSwapRate({
      fromAmountCoins: fakeFromAmountCoins,
      fromAsset,
      toAmountCoins: applyCommission(commission, fakeToAmountCoins),
      toAsset,
    });
  } else {
    toAmountCoins = await calcToAmount({
      exchangerVersion,
      fromAmountCoins,
      fromBalanceCoins,
      toBalanceCoins,
    });

    feeCoins = toAmountCoins
      .mul(commission)
      .roundTo(0, BigNumber.ROUND_MODE.ROUND_FLOOR);

    toAmountCoins = applyCommission(commission, toAmountCoins);

    swapRate = calcSwapRate({
      fromAmountCoins,
      fromAsset,
      toAmountCoins,
      toAsset,
    });
  }

  return {
    feeCoins,
    minReceivedCoins: calcMinReceived(toAmountCoins, slippageTolerancePercents),
    priceImpact: calcPriceImpact({
      fromAmountCoins,
      fromAsset,
      fromBalanceCoins,
      toAsset,
      toBalanceCoins,
    }),
    swapRate,
    toAmountCoins,
  };
}
