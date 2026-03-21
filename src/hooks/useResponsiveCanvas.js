import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook that manages responsive canvas/container sizing.
 * Returns { containerRef, dimensions } where dimensions = { width, height }.
 *
 * @param {object} opts
 * @param {number} [opts.aspectRatio=0.625]  height / width ratio (default 5:8)
 * @param {number} [opts.maxWidth=1200]      clamp at this width
 * @param {number} [opts.minWidth=300]       minimum usable width
 * @param {number} [opts.debounceMs=100]     resize debounce
 */
export default function useResponsiveCanvas({
  aspectRatio = 0.625,
  maxWidth = 1200,
  minWidth = 300,
  debounceMs = 100,
} = {}) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  const measure = useCallback(() => {
    if (!containerRef.current) return;
    const w = Math.max(minWidth, Math.min(containerRef.current.clientWidth, maxWidth));
    const h = Math.round(w * aspectRatio);
    setDimensions((prev) => (prev.width === w && prev.height === h ? prev : { width: w, height: h }));
  }, [aspectRatio, maxWidth, minWidth]);

  useEffect(() => {
    measure();
    let timer;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(measure, debounceMs);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(timer);
    };
  }, [measure, debounceMs]);

  return { containerRef, dimensions };
}
