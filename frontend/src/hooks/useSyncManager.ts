/**
 * useSyncManager Hook
 *
 * React hook for managing bidirectional sync between visual and code editors.
 * Provides easy integration with React components and automatic cleanup.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Node, Edge } from 'reactflow';
import { SyncManager, type SyncState, type SyncOptions, type SyncDirection } from '@/services/sync';

/**
 * Return type for useSyncManager hook
 */
export interface UseSyncManagerReturn {
  /** Sync manager instance */
  syncManager: SyncManager;

  /** Current sync state */
  syncState: SyncState;

  /** Trigger sync from visual to code */
  syncVisualToCode: (nodes: Node[], edges: Edge[]) => void;

  /** Trigger sync from code to visual */
  syncCodeToVisual: (code: string, format: 'json' | 'yaml') => void;

  /** Force immediate sync */
  forceSync: (direction: SyncDirection) => void;

  /** Set code format */
  setFormat: (format: 'json' | 'yaml') => void;

  /** Reset sync state */
  resetSync: () => void;
}

/**
 * Options for useSyncManager hook
 */
export interface UseSyncManagerOptions extends Omit<SyncOptions, 'onStatusChange' | 'onError'> {
  /** Callback when visual → code sync occurs */
  onVisualToCode?: (code: string) => void;

  /** Callback when code → visual sync occurs */
  onCodeToVisual?: (state: { nodes: Node[]; edges: Edge[] }) => void;

  /** Callback when sync status changes */
  onStatusChange?: (state: SyncState) => void;

  /** Callback when sync fails */
  onError?: (error: { message: string; direction?: string }) => void;
}

/**
 * Hook for managing bidirectional sync
 *
 * @example
 * ```tsx
 * const { syncManager, syncState, syncVisualToCode, syncCodeToVisual } = useSyncManager({
 *   onVisualToCode: (code) => setCode(code),
 *   onCodeToVisual: ({ nodes, edges }) => {
 *     setNodes(nodes);
 *     setEdges(edges);
 *   },
 *   onStatusChange: (state) => console.log('Sync state:', state),
 *   visualDebounceDelay: 300,
 *   codeDebounceDelay: 300,
 * });
 * ```
 */
export function useSyncManager(options: UseSyncManagerOptions = {}): UseSyncManagerReturn {
  const {
    onVisualToCode: externalOnVisualToCode,
    onCodeToVisual: externalOnCodeToVisual,
    onStatusChange: externalOnStatusChange,
    onError: externalOnError,
    ...syncOptions
  } = options;

  // State for sync state
  const [syncState, setSyncState] = useState<SyncState>({
    status: 'idle',
    lastSyncTime: 0,
    lastSyncDirection: null,
    error: null,
    visualChangesPending: false,
    codeChangesPending: false,
  });

  // Ref to store the sync manager instance
  const syncManagerRef = useRef<SyncManager | null>(null);

  // Create sync manager on mount
  useEffect(() => {
    const manager = new SyncManager(
      // onVisualToCode callback
      (code: string) => {
        // Trigger external callback
        externalOnVisualToCode?.(code);
      },
      // onCodeToVisual callback
      (state: { nodes: Node[]; edges: Edge[] }) => {
        // Trigger external callback
        externalOnCodeToVisual?.(state);
      },
      {
        ...syncOptions,
        // onStatusChange callback
        onStatusChange: (state: SyncState) => {
          // Update local state
          setSyncState(state);
          // Trigger external callback
          externalOnStatusChange?.(state);
        },
        // onError callback
        onError: (error) => {
          // Trigger external callback
          externalOnError?.({
            message: error.message,
            direction: error.direction,
          });
        },
      }
    );

    syncManagerRef.current = manager;

    // Cleanup on unmount
    return () => {
      manager.destroy();
      syncManagerRef.current = null;
    };
  }, []); // Empty deps - only create once

  // Update callbacks when they change
  useEffect(() => {
    if (syncManagerRef.current) {
      // The sync manager already has the callbacks registered
      // We don't need to update them as they're closures
    }
  }, [externalOnVisualToCode, externalOnCodeToVisual, externalOnStatusChange, externalOnError]);

  /**
   * Sync visual changes to code
   */
  const syncVisualToCode = useCallback((nodes: Node[], edges: Edge[]) => {
    syncManagerRef.current?.syncVisualToCode(nodes, edges);
  }, []);

  /**
   * Sync code changes to visual
   */
  const syncCodeToVisual = useCallback((code: string, format: 'json' | 'yaml') => {
    syncManagerRef.current?.syncCodeToVisual(code, format);
  }, []);

  /**
   * Force immediate sync
   */
  const forceSync = useCallback((direction: SyncDirection) => {
    syncManagerRef.current?.forceSync(direction);
  }, []);

  /**
   * Set code format
   */
  const setFormat = useCallback((format: 'json' | 'yaml') => {
    syncManagerRef.current?.setFormat(format);
  }, []);

  /**
   * Reset sync state
   */
  const resetSync = useCallback(() => {
    syncManagerRef.current?.reset();
    setSyncState({
      status: 'idle',
      lastSyncTime: 0,
      lastSyncDirection: null,
      error: null,
      visualChangesPending: false,
      codeChangesPending: false,
    });
  }, []);

  return {
    syncManager: syncManagerRef.current!,
    syncState,
    syncVisualToCode,
    syncCodeToVisual,
    forceSync,
    setFormat,
    resetSync,
  };
}

/**
 * Hook that automatically syncs visual changes
 *
 * @example
 * ```tsx
 * useVisualSync(nodes, edges, syncManager);
 * ```
 */
export function useVisualSync(
  nodes: Node[],
  edges: Edge[],
  syncManager: SyncManager | null,
  enabled: boolean = true
): void {
  const prevNodesRef = useRef<Node[]>(nodes);
  const prevEdgesRef = useRef<Edge[]>(edges);

  useEffect(() => {
    if (!syncManager || !enabled) {
      return;
    }

    // Check if nodes or edges have changed
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

    const edgesChanged =
      edges.length !== prevEdgesRef.current.length ||
      edges.some((edge, i) => {
        const prevEdge = prevEdgesRef.current[i];
        return (
          !prevEdge ||
          edge.id !== prevEdge.id ||
          edge.source !== prevEdge.source ||
          edge.target !== prevEdge.target ||
          JSON.stringify(edge.data) !== JSON.stringify(prevEdge.data)
        );
      });

    if (nodesChanged || edgesChanged) {
      syncManager.syncVisualToCode(nodes, edges);
      prevNodesRef.current = nodes;
      prevEdgesRef.current = edges;
    }
  }, [nodes, edges, syncManager, enabled]);
}

/**
 * Hook that automatically syncs code changes
 *
 * @example
 * ```tsx
 * useCodeSync(code, format, syncManager);
 * ```
 */
export function useCodeSync(
  code: string,
  format: 'json' | 'yaml',
  syncManager: SyncManager | null,
  enabled: boolean = true
): void {
  const prevCodeRef = useRef<string>(code);
  const prevFormatRef = useRef<'json' | 'yaml'>(format);

  useEffect(() => {
    if (!syncManager || !enabled) {
      return;
    }

    // Check if code or format has changed
    const codeChanged = code !== prevCodeRef.current;
    const formatChanged = format !== prevFormatRef.current;

    if (codeChanged || formatChanged) {
      syncManager.syncCodeToVisual(code, format);
      prevCodeRef.current = code;
      prevFormatRef.current = format;
    }
  }, [code, format, syncManager, enabled]);
}
