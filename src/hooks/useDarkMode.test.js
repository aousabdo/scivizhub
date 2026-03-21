import { renderHook, act } from '@testing-library/react';
import useDarkMode from './useDarkMode';

const mockMatchMedia = (matches = false) => {
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
};

describe('useDarkMode', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    mockMatchMedia(false);
  });

  test('defaults to false when no stored preference and system prefers light', () => {
    const { result } = renderHook(() => useDarkMode());
    expect(result.current[0]).toBe(false);
  });

  test('defaults to true when system prefers dark', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useDarkMode());
    expect(result.current[0]).toBe(true);
  });

  test('reads stored preference from localStorage', () => {
    localStorage.setItem('scivizhub-dark', 'true');
    const { result } = renderHook(() => useDarkMode());
    expect(result.current[0]).toBe(true);
  });

  test('toggling dark mode updates class and localStorage', () => {
    const { result } = renderHook(() => useDarkMode());
    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[1](true);
    });

    expect(result.current[0]).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('scivizhub-dark')).toBe('true');
  });

  test('setting dark to false removes dark class', () => {
    localStorage.setItem('scivizhub-dark', 'true');
    const { result } = renderHook(() => useDarkMode());

    act(() => {
      result.current[1](false);
    });

    expect(result.current[0]).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('scivizhub-dark')).toBe('false');
  });
});
