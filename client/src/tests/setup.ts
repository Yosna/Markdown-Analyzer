import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables for tests
vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:5000');

// Mock window.matchMedia for useTheme hook
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    addListener: vi.fn(),
    removeListener: vi.fn(),
  })),
});

// Mock getClientRects for CodeMirror compatibility with jsdom
if (typeof window !== 'undefined') {
  // Mock getClientRects for elements
  Element.prototype.getClientRects = function () {
    return [new DOMRect(0, 0, 0, 0)] as any;
  };

  // Mock getBoundingClientRect for elements
  Element.prototype.getBoundingClientRect = function () {
    return new DOMRect(0, 0, 0, 0);
  };

  // Mock textRange for CodeMirror
  const originalCreateRange = document.createRange;
  document.createRange = function () {
    const range = originalCreateRange.call(this);
    range.getClientRects = function () {
      return [new DOMRect(0, 0, 0, 0)] as any;
    };
    range.getBoundingClientRect = function () {
      return new DOMRect(0, 0, 0, 0);
    };
    return range;
  };

  // Mock html2canvas-pro for image capturing
  vi.mock('html2canvas-pro', () => ({
    default: vi.fn(async () => ({ toDataURL: () => 'data:image/jpeg;base64,TEST' })),
  }));

  // Mock react-toastify for toast notifications
  vi.mock('react-toastify', () => ({
    toast: {
      success: vi.fn(),
      error: vi.fn(),
    },
  }));
}
