import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import UserAuth from '../components/UserAuth';
import { AuthCtx } from '../hooks/useAuth';

const AuthContext = AuthCtx as any;

vi.mock('../lib/firebase', () => ({
  auth: {
    currentUser: null,
  },
}));

vi.mock('firebase/auth', () => {
  const mockSignInWithPopup = vi.fn();
  const mockSignOut = vi.fn();
  const mockOnAuthStateChanged = vi.fn();

  return {
    GoogleAuthProvider: vi.fn().mockImplementation(() => ({
      setCustomParameters: vi.fn(),
    })),
    GithubAuthProvider: vi.fn().mockImplementation(() => ({
      addScope: vi.fn(),
      setCustomParameters: vi.fn(),
    })),
    signInWithPopup: mockSignInWithPopup,
    signOut: mockSignOut,
    onAuthStateChanged: mockOnAuthStateChanged,
  };
});

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../utils/linkCredentials', () => ({
  default: vi.fn(),
}));

let mockSignInWithPopup: any;
let mockSignOut: any;
let mockOnAuthStateChanged: any;
let mockLinkCredentials: any;

describe('UserAuth', () => {
  const user = userEvent.setup();

  const renderWithAuth = (component, authValue: any = { user: null, loading: false }) => {
    return render(<AuthContext.Provider value={authValue}>{component}</AuthContext.Provider>);
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const authModule = await import('firebase/auth');
    mockSignInWithPopup = vi.mocked(authModule.signInWithPopup);
    mockSignOut = vi.mocked(authModule.signOut);
    mockOnAuthStateChanged = vi.mocked(authModule.onAuthStateChanged);

    const linkCredentialsModule = await import('../utils/linkCredentials');
    mockLinkCredentials = vi.mocked(linkCredentialsModule.default);

    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null);
      return vi.fn();
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Signed out state', () => {
    test('renders sign in button when user is not authenticated', () => {
      renderWithAuth(<UserAuth setUserPanel={() => {}} />, { user: null, loading: false });

      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.queryByText(/sign out/i)).not.toBeInTheDocument();
    });

    test('opens dropdown when sign in button is clicked', async () => {
      renderWithAuth(<UserAuth setUserPanel={() => {}} />, { user: null, loading: false });

      const signInButton = screen.getByRole('button', { name: /sign in options/i });
      await user.click(signInButton);

      expect(screen.getByText('Sign In with Google')).toBeInTheDocument();
      expect(screen.getByText('Sign In with GitHub')).toBeInTheDocument();
    });

    test('closes dropdown when sign in button is clicked again', async () => {
      render(<UserAuth setUserPanel={() => {}} />);

      const signInButton = screen.getByRole('button', { name: /sign in options/i });
      await user.click(signInButton);
      expect(screen.getByText('Sign In with Google')).toBeInTheDocument();

      await user.click(signInButton);
      expect(screen.queryByText('Sign In with Google')).not.toBeInTheDocument();
    });

    test('shows loading state when signing in', async () => {
      mockSignInWithPopup.mockImplementation(() => new Promise(() => {}));

      render(<UserAuth setUserPanel={() => {}} />);

      const signInButton = screen.getByRole('button', { name: /sign in options/i });
      await user.click(signInButton);

      const googleButton = screen.getByRole('button', { name: /sign in with google/i });
      await user.click(googleButton);

      expect(screen.getByText('Signing in...')).toBeInTheDocument();
    });
  });

  describe('Signed in state', () => {
    const mockUser = {
      displayName: 'Test User',
      photoURL: 'https://example.com/photo.jpg',
    };

    beforeEach(() => {
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        callback(mockUser);
        return vi.fn();
      });
    });

    test('sign in button is not shown when authenticated', async () => {
      renderWithAuth(<UserAuth setUserPanel={() => {}} />, { user: mockUser, loading: false });

      expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument();
    });
  });

  describe('Authentication flow', () => {
    test.each([
      ['Google', 'google'],
      ['GitHub', 'github'],
    ])('handles successful %s sign in', async (_, provider) => {
      mockSignInWithPopup.mockResolvedValue({ user: { displayName: 'Test User' } });

      render(<UserAuth setUserPanel={() => {}} />);

      const signInButton = screen.getByRole('button', { name: /sign in options/i });
      await user.click(signInButton);

      const providerButton = screen.getByRole('button', {
        name: new RegExp(`sign in with ${provider}`, 'i'),
      });
      await user.click(providerButton);

      expect(mockSignInWithPopup).toHaveBeenCalled();
    });

    test('handles popup closed error', async () => {
      const mockError = { code: 'auth/popup-closed-by-user' };
      mockSignInWithPopup.mockRejectedValue(mockError);

      render(<UserAuth setUserPanel={() => {}} />);

      const signInButton = screen.getByRole('button', { name: /sign in options/i });
      await user.click(signInButton);

      const googleButton = screen.getByRole('button', { name: /sign in with google/i });
      await user.click(googleButton);

      expect(mockSignInWithPopup).toHaveBeenCalled();
    });

    test('handles popup blocked error', async () => {
      const mockError = { code: 'auth/popup-blocked' };
      mockSignInWithPopup.mockRejectedValue(mockError);

      render(<UserAuth setUserPanel={() => {}} />);

      const signInButton = screen.getByRole('button', { name: /sign in options/i });
      await user.click(signInButton);

      const googleButton = screen.getByRole('button', { name: /sign in with google/i });
      await user.click(googleButton);

      expect(mockSignInWithPopup).toHaveBeenCalled();
    });
  });

  describe('Account linking modal', () => {
    beforeEach(async () => {
      const { GithubAuthProvider } = await import('firebase/auth');
      (GithubAuthProvider as any).credentialFromError = vi.fn().mockReturnValue({
        providerId: 'github.com',
      });
    });

    test('shows account linking modal when existing account error occurs', async () => {
      const mockError = {
        code: 'auth/account-exists-with-different-credential',
        customData: { email: 'test@example.com' },
      };

      mockSignInWithPopup.mockRejectedValue(mockError);

      render(<UserAuth setUserPanel={() => {}} />);

      const signInButton = screen.getByRole('button', { name: /sign in options/i });
      await user.click(signInButton);

      const githubButton = screen.getByRole('button', { name: /sign in with github/i });
      await user.click(githubButton);

      await waitFor(() => {
        expect(screen.getByText('Existing User Found')).toBeInTheDocument();
      });
    });

    test('closes account linking modal when close button is clicked', async () => {
      const mockError = {
        code: 'auth/account-exists-with-different-credential',
        customData: { email: 'test@example.com' },
      };

      mockSignInWithPopup.mockRejectedValue(mockError);

      render(<UserAuth setUserPanel={() => {}} />);

      const signInButton = screen.getByRole('button', { name: /sign in options/i });
      await user.click(signInButton);

      const githubButton = screen.getByRole('button', { name: /sign in with github/i });
      await user.click(githubButton);

      await waitFor(() => {
        expect(screen.getByText('Existing User Found')).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: /close modal/i });
      await user.click(closeButton);

      expect(screen.queryByText('Existing User Found')).not.toBeInTheDocument();
    });

    test('links credentials when signing in with Google after account exists error', async () => {
      const mockError = {
        code: 'auth/account-exists-with-different-credential',
        customData: { email: 'test@example.com' },
      };

      const mockCredential = {
        providerId: 'github.com',
      };

      const { GithubAuthProvider } = await import('firebase/auth');
      (GithubAuthProvider as any).credentialFromError = vi.fn().mockReturnValue(mockCredential);

      mockSignInWithPopup.mockRejectedValueOnce(mockError);

      render(<UserAuth setUserPanel={() => {}} />);

      const signInButton = screen.getByRole('button', { name: /sign in options/i });
      await user.click(signInButton);

      const githubButton = screen.getByRole('button', { name: /sign in with github/i });
      await user.click(githubButton);

      await waitFor(() => {
        expect(screen.getByText('Existing User Found')).toBeInTheDocument();
      });

      mockSignInWithPopup.mockResolvedValueOnce({ user: { displayName: 'Test User' } });

      const googleButtonInModal = screen.getByRole('button', { name: /sign in with google/i });
      await user.click(googleButtonInModal);

      await waitFor(() => {
        expect(mockLinkCredentials).toHaveBeenCalled();
      });
    });
  });

  describe('Error handling', () => {
    test.each([
      ['email already in use', 'auth/email-already-in-use'],
      ['default error', 'auth/unknown-error'],
    ])('handles %s error', async (_, errorCode) => {
      const mockError = { code: errorCode };
      mockSignInWithPopup.mockRejectedValue(mockError);

      render(<UserAuth setUserPanel={() => {}} />);

      const signInButton = screen.getByRole('button', { name: /sign in options/i });
      await user.click(signInButton);

      const googleButton = screen.getByRole('button', { name: /sign in with google/i });
      await user.click(googleButton);

      expect(mockSignInWithPopup).toHaveBeenCalled();
    });
  });
});
