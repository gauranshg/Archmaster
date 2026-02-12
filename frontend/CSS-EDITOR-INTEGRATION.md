# CSS Style Editor Integration

## Overview

The CSS Style Editor has been fully integrated into the main editor workflow, allowing users to edit custom CSS for individual nodes and entire diagrams. This integration provides a secure, validated, and scoped CSS editing experience with live preview capabilities.

## Features

### 1. Node-Level CSS Editing
- Edit custom CSS for individual nodes
- Opened via "Edit Node CSS" button in Properties Panel
- CSS is stored in node's `data.properties.customCSS` field
- Automatically scoped to prevent conflicts

### 2. Diagram-Level CSS Editing
- Edit global CSS that applies to all nodes in a diagram
- Opened via "Edit Diagram CSS" button in Properties Panel
- CSS is stored in diagram's `customCSS` field
- Provides consistent styling across the entire diagram

### 3. CSS Validation & Security
- All CSS is validated before saving
- Dangerous patterns are blocked (XSS prevention)
- Syntax errors are highlighted with line numbers
- Real-time validation feedback as you type

### 4. CSS Scoping
- Per-diagram CSS scoping to prevent bleeding
- Automatic `data-diagram-id` attribute injection
- Clean namespace isolation between diagrams

## Components

### StyleEditor Component
**Location:** `frontend/src/components/editor/StyleEditor.tsx`

Main CSS editor with:
- Syntax highlighting textarea
- Line numbers
- Real-time validation
- Live preview toggle
- Error/warning display
- Example CSS insertion

**Props:**
```typescript
interface StyleEditorProps {
  initialCss?: string;
  diagramId: string;
  onSave: (css: string) => void;
  onClose: () => void;
  showPreview?: boolean;
  validationDelay?: number;
}
```

### StyleEditorDialog Component
**Location:** `frontend/src/components/editor/StyleEditorDialog.tsx`

Modal dialog wrapper for StyleEditor with:
- Backdrop overlay
- Portal rendering
- Responsive layout

**Props:**
```typescript
interface StyleEditorDialogProps {
  isOpen: boolean;
  initialCss?: string;
  diagramId: string;
  onSave: (css: string) => void;
  onClose: () => void;
  showPreview?: boolean;
}
```

### CssInjector Component
**Location:** `frontend/src/components/theme/CssInjector.tsx`

Automatically injects scoped CSS into the document:
- Sanitizes CSS before injection
- Scopes CSS to diagram ID
- Cleans up on unmount
- Prevents memory leaks

**Usage:**
```tsx
<CssInjector
  css={diagram.customCSS || ''}
  diagramId={diagram.id}
  enableScoping={true}
/>
```

### CSS Service
**Location:** `frontend/src/services/cssService.ts`

Provides CSS validation, sanitization, and scoping:
- `validateCSS()` - Validates CSS and returns errors
- `sanitizeCSS()` - Removes dangerous patterns
- `scopeCSS()` - Adds diagram scoping
- `extractClassNames()` - Extracts class names from CSS
- `generateStyleId()` - Generates unique style element IDs

## Store Integration

### DiagramStore Updates
**Location:** `frontend/src/store/diagramStore.ts`

Added actions:
```typescript
updateCustomCSS: (css: string) => void;
getDiagramCSS: () => string;
onNodesChange: (changes: any[]) => void;
onEdgesChange: (changes: any[]) => void;
onConnect: (connection: any) => void;
```

### PropertiesPanel Integration
**Location:** `frontend/src/components/editor/PropertiesPanel.tsx`

Added buttons:
- "Edit Node CSS" - Opens CSS editor for selected node (when single node selected)
- "Edit Diagram CSS" - Opens CSS editor for current diagram

## Usage Example

```tsx
import { useDiagramStore } from '@/store/diagramStore';
import { CssInjector } from '@/components/theme/CssInjector';
import { PropertiesPanel } from '@/components/editor/PropertiesPanel';

function Editor() {
  const { currentDiagram, nodes } = useDiagramStore();

  return (
    <div className="editor">
      {/* Inject CSS for current diagram */}
      {currentDiagram && (
        <CssInjector
          css={currentDiagram.customCSS || ''}
          diagramId={currentDiagram.id}
        />
      )}

      {/* Canvas with nodes */}
      <Canvas />

      {/* Properties panel with CSS editing buttons */}
      <PropertiesPanel />
    </div>
  );
}
```

