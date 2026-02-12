/**
 * Bidirectional Sync Tests
 *
 * Unit tests for the sync manager and related functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SyncManager, type SyncState, type SyncDirection } from '../sync';
import type { Node, Edge } from 'reactflow';

describe('SyncManager', () => {
  let syncManager: SyncManager;
  let mockOnVisualToCode: ReturnType<typeof vi.fn>;
  let mockOnCodeToVisual: ReturnType<typeof vi.fn>;
  let mockOnStatusChange: ReturnType<typeof vi.fn>;
  let mockOnError: ReturnType<typeof vi.fn>;

  const mockNodes: Node[] = [
    {
      id: '1',
      position: { x: 0, y: 0 },
      data: { label: 'Node 1' },
    },
    {
      id: '2',
      position: { x: 100, y: 100 },
      data: { label: 'Node 2' },
    },
  ];

  const mockEdges: Edge[] = [
    {
      id: 'e1-2',
      source: '1',
      target: '2',
    },
  ];

  beforeEach(() => {
    mockOnVisualToCode = vi.fn();
    mockOnCodeToVisual = vi.fn();
    mockOnStatusChange = vi.fn();
    mockOnError = vi.fn();

    syncManager = new SyncManager(
      mockOnVisualToCode,
      mockOnCodeToVisual,
      {
        visualDebounceDelay: 100, // Faster for tests
        codeDebounceDelay: 100,
        onStatusChange: mockOnStatusChange,
        onError: mockOnError,
      }
    );
  });

  afterEach(() => {
    syncManager.destroy();
  });

  describe('initialization', () => {
    it('should create sync manager instance', () => {
      expect(syncManager).toBeInstanceOf(SyncManager);
    });

    it('should initialize with idle state', () => {
      const state = syncManager.getState();
      expect(state.status).toBe('idle');
      expect(state.lastSyncTime).toBe(0);
      expect(state.lastSyncDirection).toBeNull();
      expect(state.error).toBeNull();
    });

    it('should set default options', () => {
      const state = syncManager.getState();
      expect(state.visualChangesPending).toBe(false);
      expect(state.codeChangesPending).toBe(false);
    });
  });

  describe('visual to code sync', () => {
    it('should sync visual changes to code', async () => {
      syncManager.syncVisualToCode(mockNodes, mockEdges);

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(mockOnVisualToCode).toHaveBeenCalled();
      expect(mockOnVisualToCode.mock.calls[0][0]).toContain('Node 1');
      expect(mockOnVisualToCode.mock.calls[0][0]).toContain('Node 2');
    });

    it('should update sync state to synced', async () => {
      syncManager.syncVisualToCode(mockNodes, mockEdges);

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 150));

      const state = syncManager.getState();
      expect(state.status).toBe('synced');
      expect(state.lastSyncDirection).toBe('visual-to-code');
      expect(state.lastSyncTime).toBeGreaterThan(0);
    });

    it('should call onStatusChange callback', async () => {
      syncManager.syncVisualToCode(mockNodes, mockEdges);

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(mockOnStatusChange).toHaveBeenCalled();
      const state = mockOnStatusChange.mock.calls[0][0] as SyncState;
      expect(state.status).toBe('synced');
    });

    it('should debounce rapid changes', async () => {
      syncManager.syncVisualToCode(mockNodes, mockEdges);
      syncManager.syncVisualToCode(mockNodes, mockEdges);
      syncManager.syncVisualToCode(mockNodes, mockEdges);

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(mockOnVisualToCode).toHaveBeenCalledTimes(1);
    });
  });

  describe('code to visual sync', () => {
    const validJson = JSON.stringify({
      id: 'test',
      name: 'Test Diagram',
      type: 'generic',
      workspaceId: 'default',
      nodes: mockNodes,
      edges: mockEdges,
      metadata: {
        version: 1,
        author: 'test',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    it('should sync code changes to visual', async () => {
      syncManager.syncCodeToVisual(validJson, 'json');

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(mockOnCodeToVisual).toHaveBeenCalled();
      const syncedState = mockOnCodeToVisual.mock.calls[0][0];
      expect(syncedState.nodes).toHaveLength(2);
      expect(syncedState.edges).toHaveLength(1);
    });

    it('should update sync state to synced', async () => {
      syncManager.syncCodeToVisual(validJson, 'json');

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 150));

      const state = syncManager.getState();
      expect(state.status).toBe('synced');
      expect(state.lastSyncDirection).toBe('code-to-visual');
    });

    it('should handle YAML format', async () => {
      const yaml = require('js-yaml');
      const yamlData = yaml.dump({
        id: 'test',
        name: 'Test Diagram',
        type: 'generic',
        workspaceId: 'default',
        nodes: mockNodes,
        edges: mockEdges,
        metadata: {
          version: 1,
          author: 'test',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });

      syncManager.syncCodeToVisual(yamlData, 'yaml');

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(mockOnCodeToVisual).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle invalid JSON', async () => {
      const invalidJson = '{ invalid json }';

      syncManager.syncCodeToVisual(invalidJson, 'json');

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 150));

      const state = syncManager.getState();
      expect(state.status).toBe('error');
      expect(state.error).not.toBeNull();
      expect(mockOnError).toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      const invalidDiagram = JSON.stringify({
        id: 'test',
        // Missing required fields
      });

      syncManager.syncCodeToVisual(invalidDiagram, 'json');

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 150));

      const state = syncManager.getState();
      expect(state.status).toBe('error');
      expect(state.error?.message).toContain('Validation failed');
    });
  });

  describe('force sync', () => {
    it('should force visual to code sync immediately', async () => {
      syncManager.syncVisualToCode(mockNodes, mockEdges);

      // Force sync before debounce completes
      syncManager.forceSync('visual-to-code');

      expect(mockOnVisualToCode).toHaveBeenCalled();
    });

    it('should force code to visual sync immediately', async () => {
      const validJson = JSON.stringify({
        id: 'test',
        name: 'Test Diagram',
        type: 'generic',
        workspaceId: 'default',
        nodes: mockNodes,
        edges: mockEdges,
        metadata: {
          version: 1,
          author: 'test',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });

      syncManager.syncCodeToVisual(validJson, 'json');

      // Force sync before debounce completes
      syncManager.forceSync('code-to-visual');

      expect(mockOnCodeToVisual).toHaveBeenCalled();
    });

    it('should force bidirectional sync', async () => {
      const validJson = JSON.stringify({
        id: 'test',
        name: 'Test Diagram',
        type: 'generic',
        workspaceId: 'default',
        nodes: mockNodes,
        edges: mockEdges,
        metadata: {
          version: 1,
          author: 'test',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });

      syncManager.syncVisualToCode(mockNodes, mockEdges);
      syncManager.syncCodeToVisual(validJson, 'json');

      syncManager.forceSync('bidirectional');

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockOnVisualToCode).toHaveBeenCalled();
      expect(mockOnCodeToVisual).toHaveBeenCalled();
    });
  });

  describe('format switching', () => {
    it('should set format to json', () => {
      syncManager.setFormat('json');
      syncManager.syncVisualToCode(mockNodes, mockEdges);

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 150));

      const code = mockOnVisualToCode.mock.calls[0][0];
      expect(() => JSON.parse(code)).not.toThrow();
    });

    it('should set format to yaml', async () => {
      const yaml = require('js-yaml');

      syncManager.setFormat('yaml');
      syncManager.syncVisualToCode(mockNodes, mockEdges);

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 150));

      const code = mockOnVisualToCode.mock.calls[0][0];
      expect(() => yaml.load(code)).not.toThrow();
    });
  });

  describe('reset', () => {
    it('should reset sync state', async () => {
      syncManager.syncVisualToCode(mockNodes, mockEdges);

      // Wait for sync
      await new Promise((resolve) => setTimeout(resolve, 150));

      syncManager.reset();

      const state = syncManager.getState();
      expect(state.status).toBe('idle');
      expect(state.lastSyncTime).toBe(0);
      expect(state.lastSyncDirection).toBeNull();
      expect(state.error).toBeNull();
      expect(state.visualChangesPending).toBe(false);
      expect(state.codeChangesPending).toBe(false);
    });

    it('should cancel pending debounced syncs', () => {
      syncManager.syncVisualToCode(mockNodes, mockEdges);

      syncManager.reset();

      // Wait longer than debounce
      setTimeout(() => {
        expect(mockOnVisualToCode).not.toHaveBeenCalled();
      }, 150);
    });
  });

  describe('destroy', () => {
    it('should cleanup resources', () => {
      syncManager.syncVisualToCode(mockNodes, mockEdges);
      syncManager.destroy();

      // Wait longer than debounce
      setTimeout(() => {
        expect(mockOnVisualToCode).not.toHaveBeenCalled();
      }, 150);
    });
  });
});
