import { assetIds, assetLogosByNetwork } from './constants';
import { useAppSelector } from 'ui/store';
import { NetworkName } from 'networks/types';
import { SwappableAssetIdsByNetwork } from 'ui/components/pages/swap/hooks/useSwappableAssetTickersByVendor';

export function useAssetLogo(network: NetworkName, assetId: string) {
  const logos = useAppSelector(state => state.assetLogos);

  if (network !== NetworkName.Mainnet) {
    return assetLogosByNetwork[network]?.[assetId];
  }

  return logos[assetId] || assetLogosByNetwork[network]?.[assetId];
}

export function useAssetIdByTicker(network: NetworkName, ticker: string) {
  const tickers = useAppSelector(state => state.assetTickers);

  if (network !== NetworkName.Mainnet) {
    return assetIds[network]?.[ticker];
  }

  return (
    Object.keys(tickers).find(id => tickers[id] === ticker) ||
    assetIds[network]?.[ticker]
  );
}

export function isSwappableAsset(
  swappableAssetIds: SwappableAssetIdsByNetwork,
  network: NetworkName.Mainnet,
  assetId: string
) {
  return swappableAssetIds[network]?.includes(assetId) ?? false;
}
