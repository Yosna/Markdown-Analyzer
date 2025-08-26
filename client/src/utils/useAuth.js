import { createContext, useContext } from 'react';

/**
 * Authentication context for managing user state and subscription data.
 *
 * @typedef {Object} AuthContext
 * @property {Object|null} user - Firebase user object or null if not authenticated
 * @property {boolean} loading - Whether authentication state is being determined
 * @property {boolean} subscribed - Whether user has an active subscription
 * @property {boolean} paymentEnabled - Whether payment system is enabled
 * @property {boolean} portalAccess - Whether user can access billing portal
 * @property {string|null} priceId - Stripe price ID for subscription
 */

/**
 * Default authentication context value.
 *
 * @type {AuthContext}
 */
const AuthCtx = createContext({
  user: null,
  loading: true,
  subscribed: false,
  paymentEnabled: false,
  portalAccess: false,
  priceId: null,
});

/**
 * Custom hook to access authentication context.
 *
 * Provides access to user authentication state, subscription status,
 * and payment system configuration throughout the application.
 *
 * @returns {AuthContext} Authentication context object
 * @throws {Error} When used outside of AuthProvider
 */
const useAuth = () => useContext(AuthCtx);

export { useAuth, AuthCtx };
