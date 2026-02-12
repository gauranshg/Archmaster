# Custom CSS Styling Feature

## Overview

The Custom CSS Styling feature allows users to apply custom CSS styles to diagram nodes, enabling complete visual customization while maintaining security through comprehensive validation and sanitization.

## Features

### 1. CSS Class and ID Support
- **CSS Class**: Apply custom CSS classes to nodes for grouped styling
- **CSS ID**: Apply unique IDs to nodes for individual styling
- **Sanitized Input**: All class names and IDs are sanitized to prevent injection

### 2. Style Editor Component
- **Live Preview**: See CSS changes in real-time
- **Syntax Validation**: Detect and report CSS errors
- **Security Checks**: Filter dangerous CSS patterns
- **Code Examples**: Insert example CSS with one click
- **Keyboard Shortcuts**: Ctrl/Cmd+S to save, Esc to close

### 3. CSS Injection System
- **Scoped Styling**: CSS is scoped to specific diagrams using `[data-diagram-id]`
- **Auto Cleanup**: Style elements are removed when diagrams are unloaded
- **CSP Support**: Content Security Policy nonce support

### 4. Security Features
- **XSS Prevention**: All CSS is validated and sanitized
- **Dangerous Pattern Detection**: Blocks javascript:, expression(), @import, etc.
- **Property Filtering**: Only allows safe CSS properties
- **Selector Validation**: Warns about overly broad selectors

## Usage

### Adding CSS Classes/IDs to Nodes

1. **Select a Node** in the diagram canvas
2. **Open Properties Panel** (right sidebar)
3. **Find "CSS Styling" section**
4. **Enter CSS Class** (e.g., `my-service-node`)
5. **Enter CSS ID** (e.g., `user-service-node`)
6. **Apply CSS** in the Style Editor

### Writing Custom CSS

1. **Open Style Editor**
   - Click the "Open Style Editor" button
   - Or use the keyboard shortcut (when implemented)

2. **Write CSS**
   ```css
   /* Target all nodes with a specific class */
   .custom-node.my-service {
     background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
     border: 2px solid #5a67d8;
     border-radius: 16px;
   }

   /* Target a specific node by ID */
   #my-database {
     background: #f0fdf4;
     border-color: #16a34a;
   }

   /* Target all nodes */
   .custom-node {
     box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
   }

   /* Hover effects */
   .custom-node:hover {
     transform: translateY(-2px);
   }
   ```

3. **Save CSS**
   - Click "Save CSS" button
   - Or press Ctrl/Cmd+S

### CSS Scoping

All CSS is automatically scoped to the diagram using `[data-diagram-id]` attributes:

**Input CSS:**
```css
.custom-node.my-service {
  background: #667eea;
}
```

**Scoped CSS:**
```css
[data-diagram-id="diagram-123"] .custom-node.my-service {
  background: #667eea;
}
```

This prevents CSS from bleeding into other diagrams or the application UI.

## Security

### Dangerous Patterns Detected

The following patterns are blocked:

- `javascript:` - JavaScript execution attempts
- `expression()` - IE CSS expressions
- `behavior:` - IE behaviors
- `@import` - External style imports
- `@charset` - Character set declarations
- `data:text/html` - Data URLs with HTML
- `data:image/svg+xml` with `<script>` - SVG with scripts

### Allowed CSS Properties

Only safe CSS properties are allowed:

**Layout**: display, position, top, right, bottom, left, z-index, float, clear, overflow
**Box Model**: width, height, min-width, max-width, min-height, max-height, padding, margin, border, border-radius
**Typography**: font, font-family, font-size, font-weight, line-height, text-align, text-decoration
**Visual**: opacity, color, background, background-color, box-shadow, filter
**Transitions**: transition, animation, transform

### Dangerous Properties Blocked

- behavior
- binding
- expression
- -moz-binding
- javascript
- vbscript

## API Reference

### CSS Service

```typescript
import { cssService } from '@/services/cssService';

// Validate CSS
const result = cssService.validateCSS(css);
console.log(result.valid);      // boolean
console.log(result.errors);     // CSSValidationError[]
console.log(result.sanitized);  // string

// Sanitize CSS
const safe = cssService.sanitizeCSS(css);

// Scope CSS to diagram
const scoped = cssService.scopeCSS(css, diagramId);

// Extract class names
const classes = cssService.extractClassNames(css);

// Generate style element ID
const styleId = cssService.generateStyleId(diagramId);
```

### CssInjector Component

```typescript
import { CssInjector } from '@/components/theme';

<CssInjector
  css={customCSS}
  diagramId={diagram.id}
  enableScoping={true}
/>
```

