import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';

/**
 * Renders markdown content with enhanced formatting and syntax highlighting.
 *
 * This component uses ReactMarkdown with a comprehensive set of plugins to provide
 * GitHub-flavored markdown support, raw HTML rendering, automatic heading IDs,
 * and syntax highlighting for code blocks.
 *
 * @param {Object} props - Component props
 * @param {string} props.markdown - The markdown content to render
 * @param {React.RefObject} [props.reference] - Optional ref object for the container div
 * @returns {JSX.Element} Rendered markdown content
 */
const MarkdownPreview = ({ markdown, reference }) => {
  return (
    <div
      ref={reference}
      className="prose prose-invert text-primary max-w-none overflow-y-auto px-9 py-4"
      role="article"
      aria-label="Markdown preview"
    >
      <ReactMarkdown
        // GitHub Flavored Markdown support (tables, strikethrough, etc.)
        remarkPlugins={[remarkGfm]}
        // Raw HTML rendering, heading IDs, and syntax highlighting
        rehypePlugins={[rehypeRaw, rehypeSlug, rehypeHighlight]}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownPreview;
