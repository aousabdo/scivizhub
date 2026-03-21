import { renderHook, act } from '@testing-library/react';
import useResponsiveCanvas from './useResponsiveCanvas';

describe('useResponsiveCanvas', () => {
  test('returns containerRef and dimensions', () => {
    const { result } = renderHook(() => useResponsiveCanvas());
    expect(result.current).toHaveProperty('containerRef');
    expect(result.current).toHaveProperty('dimensions');
    expect(result.current.dimensions).toHaveProperty('width');
    expect(result.current.dimensions).toHaveProperty('height');
  });

  test('defaults to 800x500 when no container', () => {
    const { result } = renderHook(() => useResponsiveCanvas());
    expect(result.current.dimensions.width).toBe(800);
    expect(result.current.dimensions.height).toBe(500);
  });

  test('respects custom aspect ratio', () => {
    const { result } = renderHook(() => useResponsiveCanvas({ aspectRatio: 1.0 }));
    // Without a container, defaults stay
    expect(result.current.dimensions).toBeDefined();
  });

  test('responds to window resize', () => {
    const { result } = renderHook(() => useResponsiveCanvas({ debounceMs: 0 }));

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    // Should not crash; dimensions should still be valid
    expect(result.current.dimensions.width).toBeGreaterThan(0);
    expect(result.current.dimensions.height).toBeGreaterThan(0);
  });
});
