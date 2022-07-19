import { assetIds, assetLogosByNetwork, swappableAssetIds } from './constants';
import { useAppSelector } from 'ui/store';
import { NetworkName } from '../accounts/types';

export function useAssetLogo(network: string, assetId: string) {
  const logos = useAppSelector(state => state.assetLogos);

  if (network !== NetworkName.Mainnet) {
    return assetLogosByNetwork[network]?.[assetId];
  }

  return logos[assetId] || assetLogosByNetwork[network]?.[assetId];
}

export function useAssetIdByTicker(network: string, ticker: string) {
  const tickers = useAppSelector(state => state.assetTickers);

  if (network !== NetworkName.Mainnet) {
    return assetIds[network]?.[ticker];
  }

  return (
    Object.keys(tickers).find(id => tickers[id] === ticker) ||
    assetIds[network]?.[ticker]
  );
}

export function isSwappableAsset(network: string, assetId: string) {
  return swappableAssetIds[network]?.includes(assetId) ?? false;
}
