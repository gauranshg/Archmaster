# IndexedDB Storage Services

This directory contains the IndexedDB storage layer for the Custom Architecture Platform, built with [Dexie.js](https://dexie.org/).

## Overview

The storage services provide:
- **Offline-first architecture**: All data is stored locally in IndexedDB
- **CRUD operations**: Full create, read, update, delete for diagrams and templates
- **Transaction support**: Atomic multi-table operations
- **Sync capabilities**: Bidirectional sync with backend API
- **Type safety**: Full TypeScript support with proper types

## Database Schema

### Tables

1. **diagrams** - Stores diagram metadata
   - Indexed by: `id`, `workspaceId`, `parentId`, `type`, `createdAt`, `updatedAt`

2. **nodes** - Stores diagram nodes
   - Indexed by: `id`, `diagramId`

3. **edges** - Stores diagram edges
   - Indexed by: `id`, `diagramId`, `source`, `target`

4. **templates** - Stores reusable node templates
   - Indexed by: `id`, `category`, `author`, `isPublic`, `createdAt`

5. **syncStatus** - Tracks synchronization state
   - Indexed by: `diagramId`, `lastSyncedAt`, `hasPendingChanges`

## Usage Examples

### Basic Diagram Operations

```typescript
import { diagramStorage } from '@/services/storage';

// Get a complete diagram
const diagram = await diagramStorage.get('diagram-id');

// Save a diagram (with nodes and edges)
await diagramStorage.save({
  id: 'diagram-id',
  name: 'My Diagram',
  type: 'system-context',
  workspaceId: 'workspace-id',
  nodes: [...],
  edges: [...],
  metadata: {...},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// List diagrams in a workspace
const diagrams = await diagramStorage.listByWorkspace('workspace-id');

// Delete a diagram
await diagramStorage.delete('diagram-id');
```

### Template Operations

```typescript
import { templateStorage } from '@/services/storage';

// Get all templates
const templates = await templateStorage.getAll();

// Get templates by category
const serviceTemplates = await templateStorage.getByCategory('service');

// Filter templates
const filtered = await templateStorage.filter({
  category: 'infrastructure',
  includePublic: true,
  search: 'database'
});

// Save a template
await templateStorage.save({
  id: 'template-id',
  name: 'Database',
  category: 'database',
  author: 'user-id',
  isPublic: true,
  data: {...},
  style: {...},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
```

### Sync Operations

```typescript
import { syncService } from '@/services/storage';

// Get last sync time
const lastSync = syncService.getLastSyncTime();

// Check for pending changes
const hasPending = await syncService.hasPendingChanges();

// Upload pending changes to backend
const result = await syncService.uploadPendingChanges();
console.log(`Uploaded ${result.uploaded} diagrams`);

// Full bidirectional sync
const syncResult = await syncService.fullSync();
```

### Database Utilities

```typescript
import { db, dbUtils } from '@/services/storage';

// Export all data (for backup)
const backup = await dbUtils.exportAll();

// Import data (for restore)
await dbUtils.importAll(backup);

// Get database size
const size = await dbUtils.getDbSize();
console.log(`Database size: ${size} bytes`);

// Clear all data (for testing/reset)
await dbUtils.clearAll();
```

## API Reference

### `diagramStorage`

- `get(diagramId: string): Promise<CompleteDiagram | null>` - Get a complete diagram
- `save(diagram: CompleteDiagram): Promise<void>` - Save a complete diagram
- `delete(diagramId: string): Promise<void>` - Delete a diagram
- `listByWorkspace(workspaceId: string): Promise<Diagram[]>` - List diagrams in workspace
- `listAll(): Promise<Diagram[]>` - List all diagrams
- `bulkPut(diagrams: CompleteDiagram[]): Promise<void>` - Bulk save diagrams
- `getChildren(parentId: string): Promise<Diagram[]>` - Get child diagrams
- `getByType(type: string, workspaceId?: string): Promise<Diagram[]>` - Get by type
- `searchByName(searchTerm: string, workspaceId?: string): Promise<Diagram[]>` - Search by name
- `countByWorkspace(workspaceId: string): Promise<number>` - Count diagrams

### `templateStorage`

- `getAll(): Promise<Template[]>` - Get all templates
- `get(templateId: string): Promise<Template | null>` - Get template by ID
- `save(template: Template): Promise<void>` - Save template
- `delete(templateId: string): Promise<void>` - Delete template
- `getByCategory(category: TemplateCategory): Promise<Template[]>` - Get by category
- `getByAuthor(author: string): Promise<Template[]>` - Get by author
- `getPublic(): Promise<Template[]>` - Get public templates
- `filter(filter: TemplateFilter): Promise<Template[]>` - Filter templates
- `bulkSave(templates: Template[]): Promise<void>` - Bulk save
- `bulkDelete(templateIds: string[]): Promise<void>` - Bulk delete
- `search(searchTerm: string): Promise<Template[]>` - Search templates
- `getCategories(): Promise<string[]>` - Get all categories
- `count(isPublic?: boolean): Promise<number>` - Count templates

### `syncService`

- `getLastSyncTime(): Date | null` - Get last sync timestamp
- `setLastSyncTime(time: Date): void` - Set last sync timestamp
- `markPending(diagramId: string, action: 'create' | 'update' | 'delete'): Promise<void>` - Mark as pending
- `clearPending(diagramId: string): Promise<void>` - Clear pending status
- `getPendingChanges(): Promise<SyncStatus[]>` - Get pending changes
- `uploadPendingChanges(): Promise<SyncResult>` - Upload to backend
- `downloadFromBackend(): Promise<SyncResult>` - Download from backend
- `fullSync(): Promise<SyncResult>` - Full bidirectional sync
- `detectConflicts(local: Diagram[], remote: Diagram[]): Promise<SyncConflict[]>` - Detect conflicts
- `resolveConflict(conflict: SyncConflict, resolution: ConflictResolution): Promise<void>` - Resolve conflict
- `getPendingCount(): Promise<number>` - Get pending count
- `hasPendingChanges(): Promise<boolean>` - Check if pending changes exist
- `clearAllSyncStatus(): Promise<void>` - Clear all sync status

## Error Handling

All storage operations throw typed errors:

- `DiagramStorageError` - Diagram operation errors
- `TemplateStorageError` - Template operation errors
- `SyncError` - Sync operation errors

Example:

```typescript
try {
  await diagramStorage.save(diagram);
} catch (error) {
  if (error instanceof DiagramStorageError) {
    console.error('Failed to save diagram:', error.message);
    console.error('Cause:', error.cause);
  }
}
```

## Transaction Support

The storage services use Dexie transactions for atomic operations:

```typescript
// The save operation uses transactions automatically
await diagramStorage.save(diagram); // Atomic: diagram + nodes + edges
```

## Conflict Resolution

When syncing, conflicts can occur when the same diagram is modified both locally and remotely:

```typescript
// Detect conflicts
const conflicts = await syncService.detectConflicts(localDiagrams, remoteDiagrams);

// Resolve conflicts
for (const conflict of conflicts) {
  // Strategy: 'local-wins' | 'remote-wins' | 'manual'
  await syncService.resolveConflict(conflict, 'local-wins');
}
```

## Performance Considerations

1. **Indexes**: All frequently queried fields are indexed
2. **Bulk Operations**: Use `bulkPut` and `bulkDelete` for multiple items
3. **Transactions**: Multi-table operations use transactions for consistency
4. **Pagination**: For large datasets, consider implementing pagination

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 10+, macOS 10.12+)
- IndexedDB quota: Typically 50-80% of available disk space

## Testing

For testing, you can clear the database:

```typescript
import { dbUtils } from '@/services/storage';

// Reset database to clean state
await dbUtils.clearAll();
```

## Future Enhancements

- [ ] Implement automatic sync on connectivity changes
- [ ] Add compression for large diagrams
- [ ] Implement incremental backup
- [ ] Add database migration system
- [ ] Implement query result caching
