import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import useURLState from './useURLState';

const wrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>;

describe('useURLState', () => {
  test('getParam returns default when param not in URL', () => {
    const { result } = renderHook(() => useURLState(), { wrapper });
    expect(result.current.getParam('speed', 10, Number)).toBe(10);
  });

  test('getParam returns string default for missing param', () => {
    const { result } = renderHook(() => useURLState(), { wrapper });
    expect(result.current.getParam('mode', 'auto')).toBe('auto');
  });

  test('setParams updates search params', () => {
    const { result } = renderHook(() => useURLState(), { wrapper });

    act(() => {
      result.current.setParams({ speed: 5, mode: 'fast' });
    });

    expect(result.current.getParam('speed', 1, Number)).toBe(5);
    expect(result.current.getParam('mode', 'auto')).toBe('fast');
  });

  test('setParams with null removes the param', () => {
    const { result } = renderHook(() => useURLState(), { wrapper });

    act(() => {
      result.current.setParams({ speed: 5 });
    });
    expect(result.current.getParam('speed', 1, Number)).toBe(5);

    act(() => {
      result.current.setParams({ speed: null });
    });
    expect(result.current.getParam('speed', 1, Number)).toBe(1);
  });

  test('getParam handles NaN for Number parser gracefully', () => {
    const { result } = renderHook(() => useURLState(), { wrapper });

    act(() => {
      result.current.setParams({ speed: 'notanumber' });
    });

    expect(result.current.getParam('speed', 42, Number)).toBe(42);
  });

  test('shareURL returns a string', () => {
    const { result } = renderHook(() => useURLState(), { wrapper });
    expect(typeof result.current.shareURL()).toBe('string');
  });
});
