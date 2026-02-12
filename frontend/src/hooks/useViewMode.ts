/**
 * useViewMode Hook
 *
 * Custom hook for managing view mode with keyboard shortcuts.
 * Provides convenient access to view store functionality.
 */

import { useEffect, useCallback } from 'react';
import { useViewStore } from '@/store/viewStore';
import type { ViewMode } from '@/types';

export interface UseViewModeReturn {
  /** Current view mode */
  viewMode: ViewMode;
  /** Split ratio (0-1) */
  splitRatio: number;
  /** Visual panel collapsed state */
  visualPanelCollapsed: boolean;
  /** Code panel collapsed state */
  codePanelCollapsed: boolean;
  /** Minimum panel size percentage */
  minPanelSize: number;
  /** Set view mode */
  setViewMode: (mode: ViewMode) => void;
  /** Set split ratio */
  setSplitRatio: (ratio: number) => void;
  /** Toggle visual panel */
  toggleVisualPanel: () => void;
  /** Toggle code panel */
  toggleCodePanel: () => void;
  /** Collapse visual panel */
  collapseVisualPanel: () => void;
  /** Expand visual panel */
  expandVisualPanel: () => void;
  /** Collapse code panel */
  collapseCodePanel: () => void;
  /** Expand code panel */
  expandCodePanel: () => void;
  /** Reset view to defaults */
  resetView: () => void;
}

/**
 * Hook for view mode management with keyboard shortcuts
 *
 * @example
 * ```tsx
 * const { viewMode, setViewMode } = useViewMode();
 *
 * // Keyboard shortcuts:
 * // Ctrl+1: Visual mode
 * // Ctrl+2: Code mode
 * // Ctrl+3: Split mode
 * ```
 */
export function useViewMode(): UseViewModeReturn {
  const viewStore = useViewStore();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;

      if (!ctrl) return;

      // View mode shortcuts
      if (e.key === '1') {
        e.preventDefault();
        viewStore.setViewMode('visual');
      } else if (e.key === '2') {
        e.preventDefault();
        viewStore.setViewMode('code');
      } else if (e.key === '3') {
        e.preventDefault();
        viewStore.setViewMode('split');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewStore]);

  return viewStore;
}

/**
 * Hook for view mode with custom keyboard shortcuts
 *
 * @param shortcuts - Custom keyboard shortcuts map
 * @returns View mode state and actions
 *
 * @example
 * ```tsx
 * const { viewMode, setViewMode } = useViewModeWithShortcuts({
 *   'ctrl+shift+v': () => setViewMode('visual'),
 *   'ctrl+shift+c': () => setViewMode('code'),
 *   'ctrl+shift+s': () => setViewMode('split'),
 * });
 * ```
 */
export function useViewModeWithShortcuts(
  shortcuts: Record<string, () => void>
): UseViewModeReturn {
  const viewStore = useViewStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const alt = e.altKey;

      // Build shortcut string
      let shortcut = '';
      if (ctrl) shortcut += 'ctrl+';
      if (shift) shortcut += 'shift+';
      if (alt) shortcut += 'alt+';
      shortcut += e.key.toLowerCase();

      if (shortcuts[shortcut]) {
        e.preventDefault();
        shortcuts[shortcut]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  return viewStore;
}

export default useViewMode;
