import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import ControlPanel from '../components/ControlPanel.jsx';

// Mock the utility functions for this test file
vi.mock('../utils/captureImage', () => ({
  captureMarkdownPreview: vi.fn() as any,
}));

vi.mock('../utils/api', () => ({
  sendToLLM: vi.fn() as any,
}));

vi.mock('../utils/fileUtils', () => ({
  readFileAsText: vi.fn() as any,
}));

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ControlPanel', () => {
  const mockSetMarkdown = vi.fn();
  const mockSetMarkdownInput = vi.fn();
  const mockSetSummary = vi.fn();
  const mockPreviewRef = { current: document.createElement('div') };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderControlPanel = () => {
    return render(
      <ControlPanel
        markdown="# Test"
        setMarkdown={mockSetMarkdown}
        setMarkdownInput={mockSetMarkdownInput}
        setSummary={mockSetSummary}
        previewRef={mockPreviewRef}
      />
    );
  };

  describe('basic rendering', () => {
    test('renders control panel with all elements', () => {
      renderControlPanel();

      screen.debug();

      expect(screen.getByPlaceholderText('Enter instructions for the AI...')).toBeInTheDocument();
      expect(screen.getByText('Upload File')).toBeInTheDocument();
      expect(screen.getByText('Send Request')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    test('allows typing in instructions field', async () => {
      const user = userEvent.setup();
      renderControlPanel();

      const input = screen.getByPlaceholderText('Enter instructions for the AI...');
      await user.type(input, 'Test instructions');

      expect(input).toHaveValue('Test instructions');
    });

    test('handles file selection successfully', async () => {
      const user = userEvent.setup();
      const { readFileAsText } = await import('../utils/fileUtils');

      (readFileAsText as any).mockResolvedValue('# File content');

      const file = new File(['# File content'], 'test.md', { type: 'text/markdown' });

      renderControlPanel();

      const fileInput = screen.getByLabelText('Upload File');
      await user.upload(fileInput, file);

      expect(readFileAsText).toHaveBeenCalledWith(file);
      expect(mockSetMarkdown).toHaveBeenCalledWith('# File content');
    });

    test('sends request to LLM successfully', async () => {
      const user = userEvent.setup();
      const { captureMarkdownPreview } = await import('../utils/captureImage');
      const { sendToLLM } = await import('../utils/api');
      const { toast } = await import('react-toastify');

      (captureMarkdownPreview as any).mockResolvedValue('data:image/jpeg;base64,test');
      (sendToLLM as any).mockResolvedValue({ markdown: '# Updated', summary: 'New summary' });

      renderControlPanel();

      const input = screen.getByPlaceholderText('Enter instructions for the AI...');
      const button = screen.getByText('Send Request');

      await user.type(input, 'Test instructions');
      await user.type(input, '{enter}');

      await waitFor(() => {
        expect(sendToLLM).toHaveBeenCalledWith(
          '# Test',
          'Test instructions',
          'data:image/jpeg;base64,test'
        );
        expect(mockSetMarkdown).toHaveBeenCalledWith('# Updated');
        expect(mockSetSummary).toHaveBeenCalledWith('New summary');
        expect(toast.success).toHaveBeenCalledWith('LLM request completed.');
      });
    });

    test('handles empty LLM response', async () => {
      const user = userEvent.setup();
      const { captureMarkdownPreview } = await import('../utils/captureImage');
      const { sendToLLM } = await import('../utils/api');
      const { toast } = await import('react-toastify');

      (captureMarkdownPreview as any).mockResolvedValue('data:image/jpeg;base64,test');
      (sendToLLM as any).mockResolvedValue({});

      renderControlPanel();

      const input = screen.getByPlaceholderText('Enter instructions for the AI...');
      const button = screen.getByText('Send Request');

      await user.type(input, 'Test instructions');
      await user.click(button);
    });
  });

  describe('error handling', () => {
    test('handles file read error', async () => {
      const user = userEvent.setup();
      const { readFileAsText } = await import('../utils/fileUtils');
      const { toast } = await import('react-toastify');

      (readFileAsText as any).mockRejectedValue(new Error('File read failed'));

      const file = new File(['# File content'], 'test.md', { type: 'text/markdown' });

      renderControlPanel();

      const fileInput = screen.getByLabelText('Upload File');
      await user.upload(fileInput, file);

      expect(toast.error).toHaveBeenCalledWith('Failed to read file');
    });

    test('handles LLM request failure', async () => {
      const user = userEvent.setup();
      const { captureMarkdownPreview } = await import('../utils/captureImage');
      const { sendToLLM } = await import('../utils/api');
      const { toast } = await import('react-toastify');

      (captureMarkdownPreview as any).mockResolvedValue('data:image/jpeg;base64,test');
      (sendToLLM as any).mockRejectedValue(new Error('API failed'));

      renderControlPanel();

      const input = screen.getByPlaceholderText('Enter instructions for the AI...');
      const button = screen.getByText('Send Request');

      await user.type(input, 'Test instructions');
      await user.click(button);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('LLM request failed. Please try again.');
      });
    });
  });
});
