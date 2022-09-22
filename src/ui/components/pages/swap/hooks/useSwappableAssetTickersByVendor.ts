import { useMemo } from 'react';
import { SwapVendor } from 'swap/constants';
import { useAppSelector } from 'ui/store';
import { assetIds } from 'assets/constants';
import { NetworkName } from 'networks/types';

export type SwappableAssetIdsByNetwork = Record<NetworkName.Mainnet, string[]>;

export function useSwappableAssetTickersByVendor(): {
  swappableAssetTickersByVendor: Record<SwapVendor, Set<string>>;
  swappableAssetTickers: string[];
  swappableAssetIds: Record<NetworkName.Mainnet, string[]>;
} {
  const data = useAppSelector(state => state.swappableAssetsFromVendor);
  const assetTickers = useAppSelector(state => state.assetTickers);

  const swappableAssetTickersByVendor = useMemo(
    () =>
      Object.keys(data).reduce((acc, key) => {
        const vendor = key as SwapVendor;
        acc[vendor] = new Set(data[vendor]);
        return acc;
      }, {} as Record<SwapVendor, Set<string>>),
    [data]
  );

  const swappableAssetTickers = useMemo(() => {
    const commonSet = Object.entries(swappableAssetTickersByVendor).reduce(
      (acc, [, swapSet]) => new Set([...acc, ...swapSet]),
      new Set()
    );

    return Object.entries(assetTickers).reduce((acc, [key, value]) => {
      if (commonSet.has(key)) {
        acc.push(value);
      }

      return acc;
    }, [] as string[]);
  }, [assetTickers, swappableAssetTickersByVendor]);

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
    swappableAssetTickersByVendor,
    swappableAssetTickers,
    swappableAssetIds,
  };
}
