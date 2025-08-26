import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import App from '../App.jsx';

vi.mock('react-toastify', () => ({
  ToastContainer: () => <div data-testid="toast-container" className="Toastify__toast-container" />,
}));

vi.mock('../components/EditorPanel', () => ({
  default: ({ markdown }) => (
    <div data-testid="editor-panel">
      <span>Editor Panel</span>
      <span>Markdown: {markdown}</span>
    </div>
  ),
}));

vi.mock('../components/OutputPanel', () => ({
  default: ({ markdown, markdownInput, summary }) => (
    <div data-testid="output-panel">
      <span>Output Panel</span>
      <span>Markdown: {markdown}</span>
      <span>Input: {markdownInput}</span>
      <span>Summary: {summary}</span>
    </div>
  ),
}));

vi.mock('../components/ControlPanel', () => ({
  default: ({ markdown }) => (
    <div data-testid="control-panel">
      <span>Control Panel</span>
      <span>Markdown: {markdown}</span>
    </div>
  ),
}));

vi.mock('../components/UserAuth', () => ({
  default: () => <div data-testid="user-auth">User Auth</div>,
}));

describe('App', () => {
  test('renders all main components', async () => {
    await act(async () => render(<App />));

    expect(screen.getByTestId('user-auth')).toBeInTheDocument();
    expect(screen.getByTestId('editor-panel')).toBeInTheDocument();
    expect(screen.getByTestId('output-panel')).toBeInTheDocument();
    expect(screen.getByTestId('control-panel')).toBeInTheDocument();
  });

  test('renders toast container', async () => {
    await act(async () => render(<App />));

    const toastContainer = document.querySelector('.Toastify__toast-container');
    expect(toastContainer).toBeInTheDocument();
  });

  test('has correct main layout structure', async () => {
    let container;
    await act(async () => {
      const result = render(<App />);
      container = result.container;
    });

    const mainContainer = container.querySelector('.flex.h-\\[calc\\(95vh-40px\\)\\]');
    expect(mainContainer).toBeInTheDocument();

    const splitPane = mainContainer.querySelector('.flex.h-full.flex-1');
    expect(splitPane).toBeInTheDocument();
  });

  test('passes correct props to child components', async () => {
    await act(async () => render(<App />));

    expect(screen.getByText('Editor Panel')).toBeInTheDocument();
    expect(screen.getByText('Output Panel')).toBeInTheDocument();
    expect(screen.getByText('Control Panel')).toBeInTheDocument();
    expect(screen.getByText('User Auth')).toBeInTheDocument();
  });

  test('initializes with default markdown', async () => {
    await act(async () => render(<App />));

    const markdownElements = screen.getAllByText(/Markdown:/);
    expect(markdownElements.length).toBeGreaterThan(0);
  });
});
