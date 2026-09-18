import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Filter state that lives in the URL.
 *
 * Board state kept only in React is state nobody can share. Putting it in the
 * query string makes "here is the view I am talking about" a link, and makes
 * the back button behave the way people expect on a filtered board.
 */
export const useUrlState = <T extends string>(
  key: string,
  fallback: T,
  allowed?: readonly T[],
): [T, (value: T) => void] => {
  const [params, setParams] = useSearchParams();
  const raw = params.get(key);

  const value = useMemo(() => {
    if (raw === null) return fallback;
    // Never trust a hand-edited query string to contain a valid value.
    if (allowed && !allowed.includes(raw as T)) return fallback;
    return raw as T;
  }, [raw, fallback, allowed]);

  const setValue = useCallback(
    (next: T) => {
      setParams(
        (current) => {
          const updated = new URLSearchParams(current);
          if (next === fallback) updated.delete(key);
          else updated.set(key, next);
          return updated;
        },
        { replace: true },
      );
    },
    [fallback, key, setParams],
  );

  return [value, setValue];
};

/** Clear every filter at once, preserving any unrelated parameters. */
export const useClearUrlState = (keys: string[]): (() => void) => {
  const [, setParams] = useSearchParams();
  return useCallback(() => {
    setParams(
      (current) => {
        const updated = new URLSearchParams(current);
        for (const key of keys) updated.delete(key);
        return updated;
      },
      { replace: true },
    );
  }, [keys, setParams]);
};
