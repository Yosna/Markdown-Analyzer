import { useState, useRef, Fragment } from 'react';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DEFAULT_MARKDOWN } from './utils/constants';
import UserAuth from './components/UserAuth';
import AuthProvider from './components/AuthProvider';
import UserPanel from './components/UserPanel';
import UserCard from './components/UserCard';
import ColorSchemes from './components/ColorSchemes';
import EditorPanel from './components/EditorPanel';
import OutputPanel from './components/OutputPanel';
import ControlPanel from './components/ControlPanel';

/**
 * Main application component for the Markdown Analyzer.
 *
 * This component orchestrates the entire application workflow, including markdown editing,
 * preview rendering, diff visualization, AI-powered analysis, and file management. It
 * provides a split-pane interface with an editor on the left and multiple output views
 * (preview, diff, summary) on the right, along with AI integration for markdown analysis.
 *
 * @returns {JSX.Element} Complete application interface with editor, preview, and AI features
 */
function App() {
  const [userPanel, setUserPanel] = useState(false);
  const [markdownInput, setMarkdownInput] = useState(``);
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [summary, setSummary] = useState('');
  const previewRef = useRef(null);

  return (
    <Fragment>
      {/* Toast notifications for user feedback */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        pauseOnHover
        theme="dark"
      />

      {/* User authentication component */}
      <header className="flex h-12 w-full items-center justify-end gap-4 px-8 py-8" role="banner">
        <ColorSchemes />
        <AuthProvider>
          <UserCard userPanel={userPanel} setUserPanel={setUserPanel} />
          <UserPanel userPanel={userPanel} setUserPanel={setUserPanel} />
          <UserAuth setUserPanel={setUserPanel} />
        </AuthProvider>
      </header>

      {/* Main application layout */}
      <main
        className="flex h-[calc(95vh-40px)] flex-col gap-1 px-8"
        role="main"
        aria-label="Markdown Analyzer"
      >
        {/* Split-pane editor and output area */}
        <div
          className="flex h-full flex-1 gap-4 overflow-hidden"
          role="application"
          aria-label="Editor and preview workspace"
        >
          {/* Left panel: Markdown editor */}
          <EditorPanel markdown={markdown} setMarkdown={setMarkdown} />

          {/* Right panel: Preview, diff, and summary tabs */}
          <OutputPanel
            markdown={markdown}
            markdownInput={markdownInput}
            summary={summary}
            previewRef={previewRef}
          />
        </div>

        {/* Bottom control panel */}
        <ControlPanel
          markdown={markdown}
          setMarkdown={setMarkdown}
          setMarkdownInput={setMarkdownInput}
          setSummary={setSummary}
          previewRef={previewRef}
        />
      </main>
    </Fragment>
  );
}

export default App;
