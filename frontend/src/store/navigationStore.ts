/**
 * Navigation Store
 *
 * Manages drill-down navigation state and breadcrumbs.
 */

import { create } from 'zustand';
import type { Diagram } from '@/types';

interface NavigationBreadcrumb {
  id: string;
  name: string;
  type: Diagram['type'];
}

interface NavigationState {
  /** Current navigation path (breadcrumb trail) */
  breadcrumbs: NavigationBreadcrumb[];

  /** Current diagram ID */
  currentDiagramId: string | null;

  /** Navigation history for back/forward */
  history: string[];
  historyIndex: number;

  /** Actions */
  setCurrentDiagram: (diagram: Diagram) => void;
  navigateToDiagram: (diagram: Diagram) => void;
  navigateBack: () => void;
  navigateForward: () => void;
  canGoBack: () => boolean;
  canGoForward: () => boolean;
  clearHistory: () => void;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  breadcrumbs: [],
  currentDiagramId: null,
  history: [],
  historyIndex: -1,

  setCurrentDiagram: (diagram) => {
    const newBreadcrumb: NavigationBreadcrumb = {
      id: diagram.id,
      name: diagram.name,
      type: diagram.type,
    };

    set((state) => {
      // Check if this diagram is already in breadcrumbs
      const existingIndex = state.breadcrumbs.findIndex((b) => b.id === diagram.id);

      if (existingIndex >= 0) {
        // Navigate to existing level (remove everything after)
        return {
          breadcrumbs: state.breadcrumbs.slice(0, existingIndex + 1),
          currentDiagramId: diagram.id,
        };
      }

      // Add new breadcrumb
      return {
        breadcrumbs: [...state.breadcrumbs, newBreadcrumb],
        currentDiagramId: diagram.id,
      };
    });
  },

  navigateToDiagram: (diagram) => {
    const { history, historyIndex } = get();

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(diagram.id);

    set({
      currentDiagramId: diagram.id,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });

    // Update breadcrumbs
    get().setCurrentDiagram(diagram);
  },

  navigateBack: () => {
    const { history, historyIndex } = get();

    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const diagramId = history[newIndex];

      set({
        currentDiagramId: diagramId,
        historyIndex: newIndex,
      });
    }
  },

  navigateForward: () => {
    const { history, historyIndex } = get();

    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const diagramId = history[newIndex];

      set({
        currentDiagramId: diagramId,
        historyIndex: newIndex,
      });
    }
  },

  canGoBack: () => {
    return get().historyIndex > 0;
  },

  canGoForward: () => {
    const { history, historyIndex } = get();
    return historyIndex < history.length - 1;
  },

  clearHistory: () => {
    set({
      breadcrumbs: [],
      currentDiagramId: null,
      history: [],
      historyIndex: -1,
    });
  },
}));
