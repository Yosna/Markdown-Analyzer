import { linkWithCredential } from 'firebase/auth';
import { toast } from 'react-toastify';

/**
 * Links a Firebase user account with additional authentication credentials.
 *
 * Attempts to link the provided credential to an existing Firebase user account.
 * Shows success/error toast notifications and handles errors through the provided
 * error callback function. Validates that both user and credential are provided
 * before attempting to link accounts.
 *
 * @param {Object} user - The Firebase user object to link credentials to
 * @param {Object} credential - The authentication credential to link
 * @param {Function} error - Error handler function called when linking fails
 * @returns {Promise<void>} Promise that resolves when linking completes
 */
const linkCredentials = async (user, credential, error) => {
  if (user && credential) {
    try {
      await linkWithCredential(user, credential);
      toast.success('Accounts linked successfully');
    } catch (err) {
      await error(err);
    }
  } else {
    toast.error('No user credentials to link');
  }
};

export default linkCredentials;
