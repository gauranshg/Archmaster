# Bidirectional Synchronization System

## Overview

This document describes the bidirectional synchronization system that keeps the visual canvas and code editor in sync. The system implements debouncing, conflict detection, and comprehensive error handling.

## Architecture

### Core Components

1. **SyncManager** (`services/sync.ts`)
   - Central orchestrator for bidirectional sync
   - Manages debouncing and conflict detection
   - Tracks sync state and error handling

2. **useSyncManager Hook** (`hooks/useSyncManager.ts`)
   - React hook for easy integration
   - Provides automatic cleanup
   - Exposes sync state and methods

3. **SyncStatusIndicator** (`components/editor/SyncStatusIndicator.tsx`)
   - Visual feedback for sync state
   - Shows syncing, synced, error, and pending states
   - Displays time since last sync

4. **Helper Hooks**
   - `useVisualSync`: Auto-syncs visual changes
   - `useCodeSync`: Auto-syncs code changes

## Data Flow

```
┌─────────────────┐
│  Visual Canvas  │
│  (React Flow)   │
└────────┬────────┘
         │ onNodesChange/onEdgesChange
         ▼
    ┌────────────────┐
    │ useVisualSync  │ (300ms debounce)
    │  Hook Wrapper  │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────────┐
    │  SyncManager        │
    │  syncVisualToCode() │
    └────────┬────────────┘
             │ validate + serialize
             ▼
    ┌─────────────────┐
    │  Code Editor    │
    │  (Monaco)       │
    └────────┬────────┘
             │ onDidChangeModelContent
             ▼
    ┌────────────────┐
    │ useCodeSync    │ (300ms debounce)
    │  Hook Wrapper  │
    └────────┬────────┘
             │
             ▼
    ┌──────────────────────┐
    │  SyncManager         │
    │  syncCodeToVisual()  │
    └────────┬─────────────┘
             │ parse + validate
             ▼
    ┌─────────────────┐
    │  Visual Canvas  │
    │  (React Flow)   │
    └─────────────────┘
```

## Sync States

The sync system tracks the following states:

- **idle**: No sync activity
- **syncing**: Sync in progress
- **synced**: Last sync completed successfully
- **error**: Last sync failed with error

Additional flags:
- `visualChangesPending`: Visual changes waiting to sync
- `codeChangesPending`: Code changes waiting to sync
- `lastSyncTime`: Timestamp of last successful sync
- `lastSyncDirection`: Direction of last sync

## Conflict Detection

Conflicts are detected based on timestamps:

```typescript
// Visual → Code sync
if (lastCodeChangeTime > lastVisualChangeTime) {
  // Code changed more recently - skip or merge
}

// Code → Visual sync
if (lastVisualChangeTime > lastCodeChangeTime) {
  // Visual changed more recently - skip or merge
}
```

**Conflict Resolution Strategy**:
- Default: Prioritize visual changes (user intent)
- Configurable via `prioritizeVisual` option
- Timestamp-based detection prevents data loss

## Debouncing Strategy

```typescript
// Visual → Code: 300ms debounce
const debouncedVisualToCode = debounce((nodes, edges) => {
  syncVisualToCodeInternal(nodes, edges);
}, 300);

// Code → Visual: 300ms debounce
const debouncedCodeToVisual = debounce((code, format) => {
  syncCodeToVisualInternal(code, format);
}, 300);
```

**Why 300ms?**
- Fast enough for real-time feedback
- Slow enough to avoid excessive updates
- User won't notice the delay
- Prevents sync during rapid typing/dragging

## Usage Examples

### Basic Integration

```tsx
import { useSyncManager } from '@/hooks/useSyncManager';
import { SyncStatusButton } from '@/components/editor/SyncStatusIndicator';

function DiagramEditor() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [code, setCode] = useState<string>('');

  const {
    syncManager,
    syncState,
    syncVisualToCode,
    syncCodeToVisual,
  } = useSyncManager({
    onVisualToCode: (code) => setCode(code),
    onCodeToVisual: ({ nodes, edges }) => {
      setNodes(nodes);
      setEdges(edges);
    },
    visualDebounceDelay: 300,
    codeDebounceDelay: 300,
  });

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(changes) => {
          // Update nodes
          syncVisualToCode(nodes, edges);
        }}
      />
      <MonacoEditor
        value={code}
        onChange={(value) => {
          syncCodeToVisual(value, 'json');
        }}
      />
      <SyncStatusButton state={syncState} />
    </>
  );
}
```

### Auto-Sync Integration

```tsx
import { useSyncManager, useVisualSync, useCodeSync } from '@/hooks/useSyncManager';

function AutoSyncEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [code, setCode] = useState('');

  const { syncManager, syncState } = useSyncManager({
    onVisualToCode: setCode,
    onCodeToVisual: ({ nodes, edges }) => {
      setNodes(nodes);
      setEdges(edges);
    },
  });

  // Auto-sync visual changes
  useVisualSync(nodes, edges, syncManager);

  // Auto-sync code changes
  useCodeSync(code, 'json', syncManager);

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      />
      <MonacoEditor
        value={code}
        onChange={setCode}
      />
    </>
  );
}
```

### With Error Handling

