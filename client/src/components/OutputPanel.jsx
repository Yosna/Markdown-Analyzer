import React from 'react';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import MarkdownPreview from './MarkdownPreview';
import DiffViewer from './DiffViewer';

/**
 * Output panel component that displays various views of the markdown content.
 *
 * Renders a tabbed interface on the right side of the application with three tabs:
 * Preview (live markdown rendering), Diff (showing changes), and Summary
 * (AI-generated analysis). Each tab contains the appropriate component for
 * displaying the content.
 *
 * @param {Object} props - Component props
 * @param {string} props.markdown - The current markdown content
 * @param {string} props.markdownInput - The original markdown content for diff comparison
 * @param {string} props.summary - The AI-generated summary content
 * @param {React.RefObject} props.previewRef - Reference to the preview element for image capture
 * @returns {JSX.Element} Output panel with preview, diff, and summary tabs
 */
const OutputPanel = ({ markdown, markdownInput, summary, previewRef }) => {
  return (
    <div
      className="bg-primary flex h-full w-1/2 flex-col rounded"
      role="region"
      aria-label="Output and analysis results"
    >
      <Tabs className="output-tabs" forceRenderTabPanel>
        <TabList
          className="text-heading text-base font-bold"
          role="tablist"
          aria-label="Output tabs"
        >
          <Tab role="tab" aria-selected="true" aria-controls="preview-panel">
            Preview
          </Tab>
          <Tab role="tab" aria-selected="false" aria-controls="diff-panel">
            Diff
          </Tab>
          <Tab role="tab" aria-selected="false" aria-controls="summary-panel">
            Summary
          </Tab>
        </TabList>

        {/* Live markdown preview */}
        <TabPanel role="tabpanel" id="preview-panel" aria-label="Live markdown preview">
          <MarkdownPreview markdown={markdown} reference={previewRef} />
        </TabPanel>

        {/* Diff view showing changes */}
        <TabPanel role="tabpanel" id="diff-panel" aria-label="Document differences">
          <DiffViewer oldContent={markdownInput || ''} newContent={markdown || ''} />
        </TabPanel>

        {/* AI-generated summary */}
        <TabPanel role="tabpanel" id="summary-panel" aria-label="AI-generated summary">
          <MarkdownPreview markdown={summary} />
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default OutputPanel;
