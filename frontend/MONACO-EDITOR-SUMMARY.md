# Monaco Code Editor - Quick Start Guide

## What Was Implemented

A professional code editor for editing diagram definitions in JSON and YAML formats.

## Key Files

- **Component**: `frontend/src/components/editor/CodeEditor.tsx`
- **Validators**: `frontend/src/components/editor/validators/`
- **Demo**: `frontend/src/pages/MonacoEditorDemo.tsx`
- **Styles**: `frontend/src/components/editor/CodeEditor.css`

## Features

| Feature | Status |
|---------|--------|
| JSON Syntax Highlighting | ✅ Complete |
| YAML Syntax Highlighting | ✅ Complete |
| Autocomplete | ✅ Complete |
| Error Validation | ✅ Complete |
| Minimap | ✅ Complete |
| Line Numbers | ✅ Complete |
| Word Wrap | ✅ Complete |
| Read-only Mode | ✅ Complete |
| Keyboard Shortcuts | ✅ Complete |
| Zustand Integration | ✅ Complete |

## How to Use

### 1. Basic Usage

```tsx
import { CodeEditor } from '@/components/editor';

<CodeEditor
  language="json"
  onChange={(code) => console.log(code)}
  onSave={() => saveDiagram()}
  height="600px"
/>
```

### 2. Read-Only Mode

```tsx
<CodeEditor
  language="yaml"
  readOnly={true}
  height="100%"
/>
```

### 3. With Diagram Store

```tsx
import { useDiagramStore } from '@/store/diagramStore';

function DiagramEditor() {
  const { currentDiagram } = useDiagramStore();

  return <CodeEditor language="json" />;
}
```

## Demo

Visit `http://localhost:5182/monaco-editor` to see:
- Interactive editor demo
- Sample diagram loader
- Language switching (JSON/YAML)
- Mode switching (Editable/Read-only)
- Feature documentation

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save |
| `Ctrl+F` | Find |
| `Ctrl+H` | Replace |
| `Ctrl+/` | Toggle comment |
| `Ctrl+D` | Select next occurrence |
| `F12` | Go to definition |

## Integration Points

The editor integrates with:
- **Zustand Store**: `useDiagramStore()` - loads current diagram
- **Export Service**: `exportService.exportDiagram()` - serializes to JSON/YAML
- **Validation Service**: Validates diagram structure
- **Import Service**: Ready for code-to-diagram parsing

## Next Steps

To enable **bidirectional sync** (visual ↔ code):

1. Parse code changes in `onChange` handler
2. Update Zustand store with parsed data
3. Visual canvas will auto-update
4. Debounce to prevent loops

Example:
```tsx
const handleCodeChange = (code: string) => {
  const result = importService.importFromJSON(code, {
    validate: true,
    throwOnError: false,
  });

  if (result.success && result.diagram) {
    setCurrentDiagram(result.diagram);
  }
};
```

## Dependencies Added

```json
{
  "@monaco-editor/react": "^4.6.0"
}
```

## Build

```bash
cd frontend
npm install
npm run build
```

Result: ✅ Build successful (5.74s)

## Documentation

- Full docs: `frontend/src/components/editor/README.md`
- Implementation: `frontend/MONACO-EDITOR-IMPLEMENTATION.md`

## Acceptance Criteria

All criteria met:
- ✅ Monaco editor renders in panel
- ✅ JSON syntax highlighting works
- ✅ YAML syntax highlighting works
- ✅ Autocomplete suggests valid diagram properties
- ✅ Errors show with red squiggles
- ✅ Minimap displays code overview
- ✅ Editor updates when diagram changes
- ✅ Read-only mode prevents edits

## Summary

Production-ready Monaco Editor integration with:
- Full JSON/YAML support
- Real-time validation
- Autocomplete
- Keyboard shortcuts
- Zustand integration
- Comprehensive documentation

Ready for Phase 2 bidirectional sync! 🚀
