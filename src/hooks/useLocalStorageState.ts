import { useState, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";

/**
 * Hook genérico que sincroniza un estado con localStorage,
 * permitiendo actualizaciones por valor o función.
 */
export function useLocalStorageState<T>(
  key: string,
  defaultValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const json = localStorage.getItem(key);
      return json ? JSON.parse(json) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      localStorage.removeItem(key);
    }
  }, [key, value]);

  return [value, setValue];
}
