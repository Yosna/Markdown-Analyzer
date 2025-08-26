import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { markdown } from '@codemirror/lang-markdown';

/**
 * A markdown code editor component with syntax highlighting and custom theming.
 *
 * This component provides a full-featured code editor using CodeMirror with
 * markdown language support, word wrapping, line numbers, and theme support
 * that can be dynamically changed based on user preferences.
 *
 * @param {Object} props - Component props
 * @param {string} props.code - The markdown content to display in the editor
 * @param {Function} props.onChange - Callback function called when content changes
 * @returns {JSX.Element} CodeMirror editor component
 */
const CodeEditor = ({ code, onChange }) => {
  // Enable word wrapping for better readability
  const wordWrap = EditorView.lineWrapping;

  return (
    <div
      id="code-editor"
      className="bg-secondary text-primary h-full overflow-y-auto pl-2 text-base"
      role="textbox"
      aria-label="Markdown editor"
      aria-multiline="true"
      aria-describedby="editor-description"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const editor = e.currentTarget.querySelector('.cm-content');
          const isEditorFocused = document.activeElement === editor;
          if (editor && !isEditorFocused) {
            editor.focus();
          }
        }
      }}
    >
      <div id="editor-description" className="sr-only">
        Edit your markdown content here. Use standard markdown syntax for formatting.
      </div>
      <CodeMirror
        value={code}
        height="100%"
        // Markdown language support, word wrapping, and custom theme
        extensions={[markdown(), wordWrap]}
        onChange={(value) => onChange(value)}
        // Basic editor features: line numbers and active line highlighting
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
        }}
        aria-label="Markdown content editor"
      />
    </div>
  );
};

export default CodeEditor;
