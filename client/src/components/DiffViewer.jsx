import { diffLines } from 'diff';
import { Fragment } from 'react';

/**
 * A side-by-side diff viewer component that displays differences between two text contents.
 *
 * This component uses the 'diff' library to generate line-by-line differences and renders
 * them in a grid layout with line numbers, color-coded changes (green for additions,
 * red for deletions), and proper text formatting for easy comparison.
 *
 * @param {Object} props - Component props
 * @param {string} props.oldContent - The original text content
 * @param {string} props.newContent - The modified text content
 * @returns {JSX.Element} Side-by-side diff view with line numbers and color coding
 */
const DiffViewer = ({ oldContent, newContent }) => {
  const lineDiff = diffLines(oldContent, newContent, { ignoreWhitespace: true });

  // Normalize newlines for consistent cross-platform handling
  const normalizeText = (text) => text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const oldLines = normalizeText(oldContent).split('\n');
  const newLines = normalizeText(newContent).split('\n');

  const getIdxWidth = (lines) => `${String(lines.length).length + 2}ch`;
  const oldIdxWidth = getIdxWidth(oldLines);
  const newIdxWidth = getIdxWidth(newLines);

  /**
   * Converts the diff result into a structured array of row objects for rendering.
   * Each row contains line numbers, change type, and text content.
   *
   * @returns {Array} Array of row objects with oldIdx, newIdx, kind, and text properties
   */
  const getDiffRows = () => {
    const rows = [];
    let oldIdx = 1;
    let newIdx = 1;

    for (const part of lineDiff) {
      let lines = part.value.split('\n');

      if (lines.at(-1) === '') lines.pop();

      for (const line of lines) {
        let row;
        if (part.added) {
          row = { oldIdx: null, newIdx: newIdx++, kind: 'add', text: line };
        } else if (part.removed) {
          row = { oldIdx: oldIdx++, newIdx: null, kind: 'del', text: line };
        } else {
          row = { oldIdx: oldIdx++, newIdx: newIdx++, kind: 'equal', text: line };
        }
        rows.push(row);
      }
    }
    return rows;
  };

  /**
   * Renders the diff rows in a grid layout with proper styling and line numbers.
   *
   * @param {Array} rows - Array of row objects from getDiffRows()
   * @returns {JSX.Element} Grid layout with diff visualization
   */
  const renderDiffRows = (rows) => (
    <div
      className="grid grid-cols-[auto_auto_1fr] overflow-y-auto font-mono text-sm"
      role="table"
      aria-label="Document differences"
      aria-describedby="diff-description"
    >
      <div id="diff-description" className="sr-only">
        Side-by-side comparison showing additions in green, deletions in red, and unchanged lines in
        gray
      </div>
      {rows.map((row, i) => {
        const { oldIdx, newIdx, kind, text } = row;

        const gutterCls = 'bg-primary px-2 text-right text-gray-500';
        const textCls =
          kind === 'add'
            ? 'border-l-4 border-green-500 bg-green-900/80 text-green-200 whitespace-pre-wrap'
            : kind === 'del'
              ? 'border-l-4 border-red-500 bg-red-900/80 text-red-200 whitespace-pre-wrap'
              : 'text-gray-300 pl-2 whitespace-pre-wrap';

        return (
          <Fragment key={i}>
            {/* Old content line number */}
            <div
              className={gutterCls}
              style={{ width: oldIdxWidth }}
              role="cell"
              aria-label={oldIdx ? `Original line ${oldIdx}` : 'No original line'}
            >
              {oldIdx || ''}
            </div>
            {/* New content line number */}
            <div
              className={gutterCls}
              style={{ width: newIdxWidth }}
              role="cell"
              aria-label={newIdx ? `New line ${newIdx}` : 'No new line'}
            >
              {newIdx || ''}
            </div>
            {/* Text content with change indicators and styling */}
            <div
              className={textCls}
              role="cell"
              aria-label={
                kind === 'add'
                  ? `Added: ${text}`
                  : kind === 'del'
                    ? `Deleted: ${text}`
                    : `Unchanged: ${text}`
              }
            >
              {kind === 'add' ? ' +' : kind === 'del' ? ' -' : ''} {text}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
  return renderDiffRows(getDiffRows());
};

export default DiffViewer;
