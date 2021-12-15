import { assetIds, assetLogosByNetwork } from './constants';

export function getAssetLogo(network: string, assetId: string) {
  return assetLogosByNetwork[network]?.[assetId];
}

export function getAssetIdByName(network: string, assetName: string) {
  return assetIds[network]?.[assetName];
}
