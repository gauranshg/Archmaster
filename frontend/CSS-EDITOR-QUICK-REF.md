# CSS Style Editor - Quick Reference Guide

## For Users

### How to Edit Node CSS
1. Click on a node to select it
2. In the Properties Panel, click the **"Edit Node CSS"** button
3. Write your CSS in the editor
4. Click **"Apply"** to preview, **"Save"** to confirm
5. Your CSS is immediately applied to the node

### How to Edit Diagram CSS
1. In the Properties Panel header, click **"Edit Diagram CSS"** button
2. Write CSS that applies to all nodes in the diagram
3. Click **"Apply"** to preview, **"Save"** to confirm
4. Your CSS is applied to the entire diagram

### CSS Tips
- Use class selectors: `.my-class { }`
- Use ID selectors: `#my-id { }`
- Target node content: `.my-node .node-content { }`
- Add hover effects: `.my-node:hover { }`
- Add animations: `@keyframes my-animation { }`

### Keyboard Shortcuts
- **Ctrl+S / Cmd+S**: Save CSS
- **Esc**: Close editor (with confirmation if unsaved)

### Example CSS

```css
/* Style a specific node by class */
.service-node {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 2px solid #5a67d8;
  border-radius: 12px;
  color: white;
}

/* Add hover effect */
.service-node:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

/* Style node content */
.service-node .node-content {
  font-family: 'Segoe UI', sans-serif;
  font-weight: 600;
}

/* Add animation */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.service-node.animated {
  animation: pulse 2s infinite;
}
```

## For Developers

### Basic Usage

```tsx
import { CssInjector } from '@/components/theme/CssInjector';
import { PropertiesPanel } from '@/components/editor/PropertiesPanel';
import { useDiagramStore } from '@/store/diagramStore';

function MyEditor() {
  const { currentDiagram } = useDiagramStore();

  return (
    <>
      {/* Inject CSS for current diagram */}
      {currentDiagram && (
        <CssInjector
          css={currentDiagram.customCSS || ''}
          diagramId={currentDiagram.id}
        />
      )}

      {/* Your canvas */}

      {/* Properties panel with CSS editing */}
      <PropertiesPanel />
    </>
  );
}
```

### Programmatic CSS Updates

```tsx
import { useDiagramStore } from '@/store/diagramStore';

function MyComponent() {
  const { updateCustomCSS, updateNode } = useDiagramStore();

  // Update diagram CSS
  const setDiagramCSS = (css: string) => {
    updateCustomCSS(css);
  };

  // Update node CSS
  const setNodeCSS = (nodeId: string, css: string) => {
    updateNode(nodeId, {
      data: {
        properties: {
          customCSS: css,
        },
      },
    });
  };
}
```

### CSS Validation

```tsx
import { cssService } from '@/services/cssService';

// Validate CSS
const result = cssService.validateCSS(myCss);

if (result.valid) {
  console.log('CSS is valid');
} else {
  console.log('Errors:', result.errors);
}

// Sanitize CSS
const safe = cssService.sanitizeCSS(dangerousCss);

// Scope CSS to diagram
const scoped = cssService.scopeCSS(css, diagramId);
```

### CSS Service API

```typescript
// Validate CSS
validateCSS(css: string): CSSValidationResult

// Sanitize CSS (remove dangerous patterns)
sanitizeCSS(css: string): string

// Scope CSS to diagram ID
scopeCSS(css: string, diagramId: string): string

// Extract class names from CSS
extractClassNames(css: string): string[]

// Generate unique style element ID
generateStyleId(diagramId: string): string
```

### Store Actions

```typescript
// DiagramStore
updateCustomCSS(css: string): void
getDiagramCSS(): string
onNodesChange(changes: any[]): void
onEdgesChange(changes: any[]): void
onConnect(connection: any): void

// UIStore
setSidebarOpen(open: boolean): void
setPropertiesPanelOpen(open: boolean): void
addNotification(notification): void
```

## CSS Scoping

### Automatic Scoping
CSS is automatically scoped to prevent conflicts:

```css
/* User writes: */
.my-node { background: blue; }

/* Automatically becomes: */
[data-diagram-id="my-diagram"] .my-node { background: blue; }
```

### Manual Scoping
If you need custom scoping:

```typescript
import { cssService } from '@/services/cssService';

// Custom scoping
const customScoped = cssService.scopeCSS(css, 'my-diagram');
```

## Security

### Blocked Patterns
- `javascript:` URLs
- `expression()` functions
- `@import` statements
- `behavior` properties
- External resources

### Allowed Properties
All standard CSS properties except:
- `behavior`
- `binding`
- `expression`
- `-moz-binding`

## Troubleshooting

### CSS Not Applying
1. Check browser console for errors
2. Verify CSS syntax (braces match)
3. Ensure CssInjector is mounted
4. Check CSS scoping

### Validation Errors
1. Remove dangerous patterns
2. Fix syntax errors
3. Check line numbers in error messages
4. Use allowed properties only

### Performance Issues
1. Debounce CSS injection (automatic)
2. Reduce CSS complexity
3. Limit animations
4. Use CSS containment

## File Locations

### Components
- `frontend/src/components/editor/StyleEditor.tsx` - Main CSS editor
- `frontend/src/components/editor/StyleEditorDialog.tsx` - Modal dialog
- `frontend/src/components/editor/PropertiesPanel.tsx` - Properties panel with CSS buttons
- `frontend/src/components/theme/CssInjector.tsx` - CSS injection

### Services
- `frontend/src/services/cssService.ts` - CSS validation and sanitization

### Stores
- `frontend/src/store/diagramStore.ts` - Diagram state with CSS actions

### Documentation
- `frontend/CSS-EDITOR-INTEGRATION.md` - Full integration guide
- `frontend/CSS-EDITOR-QUICK-REF.md` - This quick reference

## Common CSS Patterns

### Gradient Background
```css
.node {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Rounded Corners
```css
.node {
  border-radius: 12px;
}
```

### Shadow Effects
```css
.node {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

### Hover Transform
```css
.node:hover {
  transform: translateY(-2px);
}
```

### Pulse Animation
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.node.animated {
  animation: pulse 2s infinite;
}
```

## Best Practices

1. **Use classes** instead of IDs for reusable styles
2. **Scope broadly** for diagram CSS
3. **Scope specifically** for node CSS
4. **Test hover effects** before saving
5. **Keep animations subtle** for performance
6. **Use CSS variables** for theming
7. **Validate early** to catch errors
8. **Sanitize all CSS** for security

## Resources

- [CSS Scoping Strategy](../docs/css-scoping.md)
- [XSS Prevention](../docs/security.md)
- [React Flow Custom Nodes](https://reactflow.dev/docs/guides/custom-nodes/)
- [CSS-in-JS Security](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)
