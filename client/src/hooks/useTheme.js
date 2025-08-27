import { useState, useEffect } from 'react';

/**
 * Custom React hook for managing application theme state and persistence.
 *
 * Provides theme management functionality including theme switching, persistence
 * across browser sessions, and system preference detection. Automatically detects
 * user's preferred color scheme and applies appropriate default theme. Manages
 * theme state through localStorage and applies theme classes to the document body.
 *
 * Features:
 * - System preference detection (light/dark mode)
 * - Theme persistence in localStorage
 * - Dynamic theme switching with CSS class management
 * - Support for multiple custom themes
 * - Automatic theme application on mount
 *
 * Available themes: light, dark, midnight, glacier, sunset, forest
 *
 * @returns {Array} [theme, setTheme] - Current theme state and setter function
 */
const useTheme = () => {
  const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const defaultTheme = darkMode ? 'dark' : 'light';
  const [theme, setTheme] = useState(null);

  /**
   * Returns the list of available themes.
   *
   * @returns {string[]} Array of available theme names
   */
  const themes = () => {
    return ['light', 'dark', 'midnight', 'glacier', 'sunset', 'forest'];
  };

  useEffect(() => {
    const storedTheme = localStorage.getItem('color-theme');

    setTheme(themes().includes(storedTheme) ? storedTheme : defaultTheme);
  }, [defaultTheme]);

  useEffect(() => {
    if (theme) {
      themes().forEach((name) => document.body.classList.remove(name));
      document.body.classList.add(theme);
      localStorage.setItem('color-theme', theme);
    }
  }, [theme]);

  return [theme, setTheme];
};

/**
 * Utility function to retrieve CSS custom property values from the document body.
 *
 * Extracts the computed value of a CSS custom property (CSS variable) from the
 * document body element. Used for accessing theme-specific color values and other
 * CSS custom properties dynamically.
 *
 * @param {string} prop - The CSS custom property name (without -- prefix)
 * @returns {string} The computed value of the CSS custom property
 */
const getThemeProperty = (prop) => {
  const value = getComputedStyle(document.body).getPropertyValue(`--${prop}`).trim();
  return value;
};

export { useTheme, getThemeProperty };
