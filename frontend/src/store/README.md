# Zustand Stores

This directory contains all Zustand state management stores for the Custom Architecture Platform.

## Stores

### 1. Diagram Store (`diagramStore.ts`)

Manages the current diagram, nodes, edges, and selection state.

```typescript
import { useDiagramStore } from '@/store';

function DiagramComponent() {
  const { currentDiagram, nodes, edges, selectedNodes } = useDiagramStore();
  const { addNode, updateNode, deleteNode, setSelectedNodes } = useDiagramStore();

  // Add a new node
  const handleAddNode = () => {
    addNode({
      id: 'node-1',
      diagramId: 'diagram-1',
      position: { x: 100, y: 100 },
      data: { label: 'New Node' }
    });
  };
}
```

**State:**
- `currentDiagram`: Currently loaded diagram
- `nodes`: Array of nodes in the diagram
- `edges`: Array of edges (connections) in the diagram
- `selectedNodes`: IDs of selected nodes
- `selectedEdges`: IDs of selected edges

**Actions:**
- `setCurrentDiagram(diagram)`: Load a diagram
- `addNode(node)`: Add a node
- `updateNode(id, updates)`: Update a node
- `deleteNode(id)`: Delete a node (and connected edges)
- `addEdge(edge)`: Add an edge
- `updateEdge(id, updates)`: Update an edge
- `deleteEdge(id)`: Delete an edge
- `setSelectedNodes(ids)`: Set selected nodes
- `setSelectedEdges(ids)`: Set selected edges
- `clearSelection()`: Clear all selections
- `resetDiagram()`: Reset diagram state

**Persistence:** Persisted to localStorage as `diagram-storage`

---

### 2. Editor Store (`editorStore.ts`)

Manages editor view mode, code content, and sync state.

```typescript
import { useEditorStore } from '@/store';

function EditorComponent() {
  const { viewMode, codeContent, isSyncing } = useEditorStore();
  const { setViewMode, setCodeContent } = useEditorStore();

  // Switch to split view
  const handleSplitView = () => {
    setViewMode('split');
  };
}
```

**State:**
- `viewMode`: Editor mode ('visual' | 'code' | 'split')
- `codeContent`: JSON/YAML code content
- `isSyncing`: Whether sync is in progress
- `syncError`: Sync error message
- `lastSyncTime`: Last successful sync timestamp

**Actions:**
- `setViewMode(mode)`: Change view mode
- `setCodeContent(content)`: Update code content
- `setSyncing(isSyncing)`: Set syncing state
- `setSyncError(error)`: Set sync error
- `updateLastSyncTime()`: Update last sync timestamp
- `resetEditor()`: Reset editor state

**Persistence:** Persisted to localStorage as `editor-storage`

---

### 3. UI Store (`uiStore.ts`)

Manages UI state including sidebar, panels, theme, and notifications.

```typescript
import { useUIStore } from '@/store';

function UIComponent() {
  const { sidebarOpen, theme, isLoading } = useUIStore();
  const { setSidebarOpen, setTheme, setLoading, addNotification } = useUIStore();

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Show success notification
  const showSuccess = () => {
    addNotification({
      type: 'success',
      message: 'Diagram saved successfully!'
    });
  };
}
```

**State:**
- `sidebarOpen`: Whether sidebar is open
- `activePanel`: Currently active panel ID
- `theme`: Current theme ('light' | 'dark')
- `isLoading`: Whether app is loading
- `error`: Global error message
- `loadingMessage`: Loading message
- `notifications`: Array of notifications

**Actions:**
- `setSidebarOpen(open)`: Open/close sidebar
- `setActivePanel(panel)`: Set active panel
- `setTheme(theme)`: Set theme
- `setLoading(loading, message?)`: Set loading state
- `setError(error)`: Set error message
- `addNotification(notification)`: Add notification
- `removeNotification(id)`: Remove notification
- `clearNotifications()`: Clear all notifications
- `toggleSidebar()`: Toggle sidebar state

**Persistence:** Persisted to localStorage as `ui-storage`

---

### 4. Workspace Store (`workspaceStore.ts`)

Manages workspaces and diagrams within workspaces.

```typescript
import { useWorkspaceStore } from '@/store';

function WorkspaceComponent() {
  const { currentWorkspace, diagrams, recentWorkspaces } = useWorkspaceStore();
  const { setCurrentWorkspace, addDiagram, updateDiagram } = useWorkspaceStore();

  // Load workspace
  const loadWorkspace = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
  };

  // Add diagram to workspace
  const addNewDiagram = (diagram: Diagram) => {
    addDiagram(diagram);
  };
}
```

**State:**
- `currentWorkspace`: Currently loaded workspace
- `diagrams`: Array of diagrams in workspace
- `recentWorkspaces`: Recently accessed workspaces
- `isLoading`: Whether workspace data is loading
- `error`: Workspace error message

**Actions:**
- `setCurrentWorkspace(workspace)`: Load workspace
- `setDiagrams(diagrams)`: Set diagrams array
- `addDiagram(diagram)`: Add diagram
- `updateDiagram(id, updates)`: Update diagram
- `deleteDiagram(id)`: Delete diagram
- `addRecentWorkspace(workspace)`: Add to recent
- `removeRecentWorkspace(workspaceId)`: Remove from recent
- `clearRecentWorkspaces()`: Clear recent workspaces
- `setLoading(loading)`: Set loading state
- `setError(error)`: Set error
- `resetWorkspace()`: Reset workspace state

**Persistence:** Persisted to localStorage as `workspace-storage`

---

## Usage Tips

### Selecting Multiple State Values

```typescript
// Select specific values (prevents re-renders for other state changes)
const nodes = useDiagramStore((state) => state.nodes);
const { nodes, edges } = useDiagramStore((state) => ({
  nodes: state.nodes,
  edges: state.edges
}));
```

### Accessing Actions

```typescript
// Get actions (no subscription to state changes)
const { addNode, deleteNode } = useDiagramStore.getState();
```

### Resetting Stores

Each store has a reset function:
```typescript
useDiagramStore.getState().resetDiagram();
useEditorStore.getState().resetEditor();
useWorkspaceStore.getState().resetWorkspace();
```

### DevTools Integration

All stores are configured with Redux DevTools integration:
- Store name visible in DevTools
- Time-travel debugging enabled
- State jump enabled

Install the [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools) to debug state changes.

---

## Middleware

All stores use three Zustand middleware:

1. **`immer`** - Allows writing immutable updates as mutable changes
   ```typescript
   set((state) => {
     state.nodes.push(newNode); // Immer makes this immutable
   });
   ```

2. **`persist`** - Persists state to localStorage
   - Custom storage keys for each store
   - Partial persistence (only essential data)
   - Automatic hydration on app load

3. **`devtools`** - Redux DevTools integration
   - Action naming for better debugging
   - Time-travel and state jump support

---

## TypeScript Support

All stores are fully typed with TypeScript. Type interfaces are exported for use in components:

```typescript
import type { DiagramState, EditorState, UIState, WorkspaceState } from '@/store';
```
