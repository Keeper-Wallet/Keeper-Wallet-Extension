import { useMemo } from 'react';
import { useAppSelector } from 'ui/store';
import { assetIds } from 'assets/constants';
import { NetworkName } from 'networks/types';

export type SwappableAssetIdsByNetwork = Record<NetworkName.Mainnet, string[]>;

export function useSwappableAssetTickersByVendor(): {
  swappableAssetTickersByVendor: string[];
  swappableAssetTickers: string[];
  swappableAssetIds: SwappableAssetIdsByNetwork;
} {
  const data = useAppSelector(state => state.swappableAssetsFromVendor);
  const assetTickers = useAppSelector(state => state.assetTickers);

  const swappableAssetTickersByVendor = useMemo(
    () =>
      Object.values(data).reduce(
        (acc, value) =>
          acc.concat(
            value.reduce(
              (valueAcc, id) =>
                assetTickers[id] ? [...valueAcc, assetTickers[id]] : valueAcc,
              [] as string[]
            )
          ),
        [] as string[]
      ),
    [data, assetTickers]
  );

  const swappableAssetTickers = useMemo(() => {
    const commonTickers = Object.entries(data).reduce(
      (acc, [, swapSet]) => [...acc, ...swapSet],
      [] as string[]
    );

    return Object.entries(assetTickers).reduce(
      (acc, [key, value]) =>
        commonTickers.includes(key) ? [...acc, value] : acc,
      [] as string[]
    );
  }, [data, assetTickers]);

  const swappableAssetIds = useMemo(
    () => ({
      mainnet: swappableAssetTickers.reduce((acc, assetName) => {
        const item = assetIds.mainnet[assetName];
        return item ? [...acc, item] : acc;
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
