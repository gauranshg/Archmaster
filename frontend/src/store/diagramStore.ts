/**
 * Diagram Store
 *
 * Core diagram state management using Zustand.
 * Manages nodes, edges, and diagram selection.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Diagram, Node, Edge } from '@/types';

/**
 * Diagram state interface
 */
export interface DiagramState {
  // State
  currentDiagram: Diagram | null;
  nodes: Node[];
  edges: Edge[];
  selectedNodes: string[];
  selectedEdges: string[];

  // Actions
  setCurrentDiagram: (diagram: Diagram) => void;
  addNode: (node: Node) => void;
  updateNode: (id: string, updates: Partial<Node>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: Edge) => void;
  updateEdge: (id: string, updates: Partial<Edge>) => void;
  deleteEdge: (id: string) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNodes: (ids: string[]) => void;
  setSelectedEdges: (ids: string[]) => void;
  clearSelection: () => void;
  resetDiagram: () => void;
  updateCustomCSS: (css: string) => void;
  getDiagramCSS: () => string;
  onNodesChange: (changes: any[]) => void;
  onEdgesChange: (changes: any[]) => void;
  onConnect: (connection: any) => void;
}

/**
 * Diagram store with persistence and devtools
 */
export const useDiagramStore = create<DiagramState>()(
  devtools(
    persist(
      immer((set) => ({
        // Initial state
        currentDiagram: null,
        nodes: [],
        edges: [],
        selectedNodes: [],
        selectedEdges: [],

        // Set current diagram
        setCurrentDiagram: (diagram) =>
          set((state) => {
            state.currentDiagram = diagram;
            // Cast to any to handle immer draft type issues with optional properties
            state.nodes = (diagram.nodes || []) as any;
            state.edges = (diagram.edges || []) as any;
            state.selectedNodes = [];
            state.selectedEdges = [];
          }),

        // Add node
        addNode: (node) =>
          set((state) => {
            state.nodes.push(node);
          }),

        // Update node
        updateNode: (id, updates) =>
          set((state) => {
            const index = state.nodes.findIndex((n) => n.id === id);
            if (index !== -1) {
              state.nodes[index] = { ...state.nodes[index], ...updates };
            }
          }),

        // Delete node
        deleteNode: (id) =>
          set((state) => {
            state.nodes = state.nodes.filter((n) => n.id !== id);
            // Also remove connected edges
            state.edges = state.edges.filter(
              (e) => e.source !== id && e.target !== id
            );
            // Remove from selection
            state.selectedNodes = state.selectedNodes.filter((n) => n !== id);
          }),

        // Add edge
        addEdge: (edge) =>
          set((state) => {
            state.edges.push(edge);
          }),

        // Set all nodes (for bulk updates like layout)
        setNodes: (nodes) =>
          set((state) => {
            state.nodes = nodes;
          }),

        // Set all edges (for bulk updates)
        setEdges: (edges) =>
          set((state) => {
            state.edges = edges;
          }),

        // Update edge
        updateEdge: (id, updates) =>
          set((state) => {
            const index = state.edges.findIndex((e) => e.id === id);
            if (index !== -1) {
              state.edges[index] = { ...state.edges[index], ...updates };
            }
          }),

        // Delete edge
        deleteEdge: (id) =>
          set((state) => {
            state.edges = state.edges.filter((e) => e.id !== id);
            // Remove from selection
            state.selectedEdges = state.selectedEdges.filter((e) => e !== id);
          }),

        // Set selected nodes
        setSelectedNodes: (ids) =>
          set((state) => {
            state.selectedNodes = ids;
          }),

        // Set selected edges
        setSelectedEdges: (ids) =>
          set((state) => {
            state.selectedEdges = ids;
          }),

        // Clear selection
        clearSelection: () =>
          set((state) => {
            state.selectedNodes = [];
            state.selectedEdges = [];
          }),

        // Reset diagram state
        resetDiagram: () =>
          set((state) => {
            state.currentDiagram = null;
            state.nodes = [];
            state.edges = [];
            state.selectedNodes = [];
            state.selectedEdges = [];
          }),

        // Update custom CSS for current diagram
        updateCustomCSS: (css) =>
          set((state) => {
            if (state.currentDiagram) {
              state.currentDiagram.customCSS = css;
            }
          }),

        // Get current diagram CSS
        getDiagramCSS: () => {
          const state = useDiagramStore.getState();
          return state.currentDiagram?.customCSS || '';
        },

        // Handle node changes (React Flow)
        onNodesChange: (changes) =>
          set((state) => {
            changes.forEach((change) => {
              if (change.type === 'position' && change.position) {
                const node = state.nodes.find((n) => n.id === change.id);
                if (node) {
                  node.position = change.position;
                }
              }
              if (change.type === 'remove') {
                state.nodes = state.nodes.filter((n) => n.id !== change.id);
                state.edges = state.edges.filter(
                  (e) => e.source !== change.id && e.target !== change.id
                );
              }
              if (change.type === 'select' && change.selected !== undefined) {
                if (change.selected) {
                  if (!state.selectedNodes.includes(change.id)) {
                    state.selectedNodes.push(change.id);
                  }
                } else {
                  state.selectedNodes = state.selectedNodes.filter((id) => id !== change.id);
                }
              }
            });
          }),

        // Handle edge changes (React Flow)
        onEdgesChange: (changes) =>
          set((state) => {
            changes.forEach((change) => {
              if (change.type === 'remove') {
                state.edges = state.edges.filter((e) => e.id !== change.id);
              }
              if (change.type === 'select' && change.selected !== undefined) {
                if (change.selected) {
                  if (!state.selectedEdges.includes(change.id)) {
                    state.selectedEdges.push(change.id);
                  }
                } else {
                  state.selectedEdges = state.selectedEdges.filter((id) => id !== change.id);
                }
              }
            });
          }),

        // Handle connection (React Flow)
        onConnect: (connection) =>
          set((state) => {
            const newEdge: Edge = {
              id: `edge-${Date.now()}`,
              source: connection.source,
              target: connection.target,
              sourceHandle: connection.sourceHandle,
              targetHandle: connection.targetHandle,
              diagramId: state.currentDiagram?.id || '',
              type: 'default',
              animated: false,
              style: {
                stroke: '#b1b1b7',
                strokeWidth: 2,
              },
              data: {},
            };
            state.edges.push(newEdge);
          }),
      })),
      {
        name: 'diagram-storage',
        // Persist only essential data
        partialize: (state) => ({
          currentDiagram: state.currentDiagram,
          nodes: state.nodes,
          edges: state.edges,
        }),
      }
    ),
    { name: 'DiagramStore' }
  )
);
