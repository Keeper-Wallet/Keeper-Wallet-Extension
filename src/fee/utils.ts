import BigNumber from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import { type AssetDetail, type AssetsRecord } from 'assets/types';
import { type AssetBalance, type BalancesItem } from 'balances/types';
import {
  type MessageTx,
  type MessageTxAlias,
  type MessageTxBurn,
  type MessageTxCancelLease,
  type MessageTxData,
  type MessageTxInvokeScript,
  type MessageTxIssue,
  type MessageTxLease,
  type MessageTxMassTransfer,
  type MessageTxReissue,
  type MessageTxSetAssetScript,
  type MessageTxSetScript,
  type MessageTxSponsorship,
  type MessageTxTransfer,
  type MessageTxUpdateAssetInfo,
} from 'messages/types';
import invariant from 'tiny-invariant';

export async function getExtraFee(address: string, node: string) {
  const response = await fetch(
    new URL(`/addresses/scriptInfo/${address}`, node)
  );

  if (!response.ok) {
    throw response;
  }

  const json: { extraFee: number } = await response.json();

  return json.extraFee;
}

export function convertFeeToAsset(fee: Money, asset: Asset) {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const minSponsoredFee = (asset: Asset) =>
    asset.id === 'WAVES' ? 10_0000 : asset.minSponsoredFee;

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
  initialFee,
  txType,
  usdPrices,
}: {
  assets: AssetsRecord;
  balance: BalancesItem | undefined;
  initialFee: Money;
  txType: MessageTx['type'];
  usdPrices: Partial<Record<string, string>>;
}) {
  const feeInWaves = convertFeeToAsset(initialFee, new Asset(assets.WAVES));

  if (
    txType !== TRANSACTION_TYPE.TRANSFER &&
    txType !== TRANSACTION_TYPE.INVOKE_SCRIPT
  ) {
    return [];
  }

  return Object.entries(balance?.assets || {})
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
      money: convertFeeToAsset(initialFee, new Asset(asset)),
    }))
    .filter(
      ({ assetBalance, money }) =>
        assetBalance.minSponsoredAssetFee != null &&
        new BigNumber(assetBalance.sponsorBalance).gte(feeInWaves.getCoins()) &&
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
    });
}

export function getSpendingAmountsForSponsorableTx({
  assets,
  messageTx,
}: {
  assets: AssetsRecord;
  messageTx:
    | Omit<MessageTxIssue, 'fee' | 'id' | 'initialFee'>
    | Omit<MessageTxTransfer, 'fee' | 'id' | 'initialFee' | 'initialFeeAssetId'>
    | Omit<MessageTxReissue, 'fee' | 'id' | 'initialFee'>
    | Omit<MessageTxBurn, 'fee' | 'id' | 'initialFee'>
    | Omit<MessageTxLease, 'fee' | 'id' | 'initialFee'>
    | Omit<MessageTxCancelLease, 'fee' | 'id' | 'initialFee'>
    | Omit<MessageTxAlias, 'fee' | 'id' | 'initialFee'>
    | Omit<MessageTxMassTransfer, 'fee' | 'id' | 'initialFee'>
    | Omit<MessageTxData, 'fee' | 'id' | 'initialFee'>
    | Omit<MessageTxSetScript, 'fee' | 'id' | 'initialFee'>
    | Omit<MessageTxSponsorship, 'fee' | 'id' | 'initialFee'>
    | Omit<MessageTxSetAssetScript, 'fee' | 'id' | 'initialFee'>
    | Omit<
        MessageTxInvokeScript,
        'fee' | 'id' | 'initialFee' | 'initialFeeAssetId'
      >
    | Omit<MessageTxUpdateAssetInfo, 'fee' | 'id' | 'initialFee'>;
}) {
  switch (messageTx.type) {
    case TRANSACTION_TYPE.TRANSFER: {
      const asset = assets[messageTx.assetId ?? 'WAVES'];
      invariant(asset);
      return [new Money(messageTx.amount, new Asset(asset))];
    }
    case TRANSACTION_TYPE.INVOKE_SCRIPT:
      return messageTx.payment.map(({ amount, assetId }) => {
        const asset = assets[assetId ?? 'WAVES'];
        invariant(asset);
        return new Money(amount, new Asset(asset));
      });
    default:
      return [];
  }
}

export function isEnoughBalanceForFeeAndSpendingAmounts({
  balance,
  fee,
  spendingAmounts,
}: {
  balance: number | string;
  fee: Money;
  spendingAmounts: Money[];
}) {
  const totalSpendingCoins = spendingAmounts
    .filter(spending => spending.asset.id === fee.asset.id)
    .reduce((total, current) => total.add(current.getCoins()), fee.getCoins());

  return new BigNumber(balance).gte(totalSpendingCoins);
}
