/**
 * Sync Service
 *
 * Handles synchronization between IndexedDB and the backend API.
 * Tracks pending changes and manages conflict resolution.
 */

import { db, type SyncStatus } from './db';
import type { Diagram } from '@/types';

/**
 * Error class for sync operations
 */
export class SyncError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'SyncError';
  }
}

/**
 * Sync result
 */
export interface SyncResult {
  success: boolean;
  uploaded: number;
  downloaded: number;
  failed: number;
  conflicts: number;
  errors: string[];
}

/**
 * Conflict resolution strategy
 */
export type ConflictResolution = 'local-wins' | 'remote-wins' | 'manual';

/**
 * Sync conflict info
 */
export interface SyncConflict {
  diagramId: string;
  localVersion: Diagram;
  remoteVersion: Diagram;
  localModifiedAt: string;
  remoteModifiedAt: string;
}

/**
 * Storage key for last sync time
 */
const LAST_SYNC_KEY = 'last_sync_time';
const PENDING_CHANGES_KEY = 'pending_changes';

/**
 * Sync service
 */
export const syncService = {
  /**
   * Get the last sync timestamp
   *
   * @returns The last sync time or null if never synced
   */
  getLastSyncTime(): Date | null {
    try {
      const stored = localStorage.getItem(LAST_SYNC_KEY);
      return stored ? new Date(stored) : null;
    } catch (error) {
      console.error('Failed to get last sync time:', error);
      return null;
    }
  },

  /**
   * Set the last sync timestamp
   *
   * @param time - The sync time to save
   */
  setLastSyncTime(time: Date): void {
    try {
      localStorage.setItem(LAST_SYNC_KEY, time.toISOString());
    } catch (error) {
      console.error('Failed to set last sync time:', error);
    }
  },

  /**
   * Mark a diagram as having pending changes
   *
   * @param diagramId - The diagram ID
   * @param action - The type of pending action
   */
  async markPending(diagramId: string, action: 'create' | 'update' | 'delete'): Promise<void> {
    try {
      const diagram = await db.diagrams.get(diagramId);

      if (!diagram) {
        throw new Error(`Diagram ${diagramId} not found`);
      }

      const syncStatus: SyncStatus = {
        diagramId,
        lastSyncedAt: new Date().toISOString(),
        hasPendingChanges: true,
        pendingAction: action,
        version: diagram.metadata.version,
      };

      await db.syncStatus.put(syncStatus);
      this.updatePendingChangesCount();
    } catch (error) {
      throw new SyncError(`Failed to mark diagram ${diagramId} as pending`, error);
    }
  },

  /**
   * Clear pending changes flag for a diagram
   *
   * @param diagramId - The diagram ID
   */
  async clearPending(diagramId: string): Promise<void> {
    try {
      await db.syncStatus.delete(diagramId);
      this.updatePendingChangesCount();
    } catch (error) {
      throw new SyncError(`Failed to clear pending status for diagram ${diagramId}`, error);
    }
  },

  /**
   * Get all diagrams with pending changes
   *
   * @returns Array of sync status for pending diagrams
   */
  async getPendingChanges(): Promise<SyncStatus[]> {
    try {
      return await db.syncStatus
        .where('hasPendingChanges')
        .equals(true)
        .toArray();
    } catch (error) {
      throw new SyncError('Failed to get pending changes', error);
    }
  },

  /**
   * Upload pending changes to the backend
   *
   * This is a placeholder implementation that would be connected
   * to the actual API client in a real implementation.
   *
   * @returns Sync result with statistics
   */
  async uploadPendingChanges(): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      uploaded: 0,
      downloaded: 0,
      failed: 0,
      conflicts: 0,
      errors: [],
    };

    try {
      const pendingChanges = await this.getPendingChanges();

      for (const status of pendingChanges) {
        try {
          // TODO: Replace with actual API call
          // const apiClient = createApiClient();
          // if (status.pendingAction === 'delete') {
          //   await apiClient.diagrams.delete(status.diagramId);
          // } else {
          //   const diagram = await diagramStorage.get(status.diagramId);
          //   if (diagram) {
          //     await apiClient.diagrams.save(diagram);
          //   }
          // }

          // For now, simulate success
          await this.clearPending(status.diagramId);
          result.uploaded++;
        } catch (error) {
          result.failed++;
          result.errors.push(`Failed to upload ${status.diagramId}: ${error}`);
        }
      }

      // Update last sync time
      this.setLastSyncTime(new Date());

      return result;
    } catch (error) {
      throw new SyncError('Failed to upload pending changes', error);
    }
  },

  /**
   * Download changes from the backend
   *
   * This is a placeholder implementation that would be connected
   * to the actual API client in a real implementation.
   *
   * @returns Sync result with statistics
   */
  async downloadFromBackend(): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      uploaded: 0,
      downloaded: 0,
      failed: 0,
      conflicts: 0,
      errors: [],
    };

    try {
      // TODO: Replace with actual API call
      // const apiClient = createApiClient();
      // const lastSync = this.getLastSyncTime();
      // const changes = await apiClient.diagrams.getChanges(lastSync);
      //
      // for (const diagram of changes) {
      //   await diagramStorage.save(diagram);
      //   result.downloaded++;
      // }

      // For now, simulate success
      this.setLastSyncTime(new Date());

      return result;
    } catch (error) {
      throw new SyncError('Failed to download from backend', error);
    }
  },

  /**
   * Perform a full bidirectional sync
   *
   * @returns Sync result with statistics
   */
  async fullSync(): Promise<SyncResult> {
    try {
      // First upload pending changes
      const uploadResult = await this.uploadPendingChanges();

      // Then download changes from backend
      const downloadResult = await this.downloadFromBackend();

      return {
        success: uploadResult.success && downloadResult.success,
        uploaded: uploadResult.uploaded,
        downloaded: downloadResult.downloaded,
        failed: uploadResult.failed + downloadResult.failed,
        conflicts: uploadResult.conflicts + downloadResult.conflicts,
        errors: [...uploadResult.errors, ...downloadResult.errors],
      };
    } catch (error) {
      throw new SyncError('Failed to perform full sync', error);
    }
  },

  /**
   * Detect conflicts between local and remote versions
   *
   * @param localDiagrams - Local diagrams
   * @param remoteDiagrams - Remote diagrams
   * @returns Array of detected conflicts
   */
  async detectConflicts(
    localDiagrams: Diagram[],
    remoteDiagrams: Diagram[]
  ): Promise<SyncConflict[]> {
    const conflicts: SyncConflict[] = [];
    const localMap = new Map(localDiagrams.map(d => [d.id, d]));
    const remoteMap = new Map(remoteDiagrams.map(d => [d.id, d]));

    // Check for modified diagrams on both sides
    for (const [id, localDiagram] of localMap) {
      const remoteDiagram = remoteMap.get(id);

      if (remoteDiagram) {
        const localModified = new Date(localDiagram.metadata.modifiedAt);
        const remoteModified = new Date(remoteDiagram.metadata.modifiedAt);
        const lastSync = this.getLastSyncTime();

        if (lastSync && localModified > lastSync && remoteModified > lastSync) {
          conflicts.push({
            diagramId: id,
            localVersion: localDiagram,
            remoteVersion: remoteDiagram,
            localModifiedAt: localDiagram.metadata.modifiedAt,
            remoteModifiedAt: remoteDiagram.metadata.modifiedAt,
          });
        }
      }
    }

    return conflicts;
  },

  /**
   * Resolve a sync conflict
   *
   * @param conflict - The conflict to resolve
   * @param resolution - The resolution strategy
   * @param manualVersion - For manual resolution, the version to use
   */
  async resolveConflict(
    conflict: SyncConflict,
    resolution: ConflictResolution,
    manualVersion?: Diagram
  ): Promise<void> {
    try {
      let winningVersion: Diagram;

      switch (resolution) {
        case 'local-wins':
          winningVersion = conflict.localVersion;
          break;
        case 'remote-wins':
          winningVersion = conflict.remoteVersion;
          break;
        case 'manual':
          if (!manualVersion) {
            throw new Error('Manual version must be provided for manual resolution');
          }
          winningVersion = manualVersion;
          break;
      }

      // Save the winning version
      await db.diagrams.put(winningVersion);

      // Mark as synced
      await this.clearPending(conflict.diagramId);
    } catch (error) {
      throw new SyncError(`Failed to resolve conflict for diagram ${conflict.diagramId}`, error);
    }
  },

  /**
   * Get the count of pending changes
   *
   * @returns Number of diagrams with pending changes
   */
  async getPendingCount(): Promise<number> {
    try {
      return await db.syncStatus
        .where('hasPendingChanges')
        .equals(true)
        .count();
    } catch (error) {
      console.error('Failed to get pending count:', error);
      return 0;
    }
  },

  /**
   * Update the pending changes count in localStorage
   */
  updatePendingChangesCount(): void {
    this.getPendingCount().then(count => {
      try {
        localStorage.setItem(PENDING_CHANGES_KEY, count.toString());
      } catch (error) {
        console.error('Failed to update pending changes count:', error);
      }
    });
  },

  /**
   * Check if there are any pending changes
   *
   * @returns True if there are pending changes
   */
  async hasPendingChanges(): Promise<boolean> {
    const count = await this.getPendingCount();
    return count > 0;
  },

  /**
   * Clear all sync status (useful for logout or reset)
   */
  async clearAllSyncStatus(): Promise<void> {
    try {
      await db.syncStatus.clear();
      localStorage.removeItem(LAST_SYNC_KEY);
      localStorage.removeItem(PENDING_CHANGES_KEY);
    } catch (error) {
      throw new SyncError('Failed to clear sync status', error);
    }
  },
};
