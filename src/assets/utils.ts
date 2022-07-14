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
  const ids = useAppSelector(state => state.assetIds);

  if (network !== NetworkName.Mainnet) {
    return assetIds[network]?.[ticker];
  }

  return ids[ticker] || assetIds[network]?.[ticker];
}

export function isSwappableAsset(network: string, assetId: string) {
  return swappableAssetIds[network]?.includes(assetId) ?? false;
}
