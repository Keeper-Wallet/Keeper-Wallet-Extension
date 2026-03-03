/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import React from 'react';

import { NetworkName } from '../networks/types';
import {
  UsdPricesProvider,
  useUnit0UsdPrices,
  useUsdPrices,
} from './usdPrices';

const mockUsePopupSelector = jest.fn();

jest.mock('../popup/store/react', () => ({
  usePopupSelector: (selector: (state: unknown) => unknown) =>
    mockUsePopupSelector(selector),
}));

jest.mock('../ui/services/Background', () => ({
  __esModule: true,
  default: {
    updateUsdPricesByAssetIds: jest.fn().mockResolvedValue(undefined),
    updateUnit0UsdPricesByIds: jest.fn().mockResolvedValue(undefined),
  },
}));

const mockUsdPrices: Record<string, number> = {
  WAVES: 2.5,
  ABOT: 1.0,
  USDN: 0.5,
  UNIT0: 0.01,
  '0xb303d80db8415fd1d3c9fed68a52eeac9a052671': 3.0,
};

function setupSelector(overrides: Record<string, unknown> = {}) {
  const state = {
    currentNetwork: NetworkName.Mainnet,
    currentBlockchainType: 'waves',
    usdPrices: mockUsdPrices,
    ...overrides,
  };
  mockUsePopupSelector.mockImplementation(
    (selector: (s: typeof state) => unknown) => selector(state),
  );
}

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(UsdPricesProvider, null, children);

describe('useUsdPrices', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    setupSelector();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns prices filtered by the requested asset IDs', () => {
    const { result } = renderHook(() => useUsdPrices(['WAVES', 'ABOT']), {
      wrapper,
    });

    expect(result.current).toEqual({ WAVES: 2.5, ABOT: 1.0 });
  });

  it('excludes prices for asset IDs that were not requested', () => {
    const { result } = renderHook(() => useUsdPrices(['WAVES']), { wrapper });

    expect(result.current).not.toHaveProperty('ABOT');
    expect(result.current).toEqual({ WAVES: 2.5 });
  });

  it('returns empty object when no asset IDs match', () => {
    const { result } = renderHook(() => useUsdPrices(['unknownAsset']), {
      wrapper,
    });

    expect(result.current).toEqual({});
  });

  it('returns empty object for an empty asset IDs array', () => {
    const { result } = renderHook(() => useUsdPrices([]), { wrapper });

    expect(result.current).toEqual({});
  });

  it('does not fetch prices when not on mainnet', () => {
    setupSelector({ currentNetwork: NetworkName.Testnet });
    const Background = jest.requireMock('../ui/services/Background').default;
    Background.updateUsdPricesByAssetIds.mockClear();

    renderHook(() => useUsdPrices(['WAVES']), { wrapper });

    expect(Background.updateUsdPricesByAssetIds).not.toHaveBeenCalled();
  });
});

describe('useUnit0UsdPrices', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    setupSelector({ currentBlockchainType: 'unit0' });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns prices for the UNIT0 native address', () => {
    const { result } = renderHook(() => useUnit0UsdPrices(['unit0']), {
      wrapper,
    });

    expect(result.current).toEqual({ UNIT0: 0.01 });
  });

  it('normalizes ERC-20 addresses to lowercase when filtering', () => {
    setupSelector({
      currentBlockchainType: 'unit0',
      usdPrices: { '0xb303d80db8415fd1d3c9fed68a52eeac9a052671': 3.0 },
    });

    const { result } = renderHook(
      () => useUnit0UsdPrices(['0xB303D80DB8415FD1D3C9FED68A52EEAC9A052671']),
      { wrapper },
    );

    expect(result.current).toEqual({
      '0xb303d80db8415fd1d3c9fed68a52eeac9a052671': 3.0,
    });
  });

  it('normalizes the unit0 native address to uppercase UNIT0', () => {
    setupSelector({
      currentBlockchainType: 'unit0',
      usdPrices: { UNIT0: 0.01 },
    });

    const { result } = renderHook(() => useUnit0UsdPrices(['unit0']), {
      wrapper,
    });

    expect(result.current).toHaveProperty('UNIT0');
    expect(result.current).not.toHaveProperty('unit0');
  });

  it('returns empty object when no addresses match', () => {
    const { result } = renderHook(() => useUnit0UsdPrices(['0xunknown']), {
      wrapper,
    });

    expect(result.current).toEqual({});
  });

  it('does not fetch prices when not on mainnet', () => {
    setupSelector({
      currentNetwork: NetworkName.Testnet,
      currentBlockchainType: 'unit0',
    });
    const Background = jest.requireMock('../ui/services/Background').default;
    Background.updateUnit0UsdPricesByIds.mockClear();

    renderHook(() => useUnit0UsdPrices(['unit0']), { wrapper });

    expect(Background.updateUnit0UsdPricesByIds).not.toHaveBeenCalled();
  });
});
