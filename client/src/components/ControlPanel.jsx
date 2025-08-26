import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { captureMarkdownPreview } from '../utils/captureImage';
import { sendToLLM } from '../utils/api';
import { readFileAsText } from '../utils/fileUtils';

/**
 * Control panel component that handles user interactions and AI analysis.
 *
 * Provides the bottom control interface with an instructions input field,
 * file upload functionality, and AI analysis button. Handles file reading,
 * API communication with the LLM service, and user feedback via toast
 * notifications. Manages its own processing state and instructions input.
 *
 * @param {Object} props - Component props
 * @param {string} props.markdown - The current markdown content
 * @param {Function} props.setMarkdown - Function to update the markdown content
 * @param {Function} props.setMarkdownInput - Function to set the original markdown for diff
 * @param {Function} props.setSummary - Function to update the AI-generated summary
 * @param {React.RefObject} props.previewRef - Reference to the preview element for image capture
 * @returns {JSX.Element} Control panel with file upload and AI analysis controls
 */
const ControlPanel = ({ markdown, setMarkdown, setMarkdownInput, setSummary, previewRef }) => {
  const [instructions, setInstructions] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  /**
   * Handles file upload and loads markdown content from the selected file.
   *
   * @param {Event} e - File input change event
   */
  const onSelectFile = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const text = await readFileAsText(file);
        setMarkdown(text);
        fileInputRef.current.value = '';
      } catch {
        toast.error('Failed to read file');
      }
    }
  };

  /**
   * Sends markdown content and instructions to the AI analysis API.
   *
   * Captures the current preview as an image, sends the markdown content and
   * user instructions to the backend API, and updates the UI with the AI response.
   * Handles loading states, error recovery, and user feedback via toast notifications.
   */
  const onSendToLLM = async () => {
    setIsProcessing(true);

    const originalMarkdown = markdown;
    const originalInstructions = instructions;

    try {
      const preview = await captureMarkdownPreview(previewRef);
      const result = await sendToLLM(markdown, instructions, preview);

      setMarkdownInput(markdown);
      setMarkdown(result.markdown ?? markdown);
      setSummary(result.summary ?? '');
      setInstructions('');
      toast.success('LLM request completed.');
    } catch (error) {
      console.error(error);
      setMarkdown(originalMarkdown);
      setInstructions(originalInstructions);
      toast.error('LLM request failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="bg-secondary text-primary flex h-12 items-center gap-2 px-4"
      role="toolbar"
      aria-label="Analysis controls"
    >
      {/* Instructions input field */}
      <input
        type="text"
        placeholder="Enter instructions for the AI..."
        className="bg-primary text-primary border-default focus:border-accent flex-1 rounded border px-3 py-2 text-sm focus:outline-none"
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !isProcessing) {
            onSendToLLM();
          }
        }}
        disabled={isProcessing}
        aria-label="Instructions for AI analysis"
        aria-describedby="instructions-help"
      />
      <div id="instructions-help" className="sr-only">
        Enter specific instructions for how the AI should analyze your markdown content
      </div>

      {/* File upload button */}
      <label
        htmlFor="select-file"
        className="clickable border-default hover:bg-accent h-10 min-w-24 px-4"
        aria-label="Upload markdown file"
      >
        Upload File
      </label>
      <input
        ref={fileInputRef}
        type="file"
        id="select-file"
        accept=".md"
        className="hidden"
        onChange={onSelectFile}
        aria-label="Choose markdown file to upload"
      />

      {/* AI analysis button */}
      <button
        className={`clickable border-default h-10 min-w-24 px-4 ${
          isProcessing ? 'bg-accent cursor-not-allowed opacity-60' : 'hover:bg-accent'
        }`}
        onClick={onSendToLLM}
        disabled={isProcessing}
        aria-label="Send markdown to AI for analysis"
        aria-busy={isProcessing}
      >
        {isProcessing ? 'Processing...' : 'Send Request'}
      </button>
    </div>
  );
};

export default ControlPanel;
