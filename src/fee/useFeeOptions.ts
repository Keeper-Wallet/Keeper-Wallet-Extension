import { BigNumber } from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import { useAppSelector } from 'ui/store';
import { SPONSORED_FEE_TX_TYPES } from './constants';
import { convertFeeToAsset } from './utils';

export function useFeeOptions({
  initialFee,
  txType,
}: {
  initialFee: Money;
  txType: number;
}) {
  const assets = useAppSelector(state => state.assets);

  const balance = useAppSelector(
    state => state.balances[state.selectedAccount.address]
  );

  const usdPrices = useAppSelector(state => state.usdPrices);

  const feeInWaves = convertFeeToAsset(initialFee, new Asset(assets['WAVES']));

  const options = SPONSORED_FEE_TX_TYPES.includes(txType)
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

  return options;
}
