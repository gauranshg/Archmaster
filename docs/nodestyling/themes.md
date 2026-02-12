# Theme System

Complete guide to the theme system, including built-in themes, theme customization, and CSS variables.

## Table of Contents

- [Overview](#overview)
- [Built-in Themes](#built-in-themes)
- [Theme Structure](#theme-structure)
- [Using Themes](#using-themes)
- [Custom Themes](#custom-themes)
- [CSS Variables](#css-variables)
- [Theme Switching](#theme-switching)

---

## Overview

The theme system provides consistent styling across the application with 5 built-in themes and full support for custom themes.

### Key Features

- ✅ **5 Built-in Themes**: Light, Dark, Blue, Green, High-Contrast
- ✅ **CSS Variables**: All theme colors as CSS custom properties
- ✅ **Type-Safe**: Full TypeScript support
- ✅ **Reactive**: Theme changes apply immediately
- ✅ **Persistent**: Theme preference saved to localStorage
- ✅ **Extensible**: Easy to create custom themes

### Theme Architecture

```
Theme Selection (User)
       ↓
   Theme Provider (React Context)
       ↓
   CSS Variables (CSS Custom Properties)
       ↓
   Component Styling (var(--theme-*))
       ↓
   Rendered Application
```

---

## Built-in Themes

### 1. Light Theme

**ID**: `light`
**Name**: Light Mode
**Icon**: ☀️
**Description**: Clean, modern light theme

**Color Palette**:

```typescript
{
  // Background colors
  background: '#ffffff',
  surface: '#f9fafb',
  canvas: '#ffffff',

  // Text colors
  text: '#1f2937',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',

  // Primary colors
  primary: '#3b82f6',
  primaryLight: '#eff6ff',
  primaryDark: '#2563eb',

  // Border colors
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  borderDark: '#d1d5db',

  // Node colors
  nodeBackground: '#ffffff',
  nodeBorder: '#e5e7eb',
  nodeSelected: '#3b82f6',
  nodeText: '#1f2937',

  // Edge colors
  edge: '#94a3b8',
  edgeSelected: '#3b82f6',
  edgeText: '#6b7280',

  // Port colors
  port: '#6b7280',
  portHover: '#3b82f6',

  // Grid
  grid: '#e5e7eb',

  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6'
}
```

### 2. Dark Theme

**ID**: `dark`
**Name**: Dark Mode
**Icon**: 🌙
**Description**: Easy on the eyes for low-light environments

**Color Palette**:

```typescript
{
  background: '#111827',
  surface: '#1f2937',
  canvas: '#111827',

  text: '#f9fafb',
  textSecondary: '#d1d5db',
  textMuted: '#9ca3af',

  primary: '#3b82f6',
  primaryLight: '#1e3a8a',
  primaryDark: '#60a5fa',

  border: '#374151',
  borderLight: '#4b5563',
  borderDark: '#1f2937',

  nodeBackground: '#1f2937',
  nodeBorder: '#374151',
  nodeSelected: '#3b82f6',
  nodeText: '#f9fafb',

  edge: '#6b7280',
  edgeSelected: '#60a5fa',
  edgeText: '#9ca3af',

  port: '#6b7280',
  portHover: '#3b82f6',

  grid: '#374151',

  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6'
}
```

### 3. Blue Theme

**ID**: `blue`
**Name**: Ocean Blue
**Icon**: 🌊
**Description**: Calming blue tones for focus

**Color Palette**:

```typescript
{
  background: '#eff6ff',
  surface: '#dbeafe',
  canvas: '#eff6ff',

  text: '#1e3a8a',
  textSecondary: '#3b82f6',
  textMuted: '#60a5fa',

  primary: '#2563eb',
  primaryLight: '#93c5fd',
  primaryDark: '#1d4ed8',

  border: '#bfdbfe',
  borderLight: '#dbeafe',
  borderDark: '#93c5fd',

  nodeBackground: '#ffffff',
  nodeBorder: '#3b82f6',
  nodeSelected: '#1d4ed8',
  nodeText: '#1e3a8a',

  edge: '#60a5fa',
  edgeSelected: '#1d4ed8',
  edgeText: '#3b82f6',

  port: '#3b82f6',
  portHover: '#1d4ed8',

  grid: '#bfdbfe',

  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  info: '#2563eb'
}
```

### 4. Green Theme

**ID**: `green`
**Name**: Forest Green
**Icon**: 🌲
**Description**: Natural green tones for clarity

**Color Palette**:

```typescript
{
  background: '#f0fdf4',
  surface: '#dcfce7',
  canvas: '#f0fdf4',

  text: '#14532d',
  textSecondary: '#166534',
  textMuted: '#15803d',

  primary: '#059669',
  primaryLight: '#86efac',
  primaryDark: '#047857',

  border: '#bbf7d0',
  borderLight: '#dcfce7',
  borderDark: '#86efac',

  nodeBackground: '#ffffff',
  nodeBorder: '#059669',
  nodeSelected: '#047857',
  nodeText: '#14532d',

  edge: '#22c55e',
  edgeSelected: '#047857',
  edgeText: '#166534',

  port: '#059669',
  portHover: '#047857',

  grid: '#bbf7d0',

  success: '#047857',
  warning: '#ca8a04',
  error: '#b91c1c',
  info: '#059669'
}
```

### 5. High-Contrast Theme

**ID**: `high-contrast`
**Name**: High Contrast
**Icon**: ⚫
**Description**: Maximum contrast for accessibility

**Color Palette**:

```typescript
{
  background: '#ffffff',
  surface: '#ffffff',
  canvas: '#ffffff',

  text: '#000000',
  textSecondary: '#000000',
  textMuted: '#333333',

  primary: '#000000',
  primaryLight: '#cccccc',
  primaryDark: '#000000',

  border: '#000000',
  borderLight: '#666666',
  borderDark: '#000000',

  nodeBackground: '#ffffff',
  nodeBorder: '#000000',
  nodeSelected: '#000000',
  nodeText: '#000000',

  edge: '#000000',
  edgeSelected: '#000000',
  edgeText: '#000000',

  port: '#000000',
  portHover: '#000000',

  grid: '#cccccc',

  success: '#000000',
  warning: '#000000',
  error: '#000000',
  info: '#000000'
}
```

---

## Theme Structure

### TypeScript Interface

**File**: `frontend/src/styles/themes.ts` (965 lines)

```typescript
interface ThemeColors {
  // Background
  background: string;
  surface: string;
  canvas: string;

  // Text
  text: string;
  textSecondary: string;
  textMuted: string;

  // Primary
  primary: string;
  primaryLight: string;
  primaryDark: string;

  // Border
  border: string;
  borderLight: string;
  borderDark: string;

  // Node
  nodeBackground: string;
  nodeBorder: string;
  nodeSelected: string;
  nodeText: string;

  // Edge
  edge: string;
  edgeSelected: string;
  edgeText: string;

  // Port
  port: string;
  portHover: string;

  // Grid
  grid: string;

  // Status
  success: string;
  warning: string;
  error: string;
  info: string;
}

interface Theme {
  id: string;
  name: string;
  description: string;
  icon: string;
  colors: ThemeColors;
}
```

### Theme Metadata

```typescript
interface ThemeMetadata {
  id: string;
  name: string;
  description: string;
  icon: string;
  isDefault?: boolean;
}
```

---

## Using Themes

### Theme Provider

Wrap your application with the ThemeProvider:

```typescript
import { ThemeProvider } from '@/contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}
```

### Accessing Theme

Using the `useTheme` hook:

```typescript
import { useTheme } from '@/hooks/useTheme';

function MyComponent() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div>
      <select value={theme.id} onChange={(e) => setTheme(e.target.value)}>
        {themes.map((t) => (
          <option key={t.id} value={t.id}>
            {t.icon} {t.name}
          </option>
        ))}
      </select>
    </div>
  );
}
```

### Theme Persistence

Theme preference is automatically persisted:

```typescript
// Saved to localStorage
localStorage.setItem('theme', 'dark');

// Loaded on app start
const savedTheme = localStorage.getItem('theme') || 'light';
```

---

## CSS Variables

### Variable Naming Convention

```css
/* Format: --{category}-{property}-{variant} */
--diagram-node-background;
--diagram-node-border;
--diagram-node-text;

--diagram-edge-default;
--diagram-edge-selected;

--diagram-port-default;
--diagram-port-hover;
```

### Using CSS Variables

```css
/* In components */
.my-node {
  background: var(--diagram-node-background);
  border: 1px solid var(--diagram-node-border);
  color: var(--diagram-node-text);
}

.my-node:hover {
  border-color: var(--diagram-node-selected);
}

.my-node.selected {
  background: var(--diagram-node-selected);
  color: #ffffff;
}
```

### Complete Variable List

```css
:root {
  /* Backgrounds */
  --diagram-background: #ffffff;
  --diagram-surface: #f9fafb;
  --diagram-canvas: #ffffff;

  /* Text */
  --diagram-text: #1f2937;
  --diagram-text-secondary: #6b7280;
  --diagram-text-muted: #9ca3af;

  /* Primary */
  --diagram-primary: #3b82f6;
  --diagram-primary-light: #eff6ff;
  --diagram-primary-dark: #2563eb;

  /* Borders */
  --diagram-border: #e5e7eb;
  --diagram-border-light: #f3f4f6;
  --diagram-border-dark: #d1d5db;

  /* Node */
  --diagram-node-background: #ffffff;
  --diagram-node-border: #e5e7eb;
  --diagram-node-selected: #3b82f6;
  --diagram-node-text: #1f2937;

  /* Edge */
  --diagram-edge: #94a3b8;
  --diagram-edge-selected: #3b82f6;
  --diagram-edge-text: #6b7280;

  /* Port */
  --diagram-port: #6b7280;
  --diagram-port-hover: #3b82f6;

  /* Grid */
  --diagram-grid: #e5e7eb;

  /* Status */
  --diagram-success: #10b981;
  --diagram-warning: #f59e0b;
  --diagram-error: #ef4444;
  --diagram-info: #3b82f6;
}
```

---

## Custom Themes

### Creating a Custom Theme

1. **Define theme colors**:

```typescript
const customTheme: Theme = {
  id: 'my-custom-theme',
  name: 'My Custom Theme',
  description: 'A theme with custom colors',
  icon: '🎨',
  colors: {
    background: '#f0f9ff',
    surface: '#e0f2fe',
    canvas: '#f0f9ff',

    text: '#0c4a6e',
    textSecondary: '#0369a1',
    textMuted: '#075985',

    primary: '#0284c7',
    primaryLight: '#7dd3fc',
    primaryDark: '#0c4a6e',

    border: '#bae6fd',
    borderLight: '#e0f2fe',
    borderDark: '#7dd3fc',

    nodeBackground: '#ffffff',
    nodeBorder: '#0284c7',
    nodeSelected: '#0c4a6e',
    nodeText: '#0c4a6e',

    edge: '#38bdf8',
    edgeSelected: '#0284c7',
    edgeText: '#0369a1',

    port: '#0284c7',
    portHover: '#0369a1',

    grid: '#bae6fd',

    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    info: '#0284c7'
  }
};
```

2. **Register the theme**:

```typescript
import { themes } from '@/styles/themes';

themes.push(customTheme);
```

3. **Use the theme**:

```typescript
setTheme('my-custom-theme');
```

### Theme Generator

Helper function to generate themes:

```typescript
function generateTheme(
  baseColor: string,
  name: string,
  icon: string
): Theme {
  // Generate color variations
  const primary = baseColor;
  const primaryLight = lighten(baseColor, 20);
  const primaryDark = darken(baseColor, 20);

  // Generate complementary colors
  const background = adjustColor(primary, { lightness: 98 });
  const surface = adjustColor(primary, { lightness: 94 });
  const border = adjustColor(primary, { lightness: 80 });

  return {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    description: `Custom ${name} theme`,
    icon,
    colors: {
      background,
      surface,
      canvas: background,

      text: getContrastColor(background),
      textSecondary: adjustColor(background, { lightness: -20 }),
      textMuted: adjustColor(background, { lightness: -40 }),

      primary,
      primaryLight,
      primaryDark,

      border,
      borderLight: adjustColor(border, { lightness: 10 }),
      borderDark: adjustColor(border, { lightness: -10 }),

      nodeBackground: '#ffffff',
      nodeBorder: primary,
      nodeSelected: primaryDark,
      nodeText: getContrastColor('#ffffff'),

      edge: primaryLight,
      edgeSelected: primary,
      edgeText: adjustColor(primaryLight, { lightness: -20 }),

      port: primary,
      portHover: primaryDark,

      grid: border,

      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: primary
    }
  };
}

// Usage
const purpleTheme = generateTheme('#8b5cf6', 'Purple', '💜');
const tealTheme = generateTheme('#14b8a6', 'Teal', '🩵');
```

---

## Theme Switching

### Switching Themes

```typescript
const { setTheme } = useTheme();

// Switch to dark theme
setTheme('dark');

// Switch to custom theme
setTheme('my-custom-theme');
```

### Theme Transition

Theme changes include smooth transitions:

```css
/* Smooth theme transitions */
* {
  transition: background-color 200ms cubic-bezier(0.4, 0, 0.2, 1),
              color 200ms cubic-bezier(0.4, 0, 0.2, 1),
              border-color 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### System Theme Detection

Automatically detect system theme preference:

```typescript
function getSystemTheme(): 'light' | 'dark' {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', (e) => {
    const newTheme = e.matches ? 'dark' : 'light';
    setTheme(newTheme);
  });
```

---

## Theme CSS Variables

### Converting Theme to CSS

```typescript
function themeToCSSVariables(theme: Theme): string {
  const cssVars: string[] = [];

  Object.entries(theme.colors).forEach(([key, value]) => {
    const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    cssVars.push(`--diagram-${cssVarName}: ${value};`);
  });

  return `
:root {
  ${cssVars.join('\n')}
}
`;
}
```

### Applying CSS Variables

```typescript
function applyTheme(theme: Theme) {
  // Convert theme to CSS variables
  const cssVars = themeToCSSVariables(theme);

  // Create or update style element
  let styleElement = document.getElementById('theme-variables');
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'theme-variables';
    document.head.appendChild(styleElement);
  }

  styleElement.textContent = cssVars;
}
```

---

## Best Practices

### 1. Use Semantic Color Names

```typescript
// Good - Semantic
colors: {
  nodeBackground: '#ffffff',
  nodeBorder: '#e5e7eb',
  nodeText: '#1f2937'
}

// Avoid - Generic
colors: {
  color1: '#ffffff',
  color2: '#e5e7eb',
  color3: '#1f2937'
}
```

### 2. Ensure Contrast Ratios

```typescript
// Ensure text is readable
function getContrastColor(background: string): string {
  const luminance = getLuminance(background);
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

// Good contrast ratio (>= 4.5:1)
{
  background: '#ffffff',
  text: '#1f2937',  // Contrast ratio: 12.6:1 ✓
}

// Poor contrast ratio
{
  background: '#ffffff',
  text: '#e5e7eb',  // Contrast ratio: 1.2:1 ✗
}
```

### 3. Test Color Blindness

```typescript
// Simulate color blindness
function simulateColorBlindness(hex: string, type: 'protanopia' | 'deuteranopia' | 'tritanopia'): string {
  // Color blindness simulation matrices
  const matrices = {
    protanopia: [
      [0.567, 0.433, 0],
    [0.558, 0.442, 0],
    [0, 0.242, 0.758]
  ],
    // ... other matrices
  };

  const rgb = hexToRgb(hex);
  const matrix = matrices[type];

  return rgbToHex(
    rgb[0] * matrix[0][0] + rgb[1] * matrix[0][1] + rgb[2] * matrix[0][2],
    rgb[0] * matrix[1][0] + rgb[1] * matrix[1][1] + rgb[2] * matrix[1][2],
    rgb[0] * matrix[2][0] + rgb[1] * matrix[2][1] + rgb[2] * matrix[2][2]
  );
}
```

### 4. Document Theme Colors

```typescript
interface Theme {
  id: string;
  name: string;
  description: string;
  icon: string;
  colors: ThemeColors;

  // Add documentation
  documentation?: {
    designer: string;
    version: string;
    created: string;
    inspiration?: string[];
    accessibility: {
      contrastRatio: {
        normal: number;
        large: number;
      };
      colorBlindness: {
        protanopia: 'pass' | 'fail';
        deuteranopia: 'pass' | 'fail';
        tritanopia: 'pass' | 'fail';
      };
    };
  };
}
```

---

## Theme Browser Support

### Fallback for Older Browsers

```css
/* Fallback for browsers without CSS variable support */
.my-node {
  background: #ffffff; /* Fallback */
  background: var(--diagram-node-background);
}
```

### Progressive Enhancement

```css
/* Base styles */
.my-node {
  background: #ffffff;
  border: 1px solid #e5e7eb;
}

/* Enhanced with CSS variables */
.my-node {
  background: var(--diagram-node-background);
  border-color: var(--diagram-node-border);
}

/* Enhanced with CSS variables and fallback */
@supports (--css: variables) {
  .my-node {
    background: var(--diagram-node-background);
    border-color: var(--diagram-node-border);
  }
}
```

---

## Troubleshooting

### Theme Not Applying

**Problem**: Theme changes don't affect components

**Solutions**:
1. Check if ThemeProvider wraps app
2. Verify CSS variables are set
3. Check browser DevTools for CSS variable values
4. Ensure component uses CSS variables

### Colors Look Wrong

**Problem**: Colors don't match theme definition

**Solutions**:
1. Check CSS variable usage: `var(--diagram-*)`
2. Verify theme is loaded correctly
3. Check for CSS specificity issues
4. Clear browser cache

### Performance Issues

**Problem**: Theme switching is slow

**Solutions**:
1. Reduce number of CSS variables
2. Optimize transition durations
3. Use `will-change` sparingly
4. Profile with browser DevTools

---

## See Also

- [Overview](./overview.md) - Styling system overview
- [Node Types](./node-types.md) - Node component reference
- [CSS System](./css-system.md) - CSS service and security
- [Custom Styling](./custom-styling.md) - Advanced techniques
