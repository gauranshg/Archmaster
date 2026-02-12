/**
 * Architecture Template Type Definitions
 *
 * Types for pre-built architecture diagram templates.
 */

import type { Diagram } from './diagram';

/**
 * Architecture template categories
 */
export type ArchitectureTemplateCategory =
  | 'microservices'
  | 'monolithic'
  | 'event-driven'
  | 'layered'
  | 'serverless';

/**
 * Architecture template metadata
 */
export interface ArchitectureTemplate {
  /** Unique template ID */
  id: string;

  /** Template name */
  name: string;

  /** Short description */
  description: string;

  /** Template category */
  category: ArchitectureTemplateCategory;

  /** Diagram type for this template */
  diagramType: Diagram['type'];

  /** Template icon (emoji) */
  icon: string;

  /** Template preview color */
  color: string;

  /** Number of nodes in template */
  nodeCount: number;

  /** Number of edges in template */
  edgeCount: number;

  /** Tags for filtering */
  tags: string[];

  /** Create a diagram from this template */
  createDiagram: (workspaceId: string) => Omit<Diagram, 'id' | 'createdAt' | 'updatedAt'>;
}

/**
 * Architecture template category info
 */
export interface ArchitectureTemplateCategoryInfo {
  /** Display label */
  label: string;

  /** Category description */
  description: string;

  /** Icon emoji */
  icon: string;

  /** Theme color */
  color: string;
}

/**
 * Template preview data for UI
 */
export interface ArchitectureTemplatePreview {
  /** Template ID */
  id: string;

  /** Template name */
  name: string;

  /** Description */
  description: string;

  /** Category */
  category: ArchitectureTemplateCategory;

  /** Icon */
  icon: string;

  /** Color */
  color: string;

  /** Node count */
  nodeCount: number;

  /** Edge count */
  edgeCount: number;

  /** Tags */
  tags: string[];

  /** Mini preview SVG (optional) */
  previewSvg?: string;
}
