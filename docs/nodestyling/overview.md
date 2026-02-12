# Node Styling Overview

## Introduction

The Custom Architecture Platform provides a powerful and flexible node styling system that allows for complete customization of diagram node appearance. This documentation covers all aspects of node styling, from basic styling properties to advanced templating.

## Styling Architecture

The node styling system is built on multiple layers:

```
┌─────────────────────────────────────────┐
│   Jinja Template Layer (HTML Content)   │
├─────────────────────────────────────────┤
│      Inline Styles (Dynamic Props)       │
├─────────────────────────────────────────┤
│   CSS Classes (cssClass/cssId)          │
├─────────────────────────────────────────┤
│    Per-Diagram Custom CSS (Scoped)       │
├─────────────────────────────────────────┤
│      Global Theme (CSS Variables)        │
└─────────────────────────────────────────┘
```

## Quick Start

### Basic Node Styling

```typescript
// Create a styled node
const node: Node = {
  id: 'node-1',
  type: 'custom',
  position: { x: 100, y: 100 },
  data: {
    label: 'My Node',
    cssClass: 'my-custom-class',  // Custom CSS class
    cssId: 'node-1',             // Custom CSS ID
  },
  style: {
    backgroundColor: '#ffffff',
    borderColor: '#3b82f6',
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
  }
};
```

### Using Jinja Templates

```typescript
const nodeWithTemplate: Node = {
  id: 'node-2',
  type: 'c4Person',
  position: { x: 200, y: 100 },
  data: {
    label: 'User',
    description: 'Application user',
    properties: {
      role: 'Admin',
      department: 'Engineering'
    },
    jinjaTemplate: `
      <div style="text-align: center; padding: 12px;">
        <div style="font-size: 28px;">👤</div>
        <div style="font-weight: 600;">{{ label }}</div>
        {% if description %}
        <div style="font-size: 12px; color: #6b7280;">{{ description }}</div>
        {% endif %}
        {% if properties %}
        <div style="margin-top: 8px; font-size: 11px; color: #9ca3af;">
          {% for key, value in properties.items() %}
          <div>{{ key }}: {{ value }}</div>
          {% endfor %}
        </div>
        {% endif %}
      </div>
    `
  }
};
```

## Styling Methods

### 1. Inline Styles

Direct style properties on the node:

```typescript
style: {
  backgroundColor: '#ffffff',
  borderColor: '#3b82f6',
  borderWidth: 2,
  borderRadius: 8,
  padding: 12,
  fontSize: 14,
  color: '#1f2937',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
}
```

**Pros**: Simple, type-safe, reactive
**Cons**: Limited to CSS-in-JS properties

### 2. CSS Classes & IDs

Apply custom CSS classes and IDs:

```typescript
data: {
  cssClass: 'custom-node highlighted',  // Sanitized automatically
  cssId: 'unique-node-id',             // Sanitized automatically
}
```

Then in your CSS:

```css
.custom-node {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
}

.highlighted {
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
}

#unique-node-id {
  animation: pulse 2s infinite;
}
```

**Pros**: Full CSS power, reusable, animations
**Cons**: Requires CSS scoping for diagrams

### 3. Per-Diagram Custom CSS

Add diagram-specific CSS through the Style Editor:

```typescript
const diagram: Diagram = {
  id: 'diagram-1',
  customCSS: `
    .my-node {
      background: linear-gradient(to right, #ff7e5f, #feb47b);
      border-radius: 12px;
      padding: 16px;
    }

    .my-node:hover {
      transform: scale(1.05);
      transition: transform 0.2s ease;
    }
  `
}
```

**Pros**: Scoped to diagram, validated for security, full CSS
**Cons**: Diagram-specific only

### 4. Jinja Templates

Dynamic HTML rendering with template variables:

```typescript
data: {
  jinjaTemplate: `
    <div class="custom-card" data-node-type="{{ type }}">
      {% if icon %}
      <div class="icon">{{ icon }}</div>
      {% endif %}
      <h3>{{ label | title }}</h3>
      {% if description %}
      <p>{{ description }}</p>
      {% endif %}
      {% if properties.status %}
      <div class="badge {{ properties.status }}">
        Status: {{ properties.status | upper }}
      </div>
      {% endif %}
    </div>
  `
}
```

**Pros**: Dynamic content, conditional rendering, loops, filters
**Cons**: Requires learning Jinja syntax

## Available Style Properties

### NodeStyle Properties

All standard CSS properties are supported:

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

  // Custom properties
  customCSS?: Record<string, string>;
}
```

### CSS Scoping

CSS is automatically scoped to prevent leakage:

```typescript
// Diagram CSS is scoped with a unique ID
const scopedCSS = cssService.scopeCSS(
  customCSS,
  'diagram-abc123'  // Diagram ID
);
```

Result:

```css
/* Original */
.my-node { background: red; }

