/**
 * Architecture Template Store
 *
 * Zustand store for managing architecture template state.
 * Handles template selection and diagram creation from templates.
 */

import { create } from 'zustand';
import {
  ARCHITECTURE_TEMPLATES,
  getArchitectureTemplateById,
  createDiagramFromTemplate,
} from '@/services/c4';
import type { ArchitectureTemplate, Diagram } from '@/types';

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Architecture template store state
 */
interface ArchitectureTemplateState {
  /** All available templates */
  templates: readonly ArchitectureTemplate[];

  /** Currently selected template */
  selectedTemplate: ArchitectureTemplate | null;

  /** Selected template category filter */
  selectedCategory: 'all' | ArchitectureTemplate['category'];

  /** Search query for filtering templates */
  searchQuery: string;

  /** Loading state */
  isLoading: boolean;

  /** Error state */
  error: string | null;

  /** Recently used template IDs */
  recentTemplateIds: string[];

  /** Favorite template IDs */
  favoriteTemplateIds: string[];
}

/**
 * Architecture template store actions
 */
interface ArchitectureTemplateActions {
  /** Select a template */
  selectTemplate: (templateId: string) => ArchitectureTemplate | null;

  /** Clear template selection */
  clearSelection: () => void;

  /** Set category filter */
  setCategory: (category: 'all' | ArchitectureTemplate['category']) => void;

  /** Set search query */
  setSearchQuery: (query: string) => void;

  /** Create a diagram from the selected template */
  createDiagramFromTemplate: (
    workspaceId: string,
    customName?: string
  ) => Omit<Diagram, 'id' | 'createdAt' | 'updatedAt'> | null;

  /** Create a diagram from a specific template */
  createDiagramFromId: (
    templateId: string,
    workspaceId: string,
    customName?: string
  ) => Omit<Diagram, 'id' | 'createdAt' | 'updatedAt'> | null;

  /** Add template to recent */
  addToRecent: (templateId: string) => void;

  /** Toggle template favorite */
  toggleFavorite: (templateId: string) => void;

  /** Check if template is favorite */
  isFavorite: (templateId: string) => boolean;

  /** Get filtered templates based on current filters */
  getFilteredTemplates: () => readonly ArchitectureTemplate[];

  /** Get recent templates */
  getRecentTemplates: () => readonly ArchitectureTemplate[];

  /** Get favorite templates */
  getFavoriteTemplates: () => readonly ArchitectureTemplate[];

  /** Reset store state */
  reset: () => void;
}

/**
 * Initial state
 */
const initialState: ArchitectureTemplateState = {
  templates: ARCHITECTURE_TEMPLATES,
  selectedTemplate: null,
  selectedCategory: 'all',
  searchQuery: '',
  isLoading: false,
  error: null,
  recentTemplateIds: [],
  favoriteTemplateIds: [],
};

/**
 * Create the architecture template store
 */
export const useArchitectureTemplateStore = create<
  ArchitectureTemplateState & ArchitectureTemplateActions
>((set, get) => ({
  ...initialState,

  selectTemplate: (templateId: string) => {
    const template = getArchitectureTemplateById(templateId);
    if (template) {
      set({ selectedTemplate: template });
      // Automatically add to recent when selected
      get().addToRecent(templateId);
    }
    return template || null;
  },

  clearSelection: () => {
    set({ selectedTemplate: null });
  },

  setCategory: (category) => {
    set({ selectedCategory: category });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  createDiagramFromTemplate: (workspaceId: string, customName?: string) => {
    const { selectedTemplate } = get();
    if (!selectedTemplate) {
      return null;
    }
    return createDiagramFromTemplate(selectedTemplate.id, workspaceId, customName);
  },

  createDiagramFromId: (templateId: string, workspaceId: string, customName?: string) => {
    return createDiagramFromTemplate(templateId, workspaceId, customName);
  },

  addToRecent: (templateId: string) => {
    set((state) => {
      // Remove if already exists (to move to front)
      const filtered = state.recentTemplateIds.filter((id) => id !== templateId);
      // Add to front, keep max 10
      const recent = [templateId, ...filtered].slice(0, 10);
      return { recentTemplateIds: recent };
    });
  },

  toggleFavorite: (templateId: string) => {
    set((state) => {
      const exists = state.favoriteTemplateIds.includes(templateId);
      const favorites = exists
        ? state.favoriteTemplateIds.filter((id) => id !== templateId)
        : [...state.favoriteTemplateIds, templateId];
      return { favoriteTemplateIds: favorites };
    });
  },

  isFavorite: (templateId: string) => {
    return get().favoriteTemplateIds.includes(templateId);
  },

  getFilteredTemplates: () => {
    const { templates, selectedCategory, searchQuery } = get();
    return templates.filter((template) => {
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  },

  getRecentTemplates: () => {
    const { recentTemplateIds } = get();
    return recentTemplateIds
      .map((id) => getArchitectureTemplateById(id))
      .filter((template): template is ArchitectureTemplate => template !== undefined);
  },

  getFavoriteTemplates: () => {
    const { favoriteTemplateIds } = get();
    return favoriteTemplateIds
      .map((id) => getArchitectureTemplateById(id))
      .filter((template): template is ArchitectureTemplate => template !== undefined);
  },

  reset: () => {
    set(initialState);
  },
}));

/**
 * Hook to get template statistics
 */
export function useTemplateStats() {
  const { templates, recentTemplateIds, favoriteTemplateIds } = useArchitectureTemplateStore();

  return {
    totalTemplates: templates.length,
    recentCount: recentTemplateIds.length,
    favoriteCount: favoriteTemplateIds.length,
    categories: {
      microservices: templates.filter((t) => t.category === 'microservices').length,
      monolithic: templates.filter((t) => t.category === 'monolithic').length,
      'event-driven': templates.filter((t) => t.category === 'event-driven').length,
      layered: templates.filter((t) => t.category === 'layered').length,
      serverless: templates.filter((t) => t.category === 'serverless').length,
    },
  };
}

/**
 * Hook to get a template by ID
 */
export function useTemplate(templateId: string | undefined) {
  const templates = useArchitectureTemplateStore((state) => state.templates);
  return templateId ? getArchitectureTemplateById(templateId) : null;
}
