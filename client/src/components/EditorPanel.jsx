import React from 'react';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import CodeEditor from './CodeEditor';

/**
 * Editor panel component that provides the markdown editing interface.
 *
 * Renders a tabbed interface containing the markdown editor on the left side
 * of the application. Currently supports a single "Markdown" tab with the
 * CodeEditor component for editing markdown content.
 *
 * @param {Object} props - Component props
 * @param {string} props.markdown - The current markdown content
 * @param {Function} props.setMarkdown - Function to update the markdown content
 * @returns {JSX.Element} Editor panel with markdown editing interface
 */
const EditorPanel = ({ markdown, setMarkdown }) => {
  return (
    <div
      className="bg-primary flex w-1/2 flex-col rounded"
      role="region"
      aria-label="Markdown editor"
    >
      <Tabs className="input-tabs">
        <TabList
          className="text-heading flex-shrink-0 text-base font-bold"
          role="tablist"
          aria-label="Editor tabs"
        >
          <Tab role="tab" aria-selected="true" aria-controls="markdown-panel">
            Markdown
          </Tab>
        </TabList>

        {/*Markdown editor */}
        <TabPanel role="tabpanel" id="markdown-panel" aria-label="Markdown editor">
          <CodeEditor code={markdown} onChange={setMarkdown} />
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default EditorPanel;
