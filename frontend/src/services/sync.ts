/**
 * Bidirectional Sync Service
 *
 * Manages synchronization between visual canvas and code editor.
 * Implements debouncing, conflict detection, and error handling.
 */

import { debounce as debounceFn } from 'lodash';
import type { Node, Edge } from 'reactflow';
import type { Diagram } from '../types/diagram';
import { validateDiagram } from './validation';
import { exportService } from './export';

/**
 * Sync status
 */
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

/**
 * Sync direction
 */
export type SyncDirection = 'visual-to-code' | 'code-to-visual' | 'bidirectional';

/**
 * Sync error
 */
export interface SyncError {
  message: string;
  direction?: SyncDirection;
  timestamp: number;
}

/**
 * Sync state
 */
export interface SyncState {
  status: SyncStatus;
  lastSyncTime: number;
  lastSyncDirection: SyncDirection | null;
  error: SyncError | null;
  visualChangesPending: boolean;
  codeChangesPending: boolean;
}

/**
 * Sync options
 */
export interface SyncOptions {
  /** Debounce delay for visual → code sync (ms) */
  visualDebounceDelay?: number;

  /** Debounce delay for code → visual sync (ms) */
  codeDebounceDelay?: number;

  /** Maximum sync attempts before giving up */
  maxSyncAttempts?: number;

  /** Whether to prioritize visual changes in conflicts */
  prioritizeVisual?: boolean;

  /** Callback when sync status changes */
  onStatusChange?: (state: SyncState) => void;

  /** Callback when sync fails */
  onError?: (error: SyncError) => void;
}

/**
 * Default sync options
 */
const DEFAULT_SYNC_OPTIONS: Required<SyncOptions> = {
  visualDebounceDelay: 300,
  codeDebounceDelay: 300,
  maxSyncAttempts: 3,
  prioritizeVisual: true,
  onStatusChange: () => {},
  onError: () => {},
};

/**
 * Bidirectional sync manager
 */
export class SyncManager {
  private options: Required<SyncOptions>;
  private state: SyncState;

  // Debounced sync functions
  private debouncedVisualToCode: ReturnType<typeof debounceFn>;
  private debouncedCodeToVisual: ReturnType<typeof debounceFn>;

  // Last synced state
  private lastVisualState: { nodes: Node[]; edges: Edge[] } | null = null;
  private lastCodeState: string | null = null;

  // Sync timestamps for conflict detection
  private lastVisualChangeTime: number = 0;
  private lastCodeChangeTime: number = 0;

  // Callbacks
  private onVisualToCode: (code: string) => void;
  private onCodeToVisual: (state: { nodes: Node[]; edges: Edge[] }) => void;

  // Current format
  private currentFormat: 'json' | 'yaml' = 'json';

  constructor(
    onVisualToCode: (code: string) => void,
    onCodeToVisual: (state: { nodes: Node[]; edges: Edge[] }) => void,
    options: SyncOptions = {}
  ) {
    this.options = { ...DEFAULT_SYNC_OPTIONS, ...options };
    this.onVisualToCode = onVisualToCode;
    this.onCodeToVisual = onCodeToVisual;

    this.state = {
      status: 'idle',
      lastSyncTime: 0,
      lastSyncDirection: null,
      error: null,
      visualChangesPending: false,
      codeChangesPending: false,
    };

    // Create debounced sync functions
    this.debouncedVisualToCode = debounceFn((nodes, edges) => {
      this.syncVisualToCodeInternal(nodes, edges);
    }, this.options.visualDebounceDelay);

    this.debouncedCodeToVisual = debounceFn(async (code, format) => {
      await this.syncCodeToVisualInternal(code, format);
    }, this.options.codeDebounceDelay);
  }

  /**
   * Gets current sync state
   */
  getState(): SyncState {
    return { ...this.state };
  }

  /**
   * Updates sync state and notifies listeners
   */
  private setState(update: Partial<SyncState>): void {
    this.state = { ...this.state, ...update };
    this.options.onStatusChange(this.getState());
  }

  /**
   * Sets the code format for serialization
   */
  setFormat(format: 'json' | 'yaml'): void {
    this.currentFormat = format;
  }

  /**
   * Triggers sync from visual to code (debounced)
   */
  syncVisualToCode(nodes: Node[], edges: Edge[]): void {
    this.lastVisualChangeTime = Date.now();
    this.setState({ visualChangesPending: true });

    // Store current visual state
    this.lastVisualState = { nodes, edges };

    // Trigger debounced sync
    this.debouncedVisualToCode(nodes, edges);
  }

  /**
   * Triggers sync from code to visual (debounced)
   */
  syncCodeToVisual(code: string, format: 'json' | 'yaml'): void {
    this.lastCodeChangeTime = Date.now();
    this.setState({ codeChangesPending: true });

    // Store current code state
    this.lastCodeState = code;
    this.currentFormat = format;

    // Trigger debounced sync
    this.debouncedCodeToVisual(code, format);
  }

