import BigNumber from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import { getMoney } from 'ui/utils/converters';
import * as invokeScriptParseTx from '../ui/components/transactions/ScriptInvocation/parseTx';
import * as transferParseTx from '../ui/components/transactions/Transfer/parseTx';
import { DEFAULT_FEE_CONFIG } from '../constants';
import { Message } from 'ui/components/transactions/BaseTransaction';
import { AssetDetail } from 'ui/services/Background';
import { AccountBalance, AssetBalance } from 'ui/reducers/updateState';
import { SPONSORED_FEE_TX_TYPES } from './constants';

export function convertFeeToAsset(fee: Money, asset: Asset) {
  const minSponsoredFee = (asset: Asset) =>
    asset.id === 'WAVES'
      ? DEFAULT_FEE_CONFIG.calculate_fee_rules.default.fee
      : asset.minSponsoredFee;

  return new Money(
    fee
      .getCoins()
      .mul(minSponsoredFee(asset))
      .div(minSponsoredFee(fee.asset))
      .roundTo(0, BigNumber.ROUND_MODE.ROUND_UP),
    asset
  );
}

export function getFeeOptions({
  assets,
  balance,
  initialFee,
  txType,
  usdPrices,
}: {
  assets: Record<string, AssetDetail>;
  balance: AccountBalance;
  initialFee: Money;
  txType: number;
  usdPrices: Record<string, string>;
}) {
  const feeInWaves = convertFeeToAsset(initialFee, new Asset(assets['WAVES']));

  return SPONSORED_FEE_TX_TYPES.includes(txType)
    ? Object.entries(balance.assets || {})
        .map(([assetId, assetBalance]) => ({
          assetBalance,
          money: convertFeeToAsset(initialFee, new Asset(assets[assetId])),
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
  assets: Record<string, AssetDetail>;
  message: Message;
}): Money[] {
  switch (message.data.type) {
    case TRANSACTION_TYPE.TRANSFER:
      return [getMoney(transferParseTx.getAmount(message.data.data), assets)];
    case TRANSACTION_TYPE.INVOKE_SCRIPT:
      return invokeScriptParseTx
        .getAmounts(message.data.data)
        .map(amount => getMoney(amount, assets));
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
