import { vi } from 'vitest';

// Mock localStorage
export const localStorageMock = (value: string | null = null) => {
  const localStorageMock = {
    matches: value === 'dark',
    getItem: vi.fn().mockReturnValue(value),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });
};

// Mock complete for images to resolve the Promise
let imageCompleteSpy: any;
export const mockImageCompleteTrue = () => {
  imageCompleteSpy = vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true);
};

export const mockImageCompleteFalse = () => {
  imageCompleteSpy = vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(false);
};

export const restoreImageComplete = () => {
  imageCompleteSpy?.mockRestore();
  imageCompleteSpy = null;
};

export const autoResolveImageHandlers = () => {
  const onloadSet = vi
    .spyOn(HTMLImageElement.prototype, 'onload', 'set')
    .mockImplementation(function (handler: any) {
      if (typeof handler === 'function')
        queueMicrotask(() => handler.call(this, new Event('load')));
    });

  const onerrorSet = vi
    .spyOn(HTMLImageElement.prototype, 'onerror', 'set')
    .mockImplementation(function (handler: any) {
      if (typeof handler === 'function')
        queueMicrotask(() => handler.call(this, new Event('error')));
    });

  return () => {
    onloadSet.mockRestore();
    onerrorSet.mockRestore();
  };
};
