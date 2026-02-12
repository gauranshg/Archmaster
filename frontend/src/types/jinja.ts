/**
 * Jinja Template System Types
 */

import type { NodeData } from './node';

/**
 * Template context passed to Jinja renderer
 */
export interface JinjaTemplateContext {
  /** Node label */
  label: string;

  /** Node description */
  description?: string;

  /** Node icon (emoji) */
  icon?: string;

  /** Node image URL */
  image?: string;

  /** Custom CSS class */
  cssClass?: string;

  /** Custom CSS ID */
  cssId?: string;

  /** Node width */
  width?: number;

  /** Node height */
  height?: number;

  /** Child diagram ID for drill-down */
  childDiagramId?: string;

  /** Custom properties */
  properties?: Record<string, unknown>;

  /** Style properties */
  style: {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    padding?: number;
    margin?: number;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    boxShadow?: string;
    [key: string]: any;
  };

  /** Computed values */
  hasDescription: boolean;
  hasIcon: boolean;
  hasImage: boolean;
  hasProperties: boolean;
}

/**
 * Template rendering result
 */
export interface TemplateRenderResult {
  /** Rendered HTML */
  html: string;

  /** Whether rendering was successful */
  success: boolean;

  /** Error message if failed */
  error?: string;

  /** Render time in ms */
  renderTime: number;
}

/**
 * Template validation result
 */
export interface TemplateValidationResult {
  /** Whether template is valid */
  isValid: boolean;

  /** Validation errors */
  errors: string[];

  /** Validation warnings */
  warnings: string[];

  /** Detected variables in template */
  variables: string[];

  /** Detected filters in template */
  filters: string[];
}

/**
 * Built-in Jinja filter documentation
 */
export interface JinjaFilter {
  name: string;
  description: string;
  example: string;
}

/**
 * Template export format
 */
export interface JinjaTemplateExport {
  version: string;
  exportedAt: string;
  templates: Array<{
    id: string;
    name: string;
    category: string;
    jinjaTemplate: string;
    description?: string;
    tags?: string[];
  }>;
}
