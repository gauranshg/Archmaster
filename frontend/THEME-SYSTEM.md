# Theme System Documentation

## Overview

The Custom Architecture Platform includes a comprehensive theme system that supports multiple color schemes with smooth transitions and persistent preferences.

## Features

- **5 Built-in Themes**: Light, Dark, Blue, Green, and High Contrast
- **System Preference Detection**: Automatically detects OS theme preference
- **Persistent Storage**: Saves theme choice in localStorage
- **Smooth Transitions**: Animated color changes between themes
- **Accessibility**: WCAG AA compliant contrast ratios
- **Keyboard Shortcuts**: Quick theme toggling with Ctrl+Shift+T
- **CSS Variables**: Dynamic theming via CSS custom properties

## Architecture

### Files Structure

```
frontend/src/
├── contexts/
│   └── ThemeContext.tsx      # React context provider
├── hooks/
│   └── useTheme.ts           # Theme hook
├── components/
│   └── common/
│       └── ThemeToggle.tsx   # Theme switcher component
├── styles/
│   ├── themes.ts             # Theme definitions
│   └── theme.css             # CSS variables
└── types/
    └── common.ts             # Theme type definition
```

### Theme Definitions

All themes are defined in `frontend/src/styles/themes.ts` with comprehensive color tokens:

```typescript
interface ThemeColors {
  primary: { 50-900 };
  secondary: { 50-900 };
  success, warning, error, info;
  gray: { 50-950 };
  background: { default, paper, canvas, elevated };
  surface: { default, hover, active, focus };
  border: { default, hover, focus, error };
  text: { primary, secondary, tertiary, disabled, inverse };
  shadow: { sm, md, lg, xl };
  diagram: { nodeBackground, nodeBorder, edge, ... };
  editor: { background, foreground, lineNumbers, ... };
}
```

## Usage

### 1. Wrap App with ThemeProvider

```tsx
import { ThemeProvider } from '@/contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

### 2. Use Theme in Components

```tsx
import { useTheme } from '@/hooks/useTheme';

function MyComponent() {
  const { theme, setTheme, toggleTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle</button>
      <button onClick={() => setTheme('dark')}>Dark Mode</button>
    </div>
  );
}
```

### 3. Add Theme Toggle Button

```tsx
import { ThemeToggle } from '@/components/common';

function Navigation() {
  return (
    <nav>
      <ThemeToggle />
    </nav>
  );
}
```

### 4. Use CSS Variables in Styles

```css
.my-component {
  background-color: var(--bg-default);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
}

.my-component:hover {
  background-color: var(--surface-hover);
  border-color: var(--border-hover);
}
```

### 5. Use Tailwind with CSS Variables

```tsx
<div className="bg-background-default text-text-primary border-border-default">
  Content
</div>
```

## Available Themes

### Light Theme (Default)
Clean, modern interface with blue accents.
- Best for: Well-lit environments, general use
- Background: White (#ffffff)
- Text: Dark gray (#111827)

### Dark Theme
Professional dark mode with reduced eye strain.
- Best for: Low-light environments, extended use
- Background: Dark blue-gray (#0f172a)
- Text: Off-white (#f9fafb)

### Blue Theme
Professional blue-themed interface.
- Best for: Corporate environments, business contexts
- Background: Light blue (#f0f9ff)
- Accents: Blue throughout

### Green Theme
Natural green-themed interface.
- Best for: Nature-inspired designs, environmental contexts
- Background: Light green (#f0fdf4)
- Accents: Green throughout

### High Contrast Theme
Maximum contrast for accessibility.
- Best for: Accessibility needs, high-visibility requirements
- Background: White (#ffffff)
- Text: Pure black (#000000)
- Borders: 2px for better visibility

## Keyboard Shortcuts

- **Ctrl+Shift+T**: Toggle between light and dark themes

## System Preference Detection

On first visit, the theme system can automatically detect and apply the user's OS theme preference:

```tsx
<ThemeProvider useSystem>
  {/* Will use system preference */}
