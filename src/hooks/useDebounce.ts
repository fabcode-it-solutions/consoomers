/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useEffect, DependencyList } from "react";

export const useDebounce = (
  callback: () => void,
  delay: number,
  deps?: DependencyList
) => {
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(callback, delay);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, deps);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);
};
