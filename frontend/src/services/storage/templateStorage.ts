/**
 * Template Storage Service
 *
 * Provides CRUD operations for templates stored in IndexedDB.
 * Templates are reusable node configurations.
 */

import { db, type StoredTemplate } from './db';
import type { Template, TemplateCategory, TemplateFilter } from '@/types';

/**
 * Error class for template storage operations
 */
export class TemplateStorageError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'TemplateStorageError';
  }
}

/**
 * Template storage service
 */
export const templateStorage = {
  /**
   * Get all templates
   *
   * @returns Array of all templates
   */
  async getAll(): Promise<Template[]> {
    try {
      const templates = await db.templates.toArray();
      return templates as unknown as Template[];
    } catch (error) {
      throw new TemplateStorageError('Failed to get all templates', error);
    }
  },

  /**
   * Get a template by ID
   *
   * @param templateId - The template ID
   * @returns The template or null if not found
   */
  async get(templateId: string): Promise<Template | null> {
    try {
      const template = await db.templates.get(templateId);
      return template ? (template as unknown as Template) : null;
    } catch (error) {
      throw new TemplateStorageError(`Failed to get template ${templateId}`, error);
    }
  },

  /**
   * Save a template (create or update)
   *
   * @param template - The template to save
   */
  async save(template: Template): Promise<void> {
    try {
      const stored = {
        ...template,
        updatedAt: new Date().toISOString(),
      } as unknown as StoredTemplate;

      await db.templates.put(stored);
    } catch (error) {
      throw new TemplateStorageError(`Failed to save template ${template.id}`, error);
    }
  },

  /**
   * Delete a template
   *
   * @param templateId - The template ID to delete
   */
  async delete(templateId: string): Promise<void> {
    try {
      await db.templates.delete(templateId);
    } catch (error) {
      throw new TemplateStorageError(`Failed to delete template ${templateId}`, error);
    }
  },

  /**
   * Get templates by category
   *
   * @param category - The template category
   * @returns Array of templates in the category
   */
  async getByCategory(category: TemplateCategory): Promise<Template[]> {
    try {
      const templates = await db.templates
        .where('category')
        .equals(category)
        .toArray();

      return templates as unknown as Template[];
    } catch (error) {
      throw new TemplateStorageError(`Failed to get templates for category ${category}`, error);
    }
  },

  /**
   * Get templates by author
   *
   * @param author - The author ID or name
   * @returns Array of templates by the author
   */
  async getByAuthor(author: string): Promise<Template[]> {
    try {
      const templates = await db.templates
        .where('author')
        .equals(author)
        .toArray();

      return templates as unknown as Template[];
    } catch (error) {
      throw new TemplateStorageError(`Failed to get templates for author ${author}`, error);
    }
  },

  /**
   * Get public templates
   *
   * @returns Array of public templates
   */
  async getPublic(): Promise<Template[]> {
    try {
      const templates = await db.templates
        .where('isPublic')
        .equals(true)
        .toArray();

      return templates as unknown as Template[];
    } catch (error) {
      throw new TemplateStorageError('Failed to get public templates', error);
    }
  },

  /**
   * Filter templates based on criteria
   *
   * @param filter - The filter criteria
   * @returns Array of matching templates
   */
  async filter(filter: TemplateFilter): Promise<Template[]> {
    try {
      let query = db.templates.toCollection();

      const templates = await query.filter(template => {
        // Category filter
        if (filter.category && template.category !== filter.category) {
          return false;
        }

        // Author filter
        if (filter.author && template.author !== filter.author) {
          return false;
        }

        // Public filter
        if (filter.includePublic !== undefined) {
          if (filter.includePublic && !template.isPublic) {
            return false;
          }
        }

        // Tags filter (template must have at least one matching tag)
        if (filter.tags && filter.tags.length > 0) {
          const templateTags = template.tags || [];
          const hasMatchingTag = filter.tags.some(tag => templateTags.includes(tag));
          if (!hasMatchingTag) {
            return false;
          }
        }

        // Search filter (search in name and description)
        if (filter.search) {
          const searchLower = filter.search.toLowerCase();
          const nameMatch = template.name.toLowerCase().includes(searchLower);
          const descMatch = template.description?.toLowerCase().includes(searchLower);
          if (!nameMatch && !descMatch) {
            return false;
          }
        }

        return true;
      }).toArray();

      return templates as unknown as Template[];
    } catch (error) {
      throw new TemplateStorageError('Failed to filter templates', error);
    }
  },

  /**
   * Bulk save templates
   *
   * @param templates - Array of templates to save
   */
  async bulkSave(templates: Template[]): Promise<void> {
    try {
      const stored = templates.map(t => ({
        ...t,
        updatedAt: new Date().toISOString(),
      })) as unknown as StoredTemplate[];

      await db.templates.bulkPut(stored);
    } catch (error) {
      throw new TemplateStorageError('Failed to bulk save templates', error);
    }
  },

  /**
   * Bulk delete templates
   *
   * @param templateIds - Array of template IDs to delete
   */
  async bulkDelete(templateIds: string[]): Promise<void> {
    try {
      await db.templates.bulkDelete(templateIds);
    } catch (error) {
      throw new TemplateStorageError('Failed to bulk delete templates', error);
    }
  },

  /**
   * Search templates by name or description
   *
   * @param searchTerm - The search term
   * @returns Array of matching templates
   */
  async search(searchTerm: string): Promise<Template[]> {
    try {
      const term = searchTerm.toLowerCase();

      const templates = await db.templates
        .filter(template => {
          const nameMatch = template.name.toLowerCase().includes(term);
          const descMatch = template.description?.toLowerCase().includes(term);
          const tagMatch = template.tags?.some(tag => tag.toLowerCase().includes(term));
          return nameMatch || descMatch || tagMatch;
        })
        .toArray();

      return templates as unknown as Template[];
    } catch (error) {
      throw new TemplateStorageError(`Failed to search templates with term ${searchTerm}`, error);
    }
  },

  /**
   * Get template categories (distinct)
   *
   * @returns Array of unique categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const templates = await db.templates.toArray();
      const categories = new Set<string>();

      templates.forEach(template => {
        if (template.category) {
          categories.add(template.category);
        }
      });

      return Array.from(categories);
    } catch (error) {
      throw new TemplateStorageError('Failed to get template categories', error);
    }
  },

  /**
   * Count templates
   *
   * @param isPublic - Optional filter by public status
   * @returns Number of templates
   */
  async count(isPublic?: boolean): Promise<number> {
    try {
      if (isPublic !== undefined) {
        return await db.templates.where('isPublic').equals(isPublic).count();
      }
      return await db.templates.count();
    } catch (error) {
      throw new TemplateStorageError('Failed to count templates', error);
    }
  },
};
