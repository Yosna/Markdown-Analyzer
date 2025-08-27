import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db, functions, auth } from '../lib/firebase';
import { collection, doc, addDoc, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { signOut } from 'firebase/auth';

/**
 * UserPanel component for managing user account, subscription, and billing.
 *
 * Provides a comprehensive user interface for account management including:
 * - User profile display (avatar, name, email, plan status)
 * - Subscription upgrade functionality with Stripe integration
 * - Billing portal access for existing subscribers
 * - Account sign-out functionality
 * - Payment system status indicators
 *
 * Features:
 * - Real-time subscription status monitoring
 * - Stripe checkout session creation
 * - Billing portal integration
 * - Payment system enable/disable support
 * - Error handling and loading states
 * - Responsive modal design
 *
 * @param {Object} props - Component props
 * @param {boolean} props.userPanel - Controls modal visibility
 * @param {Function} props.setUserPanel - Function to toggle modal visibility
 * @returns {JSX.Element|null} User panel modal or null if no user
 */
const UserPanel = ({ userPanel, setUserPanel }) => {
  const { user, loading, subscribed, paymentEnabled, portalAccess, priceId } = useAuth();
  const [isCheckoutBusy, setIsCheckoutBusy] = useState(false);
  const [isPortalBusy, setIsPortalBusy] = useState(false);
  const [error, setError] = useState(null);

  if (!user) return null;

  /**
   * Initiates Stripe checkout process for subscription upgrade.
   *
   * Creates a new checkout session in Firestore and listens for the session URL
   * to redirect the user to Stripe's checkout page. Handles loading states and
   * error management throughout the process.
   *
   * @param {string} priceId - Stripe price ID for the subscription
   * @returns {Promise<void>}
   */
  async function startCheckout(priceId) {
    try {
      setError(null);
      setIsCheckoutBusy(true);

      // Create checkout session document in Firestore
      const ref = collection(db, 'customers', user.uid, 'checkout_sessions');
      const sessionRef = await addDoc(ref, {
        price: priceId,
        mode: 'subscription',
        success_url: window.location.href,
        cancel_url: window.location.href,
      });

      // Listen for session URL from Firebase Functions
      await new Promise((resolve, reject) => {
        const unsub = onSnapshot(
          doc(db, sessionRef.path),
          (snap) => {
            const data = snap.data();
            if (data?.error) {
              unsub();
              reject(data.error);
            }
            if (data?.url) {
              unsub();
              location.assign(data.url);
              resolve();
            }
          },
          reject
        );
      });
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setIsCheckoutBusy(false);
    }
  }

  /**
   * Opens Stripe billing portal for subscription management.
   *
   * Calls Firebase Function to create a billing portal link and redirects
   * the user to Stripe's customer portal for subscription management.
   * Handles loading states and error management.
   *
   * @returns {Promise<void>}
   */
  const openBillingPortal = async () => {
    try {
      setError(null);
      setIsPortalBusy(true);
      const createPortalLink = httpsCallable(
        functions,
        'ext-firestore-stripe-payments-createPortalLink'
      );

      const { data } = await createPortalLink({
        returnUrl: location.origin,
      });

      location.assign(data.url);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setIsPortalBusy(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    userPanel && (
      <div
        className="modal text-secondary flex h-[600px] w-[480px] flex-col items-center gap-2 p-2"
        role="dialog"
        aria-labelledby="user-panel-title"
        aria-describedby="user-panel-description"
        aria-modal="true"
      >
        {/* Close button */}
        <button
          onClick={() => setUserPanel(false)}
          className="modal-close text-muted hover:bg-hover hover:text-heading"
          aria-label="Close user panel"
        >
          &times;
        </button>

        {/* User profile section */}
        <div className="flex items-center gap-4" id="user-panel-title">
          <img
            src={user.photoURL}
            alt={`${user.displayName}'s profile picture`}
            className="h-10 w-10 rounded-full"
          />
          <span className="text-primary text-lg">{user.displayName}</span>
          <div className="px-8">
            <span className="text-primary text-sm">{user.email}</span>
            <br />
            <span className="text-muted min-w-10 text-center text-xs">
              Account Plan: {subscribed ? 'Pro' : 'Basic'}
            </span>
          </div>
        </div>

        <hr className="text-muted my-4 w-full" />

        {/* Action buttons and content */}
        <div
          className="flex h-full flex-col items-center justify-between gap-2"
          id="user-panel-description"
        >
          <div className="flex flex-col items-center gap-2">
            {/* Subscription upgrade button */}
            <button
              disabled={!paymentEnabled || subscribed || isCheckoutBusy}
              className={`clickable w-40 ${!paymentEnabled ? 'opacity-50' : ''}`}
              onClick={() => startCheckout(priceId)}
              aria-label={
                !paymentEnabled
                  ? 'Payments are currently disabled'
                  : subscribed
                    ? 'You have an active subscription'
                    : isCheckoutBusy
                      ? 'Preparing checkout process'
                      : 'Upgrade to Pro subscription'
              }
              aria-busy={isCheckoutBusy}
            >
              {!paymentEnabled
                ? 'Payments disabled'
                : subscribed
                  ? 'Subscription active'
                  : isCheckoutBusy
                    ? 'Preparing checkout...'
                    : 'Upgrade to Pro'}
            </button>

            {/* Billing portal button */}
            <button
              disabled={!portalAccess || isPortalBusy}
              className={`clickable w-40 ${!portalAccess ? 'opacity-50' : ''}`}
              onClick={openBillingPortal}
              aria-label={
                !portalAccess
                  ? 'Billing portal access is disabled'
                  : isPortalBusy
                    ? 'Opening billing portal'
                    : 'Manage your billing and subscription'
              }
              aria-busy={isPortalBusy}
            >
              {!portalAccess
                ? 'Billing portal disabled'
                : isPortalBusy
                  ? 'Opening portal...'
                  : 'Manage billing'}
            </button>
          </div>

          {/* Payment system notice */}
          {!paymentEnabled && (
            <div
              className="text-muted space-y-4 px-12 py-4 text-center text-sm"
              role="note"
              aria-label="Payment system notice"
            >
              <p>
                <b>
                  <u>Note:</u>
                </b>{' '}
                A subscription model is set up, but payments are currently and will ideally remain
                disabled.
              </p>
              <hr />
              <p>
                This is a feature that is set up as protection against potential abuse or costs
                unexpectedly becoming too high to sustain. Thank you for your understanding.
              </p>
            </div>
          )}

          {/* Sign out button */}
          <button
            className="clickable text-primary border-default hover:bg-hover w-24"
            onClick={() => signOut(auth)}
            aria-label="Sign out of your account"
          >
            Sign Out
          </button>
        </div>

        {/* Error display */}
        {error && (
          <div className="mt-2 text-sm text-red-400" role="alert" aria-live="polite">
            {error}
          </div>
        )}
      </div>
    )
  );
};

export default UserPanel;
