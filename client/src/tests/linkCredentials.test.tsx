import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { toast } from 'react-toastify';
import linkCredentials from '../utils/linkCredentials';
import { User, AuthCredential } from 'firebase/auth';

vi.mock('firebase/auth', () => ({
  linkWithCredential: vi.fn(),
}));

describe('linkCredentials', () => {
  let mockUser: any;
  let mockCredential: any;
  let mockError: any;
  let mockLinkWithCredential: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockUser = {
      uid: 'test-user-id',
      email: 'test@example.com',
    } as User;

    mockCredential = {
      providerId: 'google.com',
      signInMethod: 'google.com',
    } as AuthCredential;

    mockError = vi.fn();

    const authModule = await import('firebase/auth');
    mockLinkWithCredential = vi.mocked(authModule.linkWithCredential);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('successfully links credentials and shows success toast', async () => {
    mockLinkWithCredential.mockResolvedValueOnce();

    await linkCredentials(mockUser, mockCredential, mockError);

    expect(mockLinkWithCredential).toHaveBeenCalledWith(mockUser, mockCredential);
    expect(toast.success).toHaveBeenCalledWith('Accounts linked successfully');
    expect(mockError).not.toHaveBeenCalled();
  });

  test('handles linking error and calls error handler', async () => {
    const linkingError = new Error('Failed to link accounts');

    mockLinkWithCredential.mockRejectedValueOnce(linkingError);

    await linkCredentials(mockUser, mockCredential, mockError);

    expect(mockLinkWithCredential).toHaveBeenCalledWith(mockUser, mockCredential);
    expect(mockError).toHaveBeenCalledWith(linkingError);
    expect(toast.success).not.toHaveBeenCalled();
  });

  test('shows error toast when user is null', async () => {
    await linkCredentials(null, mockCredential, mockError);

    expect(mockLinkWithCredential).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('No user credentials to link');
    expect(mockError).not.toHaveBeenCalled();
  });

  test('shows error toast when credential is null', async () => {
    await linkCredentials(mockUser, null, mockError);

    expect(mockLinkWithCredential).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('No user credentials to link');
    expect(mockError).not.toHaveBeenCalled();
  });

  test('shows error toast when both user and credential are null', async () => {
    await linkCredentials(null, null, mockError);

    expect(mockLinkWithCredential).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('No user credentials to link');
    expect(mockError).not.toHaveBeenCalled();
  });

  test('shows error toast when user is undefined', async () => {
    await linkCredentials(undefined, mockCredential, mockError);

    expect(mockLinkWithCredential).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('No user credentials to link');
    expect(mockError).not.toHaveBeenCalled();
  });

  test('shows error toast when credential is undefined', async () => {
    await linkCredentials(mockUser, undefined, mockError);

    expect(mockLinkWithCredential).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('No user credentials to link');
    expect(mockError).not.toHaveBeenCalled();
  });

  test('handles Firebase auth error with specific error message', async () => {
    const authError = new Error('auth/credential-already-in-use');

    mockLinkWithCredential.mockRejectedValueOnce(authError);

    await linkCredentials(mockUser, mockCredential, mockError);

    expect(mockLinkWithCredential).toHaveBeenCalledWith(mockUser, mockCredential);
    expect(mockError).toHaveBeenCalledWith(authError);
    expect(toast.success).not.toHaveBeenCalled();
  });

  test('handles network error during linking', async () => {
    const networkError = new Error('Network error');

    mockLinkWithCredential.mockRejectedValueOnce(networkError);

    await linkCredentials(mockUser, mockCredential, mockError);

    expect(mockLinkWithCredential).toHaveBeenCalledWith(mockUser, mockCredential);
    expect(mockError).toHaveBeenCalledWith(networkError);
    expect(toast.success).not.toHaveBeenCalled();
  });
});
