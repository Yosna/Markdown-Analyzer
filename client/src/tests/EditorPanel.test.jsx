import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import EditorPanel from '../components/EditorPanel.jsx';

describe('EditorPanel', () => {
  describe('basic rendering', () => {
    test('renders editor panel with tabs', () => {
      const mockSetMarkdown = vi.fn();
      render(<EditorPanel markdown="# Test" setMarkdown={mockSetMarkdown} />);

      expect(screen.getByText('Markdown')).toBeInTheDocument();
      expect(screen.getByRole('tab')).toBeInTheDocument();
    });

    test('renders with empty markdown content', () => {
      const mockSetMarkdown = vi.fn();
      render(<EditorPanel markdown="" setMarkdown={mockSetMarkdown} />);

      expect(screen.getByText('Markdown')).toBeInTheDocument();
      expect(screen.getByRole('tab')).toBeInTheDocument();
    });

    test('renders with complex markdown content', () => {
      const mockSetMarkdown = vi.fn();
      const complexMarkdown = `# Header
        **Bold text**
        - List item 1
        - List item 2

        \`\`\`javascript
        console.log("Hello world");
        \`\`\``;

      render(<EditorPanel markdown={complexMarkdown} setMarkdown={mockSetMarkdown} />);

      expect(screen.getByText('Markdown')).toBeInTheDocument();
      expect(screen.getByRole('tab')).toBeInTheDocument();
    });
  });

  describe('tab structure', () => {
    test('has correct tab list structure', () => {
      const mockSetMarkdown = vi.fn();
      const { container } = render(<EditorPanel markdown="# Test" setMarkdown={mockSetMarkdown} />);

      const tabList = container.querySelector('.text-heading');

      expect(tabList).toBeInTheDocument();
      expect(tabList).toHaveClass('text-heading');
      expect(tabList).toHaveClass('flex-shrink-0');
      expect(tabList).toHaveClass('text-base');
      expect(tabList).toHaveClass('font-bold');
    });

    test('has correct tab panel structure', () => {
      const mockSetMarkdown = vi.fn();
      const { container } = render(<EditorPanel markdown="# Test" setMarkdown={mockSetMarkdown} />);

      const tabsContainer = container.querySelector('.input-tabs');

      expect(tabsContainer).toBeInTheDocument();
    });
  });

  describe('styling and layout', () => {
    test('container has correct styling', () => {
      const mockSetMarkdown = vi.fn();
      const { container } = render(<EditorPanel markdown="# Test" setMarkdown={mockSetMarkdown} />);

      const panelContainer = container.firstChild;

      expect(panelContainer).toHaveClass('bg-primary');
      expect(panelContainer).toHaveClass('flex');
      expect(panelContainer).toHaveClass('w-1/2');
      expect(panelContainer).toHaveClass('flex-col');
      expect(panelContainer).toHaveClass('rounded');
    });

    test('tab list has correct styling', () => {
      const mockSetMarkdown = vi.fn();
      const { container } = render(<EditorPanel markdown="# Test" setMarkdown={mockSetMarkdown} />);

      const tabList = container.querySelector('.input-tabs').children;
      const markdownTab = tabList[0];

      expect(markdownTab).toHaveClass('text-heading');
      expect(markdownTab).toHaveClass('flex-shrink-0');
      expect(markdownTab).toHaveClass('text-base');
      expect(markdownTab).toHaveClass('font-bold');
    });
  });

  describe('props handling', () => {
    test('passes markdown content to CodeEditor', () => {
      const mockSetMarkdown = vi.fn();
      const testMarkdown = '# Test Header\n\nThis is test content.';

      render(<EditorPanel markdown={testMarkdown} setMarkdown={mockSetMarkdown} />);

      expect(screen.getByText('Test Header')).toBeInTheDocument();
      expect(screen.getByText('This is test content.')).toBeInTheDocument();
    });

    test('passes setMarkdown function to CodeEditor', () => {
      const mockSetMarkdown = vi.fn();
      render(<EditorPanel markdown="# Test" setMarkdown={mockSetMarkdown} />);

      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  describe('component integration', () => {
    test('renders CodeEditor component', () => {
      const mockSetMarkdown = vi.fn();
      const { container } = render(<EditorPanel markdown="# Test" setMarkdown={mockSetMarkdown} />);

      const codeMirror = container.querySelector('[class*=cm-theme-]');

      expect(codeMirror).toBeInTheDocument();
    });

    test('CodeEditor receives correct props', () => {
      const mockSetMarkdown = vi.fn();
      const testMarkdown = '**Bold text**';

      render(<EditorPanel markdown={testMarkdown} setMarkdown={mockSetMarkdown} />);

      expect(screen.getByText('Bold text')).toBeInTheDocument();
    });
  });
});
