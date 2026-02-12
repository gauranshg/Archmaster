/**
 * Template Store
 *
 * Zustand store for managing template state and operations.
 * Handles template loading, creation, deletion, and filtering.
 */

import { create } from 'zustand';
import { templateStorage } from '@/services/storage/templateStorage';
import { seedDefaultTemplates } from '@/services/templates/defaultTemplates';
import type { Template, TemplateFilter, TemplateCategory } from '@/types';

/**
 * Template store state
 */
interface TemplateState {
  // All templates
  templates: Template[];

  // Currently selected template
  selectedTemplate: Template | null;

  // Loading state
  isLoading: boolean;

  // Error state
  error: string | null;

  // Search query
  searchQuery: string;

  // Active category filter
  activeCategory: TemplateCategory | 'all';

  // Whether default templates have been seeded
  isSeeded: boolean;
}

/**
 * Template store actions
 */
interface TemplateActions {
  // Load all templates from storage
  loadTemplates: () => Promise<void>;

  // Seed default templates
  seedTemplates: () => Promise<void>;

  // Create a new template
  createTemplate: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;

  // Update an existing template
  updateTemplate: (id: string, updates: Partial<Template>) => Promise<void>;

  // Delete a template
  deleteTemplate: (id: string) => Promise<void>;

  // Set selected template
  setSelectedTemplate: (template: Template | null) => void;

  // Set search query
  setSearchQuery: (query: string) => void;

  // Set active category filter
  setActiveCategory: (category: TemplateCategory | 'all') => void;

  // Get filtered templates
  getFilteredTemplates: () => Template[];

  // Get templates by category
  getTemplatesByCategory: (category: TemplateCategory) => Template[];

  // Get template by ID
  getTemplateById: (id: string) => Template | undefined;

  // Clear error
  clearError: () => void;

  // Refresh templates from storage
  refresh: () => Promise<void>;
}

/**
 * Template store
 */
export const useTemplateStore = create<TemplateState & TemplateActions>(
  (set, get) => ({
    // Initial state
    templates: [],
    selectedTemplate: null,
    isLoading: false,
    error: null,
    searchQuery: '',
    activeCategory: 'all',
    isSeeded: false,

    // Load all templates
    loadTemplates: async () => {
      set({ isLoading: true, error: null });
      try {
        const templates = await templateStorage.getAll();
        set({ templates, isLoading: false });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load templates';
        set({ error: message, isLoading: false });
        console.error('Failed to load templates:', error);
      }
    },

    // Seed default templates
    seedTemplates: async () => {
      set({ isLoading: true, error: null });
      try {
        const defaultTemplates = await seedDefaultTemplates();
        await templateStorage.bulkSave(defaultTemplates);
        set({
          templates: defaultTemplates,
          isLoading: false,
          isSeeded: true,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to seed templates';
        set({ error: message, isLoading: false });
        console.error('Failed to seed templates:', error);
      }
    },

    // Create a new template
    createTemplate: async (templateData) => {
      set({ isLoading: true, error: null });
      try {
        const now = new Date().toISOString();
        const newTemplate: Template = {
          ...templateData,
          id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: now,
          updatedAt: now,
        };

        await templateStorage.save(newTemplate);

        set((state) => ({
          templates: [...state.templates, newTemplate],
          isLoading: false,
        }));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create template';
        set({ error: message, isLoading: false });
        console.error('Failed to create template:', error);
        throw error;
      }
    },

    // Update an existing template
    updateTemplate: async (id, updates) => {
      set({ isLoading: true, error: null });
      try {
        const template = get().templates.find((t) => t.id === id);
        if (!template) {
          throw new Error(`Template ${id} not found`);
        }

        const updatedTemplate: Template = {
          ...template,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        await templateStorage.save(updatedTemplate);

        set((state) => ({
          templates: state.templates.map((t) => (t.id === id ? updatedTemplate : t)),
          isLoading: false,
        }));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update template';
        set({ error: message, isLoading: false });
        console.error('Failed to update template:', error);
        throw error;
      }
    },

    // Delete a template
    deleteTemplate: async (id) => {
      set({ isLoading: true, error: null });
      try {
        await templateStorage.delete(id);

        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
          selectedTemplate:
            state.selectedTemplate?.id === id ? null : state.selectedTemplate,
          isLoading: false,
        }));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete template';
        set({ error: message, isLoading: false });
        console.error('Failed to delete template:', error);
        throw error;
      }
    },

    // Set selected template
    setSelectedTemplate: (template) => {
      set({ selectedTemplate: template });
    },

    // Set search query
    setSearchQuery: (query) => {
      set({ searchQuery: query });
    },

    // Set active category
    setActiveCategory: (category) => {
      set({ activeCategory: category });
    },

    // Get filtered templates
    getFilteredTemplates: () => {
      const { templates, searchQuery, activeCategory } = get();

      let filtered = templates;

      // Filter by category
      if (activeCategory !== 'all') {
        filtered = filtered.filter((t) => t.category === activeCategory);
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.name.toLowerCase().includes(query) ||
            t.description?.toLowerCase().includes(query) ||
            t.tags?.some((tag) => tag.toLowerCase().includes(query))
        );
      }

      return filtered;
    },

    // Get templates by category
    getTemplatesByCategory: (category) => {
      return get().templates.filter((t) => t.category === category);
    },

    // Get template by ID
    getTemplateById: (id) => {
      return get().templates.find((t) => t.id === id);
    },

    // Clear error
    clearError: () => {
      set({ error: null });
    },

    // Refresh from storage
    refresh: async () => {
      await get().loadTemplates();
    },
  })
);

/**
 * Hook to get filtered templates (computed)
 */
export function useFilteredTemplates(): Template[] {
  const templates = useTemplateStore((state) => state.templates);
  const searchQuery = useTemplateStore((state) => state.searchQuery);
  const activeCategory = useTemplateStore((state) => state.activeCategory);

  // Compute filtered templates
  let filtered = templates;

  // Filter by category
  if (activeCategory !== 'all') {
    filtered = filtered.filter((t) => t.category === activeCategory);
  }

  // Filter by search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  }

  return filtered;
}

/**
 * Hook to get templates grouped by category
 */
export function useTemplatesByCategory(): Record<string, Template[]> {
  const templates = useFilteredTemplates();
  return templates.reduce((acc, template) => {
    const category = template.category || 'custom';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {} as Record<string, Template[]>);
}

/**
 * Hook to get template categories
 */
export function useTemplateCategories(): (TemplateCategory | 'all')[] {
  // Return stable array reference
  return Object.freeze(['all', 'database', 'service', 'infrastructure', 'external', 'component', 'container', 'custom']);
}
