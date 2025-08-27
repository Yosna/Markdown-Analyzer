import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ColorSchemes from '../components/ColorSchemes';

vi.mock('../hooks/useTheme', () => ({
  useTheme: vi.fn(),
}));

import { useTheme } from '../hooks/useTheme';
const mockUseTheme = vi.mocked(useTheme);

describe('ColorSchemes', () => {
  const mockSetTheme = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTheme.mockReturnValue(['light' as any, mockSetTheme]);
  });

  describe('Basic rendering', () => {
    test('renders theme selector button with current theme', () => {
      render(<ColorSchemes />);

      expect(screen.getByText('Theme')).toBeInTheDocument();
    });

    test('displays correct theme name with proper capitalization', () => {
      mockUseTheme.mockReturnValue(['dark' as any, mockSetTheme]);
      render(<ColorSchemes />);

      expect(screen.getByText('Dark')).toBeInTheDocument();
    });
  });

  describe('Dropdown functionality', () => {
    test('opens dropdown when button is clicked', () => {
      render(<ColorSchemes />);

      const button = screen.getByText('Theme').closest('button');
      expect(button).not.toBeNull();
      fireEvent.click(button!);

      const dropdownContainer = document.querySelector('.bg-secondary.border-default');
      expect(dropdownContainer).toBeInTheDocument();

      const lightElements = screen.getAllByText('Light');

      expect(lightElements).toHaveLength(2);
      expect(screen.getByText('Dark')).toBeInTheDocument();
      expect(screen.getByText('Midnight')).toBeInTheDocument();
      expect(screen.getByText('Glacier')).toBeInTheDocument();
    });

    test('closes dropdown when button is clicked again', () => {
      render(<ColorSchemes />);

      const button = screen.getByText('Theme').closest('button');
      expect(button).not.toBeNull();

      fireEvent.click(button!);
      expect(screen.getByText('Dark')).toBeInTheDocument();

      fireEvent.click(button!);
      expect(screen.queryByText('Dark')).not.toBeInTheDocument();
    });

    test('dropdown is not visible initially', () => {
      render(<ColorSchemes />);

      expect(screen.queryByText('Dark')).not.toBeInTheDocument();
      expect(screen.queryByText('Midnight')).not.toBeInTheDocument();
      expect(screen.queryByText('Glacier')).not.toBeInTheDocument();
    });
  });

  describe('Theme switching', () => {
    test('calls setTheme with light when light button is clicked', () => {
      render(<ColorSchemes />);

      const button = screen.getByText('Theme').closest('button');
      expect(button).not.toBeNull();
      fireEvent.click(button!);

      const lightTheme = screen.getAllByText('Light')[1];
      fireEvent.click(lightTheme);

      expect(mockSetTheme).toHaveBeenCalledWith('light');
    });

    test('calls setTheme with dark when dark button is clicked', () => {
      render(<ColorSchemes />);

      const button = screen.getByText('Theme').closest('button');
      expect(button).not.toBeNull();
      fireEvent.click(button!);

      const darkTheme = screen.getByText('Dark');
      fireEvent.click(darkTheme);

      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    test('closes dropdown after theme selection', async () => {
      render(<ColorSchemes />);

      const button = screen.getByText('Theme').closest('button');
      expect(button).not.toBeNull();
      fireEvent.click(button!);

      expect(screen.queryByText('Dark')).toBeInTheDocument();

      const lightTheme = screen.getAllByText('Light')[1];
      fireEvent.click(lightTheme);

      await waitFor(() => {
        expect(screen.queryByText('Light')).toBeInTheDocument();
        expect(screen.queryByText('Dark')).not.toBeInTheDocument();
      });
    });
  });
});
