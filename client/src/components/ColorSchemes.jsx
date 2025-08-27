import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';

/**
 * ColorSchemes component for theme selection and management.
 *
 * Provides a dropdown interface for users to select from available color themes.
 * Displays the current theme and allows switching between different visual themes
 * that affect the entire application's appearance. Themes are persisted in
 * localStorage and applied globally through CSS custom properties.
 *
 * Features:
 * - Dropdown theme selector with descriptions
 * - Current theme display
 * - Theme persistence across sessions
 * - Accessibility support with ARIA attributes
 * - Responsive design with hover states
 *
 * Available themes:
 * - Light: Clean & bright
 * - Dark: Easy on the eyes
 * - Sunset: Warm & cozy
 * - Midnight: Deep & focused
 * - Forest: Natural & fresh
 * - Glacier: Cold & crisp
 *
 * @returns {JSX.Element} Theme selection dropdown component
 */
const ColorSchemes = () => {
  const [theme, setTheme] = useTheme();
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const updateColorScheme = (theme) => {
    setTheme(theme);
    setThemeDropdownOpen(false);
  };

  const themes = [
    { id: 'light', name: 'Light', description: 'Clean & bright' },
    { id: 'dark', name: 'Dark', description: 'Easy on the eyes' },
    { id: 'sunset', name: 'Sunset', description: 'Warm & cozy' },
    { id: 'midnight', name: 'Midnight', description: 'Deep & focused' },
    { id: 'forest', name: 'Forest', description: 'Natural & fresh' },
    { id: 'glacier', name: 'Glacier', description: 'Cold & crisp' },
  ];

  return (
    <div className="text-primary relative flex h-10 flex-row">
      <button
        className="clickable hover:bg-hover border-accent flex min-w-40 flex-col items-center justify-center"
        onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
        aria-label="Select theme"
        aria-expanded={themeDropdownOpen}
        aria-haspopup="listbox"
        aria-describedby="theme-description"
      >
        <p className="text-xs font-medium">Theme</p>
        <p className="text-muted text-xs">{theme?.charAt(0).toUpperCase() + theme?.slice(1)}</p>
      </button>
      <div id="theme-description" className="sr-only">
        Choose from available color themes for the application
      </div>

      {themeDropdownOpen && (
        <div
          className="bg-secondary border-default absolute top-10 right-0 z-10 w-48 rounded-md border shadow-lg"
          role="listbox"
          aria-label="Available themes"
          aria-activedescendant={`theme-${theme}`}
        >
          {themes.map((themeOption) => (
            <button
              key={themeOption.id}
              id={`theme-${themeOption.id}`}
              className="clickable hover:bg-accent flex w-full flex-col items-start justify-center rounded-none border-0 px-4 py-3 text-left first:rounded-t-md last:rounded-b-md"
              onClick={() => updateColorScheme(themeOption.id)}
              role="option"
              aria-selected={theme === themeOption.id}
              aria-label={`${themeOption.name} theme: ${themeOption.description}`}
            >
              <span className="text-primary text-sm font-medium">{themeOption.name}</span>
              <span className="text-muted text-xs">{themeOption.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorSchemes;
