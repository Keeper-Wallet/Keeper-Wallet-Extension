import { NetworkName } from 'networks/types';
import { usePopupSelector } from 'popup/store/react';

import { assetIds } from './constants';

export function useAssetLogo(network: NetworkName, assetId: string) {
  const logos = usePopupSelector(state => state.assetLogos);

  if (!assetId) {
    return undefined;
  }

  return logos[assetId];
}

export function useAssetIdByTicker(network: NetworkName, ticker: string) {
  const tickers = usePopupSelector(state => state.assetTickers);

  if (network !== NetworkName.Mainnet) {
    return assetIds[network]?.[ticker];
  }

  return (
    Object.keys(tickers).find(id => tickers[id] === ticker) ||
    assetIds[network]?.[ticker]
  );
}
