import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendToLLM } from '../utils/api';

describe('api', () => {
  describe('sendToLLM', () => {
    let mockFetch: any;

    beforeEach(() => {
      mockFetch = vi.fn();
      global.fetch = mockFetch;
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    const mockSuccessResponse = (data: any) => ({
      ok: true,
      json: () => Promise.resolve(data),
    });

    const mockErrorResponse = (message: string) => ({
      ok: false,
      text: () => Promise.resolve(message),
    });

    const expectApiCall = (expectedBody: any) => {
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expectedBody),
      });
    };

    test('sends request with markdown and instructions', async () => {
      const mockResponse = { markdown: 'Updated content', summary: 'AI summary' };
      mockFetch.mockResolvedValueOnce(mockSuccessResponse(mockResponse));

      const result = await sendToLLM('Test markdown', 'Test instructions');

      expectApiCall({ markdown: 'Test markdown', instructions: 'Test instructions' });
      expect(result).toEqual(mockResponse);
    });

    test('includes preview when provided', async () => {
      const mockResponse = { markdown: 'Updated content', summary: 'AI summary' };
      mockFetch.mockResolvedValueOnce(mockSuccessResponse(mockResponse));

      await sendToLLM('Test markdown', 'Test instructions', 'data:image/jpeg;base64,test');

      expectApiCall({
        markdown: 'Test markdown',
        instructions: 'Test instructions',
        preview: 'data:image/jpeg;base64,test',
      });
    });

    test('handles successful response without preview', async () => {
      const mockResponse = { markdown: 'Updated content', summary: 'AI summary' };
      mockFetch.mockResolvedValueOnce(mockSuccessResponse(mockResponse));

      const result = await sendToLLM('Test markdown', 'Test instructions');

      expect(result).toEqual(mockResponse);
    });

    test('throws error when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce(mockErrorResponse('Server error'));

      await expect(sendToLLM('Test markdown', 'Test instructions')).rejects.toThrow('Server error');
    });

    test('throws error when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(sendToLLM('Test markdown', 'Test instructions')).rejects.toThrow(
        'Network error'
      );
    });

    test('handles empty instructions', async () => {
      const mockResponse = { markdown: 'Updated content', summary: 'AI summary' };
      mockFetch.mockResolvedValueOnce(mockSuccessResponse(mockResponse));

      await sendToLLM('Test markdown', '');

      expectApiCall({ markdown: 'Test markdown', instructions: '' });
    });

    test('handles response with missing fields', async () => {
      const mockResponse = {};
      mockFetch.mockResolvedValueOnce(mockSuccessResponse(mockResponse));

      const result = await sendToLLM('Test markdown', 'Test instructions');

      expect(result).toEqual({});
    });
  });
});
