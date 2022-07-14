import { assetIds, assetLogosByNetwork, swappableAssetIds } from './constants';
import { useAppSelector } from 'ui/store';
import { NetworkName } from '../accounts/types';

export function useAssetLogo(network: string, assetId: string) {
  const logos = useAppSelector(state => state.logos);

  if (network !== NetworkName.Mainnet) {
    return assetLogosByNetwork[network]?.[assetId];
  }

  return logos[assetId] || assetLogosByNetwork[network]?.[assetId];
}

export function getAssetIdByTicker(
  network: string,
  ticker: string
): string | undefined {
  return assetIds[network]?.[ticker];
}

export function isSwappableAsset(network: string, assetId: string) {
  return swappableAssetIds[network]?.includes(assetId) ?? false;
}
