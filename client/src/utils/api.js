import { API_ANALYZE_URL } from './constants';

/**
 * Sends markdown content and instructions to the AI analysis API.
 *
 * Makes a POST request to the backend API with markdown content, user instructions,
 * and optionally a preview image. Returns the AI analysis results.
 *
 * @param {string} markdown - The markdown content to analyze
 * @param {string} instructions - User instructions for the AI analysis
 * @param {string} [preview] - Optional data URL of the preview image
 * @returns {Promise<Object>} Promise that resolves with the AI analysis results
 * @throws {Error} When the API request fails or returns an error response
 */
const sendToLLM = async (markdown, instructions, preview) => {
  const payload = { markdown, instructions };
  if (preview) payload.preview = preview;

  const response = await fetch(API_ANALYZE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
};

export { sendToLLM };
