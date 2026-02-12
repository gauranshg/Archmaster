# Style Properties Reference

Complete reference of all style properties available for node customization.

## Table of Contents

- [Quick Reference](#quick-reference)
- [Layout Properties](#layout-properties)
- [Visual Properties](#visual-properties)
- [Typography Properties](#typography-properties)
- [Border Properties](#border-properties)
- [Effects Properties](#effects-properties)
- [Advanced Properties](#advanced-properties)

---

## Quick Reference

### All Style Properties

```typescript
interface NodeStyle {
  // Colors
  backgroundColor?: string;
  borderColor?: string;
  color?: string;

  // Borders
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  borderRadius?: number;

  // Spacing
  padding?: number;
  margin?: number;

  // Typography
  fontSize?: number;
  fontFamily?: string;

  // Effects
  boxShadow?: string;
  opacity?: number;

  // Sizing
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;

  // Custom CSS
  customCSS?: Record<string, string>;
}
```

---

## Layout Properties

### Position & Size

```typescript
interface LayoutProperties {
  // Width
  width?: number;          // Fixed width in pixels
  minWidth?: number;       // Minimum width
  maxWidth?: number;       // Maximum width

  // Height
  height?: number;         // Fixed height in pixels
  minHeight?: number;      // Minimum height
  maxHeight?: number;      // Maximum height
}
```

**Usage**:

```typescript
const node: Node = {
  style: {
    width: 200,
    height: 100,
    minWidth: 150,
    maxWidth: 300
  }
};
```

### Spacing

```typescript
interface SpacingProperties {
  // Padding (internal spacing)
  padding?: number;         // All sides
  // Note: Individual sides not supported, use template instead

  // Margin (external spacing)
  margin?: number;          // All sides
  // Note: Individual sides not supported, use template instead
}
```

**Usage**:

```typescript
const node: Node = {
  style: {
    padding: 16,    // 16px padding on all sides
    margin: 8        // Not commonly used in diagrams
  }
};
```

**Jinja Template for Padding**:

```jinja
<!-- Different padding per side -->
<div style="
  padding-top: 12px;
  padding-right: 16px;
  padding-bottom: 12px;
  padding-left: 16px;
">
  {{ label }}
</div>
```

---

## Visual Properties

### Colors

```typescript
interface ColorProperties {
  // Background
  backgroundColor?: string;  // Hex, RGB, RGBA, or color name

  // Border
  borderColor?: string;     // Hex, RGB, RGBA, or color name

  // Text
  color?: string;            // Text color
}
```

**Color Formats**:

```typescript
// Hex colors (recommended)
backgroundColor: '#ffffff';
borderColor: '#3b82f6';
color: '#1f2937';

// RGB
backgroundColor: 'rgb(255, 255, 255)';
borderColor: 'rgb(59, 130, 246)';

// RGBA (with transparency)
backgroundColor: 'rgba(255, 255, 255, 0.8)';
borderColor: 'rgba(59, 130, 246, 0.5)';

// Color names
backgroundColor: 'white';
borderColor: 'blue';
color: 'black';

// CSS variables (theme-aware)
backgroundColor: 'var(--diagram-background)';
borderColor: 'var(--diagram-border)';
color: 'var(--diagram-text)';
```

**Color Best Practices**:

```typescript
// GOOD - Using theme variables
const styledNode: Node = {
  style: {
    backgroundColor: 'var(--diagram-node-background)',
    borderColor: 'var(--diagram-node-border)',
    color: 'var(--diagram-node-text)'
  }
};

// AVOID - Hardcoded colors
const unstyledNode: Node = {
  style: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    color: '#1f2937'
  }
};
```

---

## Typography Properties

### Font Styling

```typescript
interface TypographyProperties {
  // Font size
  fontSize?: number;         // In pixels (no units)

  // Font family
  fontFamily?: string;      // Font family name
}
```

**Font Sizes**:

```typescript
// Common sizes
const fontSizes = {
  small: 11,     // Descriptions, metadata
  normal: 13,    // Labels, titles
  large: 16,      // Headers, emphasis
  xlarge: 20      // Main headers
};

const node: Node = {
  style: {
    fontSize: 13
  }
};
```

**Font Families**:

```typescript
// System fonts (recommended)
const node: Node = {
  style: {
    fontFamily: 'system-ui, -apple-system, sans-serif'
  }
};

// Monospace
const codeNode: Node = {
  style: {
    fontFamily: 'monospace'
  }
};

// Custom font (must be loaded first)
const customNode: Node = {
  style: {
    fontFamily: 'CustomFont, sans-serif'
  }
};
```

**In Templates**:

```jinja
<div style="
  font-size: {{ style.fontSize or 13 }}px;
  font-family: {{ style.fontFamily or 'system-ui, sans-serif' }};
">
  {{ label }}
</div>
```

---

## Border Properties

### Border Styling

```typescript
interface BorderProperties {
  // Width
  borderWidth?: number;     // In pixels (no units)

  // Style
  borderStyle?: 'solid' | 'dashed' | 'dotted';

  // Corner radius
  borderRadius?: number;   // In pixels (no units)
}
```

**Border Widths**:

```typescript
const borderWidths = {
  thin: 1,
  normal: 2,
  thick: 3,
  heavy: 4
};
```

**Border Styles**:

```typescript
// Solid (default)
const solidNode: Node = {
  style: {
    borderStyle: 'solid'
  }
};

// Dashed (for external elements)
const dashedNode: Node = {
  style: {
    borderStyle: 'dashed'
  }
};

// Dotted (rarely used)
const dottedNode: Node = {
  style: {
    borderStyle: 'dotted'
  }
};
```

**Border Radius**:

```typescript
// Radius sizes
const borderRadiuses = {
  none: 0,
  small: 4,
  normal: 8,
  large: 12,
  xlarge: 16,
  circle: 50
};

// Rounded rectangle
const roundedNode: Node = {
  style: {
    borderRadius: 8
  }
};

// Fully rounded (pill/circle)
const pillNode: Node = {
  style: {
    borderRadius: 12,
    minWidth: 80
  }
};
```

---

## Effects Properties

### Box Shadow

```typescript
interface EffectsProperties {
  // Shadow
  boxShadow?: string;  // CSS box-shadow syntax
}
```

**Box Shadow Syntax**:

```css
/* Basic shadow */
box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.1);

/* Offset-x, offset-y, blur, spread, color */
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

/* Multiple shadows */
box-shadow:
  0 2px 4px rgba(0, 0, 0, 0.1),
  0 8px 16px rgba(0, 0, 0, 0.05);

/* Inset shadow */
box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);

/* Colored shadow */
box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
```

**Usage**:

```typescript
// Subtle shadow
const subtle: Node = {
  style: {
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
  }
};

// Elevation (material design)
const elevated: Node = {
  style: {
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)'
  }
};

// Selected state
const selected: Node = {
  style: {
    boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1), 0 10px 15px rgba(0, 0, 0, 0.1)'
  }
};

// Glow effect
const glow: Node = {
  style: {
    boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
  }
};
```

### Opacity

```typescript
interface EffectsProperties {
  // Opacity
  opacity?: number;         // 0.0 to 1.0
}
```

**Opacity Values**:

```typescript
const opacityLevels = {
  transparent: 0.0,
  veryLight: 0.25,
  light: 0.5,
  normal: 1.0,
  verySubtle: 0.9,
  subtle: 0.75
};

const fadedNode: Node = {
  style: {
    opacity: 0.6
  }
};
```

---

## Advanced Properties

### Custom CSS

```typescript
interface AdvancedProperties {
  // Custom CSS properties
  customCSS?: Record<string, string>;
}
```

**Usage**:

```typescript
const advancedNode: Node = {
  style: {
    customCSS: {
      // Any valid CSS property
      'background-image': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'background-size': 'cover',
      'transform': 'rotate(2deg)',
      'filter': 'blur(0.5px)',
      'animation': 'spin 10s linear infinite',
      'transition': 'all 0.3s ease'
    }
  }
};
```

**In Templates**:

```jinja
<div style="{{ style | toStyleAttr }}">
  {{ label }}
</div>
```

### CSS Class Injection

```typescript
// Use cssClass for custom classes
const node: Node = {
  data: {
    label: 'My Node',
    cssClass: 'custom-class another-class'
  }
};

// Then define CSS
const diagramCSS = `
.custom-class {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.another-class {
  border: 2px solid #764ba2;
}
`;
```

---

## Property Reference Table

| Property | Type | Default | Description | Example |
|----------|------|---------|-------------|---------|
| `backgroundColor` | `string` | `#ffffff` | Background color | `'#ffffff'` |
| `borderColor` | `string` | `#e5e7eb` | Border color | `'#3b82f6'` |
| `borderWidth` | `number` | `1` | Border width (px) | `2` |
| `borderStyle` | `'solid' \| 'dashed' \| 'dotted'` | `'solid'` | Border style | `'dashed'` |
| `borderRadius` | `number` | `0` | Border radius (px) | `8` |
| `color` | `string` | `'inherit'` | Text color | `'#1f2937'` |
| `padding` | `number` | `0` | Padding (px) | `16` |
| `margin` | `number` | `0` | Margin (px) | `8` |
| `fontSize` | `number` | `14` | Font size (px) | `13` |
| `fontFamily` | `string` | `inherit` | Font family | `'system-ui'` |
| `boxShadow` | `string` | `undefined` | Box shadow | `'0 2px 8px rgba(0,0,0,0.1)'` |
| `opacity` | `number` | `1` | Opacity (0-1) | `0.8` |
| `minWidth` | `number` | `undefined` | Min width (px) | `150` |
| `maxWidth` | `number` | `undefined` | Max width (px) | `300` |
| `minHeight` | `number` | `undefined` | Min height (px) | `80` |
| `maxHeight` | `number` | `undefined` | Max height (px) | `200` |
| `customCSS` | `Record<string, string>` | `undefined` | Custom CSS | `{ 'transform': 'rotate(2deg)' }` |

---

## Common Style Patterns

### Card Style

```typescript
const cardStyle: NodeStyle = {
  backgroundColor: '#ffffff',
  borderColor: '#e5e7eb',
  borderWidth: 1,
  borderRadius: 8,
  padding: 16,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
};
```

### Elevated Card

```typescript
const elevatedStyle: NodeStyle = {
  backgroundColor: '#ffffff',
  borderColor: '#e5e7eb',
  borderWidth: 1,
  borderRadius: 12,
  padding: 20,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)'
};
```

### Selected State

```typescript
const selectedStyle: NodeStyle = {
  backgroundColor: '#eff6ff',
  borderColor: '#3b82f6',
  borderWidth: 2,
  borderRadius: 8,
  padding: 16,
  boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1), 0 10px 15px rgba(0, 0, 0, 0.1)'
};
```

### Compact Style

```typescript
const compactStyle: NodeStyle = {
  backgroundColor: '#ffffff',
  borderColor: '#e5e7eb',
  borderWidth: 1,
  borderRadius: 6,
  padding: 8,
  fontSize: 12
};
```

### Minimal Style

```typescript
const minimalStyle: NodeStyle = {
  backgroundColor: 'transparent',
  borderColor: '#e5e7eb',
  borderWidth: 1,
  borderStyle: 'dashed',
  borderRadius: 4,
  padding: 4
};
```

---

## Style Inheritance

### Node Style Priority

Styles are applied in this order (later overrides earlier):

1. **Default** - Built-in component defaults
2. **Inline Style** - `node.style` property
3. **CSS Class** - `node.data.cssClass`
4. **CSS ID** - `node.data.cssId`
5. **Diagram CSS** - Scoped diagram CSS
6. **Jinja Template** - Inline styles in template (highest priority)

**Example**:

```typescript
// Multiple style sources
const node: Node = {
  // 1. Default: Component default style
  style: {
    borderColor: '#3b82f6',  // 2. Will be used
    padding: 16
  },
  data: {
    // 2. CSS Class: Can override style
    cssClass: 'custom-class',

    // 3. Jinja Template: Can override everything
    jinjaTemplate: `
      <div style="border-color: #ef4444; padding: 20px;">
        {{ label }}
      </div>
    `
  }
};

const diagramCSS = `
  /* 4. Diagram CSS: Scoped to diagram */
  #diagram-abc123 .custom-class {
    border-color: #10b981 !important;
  }
`;
```

### Style Inheritance in Templates

```jinja
<!-- Template can access all style properties -->
<div style="
  background: {{ style.backgroundColor }};
  border: {{ style.borderWidth }}px solid {{ style.borderColor }};
  border-radius: {{ style.borderRadius }}px;
  padding: {{ style.padding }}px;
  font-size: {{ style.fontSize }}px;
  color: {{ style.color }};
">
  {{ label }}
</div>

<!-- With fallbacks -->
<div style="
  background: {{ style.backgroundColor or '#ffffff' }};
  border: {{ style.borderWidth or 2 }}px solid {{ style.borderColor or '#e5e7eb' }};
  border-radius: {{ style.borderRadius or 8 }}px;
  padding: {{ style.padding or 12 }}px;
  font-size: {{ style.fontSize or 14 }}px;
  color: {{ style.color or '#1f2937' }};
">
  {{ label }}
</div>
```

---

## Performance Considerations

### Expensive Properties

Some style properties are more expensive than others:

```typescript
// ✅ Good - Performant
const performant: NodeStyle = {
  backgroundColor: '#ffffff',
  borderColor: '#3b82f6',
  borderWidth: 2,
  borderRadius: 8
};

// ⚠️ Use sparingly
const expensive: NodeStyle = {
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',  // Blur is expensive
  filter: 'blur(2px)',                                // Filter is expensive
  transform: 'translate3d(0, 0, 0)'                   // Creates GPU layer
};

// ❌ Avoid in diagrams
const veryExpensive: NodeStyle = {
  filter: 'blur(4px) drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
  transform: 'rotateX(45deg) rotateY(45deg)'
};
```

### Style Optimization

```typescript
// ✅ Use transitions sparingly
const smoothTransition: NodeStyle = {
  transition: 'opacity 0.2s ease, background-color 0.2s ease'
};

// ❌ Don't transition everything
const badTransition: NodeStyle = {
  transition: 'all 0.3s ease'  // Transitions all properties
};

// ✅ Use hardware acceleration for animations
const accelerated: NodeStyle = {
  transform: 'translateZ(0)',  // Force GPU layer
  willChange: 'transform'     // Hint browser
};
```

---

## See Also

- [Overview](./overview.md) - Styling system overview
- [Node Types](./node-types.md) - Node component reference
- [CSS System](./css-system.md) - CSS service and security
- [Themes](./themes.md) - Theme system
- [Custom Styling](./custom-styling.md) - Advanced techniques
