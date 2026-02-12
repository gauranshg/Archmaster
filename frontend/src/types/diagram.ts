/**
 * Diagram Type Definitions
 *
 * Defines core diagram types for the Custom Architecture Platform.
 * Compatible with C4 model and generic diagram types.
 */

import type { C4Metadata } from './c4';

/**
 * Supported diagram types following the C4 model
 *
 * @see https://c4model.com/ for more information on the C4 model
 */
export type DiagramType =
  | 'system-context' // C4 Level 1: System Context diagram
  | 'container'      // C4 Level 2: Container diagram
  | 'component'      // C4 Level 3: Component diagram
  | 'code'           // C4 Level 4: Code diagram (optional)
  | 'deployment'     // C4 Level 5: Deployment diagram (optional)
  | 'generic';       // Custom/flexible diagram type

/**
 * Main diagram entity representing a complete architecture diagram
 */
export interface Diagram {
  /** Unique identifier (UUID) */
  id: string;

  /** Diagram name */
  name: string;

  /** Optional description */
  description?: string;

  /** Diagram type (C4 level or generic) */
  type: DiagramType;

  /** Parent diagram ID for hierarchical navigation */
  parentId?: string;

  /** Parent node ID (which node in parent diagram this diagram belongs to) */
  parentNodeId?: string;

  /** Workspace this diagram belongs to */
  workspaceId: string;

  /** Nodes (visual elements) in this diagram */
  nodes: Node[];

  /** Edges (connections) between nodes */
  edges: Edge[];

  /** Custom CSS for this diagram */
  customCSS?: string;

  /** Theme name */
  theme?: string;

  /** Layout configuration */
  layout?: LayoutConfig;

  /** Diagram-level styles */
  styles?: DiagramStyles;

  /** C4-specific metadata (if this is a C4 diagram) */
  c4Metadata?: C4Metadata;

  /** Metadata */
  metadata: DiagramMetadata;

  /** Tags for filtering and search */
  tags?: string[];

  /** Creation timestamp */
  createdAt: string;

  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Diagram metadata
 */
export interface DiagramMetadata {
  /** Version number (incremented on each save) */
  version: number;

  /** User ID or name of author */
  author: string;

  /** Creation timestamp */
  createdAt: string;

  /** Last modification timestamp */
  modifiedAt: string;

  /** Parent diagram ID for drill-down navigation */
  parentDiagramId?: string;

  /** Child diagram IDs for drill-down navigation */
  childDiagramIds?: string[];
}

/**
 * Diagram-level styles
 */
export interface DiagramStyles {
  /** Background color */
  background?: string;

  /** Grid configuration */
  grid?: {
    type: 'dots' | 'lines' | 'none';
    size?: number;
    color?: string;
  };

  /** Canvas padding */
  padding?: number;
}

/**
 * Layout configuration for automatic positioning
 */
export interface LayoutConfig {
  /** Layout algorithm type */
  type: 'manual' | 'hierarchical' | 'force-directed' | 'circular';

  /** Direction for hierarchical layout */
  direction?: 'TB' | 'BT' | 'LR' | 'RL'; // Top-Bottom, Bottom-Top, Left-Right, Right-Left

  /** Spacing configuration */
  spacing?: {
    /** Spacing between nodes */
    node?: number;

    /** Spacing between ranks */
    rank?: number;
  };

  /** Layout algorithm to use */
  algorithm?: 'dagre' | 'elk';
}

/**
 * Import to avoid circular dependency
 * Will be replaced with proper imports from node.ts and edge.ts
 */
interface Node {
  id: string;
  position: { x: number; y: number };
  data: unknown;
}

interface Edge {
  id: string;
  source: string;
  target: string;
}
