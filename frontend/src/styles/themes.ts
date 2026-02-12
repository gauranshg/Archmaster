/**
 * Theme Definitions
 *
 * Comprehensive theme tokens for the Custom Architecture Platform.
 * Each theme defines colors for all UI elements with WCAG AA contrast compliance.
 */

import type { Theme } from '@/types';

/**
 * Base theme interface
 */
export interface ThemeColors {
  // Primary colors
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };

  // Secondary colors
  secondary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };

  // Semantic colors
  success: {
    light: string;
    main: string;
    dark: string;
    bg: string;
  };

  warning: {
    light: string;
    main: string;
    dark: string;
    bg: string;
  };

  error: {
    light: string;
    main: string;
    dark: string;
    bg: string;
  };

  info: {
    light: string;
    main: string;
    dark: string;
    bg: string;
  };

  // Neutral colors
  gray: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };

  // Background colors
  background: {
    default: string;
    paper: string;
    canvas: string;
    elevated: string;
  };

  // Surface colors
  surface: {
    default: string;
    hover: string;
    active: string;
    focus: string;
  };

  // Border colors
  border: {
    default: string;
    hover: string;
    focus: string;
    error: string;
  };

  // Text colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
    inverse: string;
  };

  // Shadow colors
  shadow: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };

  // Diagram-specific colors
  diagram: {
    nodeBackground: string;
    nodeBorder: string;
    nodeSelected: string;
    edge: string;
    edgeSelected: string;
    port: string;
    portHover: string;
    grid: string;
    gridMajor: string;
  };

  // Editor colors
  editor: {
    background: string;
    foreground: string;
    lineNumbers: string;
    selection: string;
    activeLine: string;
  };
}

/**
 * Light Theme (Default)
 * Clean, modern interface with blue accents
 */
export const lightTheme: ThemeColors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  secondary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },

  success: {
    light: '#86efac',
    main: '#22c55e',
    dark: '#16a34a',
    bg: '#f0fdf4',
  },

  warning: {
    light: '#fcd34d',
    main: '#f59e0b',
    dark: '#d97706',
    bg: '#fffbeb',
  },

  error: {
    light: '#fca5a5',
    main: '#ef4444',
    dark: '#dc2626',
    bg: '#fef2f2',
  },

  info: {
    light: '#93c5fd',
    main: '#3b82f6',
    dark: '#2563eb',
    bg: '#eff6ff',
  },

  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  background: {
    default: '#ffffff',
    paper: '#ffffff',
    canvas: '#f8fafc',
    elevated: '#ffffff',
  },

  surface: {
    default: '#ffffff',
    hover: '#f9fafb',
    active: '#f3f4f6',
    focus: '#eff6ff',
  },

  border: {
    default: '#e5e7eb',
    hover: '#d1d5db',
    focus: '#3b82f6',
    error: '#ef4444',
  },

  text: {
    primary: '#111827',
    secondary: '#6b7280',
    tertiary: '#9ca3af',
    disabled: '#d1d5db',
    inverse: '#ffffff',
  },

  shadow: {
    sm: 'rgba(0, 0, 0, 0.05)',
    md: 'rgba(0, 0, 0, 0.1)',
    lg: 'rgba(0, 0, 0, 0.15)',
    xl: 'rgba(0, 0, 0, 0.2)',
  },

  diagram: {
    nodeBackground: '#ffffff',
    nodeBorder: '#e5e7eb',
    nodeSelected: '#3b82f6',
    edge: '#9ca3af',
    edgeSelected: '#3b82f6',
    port: '#d1d5db',
    portHover: '#3b82f6',
    grid: '#e5e7eb',
    gridMajor: '#d1d5db',
  },

  editor: {
    background: '#ffffff',
    foreground: '#1f2937',
    lineNumbers: '#9ca3af',
    selection: 'rgba(59, 130, 246, 0.2)',
    activeLine: '#f9fafb',
  },
};

