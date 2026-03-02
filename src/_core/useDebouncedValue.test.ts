/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';

import { useDebouncedValue } from './useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('initial', 500));

    expect(result.current).toBe('initial');
  });

  it('does not update value before delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 500),
      { initialProps: { value: 'initial' } },
    );

    rerender({ value: 'updated' });
    act(() => {
      jest.advanceTimersByTime(499);
    });

    expect(result.current).toBe('initial');
  });

  it('updates value after delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 500),
      { initialProps: { value: 'initial' } },
    );

    rerender({ value: 'updated' });
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });

  it('resets the debounce timer when value changes again before delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 500),
      { initialProps: { value: 'initial' } },
    );

    rerender({ value: 'second' });
    act(() => {
      jest.advanceTimersByTime(200);
    });

    rerender({ value: 'third' });
    act(() => {
      jest.advanceTimersByTime(499);
    });

    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(result.current).toBe('third');
  });

  it('works with numeric values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: 0 } },
    );

    rerender({ value: 42 });
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe(42);
  });

  it('works with object values', () => {
    const initial = { x: 1 };
    const updated = { x: 2 };

    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 100),
      { initialProps: { value: initial } },
    );

    rerender({ value: updated });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toEqual({ x: 2 });
  });
});