```tsx
const { syncManager, syncState } = useSyncManager({
  onVisualToCode: (code) => setCode(code),
  onCodeToVisual: (state) => {
    setNodes(state.nodes);
    setEdges(state.edges);
  },
  onStatusChange: (state) => {
    console.log('Sync status:', state.status);
  },
  onError: (error) => {
    console.error('Sync failed:', error.message);
    toast.error(`Sync error: ${error.message}`);
  },
});

// Show error state
{syncState.status === 'error' && (
  <Alert variant="error">
    {syncState.error?.message}
  </Alert>
)}
```

### Force Sync

```tsx
const { syncState, forceSync } = useSyncManager(...);

// Force visual → code
forceSync('visual-to-code');

// Force code → visual
forceSync('code-to-visual');

// Force bidirectional
forceSync('bidirectional');
```

### Custom Format

```tsx
const { syncManager, setFormat } = useSyncManager(...);

// Switch to YAML
setFormat('yaml');

// Switch to JSON
setFormat('json');
```

## Performance Considerations

### Debouncing

- Visual changes: 300ms debounce (prevents excessive updates during drag)
- Code changes: 300ms debounce (prevents excessive updates during typing)
- Debounced functions are cancelled on force sync

### Change Detection

The `useVisualSync` hook uses deep comparison to detect changes:

```typescript
const nodesChanged =
  nodes.length !== prevNodesRef.current.length ||
  nodes.some((node, i) => {
    const prevNode = prevNodesRef.current[i];
    return (
      !prevNode ||
      node.id !== prevNode.id ||
      node.position.x !== prevNode.position.x ||
      node.position.y !== prevNode.position.y ||
      JSON.stringify(node.data) !== JSON.stringify(prevNode.data)
    );
  });
```

This ensures sync only triggers when actual changes occur.

### Memory Management

- SyncManager is destroyed on component unmount
- Debounced functions are cancelled on cleanup
- Refs are used to avoid stale closures

## Error Handling

### Parse Errors

When code fails to parse:

```typescript
try {
  const data = JSON.parse(code);
  // ... sync logic
} catch (error) {
  const syncError: SyncError = {
    message: error.message,
    direction: 'code-to-visual',
    timestamp: Date.now(),
  };

  setState({ status: 'error', error: syncError });
  onError(syncError);
}
```

### Validation Errors

When validation fails:

```typescript
const validation = validateDiagram(data);

if (!validation.valid) {
  throw new Error(
    `Validation failed: ${validation.errors.map(e => e.message).join(', ')}`
  );
}
```

### Serialization Errors

When export fails:

```typescript
try {
  const result = exportService.exportDiagram(diagram, options);
  onVisualToCode(result.data);
} catch (error) {
  // Handle serialization error
}
```

## Testing

### Unit Tests

```typescript
describe('SyncManager', () => {
  it('should sync visual to code', () => {
    const onVisualToCode = jest.fn();
    const manager = new SyncManager(onVisualToCode, () => {});

    manager.syncVisualToCode(nodes, edges);

    expect(onVisualToCode).toHaveBeenCalled();
  });

  it('should debounce visual changes', async () => {
    const onVisualToCode = jest.fn();
    const manager = new SyncManager(onVisualToCode, () => {});

    manager.syncVisualToCode(nodes, edges);
    manager.syncVisualToCode(nodes, edges);
    manager.syncVisualToCode(nodes, edges);

    await waitFor(() => expect(onVisualToCode).toHaveBeenCalledTimes(1));
  });
});
```

### Integration Tests

```typescript
describe('Bidirectional Sync', () => {
  it('should sync visual changes to code', async () => {
    const { result } = renderHook(() => useSyncManager(...));

    act(() => {
      result.current.syncVisualToCode(nodes, edges);
    });

    await waitFor(() => {
      expect(result.current.syncState.status).toBe('synced');
    });
  });
});
```

## Troubleshooting

### Sync Not Working

1. Check if sync manager is initialized
2. Verify callbacks are registered
3. Check console for errors
4. Ensure debouncing delay isn't too long
5. Verify nodes/edges are actually changing

### Excessive Syncing

1. Increase debounce delay
2. Check for circular updates
3. Verify change detection logic
4. Use `useVisualSync` and `useCodeSync` hooks

### Conflicts

1. Check `prioritizeVisual` option
2. Verify timestamps are accurate
3. Implement custom merge logic if needed
4. Consider showing conflict resolution UI

### Performance Issues

1. Profile with React DevTools
2. Check for unnecessary re-renders
3. Optimize change detection
4. Consider splitting into separate sync managers

## Future Enhancements

1. **Operational Transformation (OT)**: Advanced conflict resolution
2. **Conflict Resolution UI**: Let users choose which changes to keep
3. **Sync History**: Track all sync operations
4. **Selective Sync**: Sync only specific node/edge properties
5. **Batch Updates**: Group multiple changes into single sync
6. **WebSocket Sync**: Real-time collaboration
7. **Optimistic Updates**: Show changes immediately, rollback on error
8. **Sync Metrics**: Track sync performance and frequency

## Related Files

- `services/sync.ts` - Sync manager implementation
- `hooks/useSyncManager.ts` - React hooks
- `components/editor/SyncStatusIndicator.tsx` - Status UI
- `services/validation.ts` - Validation logic
- `services/export.ts` - Serialization logic
- `store/diagramStore.ts` - Diagram state management
