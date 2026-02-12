# Bidirectional Sync - Quick Start Guide

## 5-Minute Integration

### Step 1: Install Dependencies (Already Done)

```bash
npm install lodash @types/lodash
```

### Step 2: Basic Setup

```tsx
import { useSyncManager, useVisualSync, useCodeSync } from '@/hooks/useSyncManager';
import { SyncStatusButton } from '@/components/editor/SyncStatusIndicator';

function MyEditor() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [code, setCode] = useState('');

  // 1. Create sync manager
  const { syncManager, syncState } = useSyncManager({
    onVisualToCode: setCode,                    // Update code when visual changes
    onCodeToVisual: ({ nodes, edges }) => {     // Update visual when code changes
      setNodes(nodes);
      setEdges(edges);
    },
  });

  // 2. Enable auto-sync
  useVisualSync(nodes, edges, syncManager);     // Visual → Code
  useCodeSync(code, 'json', syncManager);       // Code → Visual

  // 3. Render
  return (
    <>
      <ReactFlow nodes={nodes} edges={edges} />
      <MonacoEditor value={code} onChange={setCode} />
      <SyncStatusButton state={syncState} />
    </>
  );
}
```

### Step 3: That's It!

Your visual canvas and code editor are now in sync!

## Common Patterns

### With Error Handling

```tsx
const { syncState } = useSyncManager({
  onVisualToCode: setCode,
  onCodeToVisual: (state) => {
    setNodes(state.nodes);
    setEdges(state.edges);
  },
  onError: (error) => {
    toast.error(`Sync failed: ${error.message}`);
  },
});

// Show error
{syncState.status === 'error' && (
  <Alert>{syncState.error?.message}</Alert>
)}
```

### With Format Switching

```tsx
const [format, setFormatState] = useState<'json' | 'yaml'>('json');
const { syncManager, setFormat } = useSyncManager(...);

// Switch format
const handleFormatChange = () => {
  const newFormat = format === 'json' ? 'yaml' : 'json';
  setFormatState(newFormat);
  setFormat(newFormat);
};

useCodeSync(code, format, syncManager);
```

### Force Sync

```tsx
const { forceSync } = useSyncManager(...);

// Force immediate sync (bypasses debounce)
forceSync('visual-to-code');
forceSync('code-to-visual');
forceSync('bidirectional');
```

### Disable Auto-Sync

```tsx
useVisualSync(nodes, edges, syncManager, false);  // Disabled
useCodeSync(code, 'json', syncManager, false);    // Disabled

// Manual sync
const handleSave = () => {
  syncManager.syncVisualToCode(nodes, edges);
};
```

## Status Indicators

```tsx
// Full indicator with text
<SyncStatusButton state={syncState} />

// Compact (icon only)
<CompactSyncStatus state={syncState} />

// Custom
<SyncStatusIndicator
  state={syncState}
  showText={true}
  onClick={() => console.log('Clicked')}
/>
```

## Sync States

- **idle** - No activity
- **syncing** - Sync in progress (spinning icon)
- **synced** - Last sync successful (checkmark)
- **error** - Last sync failed (error icon)

## Configuration

```tsx
const { syncManager } = useSyncManager({
  onVisualToCode: setCode,
  onCodeToVisual: setState,
  visualDebounceDelay: 300,    // Visual → Code debounce (ms)
  codeDebounceDelay: 300,      // Code → Visual debounce (ms)
  prioritizeVisual: true,      // Prioritize visual in conflicts
  maxSyncAttempts: 3,          // Max retry attempts
  onStatusChange: (state) => {
    console.log('Sync status:', state.status);
  },
  onError: (error) => {
    console.error('Sync error:', error.message);
  },
});
```

## Examples

### Complete Working Example

See: `pages/SyncDemo.tsx`

### Integration with Canvas

See: `pages/HybridEditorDemo.tsx`

## Troubleshooting

### Sync Not Working

1. Check if sync manager is initialized
2. Verify callbacks are registered
3. Check console for errors
4. Ensure nodes/edges are actually changing

### Excessive Syncing

1. Increase debounce delay (try 500ms)
2. Check for circular updates
3. Verify change detection logic

### Conflicts

1. Check `prioritizeVisual` option
2. Verify timestamps are accurate
3. Consider showing conflict resolution UI

## Files Reference

- **Service**: `services/sync.ts`
- **Hooks**: `hooks/useSyncManager.ts`
- **UI**: `components/editor/SyncStatusIndicator.tsx`
- **Demo**: `pages/SyncDemo.tsx`
- **Docs**: `services/BIDIRECTIONAL_SYNC_IMPLEMENTATION.md`

## API Quick Reference

### SyncManager

```typescript
class SyncManager {
  syncVisualToCode(nodes: Node[], edges: Edge[]): void
  syncCodeToVisual(code: string, format: 'json' | 'yaml'): void
  forceSync(direction: SyncDirection): void
  getState(): SyncState
  setFormat(format: 'json' | 'yaml'): void
  reset(): void
  destroy(): void
}
```

### useSyncManager Hook

```typescript
function useSyncManager(options?: {
  onVisualToCode: (code: string) => void
  onCodeToVisual: (state: { nodes: Node[], edges: Edge[] }) => void
  visualDebounceDelay?: number
  codeDebounceDelay?: number
  prioritizeVisual?: boolean
  onStatusChange?: (state: SyncState) => void
  onError?: (error: SyncError) => void
}): {
  syncManager: SyncManager
  syncState: SyncState
  syncVisualToCode: (nodes: Node[], edges: Edge[]) => void
  syncCodeToVisual: (code: string, format: 'json' | 'yaml') => void
  forceSync: (direction: SyncDirection) => void
  setFormat: (format: 'json' | 'yaml') => void
  resetSync: () => void
}
```

### Helper Hooks

```typescript
useVisualSync(nodes, edges, syncManager, enabled?)
useCodeSync(code, format, syncManager, enabled?)
```

## Performance Tips

1. **Debounce Delay**: Use 300-500ms for better performance
2. **Change Detection**: Built into `useVisualSync` and `useCodeSync`
3. **Memory**: Sync manager is ~1KB, cleanup is automatic
4. **CPU**: Negligible due to debouncing

## Need Help?

- See full documentation: `services/BIDIRECTIONAL_SYNC_IMPLEMENTATION.md`
- See working demo: `pages/SyncDemo.tsx`
- Check tests: `services/__tests__/sync.test.ts`

---

**Done!** Your sync system is ready to use. 🎉
