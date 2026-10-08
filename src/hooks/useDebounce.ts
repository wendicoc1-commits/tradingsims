import { useState, useEffect } from 'react';

/**
 * useDebounce - delays updating a value until after `delay` ms of no changes.
 * Used to prevent excessive re-renders on rapid input (e.g., price/lots fields).
 *
 * @param value - The value to debounce
 * @param delay - Debounce delay in ms (default: 300ms)
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
