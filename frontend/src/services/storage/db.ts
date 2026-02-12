/**
 * Dexie Database Setup
 *
 * Defines the IndexedDB schema for the Custom Architecture Platform.
 * Provides local storage for diagrams, nodes, edges, and templates.
 */

import Dexie, { Table } from 'dexie';
import type { Diagram } from '@/types';

/**
 * Node stored in IndexedDB (extends base Node with diagramId)
 */
export interface StoredNode {
  id: string;
  diagramId: string;
  position: { x: number; y: number };
  data: unknown;
}

/**
 * Edge stored in IndexedDB (extends base Edge with diagramId)
 */
export interface StoredEdge {
  id: string;
  diagramId: string;
  source: string;
  target: string;
  data?: unknown;
}

/**
 * Template stored in IndexedDB
 */
export interface StoredTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  author: string;
  isPublic: boolean;
  isSystemTemplate?: boolean;
  jinjaTemplate?: string;
  data: unknown;
  style: unknown;
  className?: string;
  thumbnail?: string;
  tags?: string[];
  constraints?: unknown;
  createdAt: string;
  updatedAt: string;
}

/**
 * Sync status for tracking pending changes
 */
export interface SyncStatus {
  id?: number;
  diagramId: string;
  lastSyncedAt: string;
  hasPendingChanges: boolean;
  pendingAction?: 'create' | 'update' | 'delete';
  version: number;
}

/**
 * Main Dexie database class for the Architecture Platform
 */
export class DiagramDatabase extends Dexie {
  // Tables
  diagrams!: Table<Diagram>;
  nodes!: Table<StoredNode>;
  edges!: Table<StoredEdge>;
  templates!: Table<StoredTemplate>;
  syncStatus!: Table<SyncStatus>;

  constructor() {
    super('ArchitecturePlatformDB');

    // Define database schema
    this.version(1).stores({
      diagrams: 'id, workspaceId, parentId, type, createdAt, updatedAt',
      nodes: 'id, diagramId',
      edges: 'id, diagramId, source, target',
      templates: 'id, category, author, isPublic, createdAt',
      syncStatus: 'diagramId, lastSyncedAt, hasPendingChanges'
    });

    // Version 2: Add Jinja template support
    this.version(2).stores({
      diagrams: 'id, workspaceId, parentId, type, createdAt, updatedAt',
      nodes: 'id, diagramId',
      edges: 'id, diagramId, source, target',
      templates: 'id, category, author, isPublic, isSystemTemplate, createdAt',
      syncStatus: 'diagramId, lastSyncedAt, hasPendingChanges'
    }).upgrade(tx => {
      // Migration: Add isSystemTemplate and jinjaTemplate fields to existing templates
      return tx.table('templates').toCollection().modify(template => {
        // Add isSystemTemplate field (default to false for existing templates)
        if (!('isSystemTemplate' in template)) {
          template.isSystemTemplate = false;
        }
        // jinjaTemplate is optional, so we don't need to add it
      });
    });
  }
}

// Export singleton instance
export const db = new DiagramDatabase();

/**
 * Database utility functions
 */
export const dbUtils = {
  /**
   * Clear all data from all tables (useful for testing or reset)
   */
  async clearAll(): Promise<void> {
    await db.transaction('rw', db.tables, async () => {
      await Promise.all(db.tables.map(table => table.clear()));
    });
  },

  /**
   * Export all data as JSON (for backup)
   */
  async exportAll(): Promise<string> {
    const data = {
      diagrams: await db.diagrams.toArray(),
      nodes: await db.nodes.toArray(),
      edges: await db.edges.toArray(),
      templates: await db.templates.toArray(),
      syncStatus: await db.syncStatus.toArray(),
    };
    return JSON.stringify(data, null, 2);
  },

  /**
   * Import data from JSON (for restore)
   */
  async importAll(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);

    await db.transaction('rw', db.tables, async () => {
      await db.diagrams.bulkPut(data.diagrams || []);
      await db.nodes.bulkPut(data.nodes || []);
      await db.edges.bulkPut(data.edges || []);
      await db.templates.bulkPut(data.templates || []);
      await db.syncStatus.bulkPut(data.syncStatus || []);
    });
  },

  /**
   * Get database size estimate (in bytes)
   */
  async getDbSize(): Promise<number> {
    const data = await this.exportAll();
    return new Blob([data]).size;
  }
};
