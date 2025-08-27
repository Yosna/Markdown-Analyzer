import { useState, useEffect } from 'react';
import { query, where, collection, onSnapshot, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { AuthCtx } from '../hooks/useAuth';

/**
 * Authentication provider component that manages user state and subscription data.
 *
 * Provides authentication context to the entire application, including:
 * - User authentication state management
 * - Real-time subscription status monitoring
 * - Payment system configuration
 * - Billing portal access control
 *
 * Features:
 * - Firebase Auth state synchronization
 * - Stripe subscription status tracking
 * - Payment system enable/disable support
 * - Real-time Firestore listeners
 * - Automatic portal access calculation
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap with auth context
 * @returns {JSX.Element} AuthProvider wrapper component
 */
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [paymentEnabled, setPaymentEnabled] = useState(false);
  const [portalAccess, setPortalAccess] = useState(false);
  const [priceId, setPriceId] = useState(null);

  // Monitor Firebase Auth state changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (!user) setSubscribed(false);
    });
    return () => unsub();
  }, []);

  // Monitor user subscription status in real-time
  useEffect(() => {
    if (!user) return;

    // Query for active or trialing subscriptions
    const q = query(
      collection(db, 'customers', user.uid, 'subscriptions'),
      where('status', 'in', ['trialing', 'active'])
    );

    const stop = onSnapshot(q, (snap) => setSubscribed(!snap.empty));
    return () => stop();
  }, [user]);

  // Monitor payment system configuration
  useEffect(() => {
    const ref = doc(db, 'config', 'payments');

    const stop = onSnapshot(ref, (snap) => {
      const enabled = Boolean(snap.data()?.enabled);
      const priceId = snap.data()?.priceId;

      setPaymentEnabled(enabled);
      setPriceId(priceId);
    });
    return () => stop();
  }, []);

  // Calculate billing portal access based on payment status and subscription
  useEffect(() => {
    setPortalAccess(paymentEnabled || subscribed);
  }, [paymentEnabled, subscribed]);

  return (
    <AuthCtx.Provider value={{ user, loading, subscribed, paymentEnabled, portalAccess, priceId }}>
      {children}
    </AuthCtx.Provider>
  );
};

export default AuthProvider;
