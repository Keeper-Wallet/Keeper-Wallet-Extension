import { useMemo } from 'react';
import { SwapVendor } from 'swap/constants';
import { useAppSelector } from 'ui/store';
import { assetIds } from 'assets/constants';
import { NetworkName } from 'networks/types';

export type SwappableAssetIdRecord = Record<NetworkName.Mainnet, string[]>;

export const useSwappableAssetTickersByVendor = (): {
  swappableAssetTickersByVendor: Record<SwapVendor, Set<string>> | Record<string, unknown>;
  swappableAssetTickers: string[];
  swappableAssetIds: Record<NetworkName.Mainnet, string[]> | Record<string, unknown>;
} => {
  const data = useAppSelector(state => state.swappableAssetsFromVendor);

  const swappableAssetTickers = useMemo(
    () => 
      Array.from(
        new Set(
          Object.values(data).flatMap(tickersSet => (tickersSet instanceof Set) ? Array.from(tickersSet) : [])
        )
      ),
    [data]
  );

  const swappableAssetIds = useMemo(
    () => ({
      mainnet: swappableAssetTickers.map(
        assetName => assetIds.mainnet[assetName]
      ),
    }),
    [swappableAssetTickers]
  );

  return {
    swappableAssetTickersByVendor: data,
    swappableAssetTickers,
    swappableAssetIds,
  };
};
