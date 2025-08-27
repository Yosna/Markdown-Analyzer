import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from 'firebase/auth';
import { AUTH_ERRORS } from '../utils/constants';
import { useAuth } from '../hooks/useAuth';
import linkCredentials from '../utils/linkCredentials';

/**
 * User authentication component with Google and GitHub sign-in options.
 *
 * Provides a complete authentication interface with sign-in/sign-out functionality,
 * account linking capabilities, and error handling. Supports Google and GitHub
 * authentication providers with popup-based sign-in flow. Handles existing account
 * conflicts by prompting users to link their credentials.
 *
 * Features:
 * - Multi-provider authentication (Google, GitHub)
 * - Account linking for existing users
 * - Error handling with user-friendly messages
 * - Loading states and accessibility support
 * - Modal dialogs for account linking flow
 *
 * @returns {JSX.Element} Authentication interface with sign-in/sign-out controls
 */
const UserAuth = ({ setUserPanel }) => {
  const { user } = useAuth();
  const [credential, setCredential] = useState(null);
  const [signInDropdownOpen, setSignInDropdownOpen] = useState(false);
  const [accountLinkingModal, setAccountLinkingModal] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (credential) {
      setAccountLinkingModal(true);
    }
  }, [credential]);

  /**
   * Handles existing account errors by extracting pending credentials.
   *
   * When a user tries to sign in with a provider that has a different email
   * than their existing account, this function extracts the pending credential
   * and triggers the account linking flow.
   *
   * @param {Object} err - The authentication error object
   */
  const handleExistingAccountError = async (err) => {
    const email = err?.customData?.email;
    const pendingCredential = GithubAuthProvider.credentialFromError(err);

    if (email && pendingCredential?.providerId === 'github.com') {
      setCredential(pendingCredential);
    }
  };

  /**
   * Handles authentication errors with user-friendly messages.
   *
   * Maps Firebase authentication error codes to appropriate user-facing
   * error messages and handles special cases like existing account conflicts.
   *
   * @param {Object} err - The authentication error object
   */
  const handleSignInError = async (err) => {
    switch (err.code) {
      case AUTH_ERRORS.EXISTING_ACCOUNT:
        await handleExistingAccountError(err);
        break;
      case AUTH_ERRORS.EMAIL_IN_USE:
        toast.error('Account linking failed due to an email mismatch');
        break;
      case AUTH_ERRORS.POPUP_CLOSED:
        toast.error('Popup was closed by the user');
        break;
      case AUTH_ERRORS.POPUP_BLOCKED:
        toast.error('Popup was blocked by the browser');
        break;
      default:
        toast.error(`Error signing in: ${err.code}`);
    }
  };

  /**
   * Initiates sign-in process with the specified authentication provider.
   *
   * Handles the complete sign-in flow including provider setup, popup authentication,
   * account linking for existing credentials, and error handling. Manages loading
   * states and UI updates throughout the process.
   *
   * @param {Object} provider - The Firebase auth provider to use for sign-in
   */
  const onSignIn = async (provider) => {
    setSigningIn(true);
    setSignInDropdownOpen(false);

    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      await signInWithPopup(auth, provider);
      toast.success('Signed in successfully');
      if (credential) await linkCredentials(auth.currentUser, credential, handleSignInError);
      setCredential(null);
      setAccountLinkingModal(false);
    } catch (err) {
      await handleSignInError(err);
    } finally {
      setSigningIn(false);
      setUserPanel(false);
    }
  };

  /**
   * Renders the Google sign-in button with proper styling and accessibility.
   *
   * @returns {JSX.Element} Google sign-in button component
   */
  const googleSignIn = () => {
    const googleProvider = new GoogleAuthProvider();

    return (
      <button
        className="clickable text-primary border-default hover:bg-hover w-full"
        onClick={() => onSignIn(googleProvider)}
        disabled={signingIn}
        aria-busy={signingIn}
        aria-label="Sign in with Google"
      >
        Sign In with Google
      </button>
    );
  };

  /**
   * Renders the GitHub sign-in button with proper styling and accessibility.
   *
   * @returns {JSX.Element} GitHub sign-in button component
   */
  const githubSignIn = () => {
    const githubProvider = new GithubAuthProvider();
    githubProvider.addScope('user:email');

    return (
      <button
        className="clickable text-primary border-default hover:bg-hover w-full"
        onClick={() => onSignIn(githubProvider)}
        disabled={signingIn}
        aria-busy={signingIn}
        aria-label="Sign in with GitHub"
      >
        Sign In with GitHub
      </button>
    );
  };

  return (
    !user && (
      <div className="relative">
        {/* Sign-in trigger button with dropdown toggle */}
        <button
          className={`clickable border-default h-10 min-w-24 ${
            signingIn || accountLinkingModal
              ? 'bg-primary text-muted'
              : 'text-primary hover:bg-hover'
          }`}
          onClick={() => setSignInDropdownOpen(!signInDropdownOpen)}
          disabled={signingIn || accountLinkingModal}
          aria-expanded={signInDropdownOpen}
          aria-haspopup="true"
          aria-label="Sign in options"
        >
          {signingIn ? 'Signing in...' : 'Sign In'}
        </button>

        {/* Provider selection dropdown */}
        {signInDropdownOpen && (
          <div
            className="bg-primary absolute top-10 right-0 z-10 w-48 rounded-md shadow-md"
            role="menu"
            aria-label="Sign in options"
          >
            {googleSignIn()}
            {githubSignIn()}
          </div>
        )}

        {/* Account linking modal for existing user conflicts */}
        {accountLinkingModal && (
          <div
            className="modal h-[400px] w-[320px]"
            role="dialog"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            aria-modal="true"
          >
            <button
              onClick={() => {
                setAccountLinkingModal(false);
                setCredential(null);
              }}
              className="modal-close text-muted hover:bg-hover hover:text-heading"
              aria-label="Close modal"
            >
              &times;
            </button>
            <div className="flex h-full flex-col justify-between">
              <div className="flex flex-col gap-4 p-4 text-center">
                <h1 id="modal-title" className="text-2xl font-bold">
                  Existing User Found
                </h1>
                <hr />
                <div id="modal-description" className="text-muted text-sm">
                  <p>An existing account with Google was found for this user.</p>
                  <br />
                  <p>Please sign in using Google to link your credentials.</p>
                  <br />
                  <p>You will be able to sign in with your GitHub account once they're linked.</p>
                </div>
              </div>
              {googleSignIn()}
            </div>
          </div>
        )}
      </div>
    )
  );
};

export default UserAuth;
