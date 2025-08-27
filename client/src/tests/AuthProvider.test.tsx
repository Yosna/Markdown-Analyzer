import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import AuthProvider from '../components/AuthProvider';

vi.mock('../lib/firebase', () => ({
  auth: { currentUser: null },
  db: {},
  functions: {},
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  query: vi.fn(),
  where: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  onSnapshot: vi.fn(),
}));

vi.mock('../utils/useAuth', () => ({
  AuthCtx: {
    Provider: ({ children }: any) => <div data-testid="auth-provider">{children}</div>,
  },
}));

describe('AuthProvider', () => {
  const mockUser = {
    uid: 'test-user-id',
    displayName: 'Test User',
    email: 'test@example.com',
    photoURL: 'https://example.com/photo.jpg',
  };

  const mockUnsubscribe = vi.fn();
  let mockOnAuthStateChanged: any;
  let mockQuery: any;
  let mockWhere: any;
  let mockCollection: any;
  let mockDoc: any;
  let mockOnSnapshot: any;

  const renderAuthProvider = (children = <div>Test</div>) => {
    return render(<AuthProvider>{children}</AuthProvider>);
  };

  const simulateAuthState = async (user: any) => {
    let authCallback: any;
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      authCallback = callback;
      return mockUnsubscribe;
    });

    renderAuthProvider();

    await act(async () => {
      authCallback(user);
    });

    return authCallback;
  };

  const simulateFirestoreCallback = (callbackType: 'subscription' | 'payment', data: any) => {
    let callback: any;
    mockOnSnapshot.mockImplementation((ref, cb) => {
      if (callbackType === 'subscription' && ref === mockQuery()) {
        callback = cb;
      } else if (callbackType === 'payment' && ref === mockDoc()) {
        callback = cb;
      }
      return mockUnsubscribe;
    });

    renderAuthProvider();

    return async () => {
      await act(async () => {
        callback(data);
      });
    };
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const authModule = await import('firebase/auth');
    const firestoreModule = await import('firebase/firestore');

    mockOnAuthStateChanged = vi.mocked(authModule.onAuthStateChanged);
    mockQuery = vi.mocked(firestoreModule.query);
    mockWhere = vi.mocked(firestoreModule.where);
    mockCollection = vi.mocked(firestoreModule.collection);
    mockDoc = vi.mocked(firestoreModule.doc);
    mockOnSnapshot = vi.mocked(firestoreModule.onSnapshot);

    // Setup default mock implementations
    [mockOnAuthStateChanged, mockQuery, mockWhere, mockCollection, mockDoc, mockOnSnapshot].forEach(
      (mock) => {
        mock.mockReturnValue(mockUnsubscribe);
      }
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders children and sets up listeners on mount', () => {
    renderAuthProvider(<div data-testid="test-child">Test Child</div>);

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(mockOnAuthStateChanged).toHaveBeenCalledWith(expect.anything(), expect.any(Function));
    expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'config', 'payments');
    expect(mockOnSnapshot).toHaveBeenCalled();
  });

  test('sets up subscription listener when user is authenticated', async () => {
    await simulateAuthState(mockUser);

    await waitFor(() => {
      expect(mockCollection).toHaveBeenCalledWith(
        expect.anything(),
        'customers',
        mockUser.uid,
        'subscriptions'
      );
      expect(mockWhere).toHaveBeenCalledWith('status', 'in', ['trialing', 'active']);
      expect(mockQuery).toHaveBeenCalled();
      expect(mockOnSnapshot).toHaveBeenCalled();
    });
  });

  test('does not set up subscription listener when user is null', async () => {
    await simulateAuthState(null);

    expect(mockCollection).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      'subscriptions'
    );
  });

  test('handles subscription data updates', async () => {
    const triggerSubscriptionUpdate = simulateFirestoreCallback('subscription', {
      empty: false,
      data: () => ({ status: 'active' }),
    });

    await simulateAuthState(mockUser);
    await triggerSubscriptionUpdate();
  });

  test('handles empty subscription data', async () => {
    const triggerSubscriptionUpdate = simulateFirestoreCallback('subscription', {
      empty: true,
    });

    await simulateAuthState(mockUser);
    await triggerSubscriptionUpdate();
  });

  test('handles payment configuration updates', async () => {
    const triggerPaymentUpdate = simulateFirestoreCallback('payment', {
      data: () => ({ enabled: false, priceId: null }),
    });

    await triggerPaymentUpdate();
  });

  test('cleans up listeners on unmount', () => {
    const { unmount } = renderAuthProvider();
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