## CSS Scoping

CSS is automatically scoped to prevent conflicts:

### Diagram-Level Scoping
```css
/* User writes: */
.service-node { background: blue; }

/* Automatically scoped to: */
[data-diagram-id="my-diagram"] .service-node { background: blue; }
```

### Node-Level Scoping
Node CSS is injected with the node's specific ID or class:
```css
/* User writes in node CSS editor: */
#my-node { background: red; }

/* Applied to specific node only */
```

## CSS Validation

The CSS editor validates for:

### Errors (Blocked)
- JavaScript execution attempts (`javascript:`, `expression()`)
- External resources (`@import`, `@charset`)
- Dangerous properties (`behavior`, `binding`)
- Mismatched braces

### Warnings (Allowed)
- Overly broad selectors (`html`, `body`, `*`)
- Non-standard properties

## Security

### XSS Prevention
1. All CSS is sanitized through `cssService.sanitizeCSS()`
2. Dangerous patterns are removed or blocked
3. `@import` and external resources are blocked
4. Only safe CSS properties are allowed

### CSP Considerations
- Style elements include CSP nonce if available
- No inline event handlers in CSS
- No `javascript:` or `data:` URLs with scripts

## User Workflow

### Editing Node CSS
1. User selects a node on the canvas
2. Properties panel shows node properties
3. User clicks "Edit Node CSS" button
4. StyleEditorDialog opens with node's CSS
5. User writes CSS with validation feedback
6. User clicks "Apply" for live preview
7. User clicks "Save" to confirm changes
8. CSS is injected via CssInjector
9. Node styling updates immediately

### Editing Diagram CSS
1. User clicks "Edit Diagram CSS" button (always visible)
2. StyleEditorDialog opens with diagram's CSS
3. User writes global CSS for all nodes
4. User clicks "Apply" for live preview
5. User clicks "Save" to confirm changes
6. CSS is injected via CssInjector
7. All nodes in diagram update

## Demo Page

**Location:** `frontend/src/pages/CssEditorIntegrationDemo.tsx`

Complete demo showing:
- Node-level CSS editing
- Diagram-level CSS editing
- Live CSS injection
- Validation feedback
- Example CSS with gradients, animations, hover effects

To view the demo:
```tsx
import { CssEditorIntegrationDemo } from '@/pages/CssEditorIntegrationDemo';

function App() {
  return <CssEditorIntegrationDemo />;
}
```

## Customization

### Custom Validation Rules
Edit `frontend/src/services/cssService.ts`:
```typescript
const DANGEROUS_PATTERNS = [
  // Add your patterns here
  /your-pattern/gi,
];

const ALLOWED_PROPERTIES = [
  // Add your allowed properties
  'your-property',
];
```

### Custom CSS Scoping
Edit `frontend/src/services/cssService.ts`:
```typescript
export function scopeCSS(css: string, diagramId: string): string {
  // Customize scoping logic
}
```

### Styling the Editor
Edit `frontend/src/components/editor/StyleEditor.tsx`:
```typescript
// Custom styling for textarea, buttons, etc.
```

## Troubleshooting

### CSS Not Applying
1. Check browser console for validation errors
2. Verify CSS is scoped correctly
3. Ensure CssInjector is mounted
4. Check CSS syntax (braces, semicolons)

### Performance Issues
1. Debounce CSS injection (already implemented)
2. Reduce CSS complexity
3. Limit number of animations
4. Use CSS containment

### Memory Leaks
1. CssInjector automatically cleans up on unmount
2. Style elements are removed when diagram changes
3. No event listeners leaked

## Future Enhancements

- [ ] CSS autocomplete/intellisense
- [ ] Color picker integration
- [ ] CSS variable support
- [ ] CSS animation library
- [ ] CSS framework integration (Tailwind, Bootstrap)
- [ ] CSS import/export
- [ ] CSS version history
- [ ] CSS diff view
- [ ] CSS merge conflicts resolution
- [ ] CSS sharing between diagrams

## References

- [CSS Scoping Strategy](../docs/css-scoping.md)
- [XSS Prevention](../docs/security.md)
- [CSS Service API](../services/cssService.ts)
- [React Flow Custom Styling](https://reactflow.dev/docs/guides/custom-nodes/)
