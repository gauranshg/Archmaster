/**
 * View Store
 *
 * Manages view mode state for split view functionality.
 * Handles visual, code, and split view modes with panel sizing.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { ViewMode } from '@/types';

/**
 * View state interface
 */
export interface ViewState {
  // State
  viewMode: ViewMode;
  splitRatio: number; // 0-1, where 0.5 is 50/50
  visualPanelCollapsed: boolean;
  codePanelCollapsed: boolean;
  minPanelSize: number; // minimum panel size in percentage (0-100)

  // Actions
  setViewMode: (mode: ViewMode) => void;
  setSplitRatio: (ratio: number) => void;
  toggleVisualPanel: () => void;
  toggleCodePanel: () => void;
  collapseVisualPanel: () => void;
  expandVisualPanel: () => void;
  collapseCodePanel: () => void;
  expandCodePanel: () => void;
  resetView: () => void;
}

/**
 * Default values
 */
const DEFAULT_SPLIT_RATIO = 0.5;
const DEFAULT_VIEW_MODE: ViewMode = 'visual';
const MIN_PANEL_SIZE = 20; // 20% minimum

/**
 * View store with persistence and devtools
 */
export const useViewStore = create<ViewState>()(
  devtools(
    persist(
      immer((set) => ({
        // Initial state
        viewMode: DEFAULT_VIEW_MODE,
        splitRatio: DEFAULT_SPLIT_RATIO,
        visualPanelCollapsed: false,
        codePanelCollapsed: false,
        minPanelSize: MIN_PANEL_SIZE,

        // Set view mode
        setViewMode: (mode) =>
          set((state) => {
            state.viewMode = mode;

            // Auto-expand panels when switching to split mode
            if (mode === 'split') {
              state.visualPanelCollapsed = false;
              state.codePanelCollapsed = false;
            }
          }),

        // Set split ratio
        setSplitRatio: (ratio) =>
          set((state) => {
            // Clamp ratio between min and max
            const min = state.minPanelSize / 100;
            const max = 1 - min;
            state.splitRatio = Math.max(min, Math.min(max, ratio));
          }),

        // Toggle visual panel
        toggleVisualPanel: () =>
          set((state) => {
            state.visualPanelCollapsed = !state.visualPanelCollapsed;

            // If both collapsed, expand the other one
            if (state.visualPanelCollapsed && state.codePanelCollapsed) {
              state.codePanelCollapsed = false;
            }
          }),

        // Toggle code panel
        toggleCodePanel: () =>
          set((state) => {
            state.codePanelCollapsed = !state.codePanelCollapsed;

            // If both collapsed, expand the other one
            if (state.visualPanelCollapsed && state.codePanelCollapsed) {
              state.visualPanelCollapsed = false;
            }
          }),

        // Collapse visual panel
        collapseVisualPanel: () =>
          set((state) => {
            state.visualPanelCollapsed = true;

            // If both collapsed, expand code panel
            if (state.codePanelCollapsed) {
              state.codePanelCollapsed = false;
            }
          }),

        // Expand visual panel
        expandVisualPanel: () =>
          set((state) => {
            state.visualPanelCollapsed = false;
          }),

        // Collapse code panel
        collapseCodePanel: () =>
          set((state) => {
            state.codePanelCollapsed = true;

            // If both collapsed, expand visual panel
            if (state.visualPanelCollapsed) {
              state.visualPanelCollapsed = false;
            }
          }),

        // Expand code panel
        expandCodePanel: () =>
          set((state) => {
            state.codePanelCollapsed = false;
          }),

        // Reset view to defaults
        resetView: () =>
          set((state) => {
            state.viewMode = DEFAULT_VIEW_MODE;
            state.splitRatio = DEFAULT_SPLIT_RATIO;
            state.visualPanelCollapsed = false;
            state.codePanelCollapsed = false;
          }),
      })),
      {
        name: 'view-storage',
        // Persist all view state
        partialize: (state) => ({
          viewMode: state.viewMode,
          splitRatio: state.splitRatio,
          visualPanelCollapsed: state.visualPanelCollapsed,
          codePanelCollapsed: state.codePanelCollapsed,
        }),
      }
    ),
    { name: 'ViewStore' }
  )
);
