import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import UserCard from '../components/UserCard';
import { AuthCtx } from '../hooks/useAuth';

const AuthContext = AuthCtx as any;

describe('UserCard', () => {
  const mockSetUserPanel = vi.fn();
  const user = userEvent.setup();

  const mockUser = {
    uid: 'test-user-id',
    displayName: 'Test User',
    email: 'test@example.com',
    photoURL: 'https://example.com/photo.jpg',
  };

  const renderWithAuth = (authValue: any) => {
    return render(
      <AuthContext.Provider value={authValue}>
        <UserCard userPanel={false} setUserPanel={mockSetUserPanel} />
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders user information when user is authenticated', () => {
    renderWithAuth({ user: mockUser, subscribed: false });

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByAltText('Test User')).toBeInTheDocument();
    expect(screen.getByAltText('Test User')).toHaveAttribute(
      'src',
      'https://example.com/photo.jpg'
    );
  });

  test('displays Basic plan when user is not subscribed', () => {
    renderWithAuth({ user: mockUser, subscribed: false });

    expect(screen.getByText(/Basic/)).toBeInTheDocument();
    expect(screen.getByText(/Plan/)).toBeInTheDocument();
    expect(screen.queryByText(/Pro/)).not.toBeInTheDocument();
  });

  test('displays Pro plan when user is subscribed', () => {
    renderWithAuth({ user: mockUser, subscribed: true });

    expect(screen.getByText(/Pro/)).toBeInTheDocument();
    expect(screen.getByText(/Plan/)).toBeInTheDocument();
    expect(screen.queryByText(/Basic/)).not.toBeInTheDocument();
  });

  test('calls setUserPanel with toggled value when clicked', async () => {
    renderWithAuth({ user: mockUser, subscribed: false });

    const userCard = screen.getByRole('button');
    await user.click(userCard);

    expect(mockSetUserPanel).toHaveBeenCalledWith(true);
  });

  test('toggles userPanel state correctly', async () => {
    // Test with userPanel = false
    const { rerender } = renderWithAuth({ user: mockUser, subscribed: false });

    const userCard = screen.getByRole('button');
    await user.click(userCard);
    expect(mockSetUserPanel).toHaveBeenCalledWith(true);

    // Test with userPanel = true
    rerender(
      <AuthContext.Provider value={{ user: mockUser, subscribed: false }}>
        <UserCard userPanel={true} setUserPanel={mockSetUserPanel} />
      </AuthContext.Provider>
    );

    await user.click(userCard);
    expect(mockSetUserPanel).toHaveBeenCalledWith(false);
  });

  test('does not render when user is null', () => {
    renderWithAuth({ user: null, subscribed: false });

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText('Test User')).not.toBeInTheDocument();
  });

  test('does not render when user is undefined', () => {
    renderWithAuth({ user: undefined, subscribed: false });

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText('Test User')).not.toBeInTheDocument();
  });

  test('handles user with missing photoURL gracefully', () => {
    const userWithoutPhoto = { ...mockUser, photoURL: null };
    renderWithAuth({ user: userWithoutPhoto, subscribed: false });

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByAltText('Test User')).toBeInTheDocument();
  });

  test('handles user with missing displayName gracefully', () => {
    const userWithoutName = { ...mockUser, displayName: null };
    renderWithAuth({ user: userWithoutName, subscribed: false });

    const img = screen.getByRole('img');
    expect(img).not.toHaveAttribute('alt');
    expect(screen.queryByText('Test User')).not.toBeInTheDocument();
  });
});
