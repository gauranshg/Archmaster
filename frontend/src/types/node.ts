/**
 * Node Type Definitions
 *
 * Defines node entities for diagram elements.
 * Compatible with React Flow node types.
 */

import type { CSSProperties, ReactNode } from 'react';

/**
 * Position in 2D space
 */
export interface Position {
  /** X coordinate */
  x: number;

  /** Y coordinate */
  y: number;
}

/**
 * Size in 2D space
 */
export interface Size {
  /** Width in pixels */
  width: number;

  /** Height in pixels */
  height: number;
}

/**
 * Node entity - visual element in a diagram
 */
export interface Node {
  /** Unique identifier */
  id: string;

  /** Parent diagram ID */
  diagramId: string;

  /** Position on canvas */
  position: Position;

  /** Optional size (auto-calculated if not specified) */
  size?: Size;

  /** Node data */
  data: NodeData;

  /** Inline styles */
  style?: NodeStyle;

  /** CSS class for custom styling */
  className?: string;

  /** React Flow node type */
  type?: string;

  /** Reference to template */
  templateId?: string;

  /** Links to child diagram for drill-down */
  childDiagramId?: string;

  /** Whether node is draggable */
  draggable?: boolean;

  /** Whether node is selectable */
  selectable?: boolean;

  /** Whether node is connectable */
  connectable?: boolean;

  /** Creation timestamp */
  createdAt?: string;

  /** Last update timestamp */
  updatedAt?: string;
}

/**
 * Node data (user-defined content)
 *
 * NEW TEMPLATE-FIRST APPROACH:
 * - templateId: Which template to use for rendering
 * - properties: Template variable values (merged with template defaults)
 * - Core fields: label, description, childDiagramId
 *
 * LEGACY FIELDS (kept for backward compatibility):
 * - htmlContent, jinjaTemplate, icon, image, cssClass, cssId, width, height
 * - These are deprecated in favor of template-based approach
 */
export interface NodeData {
  /** Node label */
  label: string;

  /** Template ID to use for rendering (template-first approach) */
  templateId?: string;

  /** Template variable values (merged with template defaults) */
  properties?: Record<string, unknown>;

  /** Description text */
  description?: string;

  /** Child diagram ID for drill-down navigation */
  childDiagramId?: string;

  // ========== LEGACY FIELDS (deprecated, use template instead) ==========

  /** HTML content (sanitized) - DEPRECATED: Use template instead */
  htmlContent?: string;

  /** Jinja template for dynamic rendering - DEPRECATED: Use templateId instead */
  jinjaTemplate?: string;

  /** Icon name (if using icon library) - DEPRECATED: Use template instead */
  icon?: string;

  /** Image URL */
  image?: string;

  /** Custom CSS class for styling */
  cssClass?: string;

  /** Custom CSS ID for styling */
  cssId?: string;

  /** Node width in pixels (for layout) */
  width?: number;

  /** Node height in pixels (for layout) */
  height?: number;
}

/**
 * Node styling options
 */
export interface NodeStyle extends CSSProperties {
  /** Background color */
  backgroundColor?: string;

  /** Border color */
  borderColor?: string;

  /** Border width in pixels */
  borderWidth?: number;

  /** Border style */
  borderStyle?: 'solid' | 'dashed' | 'dotted';

  /** Text color */
  color?: string;

  /** Font size in pixels */
  fontSize?: number;

  /** Font family */
  fontFamily?: string;

  /** Padding in pixels */
  padding?: number;

  /** Border radius in pixels */
  borderRadius?: number;

  /** Box shadow */
  boxShadow?: string;

  /** Opacity (0-1) */
  opacity?: number;

  /** Minimum width */
  minWidth?: number;

  /** Maximum width */
  maxWidth?: number;

  /** Minimum height */
  minHeight?: number;

  /** Maximum height */
  maxHeight?: number;

  /** Custom CSS properties */
  customCSS?: Record<string, string>;
}

/**
 * Node size constraints
 */
export interface NodeConstraints {
  /** Minimum width in pixels */
  minWidth?: number;

  /** Maximum width in pixels */
  maxWidth?: number;

  /** Minimum height in pixels */
  minHeight?: number;

  /** Maximum height in pixels */
  maxHeight?: number;

  /** Whether user can resize node */
  resizable?: boolean;
}

/**
 * Rectangle area (position + size)
 */
export interface Rect {
  /** X coordinate */
  x: number;

  /** Y coordinate */
  y: number;

  /** Width in pixels */
  width: number;

  /** Height in pixels */
  height: number;
}

/**
 * React Flow compatible Node type
 * Extends the base Node interface with React Flow specific properties
 */
export interface FlowNode extends Node {
  /** React Flow node data */
  data: NodeData & {
    /** Node ID */
    id: string;

    /** React children */
    children?: ReactNode;
  };
}
