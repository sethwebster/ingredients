import { useEffect, useState } from "react";

export default function useTimeout(fn: Function, interval: number) {
  useEffect(() => {
    const id = setTimeout(fn, interval);
    return () => clearTimeout(id);
  }, [fn, interval]);
}

export function useTimedState<T>(defaultValue: T, interval: number): [T, (value:T)=>void] {
  const [storedValue, setStoredValue] = useState<T>(defaultValue);
  return [storedValue, (value: T) => {
    setStoredValue(value);
    setTimeout(() => setStoredValue(defaultValue), interval);
  }]
}