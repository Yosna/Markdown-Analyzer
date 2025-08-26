import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import MarkdownPreview from '../components/MarkdownPreview.jsx';

describe('MarkdownPreview', () => {
  describe('rendered content', () => {
    test('markdown content renders', () => {
      render(<MarkdownPreview markdown="# Hello, world!" />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByText('Hello, world!')).toBeInTheDocument();
    });
  });

  describe('classes', () => {
    test('markdown preview expected classes', () => {
      render(<MarkdownPreview markdown="# Hello, world!" />);

      const heading = screen.getByRole('heading', { level: 1 });
      const preview = heading.parentElement;

      expect(preview).toHaveClass('prose');
      expect(preview).toHaveClass('prose-invert');
      expect(preview).toHaveClass('text-primary');
      expect(preview).toHaveClass('max-w-none');
      expect(preview).toHaveClass('overflow-y-auto');
      expect(preview).toHaveClass('px-9');
      expect(preview).toHaveClass('py-4');
    });
  });

  describe('remark plugins', () => {
    test('remarkGfm is applied', () => {
      render(<MarkdownPreview markdown="**bold**" />);

      expect(screen.getByRole('strong')).toBeInTheDocument();
      expect(screen.getByText('bold')).toBeInTheDocument();
    });
  });

  describe('rehype plugins', () => {
    test('rehypeRaw is applied', () => {
      render(<MarkdownPreview markdown="<div>Hello, world!</div>" />);

      const text = screen.getByText('Hello, world!');

      expect(text.tagName).toBe('DIV');
      expect(text).toBeInTheDocument();
    });

    test('rehypeSlug is applied', () => {
      render(<MarkdownPreview markdown="# Hello, world!" />);

      const heading = screen.getByRole('heading', { level: 1 });

      expect(heading).toHaveAttribute('id', 'hello-world');
    });

    test('rehypeHighlight is applied', () => {
      const { container } = render(
        <MarkdownPreview
          markdown={`\`\`\`javascript
            console.log("Hello, world!");`}
        />
      );

      const element = container.querySelector('.hljs-string') as HTMLElement;
      const code = element.parentElement as HTMLElement;
      const pre = code.parentElement as HTMLElement;

      expect(element).toHaveTextContent('"Hello, world!"');
      expect(code.tagName).toBe('CODE');
      expect(pre.tagName).toBe('PRE');
      expect(code && pre).toHaveTextContent('console.log("Hello, world!");');
    });
  });
});