### StyleEditor Component

```typescript
import { StyleEditorDialog } from '@/components/editor';

<StyleEditorDialog
  initialCss={diagram.customCSS}
  diagramId={diagram.id}
  onSave={(css) => handleSave(css)}
  onClose={() => setShowEditor(false)}
  showPreview={true}
/>
```

## Data Model

### Node Data Extension

```typescript
interface NodeData {
  label: string;
  htmlContent?: string;
  icon?: string;
  cssClass?: string;  // NEW: Custom CSS class
  cssId?: string;     // NEW: Custom CSS ID
  description?: string;
  properties?: Record<string, unknown>;
}
```

### Diagram Extension

```typescript
interface Diagram {
  id: string;
  name: string;
  // ... other fields
  customCSS?: string;  // Custom CSS for this diagram
}
```

## Examples

### Example 1: Gradient Service Nodes

```css
/* Service nodes with gradient */
.custom-node.service {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 2px solid #5a67d8;
  color: white;
  border-radius: 16px;
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.custom-node.service .node-content {
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
```

### Example 2: Database Nodes

```css
/* Database nodes */
.custom-node.database {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border: 2px solid #00b4d8;
  color: white;
  border-radius: 16px;
}

.custom-node.database .node-icon {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}
```

### Example 3: Hover Animations

```css
/* Hover effects */
.custom-node {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.custom-node:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.25);
}

.custom-node:hover .node-icon {
  transform: scale(1.1) rotate(5deg);
}
```

### Example 4: Selected State

```css
/* Custom selected state */
.custom-node.selected {
  border-color: #fbbf24;
  box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.3), 0 12px 24px rgba(0, 0, 0, 0.25);
}
```

## Testing

### Manual Testing

1. Navigate to `/css-demo` to see the CSS Styling Demo
2. Click "Open Style Editor" to edit CSS
3. Add CSS class to a node in Properties Panel
4. Write custom CSS in the editor
5. Verify changes apply instantly
6. Try dangerous CSS patterns and verify they're blocked

### Automated Testing

```typescript
import { cssService } from '@/services/cssService';

describe('CSS Service', () => {
  test('should validate safe CSS', () => {
    const css = '.custom-node { color: red; }';
    const result = cssService.validateCSS(css);
    expect(result.valid).toBe(true);
  });

  test('should block dangerous patterns', () => {
    const css = '.custom-node { background: url(javascript:alert(1)); }';
    const result = cssService.validateCSS(css);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
  });

  test('should scope CSS', () => {
    const css = '.custom-node { color: red; }';
    const scoped = cssService.scopeCSS(css, 'diagram-123');
    expect(scoped).toContain('[data-diagram-id="diagram-123"]');
  });
});
```

## Future Enhancements

- [ ] Monaco Editor integration for better syntax highlighting
- [ ] CSS autocomplete and IntelliSense
- [ ] Color picker integration
- [ ] CSS variables support
- [ ] Import/export CSS themes
- [ ] CSS validation with detailed line/column errors
- [ ] CSS minification for production
- [ ] CSS preprocessor support (SASS/LESS)
- [ ] Dark mode CSS themes
- [ ] CSS animation presets

## Troubleshooting

### CSS Not Applying

1. **Check CSS Class/ID**: Verify the node has the correct CSS class/ID in Properties Panel
2. **Check Scope**: CSS is scoped to `[data-diagram-id]`, ensure you're using the correct diagram
3. **Check Specificity**: More specific selectors take precedence
4. **Check Validation**: Look for validation errors in the Style Editor

### Security Warnings

1. **Dangerous Pattern**: Remove the dangerous pattern from CSS
2. **Broad Selector**: Use more specific selectors instead of `html`, `body`, or `*`
3. **Unsafe Property**: Use only allowed CSS properties

### Performance Issues

1. **Too Many Rules**: Keep CSS concise and efficient
2. **Expensive Selectors**: Avoid complex selectors like `div div div`
3. **Animations**: Use `transform` and `opacity` for smooth animations

## Related Files

- **CSS Service**: `frontend/src/services/cssService.ts`
- **CSS Injector**: `frontend/src/components/theme/CssInjector.tsx`
- **Style Editor**: `frontend/src/components/editor/StyleEditor.tsx`
- **Node Types**: `frontend/src/types/node.ts`
- **Custom Node**: `frontend/src/components/diagram/nodes/CustomNode.tsx`
- **Properties Panel**: `frontend/src/components/editor/PropertiesPanel.tsx`
- **Canvas**: `frontend/src/components/diagram/Canvas.tsx`
