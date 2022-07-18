import { assetIds, assetLogosByNetwork, swappableAssetIds } from './constants';

export function getAssetLogo(network: string, assetId: string) {
  return assetLogosByNetwork[network]?.[assetId];
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
