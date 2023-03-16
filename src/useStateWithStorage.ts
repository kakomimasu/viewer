import { useEffect, useState } from "react";

export function useStateWithStorage<T>(key: string, initialValue: T) {
  const [value, setter] = useState<T>(initialValue);
  useEffect(() => {
    const storageItem = localStorage.getItem(key);
    if (storageItem !== null) {
      setter(JSON.parse(storageItem));
    }
  }, [key]);

  useEffect(() => {
    if (value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, [value, key]);

  return [value, setter] as const;
}