  /**
   * Internal visual → code sync implementation
   */
  private syncVisualToCodeInternal(nodes: Node[], edges: Edge[]): void {
    try {
      this.setState({ status: 'syncing' });

      // Check for conflicts
      if (this.detectConflict('visual-to-code')) {
        if (this.options.prioritizeVisual) {
          console.warn('Conflict detected: prioritizing visual changes');
        } else {
          // Skip sync if code changed more recently
          this.setState({
            status: 'synced',
            visualChangesPending: false,
            lastSyncTime: Date.now(),
            lastSyncDirection: 'visual-to-code',
          });
          return;
        }
      }

      // Create diagram object
      const diagram: Diagram = {
        id: 'current',
        name: 'Current Diagram',
        type: 'generic',
        workspaceId: 'default',
        nodes,
        edges,
        metadata: {
          version: 1,
          author: 'user',
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
        },
      };

      // Export to code
      const result = exportService.exportDiagram(diagram, {
        format: this.currentFormat,
        includeMetadata: true,
        includeCustomCSS: true,
        includeLayout: true,
        pretty: true,
        indent: 2,
      });

      // Update last synced code state
      this.lastCodeState = result.data;

      // Trigger callback
      this.onVisualToCode(result.data);

      this.setState({
        status: 'synced',
        visualChangesPending: false,
        lastSyncTime: Date.now(),
        lastSyncDirection: 'visual-to-code',
        error: null,
      });
    } catch (error) {
      const syncError: SyncError = {
        message: error instanceof Error ? error.message : 'Unknown error',
        direction: 'visual-to-code',
        timestamp: Date.now(),
      };

      this.setState({
        status: 'error',
        error: syncError,
      });

      this.options.onError(syncError);
      console.error('Visual to code sync failed:', error);
    }
  }

  /**
   * Internal code → visual sync implementation
   */
  private syncCodeToVisualInternal = async (code: string, format: 'json' | 'yaml'): Promise<void> => {
    try {
      this.setState({ status: 'syncing' });

      // Check for conflicts
      if (this.detectConflict('code-to-visual')) {
        if (!this.options.prioritizeVisual) {
          console.warn('Conflict detected: prioritizing code changes');
        } else {
          // Skip sync if visual changed more recently
          this.setState({
            status: 'synced',
            codeChangesPending: false,
            lastSyncTime: Date.now(),
            lastSyncDirection: 'code-to-visual',
          });
          return;
        }
      }

      // Parse code based on format
      let data: Diagram;

      if (format === 'yaml') {
        const yaml = await import('js-yaml');
        data = yaml.load(code) as Diagram;
      } else {
        data = JSON.parse(code);
      }

      // Validate diagram
      const validation = validateDiagram(data);

      if (!validation.valid) {
        throw new Error(
          `Validation failed: ${validation.errors.map((e) => e.message).join(', ')}`
        );
      }

      // Extract nodes and edges
      const nodes = (data.nodes || []) as Node[];
      const edges = (data.edges || []) as Edge[];

      // Update last synced visual state
      this.lastVisualState = { nodes, edges };

      // Trigger callback
      this.onCodeToVisual({ nodes, edges });

      this.setState({
        status: 'synced',
        codeChangesPending: false,
        lastSyncTime: Date.now(),
        lastSyncDirection: 'code-to-visual',
        error: null,
      });
    } catch (error) {
      const syncError: SyncError = {
        message: error instanceof Error ? error.message : 'Unknown error',
        direction: 'code-to-visual',
        timestamp: Date.now(),
      };

      this.setState({
        status: 'error',
        error: syncError,
      });

      this.options.onError(syncError);
      console.error('Code to visual sync failed:', error);
    }
  }

  /**
   * Detects if there's a conflict between visual and code changes
   */
  private detectConflict(direction: SyncDirection): boolean {
    // If visual is syncing, check if code changed more recently
    if (direction === 'visual-to-code') {
      return this.lastCodeChangeTime > this.lastVisualChangeTime;
    }

    // If code is syncing, check if visual changed more recently
    if (direction === 'code-to-visual') {
      return this.lastVisualChangeTime > this.lastCodeChangeTime;
    }

    return false;
  }

  /**
   * Forces an immediate sync (bypasses debouncing)
   */
  forceSync = async (direction: SyncDirection): Promise<void> => {
    // Cancel any pending debounced calls
    this.debouncedVisualToCode.cancel();
    this.debouncedCodeToVisual.cancel();

    if (direction === 'visual-to-code' || direction === 'bidirectional') {
      if (this.lastVisualState) {
        this.syncVisualToCodeInternal(
          this.lastVisualState.nodes,
          this.lastVisualState.edges
        );
      }
    }

    if (direction === 'code-to-visual' || direction === 'bidirectional') {
      if (this.lastCodeState) {
        await this.syncCodeToVisualInternal(this.lastCodeState, this.currentFormat);
      }
    }
  };

  /**
   * Resets sync state
   */
  reset(): void {
    this.debouncedVisualToCode.cancel();
    this.debouncedCodeToVisual.cancel();

    this.state = {
      status: 'idle',
      lastSyncTime: 0,
      lastSyncDirection: null,
      error: null,
      visualChangesPending: false,
      codeChangesPending: false,
    };

    this.lastVisualState = null;
    this.lastCodeState = null;
    this.lastVisualChangeTime = 0;
    this.lastCodeChangeTime = 0;
  }

  /**
   * Cleans up resources
   */
  destroy(): void {
    this.debouncedVisualToCode.cancel();
    this.debouncedCodeToVisual.cancel();
  }
}

/**
 * Factory function to create a sync manager
 */
export function createSyncManager(
  onVisualToCode: (code: string) => void,
  onCodeToVisual: (state: { nodes: Node[]; edges: Edge[] }) => void,
  options?: SyncOptions
): SyncManager {
  return new SyncManager(onVisualToCode, onCodeToVisual, options);
}

/**
 * Custom React hook for sync management
 */
export function useSyncManager(
  onVisualToCode: (code: string) => void,
  onCodeToVisual: (state: { nodes: Node[]; edges: Edge[] }) => void,
  options?: SyncOptions
): {
  syncManager: SyncManager;
  state: SyncState;
} {
  const syncManager = createSyncManager(onVisualToCode, onCodeToVisual, options);

  return {
    syncManager,
    state: syncManager.getState(),
  };
}
