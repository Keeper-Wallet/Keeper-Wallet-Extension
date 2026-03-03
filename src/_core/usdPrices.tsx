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

const Unit0UsdPricesContext = createContext<
  ((addresses: string[]) => (() => void) | undefined) | null
>(null);

export function UsdPricesProvider({ children }: { children: React.ReactNode }) {
  const [observedAssetIds, setObservedAssetIds] = useState<string[][]>([]);
  const [observedAddresses, setObservedAddresses] = useState<string[][]>([]);

  const assetIdsToFetch = useMemo(
    () => Array.from(new Set(observedAssetIds.flat())),
    [observedAssetIds],
  );

  const addressesToFetch = useMemo(
    () => Array.from(new Set(observedAddresses.flat())),
    [observedAddresses],
  );

  const currentNetwork = usePopupSelector(state => state.currentNetwork);
  const currentBlockchainType = usePopupSelector(
    state => state.currentBlockchainType,
  );

  const usdPrices = usePopupSelector(state => state.usdPrices);
  const usdPricesRef = useRef(usdPrices);

  useEffect(() => {
    usdPricesRef.current = usdPrices;
  }, [usdPrices]);

  const effectiveAssetIdsToFetch = useMemo(() => {
    if (currentNetwork !== NetworkName.Mainnet) {
      return [] as string[];
    }

    if (assetIdsToFetch.length > 0) {
      return assetIdsToFetch;
    }

    if (currentBlockchainType === 'waves') {
      return ['WAVES'];
    }

    return [] as string[];
  }, [assetIdsToFetch, currentNetwork, currentBlockchainType]);

  const effectiveAddressesToFetch = useMemo(() => {
    if (currentNetwork !== NetworkName.Mainnet) {
      return [] as string[];
    }

    if (addressesToFetch.length > 0) {
      return addressesToFetch;
    }

    if (currentBlockchainType === 'unit0') {
      return ['UNIT0'];
    }

    return [] as string[];
  }, [addressesToFetch, currentNetwork, currentBlockchainType]);

  useEffect(() => {
    if (effectiveAssetIdsToFetch.length === 0) {
      return;
    }

    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;

    async function update() {
      try {
        await Background.updateUsdPricesByAssetIds(effectiveAssetIdsToFetch);
      } finally {
        if (!cancelled) {
          timeout = setTimeout(update, USD_PRICES_UPDATE_INTERVAL);
        }
      }
    }

    update();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [effectiveAssetIdsToFetch]);

  // Unit0 price fetching effect
  useEffect(() => {
    if (effectiveAddressesToFetch.length === 0) {
      return;
    }

    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;

    async function update() {
      try {
        await Background.updateUnit0UsdPricesByIds(effectiveAddressesToFetch);
      } finally {
        if (!cancelled) {
          timeout = setTimeout(update, USD_PRICES_UPDATE_INTERVAL);
        }
      }
    }

    update();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [effectiveAddressesToFetch]);

  const observe = useCallback((assetIds: string[]) => {
    setObservedAssetIds(ids => [...ids, assetIds]);

    return () => {
      setObservedAssetIds(prev => prev.filter(ids => ids !== assetIds));
    };
  }, []);

  const observeUnit0 = useCallback((addresses: string[]) => {
    setObservedAddresses(addrs => [...addrs, addresses]);

    return () => {
      setObservedAddresses(prev => prev.filter(addrs => addrs !== addresses));
    };
  }, []);

  return (
    <UsdPricesContext.Provider value={observe}>
      <Unit0UsdPricesContext.Provider value={observeUnit0}>
        {children}
      </Unit0UsdPricesContext.Provider>
    </UsdPricesContext.Provider>
  );
}

export function useUsdPrices(assetIds: string[]) {
  const isMainnet = usePopupSelector(
    state => state.currentNetwork === NetworkName.Mainnet,
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
      Object.entries(usdPrices).filter(([id]) => assetIdsSet.has(id)),
    );
  }, [assetIds, usdPrices]);
}

/**
 * Hook to fetch and observe USD prices for Unit0 token addresses
 * @param addresses - Array of Unit0 token contract addresses ('unit0' for native, '0x...' for ERC-20)
 * @returns Map of normalized addresses to USD prices
 */
export function useUnit0UsdPrices(addresses: string[]) {
  const isMainnet = usePopupSelector(
    state => state.currentNetwork === NetworkName.Mainnet,
  );

  const observe = useContext(Unit0UsdPricesContext);
  invariant(observe);

  useEffect(() => {
    if (!isMainnet) {
      return;
    }

    return observe(addresses);
  }, [observe, addresses, isMainnet]);

  const usdPrices = usePopupSelector(state => state.usdPrices);

  return useMemo(() => {
    // Convert addresses to normalized format used in the store
    const normalizedAddresses = addresses.map(address =>
      address === 'UNIT0' ? 'UNIT0' : address.toLowerCase(),
    );
    const addressSet = new Set(normalizedAddresses);

    return Object.fromEntries(
      Object.entries(usdPrices).filter(([key]) => addressSet.has(key)),
    );
  }, [addresses, usdPrices]);
}
