import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useTheme, getThemeProperty } from '../hooks/useTheme';
import { localStorageMock } from './mocks.ts';

// Mock getComputedStyle
const mockGetComputedStyle = vi.fn();
Object.defineProperty(window, 'getComputedStyle', {
  value: mockGetComputedStyle,
});

describe('useTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.className = '';
    localStorageMock();
  });

  describe('getThemeProperty', () => {
    test('returns CSS custom property value', () => {
      const mockStyle = {
        getPropertyValue: vi.fn().mockReturnValue('  #ffffff  '),
      };
      mockGetComputedStyle.mockReturnValue(mockStyle);

      const result = getThemeProperty('bg-primary');

      expect(mockGetComputedStyle).toHaveBeenCalledWith(document.body);
      expect(mockStyle.getPropertyValue).toHaveBeenCalledWith('--bg-primary');
      expect(result).toBe('#ffffff');
    });
  });

  describe('System preferences', () => {
    test('defaults to light with light mode system preference', () => {
      const { result } = renderHook(() => useTheme());
      const [theme] = result.current;
      expect(theme).toBe('light');
    });

    test('switches to dark with dark mode system preference', () => {
      Object.defineProperty(window, 'matchMedia', {
        value: vi.fn().mockImplementation(() => ({
          matches: true,
        })),
      });
      const { result } = renderHook(() => useTheme());
      const [theme] = result.current;
      expect(theme).toBe('dark');
    });
  });

  describe('localStorage detection', () => {
    test('defaults to light when saved theme is light', () => {
      localStorageMock('light');
      const { result } = renderHook(() => useTheme());
      const [theme] = result.current;
      expect(theme).toBe('light');
    });

    test('switches to dark when saved theme is dark', () => {
      localStorageMock('dark');
      const { result } = renderHook(() => useTheme());
      const [theme] = result.current;
      expect(theme).toBe('dark');
    });
  });
});
