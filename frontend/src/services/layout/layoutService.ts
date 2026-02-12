/**
 * Layout Service
 *
 * Provides automatic layout algorithms for diagram nodes using Dagre.
 */

import dagre from 'dagre';
import type { Node, Edge } from '@/types';

/**
 * Layout direction options
 */
export type LayoutDirection = 'TB' | 'BT' | 'LR' | 'RL';

/**
 * Layout algorithm options
 */
export interface LayoutOptions {
  direction: LayoutDirection;
  nodeSpacing: number;
  rankSpacing: number;
  edgeSpacing: number;
  align?: 'UL' | 'UR' | 'DL' | 'DR'; // Up/Down Left/Right alignment
}

/**
 * Default layout options
 */
export const DEFAULT_LAYOUT_OPTIONS: LayoutOptions = {
  direction: 'TB', // Top to Bottom
  nodeSpacing: 50,
  rankSpacing: 50,
  edgeSpacing: 10,
  align: 'UL',
};

/**
 * Layout result with positioned nodes
 */
export interface LayoutResult {
  nodes: Node[];
  width: number;
  height: number;
}

/**
 * Apply Dagre hierarchical layout to nodes and edges
 */
export function applyLayout(
  nodes: Node[],
  edges: Edge[],
  options: Partial<LayoutOptions> = {}
): LayoutResult {
  const layoutOptions = { ...DEFAULT_LAYOUT_OPTIONS, ...options };

  // Create a new directed graph
  const g = new dagre.graphlib.Graph();

  // Set graph options
  g.setGraph({
    rankdir: layoutOptions.direction,
    nodesep: layoutOptions.nodeSpacing,
    ranksep: layoutOptions.rankSpacing,
    edgesep: layoutOptions.edgeSpacing,
    align: layoutOptions.align,
    // Prevent Dagre from overlapping nodes
    marginx: 20,
    marginy: 20,
  });

  // Default node and edge settings
  g.setDefaultEdgeLabel(() => ({}));

  // Add nodes to the graph
  nodes.forEach((node) => {
    const width = node.data.width || 200;
    const height = node.data.height || 100;
    g.setNode(node.id, { width, height });
  });

  // Add edges to the graph
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(g);

  // Apply calculated positions to nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);

    if (nodeWithPosition) {
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - (node.data.width || 200) / 2,
          y: nodeWithPosition.y - (node.data.height || 100) / 2,
        },
      };
    }

    return node;
  });

  // Get graph dimensions
  const graphWidth = g.graph().width || 0;
  const graphHeight = g.graph().height || 0;

  return {
    nodes: layoutedNodes,
    width: graphWidth,
    height: graphHeight,
  };
}

/**
 * Apply hierarchical layout with animation
 */
export function applyAnimatedLayout(
  nodes: Node[],
  edges: Edge[],
  options: Partial<LayoutOptions> = {},
  duration = 300
): LayoutResult {
  // TODO: Implement animation
  // For now, just return the static layout
  return applyLayout(nodes, edges, options);
}

/**
 * Calculate layout without modifying original nodes
 */
export function previewLayout(
  nodes: Node[],
  edges: Edge[],
  options: Partial<LayoutOptions> = {}
): LayoutResult {
  return applyLayout(nodes, edges, options);
}

/**
 * Validate if nodes can be laid out
 */
export function validateLayout(nodes: Node[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (nodes.length === 0) {
    errors.push('No nodes to layout');
  }

  // Check if all nodes have dimensions
  nodes.forEach((node) => {
    if (!node.data.width || node.data.width <= 0) {
      errors.push(`Node ${node.id} missing width`);
    }
    if (!node.data.height || node.data.height <= 0) {
      errors.push(`Node ${node.id} missing height`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get recommended layout direction based on node count
 */
export function getRecommendedDirection(nodeCount: number): LayoutDirection {
  if (nodeCount > 20) {
    return 'LR'; // Left to Right for many nodes
  }
  return 'TB'; // Top to Bottom for fewer nodes
}

/**
 * Layout preset configurations
 */
export const LAYOUT_PRESETS: Record<string, LayoutOptions> = {
  hierarchical: {
    direction: 'TB',
    nodeSpacing: 50,
    rankSpacing: 100,
    edgeSpacing: 10,
    align: 'UL',
  },
  horizontal: {
    direction: 'LR',
    nodeSpacing: 100,
    rankSpacing: 50,
    edgeSpacing: 10,
    align: 'UL',
  },
  compact: {
    direction: 'TB',
    nodeSpacing: 30,
    rankSpacing: 30,
    edgeSpacing: 5,
    align: 'UL',
  },
  spacious: {
    direction: 'TB',
    nodeSpacing: 100,
    rankSpacing: 100,
    edgeSpacing: 20,
    align: 'UL',
  },
};
