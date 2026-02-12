/**
 * Storage Services Index
 *
 * Central export point for all IndexedDB storage services.
 * Includes database setup, CRUD operations, and sync functionality.
 */

// Database setup
export {
  db,
  dbUtils,
  DiagramDatabase,
} from './db';

export type {
  StoredNode,
  StoredEdge,
  StoredTemplate,
  SyncStatus,
} from './db';

// Diagram storage
export {
  diagramStorage,
} from './diagramStorage';

export type {
  CompleteDiagram,
} from './diagramStorage';

export {
  DiagramStorageError,
} from './diagramStorage';

// Template storage
export {
  templateStorage,
} from './templateStorage';

export {
  TemplateStorageError,
} from './templateStorage';

// Sync service
export {
  syncService,
} from './sync';

export type {
  SyncResult,
  SyncConflict,
  ConflictResolution,
} from './sync';

export {
  SyncError,
} from './sync';
