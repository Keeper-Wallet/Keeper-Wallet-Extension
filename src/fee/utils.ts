import BigNumber from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import { getMoney } from 'ui/utils/converters';
import * as invokeScriptParseTx from '../ui/components/transactions/ScriptInvocation/parseTx';
import * as transferParseTx from '../ui/components/transactions/Transfer/parseTx';
import { FeeConfig } from '../constants';
import { SPONSORED_FEE_TX_TYPES } from './constants';
import { AssetBalance, BalancesItem } from 'balances/types';
import { AssetDetail, AssetsRecord } from 'assets/types';
import { MessageStoreItem } from 'messages/types';

export function convertFeeToAsset(
  fee: Money,
  asset: Asset,
  feeConfig: FeeConfig
) {
  const minSponsoredFee = (asset: Asset) =>
    asset.id === 'WAVES'
      ? feeConfig.calculate_fee_rules.default.fee
      : asset.minSponsoredFee;

  return new Money(
    fee
      .getCoins()
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .mul(minSponsoredFee(asset)!)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .div(minSponsoredFee(fee.asset)!)
      .roundTo(0, BigNumber.ROUND_MODE.ROUND_UP),
    asset
  );
}

export function getFeeOptions({
  assets,
  balance,
  feeConfig,
  initialFee,
  txType,
  usdPrices,
}: {
  assets: AssetsRecord;
  balance: BalancesItem | undefined;
  feeConfig: FeeConfig;
  initialFee: Money;
  txType: number;
  usdPrices: Record<string, string>;
}) {
  const feeInWaves = convertFeeToAsset(
    initialFee,
    new Asset(assets['WAVES']),
    feeConfig
  );

  return SPONSORED_FEE_TX_TYPES.includes(txType)
    ? Object.entries(balance?.assets || {})
        .map(([assetId, assetBalance]) => ({
          asset: assets[assetId],
          assetBalance,
        }))
        .filter(
          (item): item is { asset: AssetDetail; assetBalance: AssetBalance } =>
            item.asset != null
        )
        .map(({ asset, assetBalance }) => ({
          assetBalance,
          money: convertFeeToAsset(initialFee, new Asset(asset), feeConfig),
        }))
        .filter(
          ({ assetBalance, money }) =>
            assetBalance.minSponsoredAssetFee != null &&
            new BigNumber(assetBalance.sponsorBalance).gte(
              feeInWaves.getCoins()
            ) &&
            new BigNumber(assetBalance.balance).gte(money.getCoins())
        )
        .sort((a, b) => {
          const aUsdSum = a.money
            .getTokens()
            .mul(usdPrices[a.money.asset.id] || '0');

          const bUsdSum = b.money
            .getTokens()
            .mul(usdPrices[b.money.asset.id] || '0');

          if (aUsdSum.gt(bUsdSum)) {
            return 1;
          }

          if (aUsdSum.lt(bUsdSum)) {
            return -1;
          }

          const aSponsorBalance = new BigNumber(a.assetBalance.sponsorBalance);
          const bSponsorBalance = new BigNumber(b.assetBalance.sponsorBalance);

          if (aSponsorBalance.gt(bSponsorBalance)) {
            return -1;
          }

          if (aSponsorBalance.lt(bSponsorBalance)) {
            return 1;
          }

          return 0;
        })
    : [];
}

export function getSpendingAmountsForSponsorableTx({
  assets,
  message,
}: {
  assets: AssetsRecord;
  message: MessageStoreItem;
}): Money[] {
  switch (message.data.type) {
    case TRANSACTION_TYPE.TRANSFER:
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return [getMoney(transferParseTx.getAmount(message.data.data), assets)!];
    case TRANSACTION_TYPE.INVOKE_SCRIPT:
      return (
        invokeScriptParseTx
          .getAmounts(message.data.data)
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          .map(amount => getMoney(amount, assets)!)
      );
    default:
      return [];
  }
}

export function isEnoughBalanceForFeeAndSpendingAmounts({
  assetBalance,
  fee,
  spendingAmounts,
}: {
  assetBalance: AssetBalance;
  fee: Money;
  spendingAmounts: Money[];
}) {
  const totalSpendingCoins = spendingAmounts
    .filter(spending => spending.asset.id === fee.asset.id)
    .reduce((total, current) => total.add(current.getCoins()), fee.getCoins());

  return new BigNumber(assetBalance.balance).gte(totalSpendingCoins);
}
