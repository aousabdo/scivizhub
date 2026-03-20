import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Hook to sync state values with URL search parameters.
 *
 * Usage:
 *   const { getParam, setParams, shareURL } = useURLState();
 *   const initialSpeed = getParam('speed', 1, Number);
 *   setParams({ speed: 2, mode: 'fast' });
 *
 * shareURL() returns the current URL for copy-to-clipboard sharing.
 */
export default function useURLState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const getParam = useCallback((key, defaultValue, parser = String) => {
    const val = searchParams.get(key);
    if (val === null) return defaultValue;
    try {
      const parsed = parser(val);
      if (parser === Number && isNaN(parsed)) return defaultValue;
      return parsed;
    } catch {
      return defaultValue;
    }
  }, [searchParams]);

  const setParams = useCallback((params) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(params).forEach(([k, v]) => {
        if (v === null || v === undefined) {
          next.delete(k);
        } else {
          next.set(k, String(v));
        }
      });
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const shareURL = useCallback(() => {
    return window.location.href;
  }, []);

  return { getParam, setParams, shareURL, searchParams };
}
