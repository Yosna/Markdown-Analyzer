import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { captureMarkdownPreview } from '../utils/captureImage';
import {
  mockImageCompleteTrue,
  mockImageCompleteFalse,
  restoreImageComplete,
  autoResolveImageHandlers,
} from './mocks';

describe('captureImage', () => {
  describe('captureMarkdownPreview', () => {
    let mockPreviewRef: any;
    let mockClone: any;

    beforeEach(async () => {
      mockClone = {
        style: {},
        querySelectorAll: vi.fn().mockReturnValue([]),
        offsetHeight: 100,
        scrollHeight: 200,
      };

      mockPreviewRef = {
        current: {
          cloneNode: vi.fn().mockReturnValue(mockClone),
        },
      };

      // Mock document methods
      document.body.appendChild = vi.fn();
      document.body.removeChild = vi.fn();

      // Mock window.getComputedStyle
      window.getComputedStyle = vi.fn().mockReturnValue({
        getPropertyValue: vi.fn().mockReturnValue('#1a1a1a'),
      });
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    test('returns undefined when preview ref is null', async () => {
      const result = await captureMarkdownPreview({ current: null });
      expect(result).toBeUndefined();
    });

    test('creates clone and sets up styling', async () => {
      const mockCanvas = {
        toDataURL: vi.fn().mockReturnValue('data:image/jpeg;base64,test'),
      };

      await captureMarkdownPreview(mockPreviewRef);

      expect(mockPreviewRef.current.cloneNode).toHaveBeenCalledWith(true);
      expect(document.body.appendChild).toHaveBeenCalledWith(mockClone);
      expect(mockClone.style.position).toBe('absolute');
      expect(mockClone.style.left).toBe('-99999px');
      expect(mockClone.style.width).toBe('900px');
      expect(mockClone.style.overflow).toBe('visible');
    });

    test('handles images in the preview', async () => {
      const mockImages = [{ complete: true }, { complete: true }];
      mockClone.querySelectorAll.mockReturnValue(mockImages);

      const mockCanvas = {
        toDataURL: vi.fn().mockReturnValue('data:image/jpeg;base64,test'),
      };

      await captureMarkdownPreview(mockPreviewRef);

      expect(mockClone.querySelectorAll).toHaveBeenCalledWith('img');
    });

    test('sets clone height based on scroll height', async () => {
      const mockCanvas = {
        toDataURL: vi.fn().mockReturnValue('data:image/jpeg;base64,test'),
      };

      await captureMarkdownPreview(mockPreviewRef);

      expect(mockClone.style.height).toBe('200px');
    });

    test('returns data URL from canvas', async () => {
      const result = await captureMarkdownPreview(mockPreviewRef);

      expect(result).toBe('data:image/jpeg;base64,TEST');
    });

    test('removes clone from document body', async () => {
      await captureMarkdownPreview(mockPreviewRef);

      expect(document.body.removeChild).toHaveBeenCalledWith(mockClone);
    });

    test('handles case with no images', async () => {
      mockClone.querySelectorAll.mockReturnValue([]);

      const result = await captureMarkdownPreview(mockPreviewRef);

      expect(result).toBe('data:image/jpeg;base64,TEST');
    });

    test('handles image rendering', async () => {
      mockImageCompleteTrue();
      const preview = document.createElement('p');
      const img = document.createElement('img');
      img.src = 'https://img.shields.io/badge/test-blue';
      img.alt = 'test';
      preview.appendChild(img);
      const previewRef = { current: preview };
      const result = await captureMarkdownPreview(previewRef);

      expect(result).toBe('data:image/jpeg;base64,TEST');
      restoreImageComplete();
    });

    test('handles incomplete images', async () => {
      mockImageCompleteFalse();
      const cleanup = autoResolveImageHandlers();
      const preview = document.createElement('p');
      const img = document.createElement('img');
      img.src = 'https://img.shields.io/badge/test-blue';
      img.alt = 'test';
      preview.appendChild(img);
      const previewRef = { current: preview };
      const result = await captureMarkdownPreview(previewRef);

      expect(result).toBe('data:image/jpeg;base64,TEST');
      restoreImageComplete();
      cleanup();
    });
  });
});