/* Scoped */
#diagram-abc123 .my-node { background: red; }
```

## Security

### HTML Sanitization

All HTML content is sanitized using DOMPurify:

```typescript
// Allowed tags
ALLOWED_TAGS = [
  'div', 'span', 'p', 'strong', 'em', 'u', 'b', 'i',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'img', 'a', 'br', 'hr',
  'code', 'pre', 'blockquote', 'table', 'tr', 'td', 'th'
];

// Allowed attributes
ALLOWED_ATTR = [
  'class', 'style', 'title', 'href', 'src', 'alt',
  'id', 'target', 'rel', 'colspan', 'rowspan'
];
```

### CSS Validation

Custom CSS is validated for security:

```typescript
// Dangerous patterns blocked
- javascript: URLs
- expression() functions
- @import statements
- -o-link JavaScript
- Data URLs with JavaScript
```

## Color System

### C4 Model Colors

| Node Type | Primary Color | Selected | External |
|-----------|-------------|----------|----------|
| Person | #0891b2 (Cyan) | #3b82f6 | #94a3b8 |
| Software System | #1d4ed8 (Blue) | #3b82f6 | #94a3b8 |
| Container | #059669 (Green) | #3b82f6 | #94a3b8 |
| Component | #7c3aed (Purple) | #3b82f6 | - |
| Database | #ca8a04 (Yellow) | #3b82f6 | #94a3b8 |
| Queue | #f5a623 (Orange) | #3b82f6 | #94a3b8 |

### Semantic Colors

```typescript
const colors = {
  // Success
  success: '#10b981',
  successLight: '#ecfdf5',

  // Warning
  warning: '#f59e0b',
  warningLight: '#fffbeb',

  // Error
  error: '#ef4444',
  errorLight: '#fef2f2',

  // Info
  info: '#3b82f6',
  infoLight: '#eff6ff'
};
```

## Best Practices

### 1. Use Semantic Styling

```typescript
// Good - Semantic
const node = {
  data: {
    cssClass: 'database-primary'
  }
};

// Avoid - Hardcoded values
const node = {
  style: {
    backgroundColor: '#ffff00',
    borderColor: '#000000'
  }
};
```

### 2. Leverage Templates

```typescript
// Good - Reusable template
const template: Template = {
  id: 'database-template',
  name: 'Primary Database',
  category: 'database',
  data: {
    jinjaTemplate: defaultDatabaseTemplate
  }
};

// Avoid - Repetitive styling
const node1 = { style: { /* 20 lines of styles */ } };
const node2 = { style: { /* same 20 lines */ } };
```

### 3. Organize CSS

```css
/* Good - Organized by concern */
/* Structure */
.node-container { }

/* Typography */
.node-label { }
.node-description { }

/* States */
.node.selected { }
.node.external { }

/* Variants */
.node.database { }
.node.service { }
```

### 4. Use Theme Variables

```css
/* Good - Theme-aware */
.my-node {
  background: var(--diagram-node-background);
  border-color: var(--diagram-node-border);
  color: var(--diagram-node-text);
}

/* Avoid - Hardcoded */
.my-node {
  background: #ffffff;
  border-color: #e5e7eb;
  color: #1f2937;
}
```

## Performance Considerations

### 1. Template Caching

Jinja templates are compiled and cached:

```typescript
// First render: Compiles template (slow)
renderJinjaTemplate(template, context); // ~50ms

// Subsequent renders: Uses cache (fast)
renderJinjaTemplate(template, context); // ~5ms
```

### 2. Style Updates

Use React Flow's built-in styling for frequent updates:

```typescript
// Good - React Flow handles updates efficiently
const [nodes, setNodes] = useState();
setNodes((nodes) =>
  nodes.map((node) =>
    node.id === selectedId
      ? { ...node, style: { ...node.style, backgroundColor: 'red' } }
      : node
  )
);

// Avoid - Re-creating nodes
const nodes = allNodes.map(node => ({
  ...node,
  style: { /* new object every time */ }
}));
```

### 3. CSS Optimization

```css
/* Good - Optimize selectors */
.my-node { }

/* Avoid - Expensive selectors */
.my-node div div span[data-type="value"] { }
```

## Troubleshooting

### Styles Not Applying

1. **Check specificity**: Ensure custom styles override defaults
2. **Verify scoping**: Check CSS is scoped to correct diagram
3. **Check syntax**: Validate CSS in Style Editor
4. **Inspect element**: Use browser DevTools

### Templates Not Rendering

1. **Check syntax**: Validate Jinja template syntax
2. **Verify variables**: Ensure context has required data
3. **Check console**: Look for rendering errors
4. **Test simple template**: Start with basic template

### Performance Issues

1. **Too many custom styles**: Use templates instead
2. **Large templates**: Break into smaller components
3. **Frequent re-renders**: Add memoization
4. **Unoptimized CSS**: Simplify selectors

## Next Steps

- [Node Types Reference](./node-types.md) - Detailed documentation for each node type
- [CSS System](./css-system.md) - CSS service and security
- [Themes](./themes.md) - Theme system and customization
- [C4 Styling](./c4-styling.md) - C4 model specific styling
- [Custom Styling](./custom-styling.md) - Advanced custom styling techniques
- [Style Properties](./style-properties.md) - Complete property reference
