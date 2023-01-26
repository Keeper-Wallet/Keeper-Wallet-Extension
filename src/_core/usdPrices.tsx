import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import invariant from 'tiny-invariant';

import { usePopupSelector } from '../popup/store/react';
import Background from '../ui/services/Background';
import { startPolling } from './polling';
import { useDebouncedValue } from './useDebouncedValue';

const USD_PRICES_UPDATE_INTERVAL = 5000;

const UsdPricesContext = createContext<
  ((assetIds: string[]) => (() => void) | undefined) | null
>(null);

export function UsdPricesProvider({ children }: { children: ReactNode }) {
  const lastUpdatedAssetIdsTimestampsRef = useRef<Record<string, number>>({});
  const [observedAssetIds, setObservedAssetIds] = useState<string[][]>([]);
  const observedAssetIdsDebounced = useDebouncedValue(observedAssetIds, 100);

  useEffect(() => {
    const idsToUpdate = Array.from(new Set(observedAssetIdsDebounced.flat()));

    if (idsToUpdate.length === 0) {
      return;
    }

    return startPolling(USD_PRICES_UPDATE_INTERVAL, async () => {
      const currentTime = new Date().getTime();

      const areAllAssetsUpToDate = idsToUpdate.every(id => {
        const timestamp = lastUpdatedAssetIdsTimestampsRef.current[id];

        if (timestamp == null) {
          return false;
        }

        return currentTime - timestamp < USD_PRICES_UPDATE_INTERVAL;
      });

      if (!areAllAssetsUpToDate) {
        await Background.updateUsdPricesByAssetIds(idsToUpdate);

        const updatedTime = new Date().getTime();

        for (const id of idsToUpdate) {
          lastUpdatedAssetIdsTimestampsRef.current[id] = updatedTime;
        }
      }
    });
  }, [observedAssetIdsDebounced]);

  const observe = useCallback((assetIds: string[]) => {
    setObservedAssetIds(ids => [...ids, assetIds]);

    return () => {
      setObservedAssetIds(prev => prev.filter(ids => ids !== assetIds));
    };
  }, []);

  return (
    <UsdPricesContext.Provider value={observe}>
      {children}
    </UsdPricesContext.Provider>
  );
}

export function useUsdPrices(assetIds: string[]) {
  const currentNetwork = usePopupSelector(state => state.currentNetwork);
  const isMainnet = currentNetwork === 'mainnet';

  const observe = useContext(UsdPricesContext);
  invariant(observe);

  useEffect(() => {
    if (!isMainnet) {
      return;
    }

    return observe(assetIds);
  }, [observe, assetIds, isMainnet]);

  const usdPrices = usePopupSelector(state => state.usdPrices);

  return useMemo(() => {
    const assetIdsSet = new Set(assetIds);

    return Object.fromEntries(
      Object.entries(usdPrices).filter(([id]) => assetIdsSet.has(id))
    );
  }, [assetIds, usdPrices]);
}
