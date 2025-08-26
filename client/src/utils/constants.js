export const DEFAULT_MARKDOWN = `# Hello World\n\nWrite some **Markdown** here.`;

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const API_ANALYZE_URL = `${API_BASE_URL}/api/analyze`;

export const AUTH_ERRORS = {
  EXISTING_ACCOUNT: 'auth/account-exists-with-different-credential',
  EMAIL_IN_USE: 'auth/email-already-in-use',
  POPUP_CLOSED: 'auth/popup-closed-by-user',
  POPUP_BLOCKED: 'auth/popup-blocked',
};
