# Split View Mode - Quick Reference

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+1` | Switch to visual mode (full canvas) |
| `Ctrl+2` | Switch to code mode (full editor) |
| `Ctrl+3` | Switch to split mode (side-by-side) |

## Basic Usage

```tsx
import { SplitView } from '@/components/layout';
import { ViewModeToggle } from '@/components/common';

function MyEditor() {
  return (
    <>
      <ViewModeToggle />
      <SplitView>
        <DiagramCanvas />
        <CodeEditor />
      </SplitView>
    </>
  );
}
```

## API Reference

### SplitView Props

```tsx
<SplitView
  visualContent={<DiagramCanvas />}
  codeContent={<CodeEditor />}
  minPanelWidth={300}           // Minimum panel width (px)
  initialSplitRatio={0.5}       // Initial split (0-1)
  orientation="horizontal"      // or "vertical"
  showCollapseButtons={true}    // Show collapse/expand buttons
/>
```

### ViewModeToggle Props

```tsx
<ViewModeToggle
  size="md"                    // sm | md | lg
  variant="default"             // default | ghost | outline
  showShortcuts={true}          // Show keyboard hints
/>
```

### useViewMode Hook

```tsx
const {
  viewMode,                    // Current mode
  splitRatio,                  // Panel split ratio
  setViewMode,                 // Switch mode
  setSplitRatio,               // Adjust split
  toggleVisualPanel,           // Toggle collapse
  toggleCodePanel,             // Toggle collapse
} = useViewMode();
```

## Common Patterns

### Responsive Layout

```tsx
import { ResponsiveSplitView } from '@/components/layout';

<ResponsiveSplitView breakpoint={768}>
  <DiagramCanvas />
  <CodeEditor />
</ResponsiveSplitView>
```

### Custom Panel Sizes

```tsx
const { setSplitRatio } = useViewMode();

// Set to 70/30 (canvas/editor)
setSplitRatio(0.7);
```

### Collapse Panel Programmatically

```tsx
const { collapseVisualPanel } = useViewMode();

// Collapse visual panel
collapseVisualPanel();
```

## State Persistence

View state automatically persists to localStorage:

- View mode preference
- Split ratio
- Panel collapse states

To reset:

```tsx
const { resetView } = useViewStore();
resetView();
```

## Styling

### Custom Panel Styles

```tsx
<SplitView className="custom-split">
  <div className="custom-visual-panel">
    <DiagramCanvas />
  </div>
  <div className="custom-code-panel">
    <CodeEditor />
  </div>
</SplitView>
```

### Override Transition Duration

```css
.custom-split > div {
  transition-duration: 150ms; /* Faster */
}
```

## Troubleshooting

### Panels not visible

**Problem**: Panels not showing
**Solution**: Check container has explicit height:

```tsx
<div style={{ height: '100vh' }}>
  <SplitView>...</SplitView>
</div>
```

### Resize not working

**Problem**: Can't drag separator
**Solution**: Ensure container has width:

```tsx
<div style={{ width: '100vw', height: '100vh' }}>
  <SplitView>...</SplitView>
</div>
```

### State not persisting

**Problem**: View mode resets on refresh
**Solution**: Check localStorage is enabled:

```js
// In browser console
localStorage.setItem('test', '123');
localStorage.getItem('test'); // Should return '123'
```

### Shortcuts not working

**Problem**: Keyboard shortcuts don't respond
**Solution**: Check another component isn't capturing keys:

```tsx
// Remove conflicting event listeners
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Don't prevent default for Ctrl+1/2/3
    if (e.ctrlKey && ['1', '2', '3'].includes(e.key)) {
      return; // Let split view handle it
    }
    // Your custom handling...
  };
}, []);
```

## File Locations

```
frontend/src/
├── store/
│   └── viewStore.ts              # View state management
├── hooks/
│   └── useViewMode.ts            # View mode hook
├── components/
│   ├── layout/
│   │   └── SplitView.tsx         # Split view component
│   └── common/
│       └── ViewModeToggle.tsx    # Toggle buttons
└── pages/
    └── SplitViewDemo.tsx         # Demo page
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers

## Performance Tips

1. **Large Diagrams**: Use `React.memo()` on panel content
2. **Frequent Resizes**: Debounce expensive operations
3. **Mobile**: Consider disabling animations on low-end devices

```tsx
// Disable animations for performance
<SplitView className="transition-none!">
  ...
</SplitView>
```

## Accessibility

All components are fully accessible:

- Keyboard navigation: `Tab` between buttons
- Screen reader support: ARIA labels included
- Focus management: Visible focus indicators
- Keyboard shortcuts: Documented in tooltips

## Integration Example

```tsx
import { SplitView, ViewModeToggle } from '@/components';
import { useViewMode } from '@/hooks';
import { DiagramCanvas } from '@/components/diagram';
import { CodeEditor } from '@/components/editor';

function DiagramEditor() {
  const { viewMode } = useViewMode();

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="p-4 bg-white border-b">
        <div className="flex items-center justify-between">
          <h1>Diagram Editor</h1>
          <ViewModeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <SplitView minPanelWidth={300}>
          <DiagramCanvas />
          <CodeEditor language="json" />
        </SplitView>
      </main>

      {/* Status Bar */}
      <footer className="p-2 bg-gray-100 text-sm">
        Mode: {viewMode}
      </footer>
    </div>
  );
}
```

## More Information

- Full documentation: `SPLIT-VIEW-IMPLEMENTATION.md`
- Implementation summary: `SPLIT-VIEW-SUMMARY.md`
- Demo page: `pages/SplitViewDemo.tsx`

---

**Last Updated**: 2026-01-26
**Version**: 1.0.0
