import BigNumber from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import { DEFAULT_FEE_CONFIG } from '../constants';

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
