/**
 * Edge Type Definitions
 *
 * Defines edge/connection types between diagram nodes.
 * Compatible with React Flow edge types.
 */

import type { CSSProperties } from 'react';

/**
 * Edge type options
 */
export type EdgeType = 'default' | 'straight' | 'step' | 'smoothstep' | 'bezier';

/**
 * Edge entity - connection between two nodes
 */
export interface Edge {
  /** Unique identifier */
  id: string;

  /** Parent diagram ID */
  diagramId: string;

  /** Source node ID */
  source: string;

  /** Target node ID */
  target: string;

  /** Connection point on source node */
  sourceHandle?: string;

  /** Connection point on target node */
  targetHandle?: string;

  /** Edge label */
  label?: string;

  /** HTML label content (sanitized) */
  labelHTML?: string;

  /** Edge type */
  type?: EdgeType;

  /** Edge styling */
  style?: EdgeStyle;

  /** Whether to animate flow direction */
  animated?: boolean;

  /** Routing configuration */
  routing?: EdgeRouting;

  /** Label position */
  labelStyle?: CSSProperties;

  /** Label show bg */
  labelBgStyle?: CSSProperties;

  /** Label background padding */
  labelBgPadding?: [number, number];

  /** Label border radius */
  labelBgBorderRadius?: number;

  /** Whether edge is hidden */
  hidden?: boolean;

  /** Whether edge is deletable */
  deletable?: boolean;

  /** Edge data */
  data?: EdgeData;

  /** Creation timestamp */
  createdAt?: string;

  /** Last update timestamp */
  updatedAt?: string;
}

/**
 * Edge data
 */
export interface EdgeData {
  /** Label text */
  label?: string;

  /** Edge style class */
  style?: string;

  /** Description */
  description?: string;

  /** Custom properties */
  properties?: Record<string, unknown>;
}

/**
 * Edge styling options
 */
export interface EdgeStyle extends CSSProperties {
  /** Line color */
  stroke?: string;

  /** Line thickness in pixels */
  strokeWidth?: number;

  /** Dashed pattern (e.g., "5,5") */
  strokeDasharray?: string;

  /** Dash offset */
  strokeDashoffset?: number;

  /** Opacity (0-1) */
  opacity?: number;

  /** URL to end arrowhead marker */
  markerEnd?: string;

  /** URL to start arrowhead marker */
  markerStart?: string;

  /** URL to both arrowheads marker */
  markerEndUrl?: string;

  /** Marker width */
  markerWidth?: number;

  /** Marker height */
  markerHeight?: number;
}

/**
 * Edge routing configuration
 */
export interface EdgeRouting {
  /** Routing type */
  type?: 'simple' | 'orthogonal' | 'manhattan';

  /** Curvature (0-1) */
  curvature?: number;

  /** Routing radius */
  radius?: number;
}

/**
 * Edge label position
 */
export interface EdgeLabelPosition {
  /** Position type */
  type: 'source' | 'center' | 'target';

  /** Distance from position */
  offset?: number;
}

/**
 * Marker type for arrowheads
 */
export type MarkerType = 'arrow' | 'arrowclosed' | 'dot' | 'custom';

/**
 * Marker definition
 */
export interface Marker {
  /** Marker type */
  type: MarkerType;

  /** Marker ID (for custom markers) */
  id?: string;

  /** Marker color */
  color?: string;

  /** Marker width */
  width?: number;

  /** Marker height */
  height?: number;

  /** Marker path (for custom markers) */
  path?: string;
}

/**
 * React Flow compatible Edge type
 */
export interface FlowEdge extends Edge {
  /** Edge data */
  data: EdgeData;
}
