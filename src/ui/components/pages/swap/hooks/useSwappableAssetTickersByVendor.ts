import { useMemo } from 'react';
import { SwapVendor } from 'swap/constants';
import { useAppSelector } from 'ui/store';
import { assetIds } from 'assets/constants';
import { NetworkName } from 'networks/types';

export type SwappableAssetIdsByNetwork = Record<NetworkName.Mainnet, string[]>;

export function useSwappableAssetTickersByVendor(): {
  swappableAssetTickersByVendor: Record<SwapVendor, string>;
  swappableAssetTickers: string[];
  swappableAssetIds: Record<NetworkName.Mainnet, string[]>;
} {
  const data = useAppSelector(state => state.swappableAssetsFromVendor);
  const assetTickers = useAppSelector(state => state.assetTickers);
 

  const swappableAssetTickers = useMemo(() => {
    const commonTickers = Object.entries(data).reduce(
      (acc, [, swapSet]) => [...acc, ...swapSet],
      [] as string[]
    );

    return Object.entries(assetTickers).reduce((acc, [key, value]) => {
      if (commonTickers.includes(key)) {
        acc.push(value);
      }

      return acc;
    }, [] as string[]);
  }, [data, assetTickers]);

  const swappableAssetIds = useMemo(
    () => ({
      mainnet: swappableAssetTickers.reduce((acc, assetName) => {
        const item = assetIds.mainnet[assetName];
        if (item) {
          acc.push(item);
        }

        return acc;
      }, [] as string[]),
    }),
    [swappableAssetTickers]
  );

  return {
    swappableAssetTickersByVendor: data,
    swappableAssetTickers,
    swappableAssetIds,
  };
}
