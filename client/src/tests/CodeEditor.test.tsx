import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import CodeEditor from '../components/CodeEditor.jsx';

describe('CodeEditor', () => {
  test('code mirror renders', () => {
    render(<CodeEditor code="# Hello, world!" onChange={() => {}} />);

    const text = screen.getByText('Hello, world!') as HTMLElement;
    const line = text.parentElement as HTMLElement;
    const content = line.parentElement as HTMLElement;
    const scroller = content.parentElement as HTMLElement;
    const editor = scroller.parentElement as HTMLElement;
    const theme = editor.parentElement as HTMLElement;

    expect(line).toHaveClass('cm-line');
    expect(line).toHaveTextContent('# Hello, world!');
    expect(content).toHaveClass('cm-content');
    expect(content).toHaveAttribute('data-language', 'markdown');
    expect(scroller).toHaveClass('cm-scroller');
    expect(editor).toHaveClass('cm-editor');
    expect(theme.className).toMatch(/cm-theme-/);
  });

  test('code editor expected classes', () => {
    const { container } = render(<CodeEditor code="# Hello, world!" onChange={() => {}} />);

    const codeMirror = container.querySelector('[class*=cm-theme-]') as HTMLElement;
    const codeEditor = codeMirror.parentElement as HTMLElement;

    expect(codeEditor).toHaveClass('bg-secondary');
    expect(codeEditor).toHaveClass('text-primary');
    expect(codeEditor).toHaveClass('h-full');
    expect(codeEditor).toHaveClass('overflow-y-auto');
    expect(codeEditor).toHaveClass('pl-2');
    expect(codeEditor).toHaveClass('text-base');
  });

  test('code mirror focuses when editor is clicked', () => {
    const { container } = render(<CodeEditor code="# Hello, world!" onChange={() => {}} />);

    const codeMirror = container.querySelector('.cm-content') as HTMLElement;
    const codeEditor = container.children[0] as HTMLElement;

    codeEditor.click();

    expect(codeMirror).toHaveFocus();
  });

  test('content updates on change', async () => {
    const mockChange = vi.fn();
    const { container } = render(<CodeEditor code="" onChange={mockChange} />);

    const codeMirror = container.querySelector('.cm-content') as HTMLElement;

    const user = userEvent.setup();
    await user.click(codeMirror);
    await user.type(codeMirror, 'a');

    expect(mockChange).toHaveBeenCalledWith('a');
  });
});