/**
 * Dark Theme
 * Professional dark mode with reduced eye strain
 */
export const darkTheme: ThemeColors = {
  primary: {
    50: '#1e3a8a',
    100: '#1e40af',
    200: '#1d4ed8',
    300: '#2563eb',
    400: '#3b82f6',
    500: '#60a5fa',
    600: '#93c5fd',
    700: '#bfdbfe',
    800: '#dbeafe',
    900: '#eff6ff',
  },

  secondary: {
    50: '#4c1d95',
    100: '#5b21b6',
    200: '#6d28d9',
    300: '#7c3aed',
    400: '#8b5cf6',
    500: '#a78bfa',
    600: '#c4b5fd',
    700: '#ddd6fe',
    800: '#ede9fe',
    900: '#f5f3ff',
  },

  success: {
    light: '#16a34a',
    main: '#22c55e',
    dark: '#86efac',
    bg: '#052e16',
  },

  warning: {
    light: '#d97706',
    main: '#f59e0b',
    dark: '#fcd34d',
    bg: '#451a03',
  },

  error: {
    light: '#dc2626',
    main: '#ef4444',
    dark: '#fca5a5',
    bg: '#450a0a',
  },

  info: {
    light: '#2563eb',
    main: '#3b82f6',
    dark: '#93c5fd',
    bg: '#1e3a8a',
  },

  gray: {
    50: '#030712',
    100: '#111827',
    200: '#1f2937',
    300: '#374151',
    400: '#4b5563',
    500: '#6b7280',
    600: '#9ca3af',
    700: '#d1d5db',
    800: '#e5e7eb',
    900: '#f3f4f6',
    950: '#f9fafb',
  },

  background: {
    default: '#0f172a',
    paper: '#1e293b',
    canvas: '#020617',
    elevated: '#1e293b',
  },

  surface: {
    default: '#1e293b',
    hover: '#334155',
    active: '#475569',
    focus: '#1e3a8a',
  },

  border: {
    default: '#334155',
    hover: '#475569',
    focus: '#3b82f6',
    error: '#ef4444',
  },

  text: {
    primary: '#f9fafb',
    secondary: '#d1d5db',
    tertiary: '#9ca3af',
    disabled: '#4b5563',
    inverse: '#111827',
  },

  shadow: {
    sm: 'rgba(0, 0, 0, 0.3)',
    md: 'rgba(0, 0, 0, 0.5)',
    lg: 'rgba(0, 0, 0, 0.7)',
    xl: 'rgba(0, 0, 0, 0.9)',
  },

  diagram: {
    nodeBackground: '#1e293b',
    nodeBorder: '#334155',
    nodeSelected: '#3b82f6',
    edge: '#64748b',
    edgeSelected: '#3b82f6',
    port: '#475569',
    portHover: '#60a5fa',
    grid: '#1e293b',
    gridMajor: '#334155',
  },

  editor: {
    background: '#1e293b',
    foreground: '#e2e8f0',
    lineNumbers: '#64748b',
    selection: 'rgba(96, 165, 250, 0.3)',
    activeLine: '#334155',
  },
};

/**
 * Blue Theme
 * Professional blue-themed interface
 */
