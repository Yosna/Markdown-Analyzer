import html2canvas from 'html2canvas-pro';

/**
 * Captures the markdown preview as an image for AI analysis.
 *
 * Creates a hidden clone of the preview element, renders it with proper styling,
 * waits for images to load, and converts it to a data URL for API transmission.
 *
 * @returns {Promise<string>} Data URL of the captured preview image
 */
const captureMarkdownPreview = async (previewRef) => {
  const preview = previewRef.current;
  if (!preview) return;

  const clone = preview.cloneNode(true);
  document.body.appendChild(clone);
  try {
    clone.style.position = 'absolute';
    clone.style.left = '-99999px';
    clone.style.width = '900px';
    clone.style.overflow = 'visible';

    // Wait until images are loaded
    await Promise.all(
      Array.from(clone.querySelectorAll('img')).map((img) =>
        img.complete ? Promise.resolve() : new Promise((res) => (img.onload = img.onerror = res))
      )
    );

    // Force reflow before setting height
    void clone.offsetHeight;
    clone.style.height = clone.scrollHeight + 'px';

    const currentStyles = window.getComputedStyle(preview);
    const bgColor = currentStyles.getPropertyValue('--bg-secondary');

    const canvas = await html2canvas(clone, { useCORS: true, backgroundColor: bgColor });
    return canvas.toDataURL('image/jpeg');
  } finally {
    document.body.removeChild(clone);
  }
};

export { captureMarkdownPreview };
