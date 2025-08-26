import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import DiffViewer from '../components/DiffViewer.jsx';

describe('DiffViewer', () => {
  describe('basic rendering', () => {
    test('renders diff content correctly', () => {
      const oldContent = 'Old'.concat('\n', 'Content');
      const newContent = 'New'.concat('\n', 'Content');

      render(<DiffViewer oldContent={oldContent} newContent={newContent} />);

      expect(screen.getByText('- Old')).toBeInTheDocument();
      expect(screen.getByText('+ New')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    test('renders with empty content', () => {
      const { container } = render(<DiffViewer oldContent="" newContent="" />);

      expect(container).toBeInTheDocument();
      expect(
        screen.getByText(
          'Side-by-side comparison showing additions in green, deletions in red, and unchanged lines in gray'
        )
      ).toBeInTheDocument();
    });

    test('renders with identical content', () => {
      render(<DiffViewer oldContent="Content" newContent="Content" />);

      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('diff visualization', () => {
    test('shows additions with green styling', () => {
      render(<DiffViewer oldContent="" newContent="Added" />);

      const diff = screen.getByText('+ Added');

      expect(diff).toHaveClass('border-green-500');
      expect(diff).toHaveClass('bg-green-900/80');
      expect(diff).toHaveClass('text-green-200');
    });

    test('shows deletions with red styling', () => {
      render(<DiffViewer oldContent="Removed" newContent="" />);

      const diff = screen.getByText('- Removed');

      expect(diff).toHaveClass('border-red-500');
      expect(diff).toHaveClass('bg-red-900/80');
      expect(diff).toHaveClass('text-red-200');
    });

    test('shows unchanged content with neutral styling', () => {
      render(<DiffViewer oldContent="Unchanged" newContent="Unchanged" />);

      const diff = screen.getByText('Unchanged');

      expect(diff).toHaveClass('text-gray-300');
    });
  });

  describe('diff lines', () => {
    test('diff lines are indexed correctly', () => {
      const oldContent = 'Old'.concat('\n', 'Content');
      const newContent = 'New'.concat('\n', 'Content');

      const { container } = render(<DiffViewer oldContent={oldContent} newContent={newContent} />);

      const diffViewer = container.children[0];
      const rows = Array.from(diffViewer.children);
      const diffRows = rows.slice(1);
      const oldLine = diffRows.slice(0, 3);
      const newLine = diffRows.slice(3, 6);
      const unchangedLine = diffRows.slice(6, 9);

      expect(oldLine[0]).toHaveTextContent('1');
      expect(oldLine[1]).toHaveTextContent('');
      expect(newLine[0]).toHaveTextContent('');
      expect(newLine[1]).toHaveTextContent('1');
      expect(unchangedLine[0]).toHaveTextContent('2');
      expect(unchangedLine[1]).toHaveTextContent('2');
    });

    test('diff lines show indicators correctly', () => {
      const oldContent = 'Old'.concat('\n', 'Content');
      const newContent = 'New'.concat('\n', 'Content');

      render(<DiffViewer oldContent={oldContent} newContent={newContent} />);

      expect(screen.getByText('- Old')).toBeInTheDocument();
      expect(screen.getByText('+ New')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('diff layout and styling', () => {
    test('diff has correct grid layout and styling', () => {
      const { container } = render(<DiffViewer oldContent="Test" newContent="Test" />);

      const diffViewer = container.children[0];

      expect(diffViewer).toHaveClass('grid');
      expect(diffViewer).toHaveClass('grid-cols-[auto_auto_1fr]');
      expect(diffViewer).toHaveClass('overflow-y-auto');
      expect(diffViewer).toHaveClass('font-mono');
      expect(diffViewer).toHaveClass('text-sm');
    });
  });

  describe('text normalization', () => {
    test('handles different line endings consistently', () => {
      const oldContent = 'Old'.concat('\r\n', 'Content');
      const newContent = 'New'.concat('\n', 'Content');

      render(<DiffViewer oldContent={oldContent} newContent={newContent} />);

      expect(screen.getByText('- Old')).toBeInTheDocument();
      expect(screen.getByText('+ New')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    test('handles single line content', () => {
      render(<DiffViewer oldContent="Single line" newContent="Single line" />);

      expect(screen.getByText('Single line')).toBeInTheDocument();
    });
  });
});
