/**
 * React Flow Node and Edge Type Definitions
 *
 * These are defined here (outside components) to ensure stable references
 * and avoid React Flow warnings about recreated type objects.
 */

import { default as CustomNode } from './CustomNode';
import { default as CustomHTMLNode } from './CustomHTMLNode';
import { default as C4PersonNode } from './C4PersonNode';
import { default as C4SoftwareSystemNode } from './C4SoftwareSystemNode';
import { default as C4ContainerNode } from './C4ContainerNode';
import { default as C4ComponentNode } from './C4ComponentNode';
import { default as C4DatabaseNode } from './C4DatabaseNode';
import { default as C4QueueNode } from './C4QueueNode';
import { default as DatabaseNode } from './DatabaseNode';
import { default as ServiceNode } from './ServiceNode';
import { CustomEdge } from '../edges';

/**
 * Custom node types registry
 * Exported as a constant to maintain stable reference across renders
 */
export const NODE_TYPES = {
  // Generic node types
  custom: CustomNode,
  customHtml: CustomHTMLNode,
  database: DatabaseNode,
  service: ServiceNode,

  // C4 Model node types (legacy - kept for backward compatibility)
  c4Person: C4PersonNode,
  c4System: C4SoftwareSystemNode,
  c4Container: C4ContainerNode,
  c4Component: C4ComponentNode,
  c4Database: C4DatabaseNode,
  c4Queue: C4QueueNode,

  // Legacy aliases (for backward compatibility)
  C4PersonNode: C4PersonNode,
  C4SystemNode: C4SoftwareSystemNode,
} as const;

/**
 * Custom edge types registry
 * Exported as a constant to maintain stable reference across renders
 */
export const EDGE_TYPES = {
  custom: CustomEdge,
} as const;

/**
 * Export individual types for convenience
 */
export const nodeTypes = NODE_TYPES;
export const edgeTypes = EDGE_TYPES;
