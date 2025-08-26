import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import OutputPanel from '../components/OutputPanel.jsx';

describe('OutputPanel', () => {
  test('renders all three tabs', () => {
    const mockPreviewRef = { current: null };
    render(
      <OutputPanel
        markdown="# Test"
        markdownInput="# Original"
        summary="Test summary"
        previewRef={mockPreviewRef}
      />
    );

    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('Diff')).toBeInTheDocument();
    expect(screen.getByText('Summary')).toBeInTheDocument();
  });

  test('has correct container styling', () => {
    const mockPreviewRef = { current: null };
    const { container } = render(
      <OutputPanel
        markdown="# Test"
        markdownInput="# Original"
        summary="Test summary"
        previewRef={mockPreviewRef}
      />
    );

    const panelContainer = container.firstChild;

    expect(panelContainer).toHaveClass('bg-primary');
    expect(panelContainer).toHaveClass('flex');
    expect(panelContainer).toHaveClass('h-full');
    expect(panelContainer).toHaveClass('w-1/2');
    expect(panelContainer).toHaveClass('flex-col');
    expect(panelContainer).toHaveClass('rounded');
  });

  test('passes props correctly to child components', () => {
    const mockPreviewRef = { current: document.createElement('div') };
    const testMarkdown = '# Test Header';
    const testInput = '# Original Input';
    const testSummary = '# AI Summary';

    render(
      <OutputPanel
        markdown={testMarkdown}
        markdownInput={testInput}
        summary={testSummary}
        previewRef={mockPreviewRef}
      />
    );

    expect(screen.getByText('Test Header')).toBeInTheDocument();
    expect(screen.getByText('- # Original Input')).toBeInTheDocument();
    expect(screen.getByText('AI Summary')).toBeInTheDocument();
  });

  test('handles empty content gracefully', () => {
    const mockPreviewRef = { current: null };
    render(<OutputPanel markdown="" markdownInput="" summary="" previewRef={mockPreviewRef} />);

    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('Diff')).toBeInTheDocument();
    expect(screen.getByText('Summary')).toBeInTheDocument();
  });
});
