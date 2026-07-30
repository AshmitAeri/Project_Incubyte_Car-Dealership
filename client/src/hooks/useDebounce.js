import { useState, useEffect, useRef } from 'react';

/**
 * Debounce a value by the given delay
 * @param {any} value
 * @param {number} delay - milliseconds
 */
const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
