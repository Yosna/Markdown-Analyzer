import { describe, test, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { readFileAsText } from '../utils/fileUtils';

describe('fileUtils', () => {
  describe('readFileAsText', () => {
    test('reads file content successfully', async () => {
      const mockFile = new File(['Hello, world!'], 'test.md', { type: 'text/markdown' });

      const result = await readFileAsText(mockFile);

      expect(result).toBe('Hello, world!');
    });

    test('reads multi-line file content', async () => {
      const content = 'Line 1\nLine 2\nLine 3';
      const mockFile = new File([content], 'test.md', { type: 'text/markdown' });

      const result = await readFileAsText(mockFile);

      expect(result).toBe(content);
    });

    test('reads empty file content', async () => {
      const mockFile = new File([''], 'test.md', { type: 'text/markdown' });

      const result = await readFileAsText(mockFile);

      expect(result).toBe('');
    });

    test('handles file with special characters', async () => {
      const content = 'Hello, 世界! 🚀\nSpecial chars: & < > " \'';
      const mockFile = new File([content], 'test.md', { type: 'text/markdown' });

      const result = await readFileAsText(mockFile);

      expect(result).toBe(content);
    });

    test('handles file reading edge cases', async () => {
      const mockFile = new File(['Hello, world!'], 'test.md', { type: 'text/markdown' });
      const result = await readFileAsText(mockFile);
      expect(result).toBe('Hello, world!');
    });

    test('handles large file content', async () => {
      const largeContent = 'A'.repeat(10000);
      const mockFile = new File([largeContent], 'test.md', { type: 'text/markdown' });

      const result = await readFileAsText(mockFile);

      expect(result).toBe(largeContent);
      expect(result.length).toBe(10000);
    });
  });
});
