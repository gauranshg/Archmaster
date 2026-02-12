# Editor Page - Quick Reference

## Overview
The Editor page is now working with a simple, proven structure based on TemplateDemo.

## Route
- **Path**: `/editor` or `/editor/:diagramId`
- **Component**: `Editor.tsx`

## Key Features

### 1. Template Library (Left Sidebar)
- Location: Left sidebar (320px wide)
- Features:
  - Browse templates by category
  - Click template to add node to canvas
  - Drag-and-drop support (via React Flow)
  - Delete custom templates
  - Search and filter templates
- Button: "Save X Node(s) as Template" (shows when nodes selected)

### 2. Canvas Area (Main)
- Location: Center (flex-1)
- Features:
  - Interactive diagram canvas
  - Node selection (single/multiple)
  - Node dragging and positioning
  - Edge creation (drag from node handles)
  - Zoom and pan controls
  - Mini-map (optional)
- Header:
  - Home button
  - Diagram name
  - Action buttons (Save as Template, Save, Export)

### 3. Properties Panel (Right Sidebar)
- Location: Right sidebar (320px wide)
- Features:
  - Node label editing
  - Description editing
  - HTML content editor
  - CSS class editor
  - Width/Height controls
  - Background color
  - Border settings
- Shows: "X node(s) selected" or "Select a node to edit properties"

## User Flow

### Creating a New Diagram
1. Navigate to `/editor`
2. Templates are automatically initialized
3. Click template in left sidebar
4. Node appears on canvas at random position
5. Repeat to add more nodes
6. Drag nodes to arrange
7. Connect nodes with edges

### Editing Node Properties
1. Click node to select it
2. Properties panel shows on right
3. Edit label, description, styles
4. Changes appear immediately on canvas

### Saving as Template
1. Select one or more nodes
2. Click "Save X Node(s) as Template" button
3. Fill in template name, category, description
4. Click "Save Template"
5. Template appears in library

### Saving Diagram
1. Auto-saves every 1 second
2. Manual save: Click "Save" button
3. Saves to IndexedDB
4. Shows "Diagram saved successfully!" alert

### Exporting Diagram
1. Click "Export" button
2. Downloads as JSON file
3. Filename: `{diagram-name}.json`
4. Can be imported via ImportExportDemo

## State Management

### Local State
```tsx
const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [isInitialized, setIsInitialized] = useState(false);
```

### Store State
```tsx
const { currentDiagram, nodes, edges, setCurrentDiagram, addNode } = useDiagramStore();
```

## Event Handlers

### Template Selection
```tsx
const handleTemplateSelect = useCallback((template: Template) => {
  const newNode = templateToNode(template, {
    x: 100 + Math.random() * 200,
    y: 100 + Math.random() * 200,
  });
  addNode(newNode);
}, [addNode]);
```

### Node Selection
```tsx
const handleSelectionChange = useCallback((nodes: Node[], edges: Edge[]) => {
  setSelectedNodes(nodes);
}, []);
```

### Save Template
```tsx
const handleSaveTemplate = useCallback(() => {
  if (selectedNodes.length === 0) {
    alert('Please select at least one node to save as a template');
    return;
  }
  setShowSaveTemplateDialog(true);
}, [selectedNodes]);
```

### Save Diagram
```tsx
const handleSave = useCallback(async () => {
  if (!currentDiagram) return;
  await diagramStorage.save({
    ...currentDiagram,
    nodes,
    edges,
    metadata: {
      ...currentDiagram.metadata,
      modifiedAt: new Date().toISOString(),
    },
  });
  alert('Diagram saved successfully!');
}, [currentDiagram, nodes, edges]);
```

### Export Diagram
```tsx
const handleExport = useCallback(() => {
  if (!currentDiagram) return;
  const dataStr = JSON.stringify(currentDiagram, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${currentDiagram.name.replace(/\s+/g, '-').toLowerCase()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}, [currentDiagram]);
```

## Layout Structure

```tsx
<div className="flex h-screen bg-gray-50">
  {/* Left Sidebar - Template Library */}
  <div className="w-80 bg-white border-r border-gray-200">
    <TemplateLibrary />
  </div>

  {/* Main Canvas Area */}
  <div className="flex-1 flex flex-col">
    <Header />
    <DiagramCanvas />
  </div>

  {/* Right Sidebar - Properties */}
  <div className="w-80 bg-white border-l border-gray-200">
    <PropertiesPanel />
  </div>
</div>
```

## Styling

### Tailwind Classes Used
- Layout: `flex`, `h-screen`, `flex-1`, `flex-col`
- Sizing: `w-80`, `h-16`
- Colors: `bg-white`, `bg-gray-50`, `bg-gradient-to-r from-blue-50 to-purple-50`
- Borders: `border-r`, `border-l`, `border-b border-gray-200`
- Shadows: `shadow-sm`, `shadow-lg`
- Interactive: `hover:scale-105`, `transition-all`

### Gradients
- Header gradient: `bg-gradient-to-r from-blue-50 to-purple-50`
- Button gradient: `bg-gradient-to-r from-blue-600 to-purple-600`

## Dependencies

### Components
- `DiagramCanvas` - Main canvas component
- `TemplateLibrary` - Template browser
- `SaveTemplateDialog` - Template creation dialog
- `PropertiesPanel` - Node properties editor

### Services
- `initializeTemplates()` - Initialize default templates
- `templateToNode()` - Convert template to node
- `diagramStorage` - IndexedDB storage

### Stores
- `useDiagramStore()` - Diagram state management
- `useTemplateStore()` - Template state management (via TemplateLibrary)

## Testing Checklist

- [ ] Editor loads at `/editor`
- [ ] Template library shows on left
- [ ] Templates display correctly
- [ ] Clicking template adds node to canvas
- [ ] Node appears at visible position
- [ ] Node can be selected
- [ ] Properties panel shows on right
- [ ] Properties can be edited
- [ ] Changes appear on canvas
- [ ] Multiple nodes can be selected
- [ ] "Save as Template" button shows
- [ ] Save template dialog opens
- [ ] Template can be saved
- [ ] Saved template appears in library
- [ ] Save button works
- [ ] Auto-save works (1 second delay)
- [ ] Export button works
- [ ] JSON file downloads
- [ ] Error handling works
- [ ] Loading states work
- [ ] Home button navigates to home

## Known Issues
- Alert dialogs are used for notifications (should use toast notifications)
- No undo/redo functionality
- No keyboard shortcuts
- No node search/filter
- No diagram validation

## Future Enhancements
- Add toast notification system
- Implement undo/redo
- Add keyboard shortcuts (Ctrl+S, Ctrl+Z, etc.)
- Add node toolbar with quick actions
- Add mini-map for large diagrams
- Implement node search/filter
- Add diagram validation
- Re-add code editor as optional view
- Re-add split view for hybrid editing
- Add collaborative editing (real-time sync)

## Files
- `frontend/src/pages/Editor.tsx` - Main editor component
- `frontend/src/components/diagram/Canvas.tsx` - Canvas component
- `frontend/src/components/sidebar/TemplateLibrary.tsx` - Template library
- `frontend/src/components/sidebar/SaveTemplateDialog.tsx` - Save dialog
- `frontend/src/components/editor/PropertiesPanel.tsx` - Properties panel
- `frontend/src/services/templates/templateUtils.ts` - Template utilities
- `frontend/src/store/diagramStore.ts` - Diagram store
- `frontend/src/store/templateStore.ts` - Template store