export const blueTheme: ThemeColors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  secondary: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
  },

  success: {
    light: '#86efac',
    main: '#22c55e',
    dark: '#16a34a',
    bg: '#f0fdf4',
  },

  warning: {
    light: '#fcd34d',
    main: '#f59e0b',
    dark: '#d97706',
    bg: '#fffbeb',
  },

  error: {
    light: '#fca5a5',
    main: '#ef4444',
    dark: '#dc2626',
    bg: '#fef2f2',
  },

  info: {
    light: '#93c5fd',
    main: '#3b82f6',
    dark: '#2563eb',
    bg: '#eff6ff',
  },

  gray: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },

  background: {
    default: '#f0f9ff',
    paper: '#ffffff',
    canvas: '#e0f2fe',
    elevated: '#ffffff',
  },

  surface: {
    default: '#ffffff',
    hover: '#f0f9ff',
    active: '#e0f2fe',
    focus: '#dbeafe',
  },

  border: {
    default: '#bae6fd',
    hover: '#7dd3fc',
    focus: '#3b82f6',
    error: '#ef4444',
  },

  text: {
    primary: '#0c4a6e',
    secondary: '#0369a1',
    tertiary: '#0284c7',
    disabled: '#bae6fd',
    inverse: '#ffffff',
  },

  shadow: {
    sm: 'rgba(14, 165, 233, 0.1)',
    md: 'rgba(14, 165, 233, 0.2)',
    lg: 'rgba(14, 165, 233, 0.3)',
    xl: 'rgba(14, 165, 233, 0.4)',
  },

  diagram: {
    nodeBackground: '#ffffff',
    nodeBorder: '#bae6fd',
    nodeSelected: '#3b82f6',
    edge: '#7dd3fc',
    edgeSelected: '#3b82f6',
    port: '#bae6fd',
    portHover: '#0ea5e9',
    grid: '#e0f2fe',
    gridMajor: '#bae6fd',
  },

  editor: {
    background: '#ffffff',
    foreground: '#0c4a6e',
    lineNumbers: '#7dd3fc',
    selection: 'rgba(59, 130, 246, 0.2)',
    activeLine: '#f0f9ff',
  },
};

/**
 * Green Theme
 * Natural green-themed interface
 */
export const greenTheme: ThemeColors = {
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  secondary: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },

  success: {
    light: '#86efac',
    main: '#22c55e',
    dark: '#16a34a',
    bg: '#f0fdf4',
  },

  warning: {
    light: '#fcd34d',
    main: '#f59e0b',
    dark: '#d97706',
    bg: '#fffbeb',
  },

  error: {
    light: '#fca5a5',
    main: '#ef4444',
    dark: '#dc2626',
    bg: '#fef2f2',
  },

  info: {
    light: '#86efac',
    main: '#22c55e',
    dark: '#16a34a',
    bg: '#f0fdf4',
  },

  gray: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  background: {
    default: '#f0fdf4',
    paper: '#ffffff',
    canvas: '#dcfce7',
    elevated: '#ffffff',
  },

  surface: {
    default: '#ffffff',
    hover: '#f0fdf4',
    active: '#dcfce7',
    focus: '#bbf7d0',
  },

  border: {
    default: '#bbf7d0',
    hover: '#86efac',
    focus: '#22c55e',
    error: '#ef4444',
  },

  text: {
    primary: '#14532d',
    secondary: '#166534',
    tertiary: '#15803d',
    disabled: '#bbf7d0',
    inverse: '#ffffff',
  },

  shadow: {
    sm: 'rgba(34, 197, 94, 0.1)',
    md: 'rgba(34, 197, 94, 0.2)',
    lg: 'rgba(34, 197, 94, 0.3)',
    xl: 'rgba(34, 197, 94, 0.4)',
  },

  diagram: {
    nodeBackground: '#ffffff',
    nodeBorder: '#bbf7d0',
    nodeSelected: '#22c55e',
    edge: '#86efac',
    edgeSelected: '#22c55e',
    port: '#bbf7d0',
    portHover: '#4ade80',
    grid: '#dcfce7',
    gridMajor: '#bbf7d0',
  },

  editor: {
    background: '#ffffff',
    foreground: '#14532d',
    lineNumbers: '#86efac',
    selection: 'rgba(34, 197, 94, 0.2)',
    activeLine: '#f0fdf4',
  },
};

/**
 * High Contrast Theme
 * Maximum contrast for accessibility
 */
