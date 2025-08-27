import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import UserPanel from '../components/UserPanel';
import { AuthCtx } from '../hooks/useAuth';

const AuthContext = AuthCtx as any;

vi.mock('../lib/firebase', () => ({
  auth: { currentUser: null },
  db: {},
  functions: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  onSnapshot: vi.fn(),
}));

vi.mock('firebase/functions', () => ({
  httpsCallable: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  signOut: vi.fn(),
}));

describe('UserPanel', () => {
  const mockSetUserPanel = vi.fn();
  const user = userEvent.setup();

  const mockUser = {
    uid: 'test-user-id',
    displayName: 'Test User',
    email: 'test@example.com',
    photoURL: 'https://example.com/photo.jpg',
  };

  let mockAddDoc: any;
  let mockOnSnapshot: any;
  let mockHttpsCallable: any;
  let mockSignOut: any;
  let mockUnsubscribe: any;

  const renderWithAuth = (authValue: any) => {
    return render(
      <AuthContext.Provider value={authValue}>
        <UserPanel userPanel={true} setUserPanel={mockSetUserPanel} />
      </AuthContext.Provider>
    );
  };

  const createAuthValue = (overrides = {}) => ({
    user: mockUser,
    loading: false,
    subscribed: false,
    paymentEnabled: true,
    portalAccess: false,
    priceId: 'price_test123',
    ...overrides,
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    mockUnsubscribe = vi.fn();

    const firestoreModule = await import('firebase/firestore');
    mockAddDoc = vi.mocked(firestoreModule.addDoc);
    mockOnSnapshot = vi.mocked(firestoreModule.onSnapshot);

    const functionsModule = await import('firebase/functions');
    mockHttpsCallable = vi.mocked(functionsModule.httpsCallable);

    const authModule = await import('firebase/auth');
    mockSignOut = vi.mocked(authModule.signOut);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic rendering', () => {
    test('renders user panel when userPanel is true and user exists', () => {
      renderWithAuth(createAuthValue());

      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('Account Plan: Basic')).toBeInTheDocument();
      expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/photo.jpg');
    });

    test('does not render when userPanel is false', () => {
      render(
        <AuthContext.Provider value={createAuthValue()}>
          <UserPanel userPanel={false} setUserPanel={mockSetUserPanel} />
        </AuthContext.Provider>
      );

      expect(screen.queryByText('Test User')).not.toBeInTheDocument();
    });

    test('does not render when user is null', () => {
      renderWithAuth(createAuthValue({ user: null }));

      expect(screen.queryByText('Test User')).not.toBeInTheDocument();
    });

    test('shows loading state when loading is true', () => {
      renderWithAuth(createAuthValue({ loading: true }));

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('displays Pro plan when user is subscribed', () => {
      renderWithAuth(createAuthValue({ subscribed: true, portalAccess: true }));

      expect(screen.getByText('Account Plan: Pro')).toBeInTheDocument();
    });
  });

  describe('Close button functionality', () => {
    test('calls setUserPanel with false when close button is clicked', async () => {
      renderWithAuth(createAuthValue());

      const closeButton = screen.getByLabelText('Close user panel');
      await user.click(closeButton);

      expect(mockSetUserPanel).toHaveBeenCalledWith(false);
    });
  });

  describe('Subscription upgrade button', () => {
    test('shows "Upgrade to Pro" when payment enabled and not subscribed', () => {
      renderWithAuth(createAuthValue());

      expect(screen.getByText('Upgrade to Pro')).toBeInTheDocument();
    });

    test('shows "Payments disabled" when payment is disabled', () => {
      renderWithAuth(createAuthValue({ paymentEnabled: false }));

      expect(screen.getByText('Payments disabled')).toBeInTheDocument();
    });

    test('shows "Subscription active" when user is subscribed', () => {
      renderWithAuth(createAuthValue({ subscribed: true, portalAccess: true }));

      expect(screen.getByText('Subscription active')).toBeInTheDocument();
    });

    test('button is disabled when payment is disabled', () => {
      renderWithAuth(createAuthValue({ paymentEnabled: false }));

      const button = screen.getByText('Payments disabled');
      expect(button).toBeDisabled();
    });

    test('button is disabled when user is subscribed', () => {
      renderWithAuth(createAuthValue({ subscribed: true, portalAccess: true }));

      const button = screen.getByText('Subscription active');
      expect(button).toBeDisabled();
    });
  });

  describe('Billing portal button', () => {
    test('shows "Manage billing" when portal access is enabled', () => {
      renderWithAuth(createAuthValue({ subscribed: true, portalAccess: true }));

      expect(screen.getByText('Manage billing')).toBeInTheDocument();
    });

    test('shows "Billing portal disabled" when portal access is disabled', () => {
      renderWithAuth(createAuthValue());

      expect(screen.getByText('Billing portal disabled')).toBeInTheDocument();
    });

    test('button is disabled when portal access is disabled', () => {
      renderWithAuth(createAuthValue());

      const button = screen.getByText('Billing portal disabled');
      expect(button).toBeDisabled();
    });
  });

  describe('Payment system notice', () => {
    test('shows payment notice when payment is disabled', () => {
      renderWithAuth(createAuthValue({ paymentEnabled: false }));

      expect(screen.getByText(/A subscription model is set up/)).toBeInTheDocument();
      expect(
        screen.getByText(/This is a feature that is set up as protection/)
      ).toBeInTheDocument();
    });

    test('does not show payment notice when payment is enabled', () => {
      renderWithAuth(createAuthValue());

      expect(screen.queryByText(/A subscription model is set up/)).not.toBeInTheDocument();
    });
  });

  describe('Sign out functionality', () => {
    test('calls signOut when sign out button is clicked', async () => {
      renderWithAuth(createAuthValue());

      const signOutButton = screen.getByLabelText('Sign out of your account');
      await user.click(signOutButton);

      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe('Stripe checkout integration', () => {
    test('calls startCheckout when upgrade button is clicked', async () => {
      const mockSessionRef = { path: 'customers/test-user-id/checkout_sessions/session123' };
      mockAddDoc.mockResolvedValue(mockSessionRef);

      mockOnSnapshot.mockImplementation((docRef, callback) => {
        setTimeout(() => {
          callback({
            data: () => ({ url: 'https://checkout.stripe.com/test' }),
          });
        }, 100);
        return mockUnsubscribe;
      });

      renderWithAuth(createAuthValue());

      const upgradeButton = screen.getByText('Upgrade to Pro');
      await user.click(upgradeButton);

      expect(mockAddDoc).toHaveBeenCalled();
      expect(mockOnSnapshot).toHaveBeenCalled();
    });

    test('handles checkout error gracefully', async () => {
      const mockSessionRef = { path: 'customers/test-user-id/checkout_sessions/session123' };
      mockAddDoc.mockResolvedValue(mockSessionRef);

      mockOnSnapshot.mockImplementation((docRef, callback, errorCallback) => {
        setTimeout(() => {
          errorCallback(new Error('Checkout failed'));
        }, 100);
        return mockUnsubscribe;
      });

      renderWithAuth(createAuthValue());

      const upgradeButton = screen.getByText('Upgrade to Pro');
      await user.click(upgradeButton);

      await waitFor(() => {
        expect(mockOnSnapshot).toHaveBeenCalled();
      });
    });

    test('handles data.error in snapshot callback', async () => {
      const mockSessionRef = { path: 'customers/test-user-id/checkout_sessions/session123' };
      mockAddDoc.mockResolvedValue(mockSessionRef);

      mockOnSnapshot.mockImplementation((docRef, callback) => {
        setTimeout(() => {
          callback({
            data: () => ({ error: 'Payment failed' }),
          });
        }, 100);
        return mockUnsubscribe;
      });

      renderWithAuth(createAuthValue());

      const upgradeButton = screen.getByText('Upgrade to Pro');
      await user.click(upgradeButton);

      await waitFor(() => {
        expect(mockOnSnapshot).toHaveBeenCalled();
      });
    });

    test('does not start checkout when user is subscribed', async () => {
      renderWithAuth(createAuthValue({ subscribed: true, portalAccess: true }));

      const upgradeButton = screen.getByText('Subscription active');
      await user.click(upgradeButton);

      expect(mockAddDoc).not.toHaveBeenCalled();
    });
  });

  describe('Billing portal integration', () => {
    test('calls openBillingPortal when manage billing button is clicked', async () => {
      const mockPortalFunction = vi
        .fn()
        .mockResolvedValue({ data: { url: 'https://billing.stripe.com/test' } });
      mockHttpsCallable.mockReturnValue(mockPortalFunction);

      renderWithAuth(createAuthValue({ subscribed: true, portalAccess: true }));

      const billingButton = screen.getByText('Manage billing');
      await user.click(billingButton);

      expect(mockHttpsCallable).toHaveBeenCalledWith(
        expect.anything(),
        'ext-firestore-stripe-payments-createPortalLink'
      );
      expect(mockPortalFunction).toHaveBeenCalledWith({ returnUrl: expect.any(String) });
    });

    test('handles billing portal error gracefully', async () => {
      const mockPortalFunction = vi.fn().mockRejectedValue(new Error('Portal creation failed'));
      mockHttpsCallable.mockReturnValue(mockPortalFunction);

      renderWithAuth(createAuthValue({ subscribed: true, portalAccess: true }));

      const billingButton = screen.getByText('Manage billing');
      await user.click(billingButton);

      await waitFor(() => {
        expect(mockPortalFunction).toHaveBeenCalled();
      });
    });

    test('handles billing portal error with message property', async () => {
      const mockPortalFunction = vi.fn().mockRejectedValue({ message: 'Portal creation failed' });
      mockHttpsCallable.mockReturnValue(mockPortalFunction);

      renderWithAuth(createAuthValue({ subscribed: true, portalAccess: true }));

      const billingButton = screen.getByText('Manage billing');
      await user.click(billingButton);

      await waitFor(() => {
        expect(mockPortalFunction).toHaveBeenCalled();
      });
    });

    test('handles billing portal error without message property', async () => {
      const mockPortalFunction = vi.fn().mockRejectedValue('Portal creation failed');
      mockHttpsCallable.mockReturnValue(mockPortalFunction);

      renderWithAuth(createAuthValue({ subscribed: true, portalAccess: true }));

      const billingButton = screen.getByText('Manage billing');
      await user.click(billingButton);

      await waitFor(() => {
        expect(mockPortalFunction).toHaveBeenCalled();
      });
    });

    test('does not open portal when portal access is disabled', async () => {
      renderWithAuth(createAuthValue());

      const billingButton = screen.getByText('Billing portal disabled');
      await user.click(billingButton);

      expect(mockHttpsCallable).not.toHaveBeenCalled();
    });
  });
});