</ThemeProvider>
```

Users can override this by manually selecting a theme.

## Theme Persistence

Theme preferences are automatically saved to localStorage and restored on subsequent visits:

- **Storage Key**: `arch-platform-theme`
- **Stored Value**: Theme name (e.g., 'light', 'dark', 'blue')
- **Fallback**: Light theme if no preference stored

## CSS Variables Reference

### Primary Colors
```css
--primary-50 through --primary-900
```

### Semantic Colors
```css
--success-main, --warning-main, --error-main, --info-main
--success-bg, --warning-bg, --error-bg, --info-bg
```

### Backgrounds
```css
--bg-default      /* Main background */
--bg-paper        /* Card/paper background */
--bg-canvas       /* Canvas/workspace background */
--bg-elevated     /* Elevated surfaces */
```

### Text
```css
--text-primary    /* Main text */
--text-secondary  /* Secondary text */
--text-tertiary   // Tertiary text */
--text-disabled   /* Disabled text */
--text-inverse    /* Inverse text */
```

### Borders
```css
--border-default  /* Default border */
--border-hover    /* Hover state */
--border-focus    /* Focus state */
--border-error    /* Error state */
```

## Creating Custom Themes

To add a new theme:

1. **Define theme colors** in `src/styles/themes.ts`:

```typescript
export const customTheme: ThemeColors = {
  primary: { /* ... */ },
  secondary: { /* ... */ },
  // ... all required color tokens
};
```

2. **Add to Theme type** in `src/types/common.ts`:

```typescript
export type Theme = 'light' | 'dark' | 'blue' | 'green' | 'high-contrast' | 'custom';
```

3. **Register theme** in `src/styles/themes.ts`:

```typescript
export const themes: Record<Theme, ThemeColors> = {
  light: lightTheme,
  dark: darkTheme,
  // ... existing themes
  custom: customTheme,
};
```

4. **Add metadata**:

```typescript
export const themeMetadata: Record<Theme, { name: string; description: string; icon: string }> = {
  // ... existing themes
  custom: {
    name: 'Custom',
    description: 'My custom theme',
    icon: '🎨',
  },
};
```

5. **Add to available themes** in `ThemeContext.tsx`:

```typescript
const availableThemes: readonly Theme[] = [
  'light', 'dark', 'blue', 'green', 'high-contrast', 'custom'
] as const;
```

6. **Add to dropdown options** in `ThemeToggle.tsx`:

```typescript
const THEME_OPTIONS: ThemeOption[] = [
  // ... existing options
  {
    value: 'custom',
    label: 'Custom',
    icon: '🎨',
    description: 'My custom theme',
  },
];
```

## Tailwind Integration

The theme system is integrated with Tailwind CSS using CSS variables:

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          // ... etc
        },
        // ... other color mappings
      },
    },
  },
};
```

This allows you to use Tailwind classes that respect the current theme:

```tsx
<button className="bg-primary-500 hover:bg-primary-600 text-white">
  Click me
</button>
```

## Accessibility

All themes are designed with WCAG AA compliance:

- **Contrast Ratio**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Focus Indicators**: Visible focus states on all interactive elements
- **Color Independence**: Information not conveyed by color alone
- **High Contrast Mode**: Special theme with maximum contrast

## Performance

- **CSS Variables**: Efficient browser-level color updates
- **Smooth Transitions**: 200ms animated color changes
- **No Flash**: Theme applied before paint to prevent flicker
- **Minimal JavaScript**: Theme logic runs once on mount

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Theme not applying
- Ensure `ThemeProvider` wraps your app
- Check browser console for errors
- Verify CSS variables are set on `:root`

### Transitions not working
- Check if `.theme-loaded` class is present on body
- Ensure `transition-duration` is not 0
- Verify browser supports CSS transitions

### localStorage not working
- Check browser localStorage support
- Ensure cookies are not blocked
- Verify storage quota not exceeded

## Best Practices

1. **Always use CSS variables** instead of hardcoded colors
2. **Test in all themes** when adding new components
3. **Respect user preference** - don't override without good reason
4. **Provide theme toggle** in accessible location
5. **Document custom colors** in component comments

## Future Enhancements

Potential improvements for the theme system:

- [ ] Custom theme builder UI
- [ ] Theme import/export
- [ ] Per-diagram themes
- [ ] Automatic theme scheduling (time-based)
- [ ] Theme marketplace
- [ ] Colorblind-friendly themes
- [ ] Print-optimized themes