export const highContrastTheme: ThemeColors = {
  primary: {
    50: '#000000',
    100: '#000000',
    200: '#000000',
    300: '#000000',
    400: '#000000',
    500: '#000000',
    600: '#000000',
    700: '#000000',
    800: '#000000',
    900: '#000000',
  },

  secondary: {
    50: '#ffffff',
    100: '#ffffff',
    200: '#ffffff',
    300: '#ffffff',
    400: '#ffffff',
    500: '#ffffff',
    600: '#ffffff',
    700: '#ffffff',
    800: '#ffffff',
    900: '#ffffff',
  },

  success: {
    light: '#00aa00',
    main: '#008000',
    dark: '#006600',
    bg: '#ffffff',
  },

  warning: {
    light: '#ffaa00',
    main: '#ff8800',
    dark: '#cc6600',
    bg: '#ffffff',
  },

  error: {
    light: '#ff0000',
    main: '#cc0000',
    dark: '#990000',
    bg: '#ffffff',
  },

  info: {
    light: '#0000ff',
    main: '#0000cc',
    dark: '#000099',
    bg: '#ffffff',
  },

  gray: {
    50: '#ffffff',
    100: '#ffffff',
    200: '#e0e0e0',
    300: '#c0c0c0',
    400: '#a0a0a0',
    500: '#808080',
    600: '#606060',
    700: '#404040',
    800: '#202020',
    900: '#000000',
    950: '#000000',
  },

  background: {
    default: '#ffffff',
    paper: '#ffffff',
    canvas: '#ffffff',
    elevated: '#ffffff',
  },

  surface: {
    default: '#ffffff',
    hover: '#f5f5f5',
    active: '#e8e8e8',
    focus: '#e0e0e0',
  },

  border: {
    default: '#000000',
    hover: '#000000',
    focus: '#000000',
    error: '#ff0000',
  },

  text: {
    primary: '#000000',
    secondary: '#000000',
    tertiary: '#202020',
    disabled: '#606060',
    inverse: '#ffffff',
  },

  shadow: {
    sm: 'rgba(0, 0, 0, 0.2)',
    md: 'rgba(0, 0, 0, 0.3)',
    lg: 'rgba(0, 0, 0, 0.4)',
    xl: 'rgba(0, 0, 0, 0.5)',
  },

  diagram: {
    nodeBackground: '#ffffff',
    nodeBorder: '#000000',
    nodeSelected: '#000000',
    edge: '#000000',
    edgeSelected: '#000000',
    port: '#000000',
    portHover: '#000000',
    grid: '#c0c0c0',
    gridMajor: '#808080',
  },

  editor: {
    background: '#ffffff',
    foreground: '#000000',
    lineNumbers: '#000000',
    selection: 'rgba(0, 0, 0, 0.2)',
    activeLine: '#f0f0f0',
  },
};

/**
 * Theme mapping
 */
export const themes: Record<Theme, ThemeColors> = {
  light: lightTheme,
  dark: darkTheme,
  blue: blueTheme,
  green: greenTheme,
  'high-contrast': highContrastTheme,
};

/**
 * Theme metadata
 */
export const themeMetadata: Record<
  Theme,
  { name: string; description: string; icon: string }
> = {
  light: {
    name: 'Light',
    description: 'Clean and modern light theme',
    icon: '☀️',
  },
  dark: {
    name: 'Dark',
    description: 'Professional dark mode',
    icon: '🌙',
  },
  blue: {
    name: 'Blue',
    description: 'Professional blue-themed interface',
    icon: '💙',
  },
  green: {
    name: 'Green',
    description: 'Natural green-themed interface',
    icon: '💚',
  },
  'high-contrast': {
    name: 'High Contrast',
    description: 'Maximum contrast for accessibility',
    icon: '🔲',
  },
};

/**
 * Get theme by name
 */
export function getTheme(theme: Theme): ThemeColors {
  return themes[theme] || lightTheme;
}

/**
 * Convert theme colors to CSS variables
 */
