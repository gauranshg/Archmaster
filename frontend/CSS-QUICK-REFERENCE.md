# CSS Styling Quick Reference

## For Users

### Adding Custom Styles to Nodes

1. **Select a Node** → Click on any node in the diagram
2. **Open Properties** → Find the "CSS Styling" section
3. **Add CSS Class** → Enter a class name (e.g., `my-service`)
4. **Add CSS ID** → Enter a unique ID (e.g., `user-service`)
5. **Open Style Editor** → Click "Open Style Editor" button
6. **Write CSS** → Add your custom CSS rules
7. **Save** → Press Ctrl/Cmd+S or click "Save CSS"

### Common CSS Patterns

```css
/* Target all nodes */
.custom-node {
  border-radius: 16px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

/* Target by class */
.custom-node.my-service {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* Target by ID */
#user-service {
  transform: scale(1.05);
}

/* Hover effect */
.custom-node:hover {
  transform: translateY(-4px);
}

/* Selected state */
.custom-node.selected {
  border-color: #fbbf24;
}
```

## For Developers

### Using CSS Service

```typescript
import { cssService } from '@/services/cssService';

// Validate CSS
const result = cssService.validateCSS(css);
if (result.valid) {
  // CSS is safe to use
} else {
  // Show errors to user
  console.error(result.errors);
}

// Sanitize CSS
const safe = cssService.sanitizeCSS(unsafeCss);

// Scope to diagram
const scoped = cssService.scopeCSS(css, diagramId);
```

### Using CSS Injector

```typescript
import { CssInjector } from '@/components/theme';

// Automatic injection
<CssInjector
  css={diagram.customCSS}
  diagramId={diagram.id}
  enableScoping={true}
/>

// Imperative injection
function MyComponent() {
  const { injectCss, removeCss } = useCssInjection(diagramId);

  useEffect(() => {
    injectCss(customCss);
    return () => removeCss();
  }, [customCss]);
}
```

### Using Style Editor

```typescript
import { StyleEditorDialog } from '@/components/editor';

function MyDiagram() {
  const [showEditor, setShowEditor] = useState(false);

  return (
    <>
      <button onClick={() => setShowEditor(true)}>
        Edit CSS
      </button>

      {showEditor && (
        <StyleEditorDialog
          initialCss={diagram.customCSS}
          diagramId={diagram.id}
          onSave={(css) => {
            diagram.customCSS = css;
            setShowEditor(false);
          }}
          onClose={() => setShowEditor(false)}
          showPreview={true}
        />
      )}
    </>
  );
}
```

### Node Data Structure

```typescript
const node: Node = {
  id: 'node-1',
  diagramId: 'diagram-1',
  position: { x: 100, y: 100 },
  data: {
    label: 'My Node',
    cssClass: 'my-custom-class',  // CSS class
    cssId: 'my-node-id',          // CSS ID
    htmlContent: '<div>Custom HTML</div>',
    icon: '🎨',
  },
};
```

### Canvas Integration

```typescript
import { DiagramCanvas } from '@/components/diagram/Canvas';

<DiagramCanvas
  diagram={diagram}
  editable={true}
  customCSS={diagram.customCSS}
/>
```

## CSS Selectors

### By Class
```css
.custom-node.my-class { }
```

### By ID
```css
#my-node-id { }
```

### By Attribute
```css
[data-node-id="node-1"] { }
```

### Nested Elements
```css
.custom-node .node-content { }
.custom-node .node-icon { }
.custom-node .node-label { }
```

### Pseudo-classes
```css
.custom-node:hover { }
.custom-node.selected { }
.custom-node:first-child { }
```

## Common Styling Tasks

### Gradients
```css
.custom-node.service {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Shadows
```css
.custom-node {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}
```

### Borders
```css
.custom-node {
  border: 2px solid #3b82f6;
  border-radius: 16px;
}
```

### Transitions
```css
.custom-node {
  transition: all 0.3s ease;
}
```

### Animations
```css
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.custom-node {
  animation: pulse 2s infinite;
}
```

## Security Best Practices

### DO
✅ Use specific selectors (`.custom-node.my-class`)
✅ Scope CSS to diagrams (automatic)
✅ Validate CSS before saving (automatic)
✅ Use safe CSS properties (layout, visual, transitions)

### DON'T
❌ Use `javascript:` or `expression()`
❌ Use `@import` or external resources
❌ Target `html`, `body`, or `*`
❌ Use unsafe properties (behavior, binding)

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + S | Save CSS |
| Esc | Close editor |

## Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| Dangerous pattern detected | Unsafe CSS found | Remove the pattern |
| Selector too broad | Using `html`, `body`, or `*` | Use specific selectors |
| Mismatched braces | Missing `{` or `}` | Check brace matching |

## File Locations

| File | Purpose |
|------|---------|
| `services/cssService.ts` | CSS validation & sanitization |
| `components/theme/CssInjector.tsx` | CSS injection component |
| `components/editor/StyleEditor.tsx` | CSS editor UI |
| `components/editor/StyleEditorDialog.tsx` | Editor dialog wrapper |
| `components/diagram/nodes/CustomNode.tsx` | Node with CSS support |
| `components/editor/PropertiesPanel.tsx` | CSS class/ID inputs |
| `pages/CssStylingDemo.tsx` | Demo page |

## Testing

```bash
# Run dev server
npm run dev

# Navigate to demo
http://localhost:5173/css-demo

# Build for production
npm run build
```

## Support

- **Documentation**: See `CSS-STYLING-FEATURE.md`
- **Implementation**: See `CSS-IMPLEMENTATION-SUMMARY.md`
- **Examples**: See `CssStylingDemo.tsx`
