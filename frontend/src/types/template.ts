/**
 * Template Type Definitions
 *
 * Defines template entities for reusable node configurations.
 */

import type { CSSProperties } from 'react';
import type { NodeData, NodeStyle, NodeConstraints } from './node';

/**
 * Template category types
 */
export type TemplateCategory =
  | 'infrastructure' // Infrastructure components (databases, servers)
  | 'service'        // Service components (microservices, APIs)
  | 'database'       // Database components
  | 'external'       // External systems/actors
  | 'component'      // Software components
  | 'container'      // Container/application components
  | 'custom';        // User-defined templates

/**
 * Template variable types for dynamic form generation
 */
export type TemplateVariableType =
  | 'text'      // Single-line text input
  | 'textarea'  // Multi-line text input
  | 'number'    // Numeric input
  | 'boolean'   // Checkbox
  | 'select'    // Dropdown select
  | 'color'     // Color picker
  | 'icon'      // Icon/emoji picker
  | 'code';     // Code editor

/**
 * Template variable definition
 * Defines a configurable variable in a Jinja template
 *
 * Note: Default values are extracted from the Jinja template itself
 * using patterns like {{ variable or 'default' }} or {{ variable | default('value') }}
 */
export interface TemplateVariable {
  /** Variable name (must match {{ variableName }} in Jinja template) */
  name: string;

  /** Display label in UI */
  label: string;

  /** Input type */
  type: TemplateVariableType;

  /** Helper/description text */
  description?: string;

  /** For select type: available options */
  options?: Array<{ value: string; label: string }>;

  /** Whether variable is required */
  required?: boolean;

  /** For number type: minimum value */
  min?: number;

  /** For number type: maximum value */
  max?: number;

  /** For text type: regex pattern for validation */
  pattern?: string;

  /** Placeholder text */
  placeholder?: string;
}

/**
 * Template entity - reusable node configuration
 */
export interface Template {
  /** Unique identifier */
  id: string;

  /** Template name */
  name: string;

  /** Template description */
  description?: string;

  /** Template category */
  category?: TemplateCategory;

  /** User who created it */
  author: string;

  /** Whether template is shared with all users */
  isPublic: boolean;

  /** Whether this is a system template (built-in, non-user-editable) */
  isSystemTemplate?: boolean;

  /** Jinja template for dynamic rendering (optional, overrides static HTML) */
  jinjaTemplate?: string;

  /** Template variable definitions for dynamic form generation */
  variables?: TemplateVariable[];

  /** Default node data */
  data: NodeData;

  /** Default styling */
  style: NodeStyle;

  /** CSS class */
  className?: string;

  /** Thumbnail/preview (base64 or URL) */
  thumbnail?: string;

  /** Tags for search and filtering */
  tags?: string[];

  /** Optional size constraints */
  constraints?: NodeConstraints;

  /** Creation timestamp */
  createdAt: string;

  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Template library (collection of templates)
 */
export interface TemplateLibrary {
  /** Template categories */
  categories: TemplateCategoryDefinition[];

  /** Templates array */
  templates: Template[];
}

/**
 * Template category definition
 */
export interface TemplateCategoryDefinition {
  /** Category ID */
  id: string;

  /** Category name */
  name: string;

  /** Icon name */
  icon?: string;

  /** Category description */
  description?: string;

  /** Display order */
  order: number;

  /** Whether category is built-in */
  isBuiltIn?: boolean;
}

/**
 * Template data for creation/update
 */
export interface TemplateData {
  /** HTML content */
  htmlContent: string;

  /** CSS class */
  cssClass?: string;

  /** Default size */
  defaultSize?: {
    width: number;
    height: number;
  };

  /** Default style */
  defaultStyle?: CSSProperties;

  /** Icon name */
  icon?: string;
}

/**
 * Template application result
 */
export interface TemplateApplicationResult {
  /** Whether template was successfully applied */
  success: boolean;

  /** Error message if failed */
  error?: string;

  /** Applied node data */
  nodeData?: NodeData;

  /** Applied node style */
  nodeStyle?: NodeStyle;
}

/**
 * Template filter options
 */
export interface TemplateFilter {
  /** Filter by category */
  category?: TemplateCategory;

  /** Filter by tags */
  tags?: string[];

  /** Filter by author */
  author?: string;

  /** Include public templates */
  includePublic?: boolean;

  /** Search query */
  search?: string;
}

/**
 * Built-in template definitions
 */
export interface BuiltInTemplate {
  /** Template ID */
  id: string;

  /** Template name */
  name: string;

  /** Template category */
  category: TemplateCategory;

  /** Template definition */
  template: Omit<Template, 'id' | 'author' | 'createdAt' | 'updatedAt'>;
}
