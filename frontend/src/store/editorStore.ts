/**
 * Editor Store
 *
 * Editor state management using Zustand.
 * Manages view mode, code content, and sync state.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { ViewMode } from '@/types';

/**
 * Editor state interface
 */
export interface EditorState {
  // State
  viewMode: ViewMode;
  codeContent: string;
  isSyncing: boolean;
  syncError: string | null;
  lastSyncTime: string | null;

  // Actions
  setViewMode: (mode: ViewMode) => void;
  setCodeContent: (content: string) => void;
  setSyncing: (isSyncing: boolean) => void;
  setSyncError: (error: string | null) => void;
  updateLastSyncTime: () => void;
  resetEditor: () => void;
}

/**
 * Initial code content template
 */
const INITIAL_CODE_CONTENT = `{
  "name": "My Diagram",
  "type": "generic",
  "nodes": [],
  "edges": []
}`;

/**
 * Editor store with persistence and devtools
 */
export const useEditorStore = create<EditorState>()(
  devtools(
    persist(
      immer((set) => ({
        // Initial state
        viewMode: 'visual',
        codeContent: INITIAL_CODE_CONTENT,
        isSyncing: false,
        syncError: null,
        lastSyncTime: null,

        // Set view mode
        setViewMode: (mode) =>
          set((state) => {
            state.viewMode = mode;
          }),

        // Set code content
        setCodeContent: (content) =>
          set((state) => {
            state.codeContent = content;
          }),

        // Set syncing state
        setSyncing: (isSyncing) =>
          set((state) => {
            state.isSyncing = isSyncing;
          }),

        // Set sync error
        setSyncError: (error) =>
          set((state) => {
            state.syncError = error;
          }),

        // Update last sync time
        updateLastSyncTime: () =>
          set((state) => {
            state.lastSyncTime = new Date().toISOString();
          }),

        // Reset editor state
        resetEditor: () =>
          set((state) => {
            state.viewMode = 'visual';
            state.codeContent = INITIAL_CODE_CONTENT;
            state.isSyncing = false;
            state.syncError = null;
            state.lastSyncTime = null;
          }),
      })),
      {
        name: 'editor-storage',
        // Persist all fields except sync error
        partialize: (state) => ({
          viewMode: state.viewMode,
          codeContent: state.codeContent,
          lastSyncTime: state.lastSyncTime,
        }),
      }
    ),
    { name: 'EditorStore' }
  )
);
