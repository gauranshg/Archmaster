# Monaco Code Editor Integration

## Overview

The Monaco Code Editor integration provides a professional code editing experience for the Custom Architecture Platform, supporting both JSON and YAML formats with syntax highlighting, validation, and autocomplete.

## Features

- **Dual Language Support**: Seamless switching between JSON and YAML
- **Syntax Highlighting**: Full syntax highlighting for both formats
- **Real-time Validation**: Error squiggles with line and column information
- **Autocomplete**: JSON schema-based autocomplete for diagram properties
- **Keyboard Shortcuts**: Save, find, replace, and navigation shortcuts
- **Read-only Mode**: Support for read-only viewing
- **Bidirectional Sync**: Syncs with diagram state (Zustand store)
- **Minimap**: Code overview for easy navigation
- **Performance**: Debounced validation to prevent UI lag

## Architecture

```
frontend/src/components/editor/
├── CodeEditor.tsx           # Main Monaco Editor component
├── CodeEditor.css           # Editor styling
├── validators/
│   ├── index.ts            # Validator exports
│   ├── types.ts            # Common types
│   ├── jsonValidator.ts    # JSON validation
│   └── yamlValidator.ts    # YAML validation
├── PropertyInput.tsx        # Property input component
├── PropertySection.tsx      # Property section component
├── PropertiesPanel.tsx      # Properties panel
└── index.ts                 # Component exports
```

## Usage

### Basic Example

```tsx
import { CodeEditor } from '@/components/editor';

function MyComponent() {
  const [code, setCode] = useState('');

  return (
    <CodeEditor
      language="json"
      readOnly={false}
      onChange={setCode}
      onSave={() => console.log('Saved!')}
      height="600px"
    />
  );
}
```

### With Diagram Store

```tsx
import { CodeEditor } from '@/components/editor';
import { useDiagramStore } from '@/store/diagramStore';

function DiagramEditor() {
  return (
    <CodeEditor
      language="json"
      onChange={(code) => console.log('Code changed:', code)}
      onSave={() => saveDiagram()}
    />
  );
}
```

## Component Props

### CodeEditorProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `language` | `'json' \| 'yaml'` | required | Editor language mode |
| `readOnly` | `boolean` | `false` | Whether editor is read-only |
| `onChange` | `(value: string) => void` | `undefined` | Callback when code changes |
| `onSave` | `() => void` | `undefined` | Callback when Ctrl+S is pressed |
| `className` | `string` | `''` | Additional CSS class |
| `height` | `string \| number` | `'100%'` | Editor height |

## Validation

The editor validates code in real-time and displays error markers:

### JSON Validation

- Syntax errors (missing commas, brackets, etc.)
- Schema validation against diagram schema
- Required field checks
- Type validation

### YAML Validation

- Syntax errors (indentation, special characters, etc.)
- Structure validation
- Required field checks

## JSON Schema

The editor uses a comprehensive JSON schema for autocomplete:

```typescript
{
  "id": "uuid",
  "name": "string",
  "type": "system-context | container | component | code | generic",
  "workspaceId": "string",
  "nodes": [...],
  "edges": [...],
  "metadata": {...},
  "customCSS": "string",
  "layout": {...}
}
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` / `Cmd+S` | Save |
| `Ctrl+F` / `Cmd+F` | Find |
| `Ctrl+H` / `Cmd+H` | Replace |
| `Ctrl+/` | Toggle comment |
| `Ctrl+D` | Select next occurrence |
| `F12` | Go to definition |
| `Alt+Up` / `Alt+Down` | Move line |
| `Ctrl+Shift+K` | Delete line |
| `Ctrl+Enter` | Insert line below |

## Integration with Zustand Store

The CodeEditor integrates with the diagram store via `useDiagramStore()`:

```tsx
const { currentDiagram, nodes, edges } = useDiagramStore();
```

The editor automatically:
1. Loads the current diagram state
2. Converts it to JSON/YAML
3. Updates when the diagram changes
4. Validates the code in real-time

## Performance Optimizations

1. **Debounced Validation**: Validation runs 300ms after the last change
2. **Efficient Updates**: Only updates editor content when diagram actually changes
3. **Lazy Loading**: Monaco Editor loads on-demand
4. **Marker Management**: Efficient marker updates prevent memory leaks

## Styling

The editor uses custom CSS for:

- Dark theme integration
- Custom scrollbars
- Minimap opacity
- Error marker styling
- Focus states
- Read-only mode styling

## Error Handling

The editor provides comprehensive error handling:

1. **Syntax Errors**: Caught and displayed with line/column info
2. **Validation Errors**: Schema violations shown in editor
3. **Parse Errors**: Friendly error messages for invalid JSON/YAML
4. **Type Errors**: Type mismatches highlighted

## Demo Page

Visit `/monaco-editor` to see the editor in action with:
- Language switching (JSON/YAML)
- Mode switching (Editable/Read-only)
- Sample diagram loading
- Real-time validation
- Feature documentation

## Future Enhancements

Potential improvements:

1. **Code Formatting**: Prettier integration for consistent formatting
2. **Split View**: Side-by-side visual and code editing
3. **Diff View**: Compare diagram versions
4. **Search & Replace**: Advanced search with regex
5. **Multiple Cursors**: Multi-cursor editing support
6. **Snippets**: Code snippets for common patterns
7. **Linting**: ESLint-style linting for JSON/YAML
8. **Foldable Regions**: Code folding for better navigation

## Dependencies

- `@monaco-editor/react`: Monaco Editor React wrapper
- `js-yaml`: YAML parsing and validation
- `zustand`: State management integration

## Browser Support

Monaco Editor supports all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Accessibility

- Keyboard navigation fully supported
- Screen reader compatible
- High contrast mode support
- Font size scaling

## Troubleshooting

### Editor not loading

- Check browser console for errors
- Verify `@monaco-editor/react` is installed
- Ensure container has explicit height

### Validation not working

- Check that validators are imported correctly
- Verify JSON schema is registered
- Look for TypeScript errors in console

### Performance issues

- Increase debounce delay in `CodeEditor.tsx`
- Disable minimap for large files
- Use read-only mode when possible

## Related Files

- `frontend/src/components/editor/CodeEditor.tsx` - Main component
- `frontend/src/components/editor/validators/` - Validation logic
- `frontend/src/store/diagramStore.ts` - Diagram state
- `frontend/src/services/export.ts` - Code serialization
- `frontend/src/utils/debounce.ts` - Debounce utility