export function themeToCSSVariables(theme: ThemeColors): Record<string, string> {
  return {
    // Primary colors
    '--primary-50': theme.primary[50],
    '--primary-100': theme.primary[100],
    '--primary-200': theme.primary[200],
    '--primary-300': theme.primary[300],
    '--primary-400': theme.primary[400],
    '--primary-500': theme.primary[500],
    '--primary-600': theme.primary[600],
    '--primary-700': theme.primary[700],
    '--primary-800': theme.primary[800],
    '--primary-900': theme.primary[900],

    // Secondary colors
    '--secondary-50': theme.secondary[50],
    '--secondary-100': theme.secondary[100],
    '--secondary-200': theme.secondary[200],
    '--secondary-300': theme.secondary[300],
    '--secondary-400': theme.secondary[400],
    '--secondary-500': theme.secondary[500],
    '--secondary-600': theme.secondary[600],
    '--secondary-700': theme.secondary[700],
    '--secondary-800': theme.secondary[800],
    '--secondary-900': theme.secondary[900],

    // Semantic colors
    '--success-light': theme.success.light,
    '--success-main': theme.success.main,
    '--success-dark': theme.success.dark,
    '--success-bg': theme.success.bg,

    '--warning-light': theme.warning.light,
    '--warning-main': theme.warning.main,
    '--warning-dark': theme.warning.dark,
    '--warning-bg': theme.warning.bg,

    '--error-light': theme.error.light,
    '--error-main': theme.error.main,
    '--error-dark': theme.error.dark,
    '--error-bg': theme.error.bg,

    '--info-light': theme.info.light,
    '--info-main': theme.info.main,
    '--info-dark': theme.info.dark,
    '--info-bg': theme.info.bg,

    // Gray colors
    '--gray-50': theme.gray[50],
    '--gray-100': theme.gray[100],
    '--gray-200': theme.gray[200],
    '--gray-300': theme.gray[300],
    '--gray-400': theme.gray[400],
    '--gray-500': theme.gray[500],
    '--gray-600': theme.gray[600],
    '--gray-700': theme.gray[700],
    '--gray-800': theme.gray[800],
    '--gray-900': theme.gray[900],
    '--gray-950': theme.gray[950],

    // Background colors
    '--bg-default': theme.background.default,
    '--bg-paper': theme.background.paper,
    '--bg-canvas': theme.background.canvas,
    '--bg-elevated': theme.background.elevated,

    // Surface colors
    '--surface-default': theme.surface.default,
    '--surface-hover': theme.surface.hover,
    '--surface-active': theme.surface.active,
    '--surface-focus': theme.surface.focus,

    // Border colors
    '--border-default': theme.border.default,
    '--border-hover': theme.border.hover,
    '--border-focus': theme.border.focus,
    '--border-error': theme.border.error,

    // Text colors
    '--text-primary': theme.text.primary,
    '--text-secondary': theme.text.secondary,
    '--text-tertiary': theme.text.tertiary,
    '--text-disabled': theme.text.disabled,
    '--text-inverse': theme.text.inverse,

    // Shadow colors
    '--shadow-sm': theme.shadow.sm,
    '--shadow-md': theme.shadow.md,
    '--shadow-lg': theme.shadow.lg,
    '--shadow-xl': theme.shadow.xl,

    // Diagram colors
    '--diagram-node-bg': theme.diagram.nodeBackground,
    '--diagram-node-border': theme.diagram.nodeBorder,
    '--diagram-node-selected': theme.diagram.nodeSelected,
    '--diagram-edge': theme.diagram.edge,
    '--diagram-edge-selected': theme.diagram.edgeSelected,
    '--diagram-port': theme.diagram.port,
    '--diagram-port-hover': theme.diagram.portHover,
    '--diagram-grid': theme.diagram.grid,
    '--diagram-grid-major': theme.diagram.gridMajor,

    // Editor colors
    '--editor-bg': theme.editor.background,
    '--editor-fg': theme.editor.foreground,
    '--editor-line-numbers': theme.editor.lineNumbers,
    '--editor-selection': theme.editor.selection,
    '--editor-active-line': theme.editor.activeLine,
  };
}
