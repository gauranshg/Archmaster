/**
 * Workspace Store
 *
 * Workspace state management using Zustand.
 * Manages workspaces and diagrams within workspaces.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Workspace, Diagram } from '@/types';

/**
 * Workspace state interface
 */
export interface WorkspaceState {
  // State
  currentWorkspace: Workspace | null;
  diagrams: Diagram[];
  recentWorkspaces: Workspace[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentWorkspace: (workspace: Workspace) => void;
  setDiagrams: (diagrams: Diagram[]) => void;
  addDiagram: (diagram: Diagram) => void;
  updateDiagram: (id: string, updates: Partial<Diagram>) => void;
  deleteDiagram: (id: string) => void;
  addRecentWorkspace: (workspace: Workspace) => void;
  removeRecentWorkspace: (workspaceId: string) => void;
  clearRecentWorkspaces: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetWorkspace: () => void;
}

/**
 * Maximum number of recent workspaces to keep
 */
const MAX_RECENT_WORKSPACES = 5;

/**
 * Workspace store with persistence and devtools
 */
export const useWorkspaceStore = create<WorkspaceState>()(
  devtools(
    persist(
      immer((set) => ({
        // Initial state
        currentWorkspace: null,
        diagrams: [],
        recentWorkspaces: [],
        isLoading: false,
        error: null,

        // Set current workspace
        setCurrentWorkspace: (workspace) =>
          set((state) => {
            state.currentWorkspace = workspace;
            state.diagrams = [];
            state.error = null;
          }),

        // Set diagrams
        setDiagrams: (diagrams) =>
          set((state) => {
            state.diagrams = diagrams;
          }),

        // Add diagram
        addDiagram: (diagram) =>
          set((state) => {
            state.diagrams.push(diagram);
          }),

        // Update diagram
        updateDiagram: (id, updates) =>
          set((state) => {
            const index = state.diagrams.findIndex((d) => d.id === id);
            if (index !== -1) {
              state.diagrams[index] = {
                ...state.diagrams[index],
                ...updates,
                updatedAt: new Date().toISOString(),
              };
            }
          }),

        // Delete diagram
        deleteDiagram: (id) =>
          set((state) => {
            state.diagrams = state.diagrams.filter((d) => d.id !== id);
          }),

        // Add to recent workspaces
        addRecentWorkspace: (workspace) =>
          set((state) => {
            // Remove if already exists
            state.recentWorkspaces = state.recentWorkspaces.filter(
              (w) => w.id !== workspace.id
            );
            // Add to beginning
            state.recentWorkspaces.unshift(workspace);
            // Keep only max number
            state.recentWorkspaces = state.recentWorkspaces.slice(
              0,
              MAX_RECENT_WORKSPACES
            );
          }),

        // Remove from recent workspaces
        removeRecentWorkspace: (workspaceId) =>
          set((state) => {
            state.recentWorkspaces = state.recentWorkspaces.filter(
              (w) => w.id !== workspaceId
            );
          }),

        // Clear recent workspaces
        clearRecentWorkspaces: () =>
          set((state) => {
            state.recentWorkspaces = [];
          }),

        // Set loading state
        setLoading: (loading) =>
          set((state) => {
            state.isLoading = loading;
          }),

        // Set error
        setError: (error) =>
          set((state) => {
            state.error = error;
          }),

        // Reset workspace state
        resetWorkspace: () =>
          set((state) => {
            state.currentWorkspace = null;
            state.diagrams = [];
            state.isLoading = false;
            state.error = null;
          }),
      })),
      {
        name: 'workspace-storage',
        // Persist recent workspaces and current workspace ID
        partialize: (state) => ({
          currentWorkspace: state.currentWorkspace,
          recentWorkspaces: state.recentWorkspaces,
        }),
      }
    ),
    { name: 'WorkspaceStore' }
  )
);
