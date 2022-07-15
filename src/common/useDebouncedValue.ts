import { useState, useEffect } from 'react';

export function useDebouncedValue<T>(value: T, ms: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, ms);

    return () => {
      clearTimeout(timeout);
    };
  }, [ms, value]);

  return debouncedValue;
}
