/**
 * Theme Context
 *
 * React Context provider for theme management.
 * Handles theme switching, system preference detection, and localStorage persistence.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Theme } from '@/types';
import { getTheme, themeToCSSVariables, themeMetadata, themes } from '@/styles/themes';

/**
 * Theme context interface
 */
interface ThemeContextValue {
  /** Current theme */
  theme: Theme;
  /** Set theme */
  setTheme: (theme: Theme) => void;
  /** Toggle between light and dark */
  toggleTheme: () => void;
  /** Get theme metadata */
  getThemeMetadata: () => { name: string; description: string; icon: string };
  /** All available themes */
  availableThemes: readonly Theme[];
  /** Whether system preference is being used */
  isSystem: boolean;
  /** Use system preference */
  useSystemPreference: () => void;
}

/**
 * Theme context
 */
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Local storage key for theme preference
 */
const THEME_STORAGE_KEY = 'arch-platform-theme';

/**
 * Get system theme preference
 */
function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

/**
 * Get stored theme preference
 */
function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && stored in themes) {
      return stored as Theme;
    }
  } catch (error) {
    console.warn('Failed to read theme from localStorage:', error);
  }

  return null;
}

/**
 * Store theme preference
 */
function storeTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn('Failed to write theme to localStorage:', error);
  }
}

/**
 * Apply theme to document
 */
function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;

  const themeColors = getTheme(theme);
  const cssVars = themeToCSSVariables(themeColors);

  // Apply CSS variables to root
  const root = document.documentElement;
  Object.entries(cssVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // Set data attribute for CSS-based theming
  root.setAttribute('data-theme', theme);

  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', themeColors.background.default);
  }

  // Add theme-loaded class after a brief delay to enable transitions
  setTimeout(() => {
    document.body.classList.add('theme-loaded');
  }, 100);
}

/**
 * Theme Provider Props
 */
interface ThemeProviderProps {
  children: React.ReactNode;
  /** Default theme (overrides stored preference) */
  defaultTheme?: Theme;
  /** Whether to use system preference by default */
  useSystem?: boolean;
}

/**
 * Theme Provider Component
 */
export function ThemeProvider({
  children,
  defaultTheme,
  useSystem = false,
}: ThemeProviderProps) {
  // Initialize theme state
  const [theme, setThemeState] = useState<Theme>(() => {
    if (defaultTheme) {
      return defaultTheme;
    }

    if (useSystem) {
      return getSystemTheme();
    }

    return getStoredTheme() || 'light';
  });

  const [isSystem, setIsSystem] = useState(useSystem);

  // Apply theme whenever it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (!isSystem) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setThemeState(e.matches ? 'dark' : 'light');
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [isSystem]);

  // Set theme function
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    setIsSystem(false);
    storeTheme(newTheme);
  }, []);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    setThemeState((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      setIsSystem(false);
      storeTheme(newTheme);
      return newTheme;
    });
  }, []);

  // Use system preference
  const useSystemPreference = useCallback(() => {
    const systemTheme = getSystemTheme();
    setThemeState(systemTheme);
    setIsSystem(true);
    // Remove stored preference
    try {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to remove theme from localStorage:', error);
    }
  }, []);

  // Get theme metadata
  const getThemeMetadata = useCallback(() => {
    return themeMetadata[theme];
  }, [theme]);

  // Available themes
  const availableThemes: readonly Theme[] = [
    'light',
    'dark',
    'blue',
    'green',
    'high-contrast',
  ] as const;

  const value: ThemeContextValue = {
    theme,
    setTheme,
    toggleTheme,
    getThemeMetadata,
    availableThemes,
    isSystem,
    useSystemPreference,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Use theme hook
 *
 * @throws {Error} If used outside ThemeProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, setTheme, toggleTheme } = useTheme();
 *
 *   return (
 *     <button onClick={toggleTheme}>
 *       Current theme: {theme}
 *     </button>
 *   );
 * }
 * ```
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
