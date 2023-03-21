import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import invariant from 'tiny-invariant';

import { NetworkName } from '../networks/types';
import { usePopupSelector } from '../popup/store/react';
import Background from '../ui/services/Background';

const USD_PRICES_UPDATE_INTERVAL = 5000;

const UsdPricesContext = createContext<
  ((assetIds: string[]) => (() => void) | undefined) | null
>(null);

export function UsdPricesProvider({ children }: { children: React.ReactNode }) {
  const [observedAssetIds, setObservedAssetIds] = useState<string[][]>([]);

  const assetIdsToFetch = useMemo(
    () => Array.from(new Set(observedAssetIds.flat())),
    [observedAssetIds]
  );

  const usdPrices = usePopupSelector(state => state.usdPrices);
  const usdPricesRef = useRef(usdPrices);

  useEffect(() => {
    usdPricesRef.current = usdPrices;
  }, [usdPrices]);

  useEffect(() => {
    if (assetIdsToFetch.length === 0) {
      return;
    }

    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;

    async function update({ firstRun }: { firstRun?: true } = {}) {
      try {
        if (
          !firstRun ||
          assetIdsToFetch.some(assetId => usdPricesRef.current[assetId] == null)
        ) {
          await Background.updateUsdPricesByAssetIds(assetIdsToFetch);
        }
      } finally {
        if (!cancelled) {
          timeout = setTimeout(update, USD_PRICES_UPDATE_INTERVAL);
        }
      }
    }

    update({ firstRun: true });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [assetIdsToFetch]);

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
  const isMainnet = usePopupSelector(
    state => state.currentNetwork === NetworkName.Mainnet
  );

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
