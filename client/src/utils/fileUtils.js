/**
 * Reads a file as text content using FileReader API.
 *
 * Creates a Promise-based wrapper around FileReader to read file content as text.
 * Returns a Promise that resolves with the file content or rejects with an error.
 *
 * @param {File} file - The file object to read
 * @returns {Promise<string>} Promise that resolves with the file content as string
 */
const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

export { readFileAsText };
