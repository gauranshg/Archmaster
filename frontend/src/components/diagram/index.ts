/**
 * Diagram Components Index
 *
 * Central export point for all diagram-related components.
 */

export { DiagramCanvas, default } from './Canvas';
export { ExportControls } from './ExportControls';
export { LayoutControls } from './LayoutControls';
export { EdgeStylePanel } from './EdgeStylePanel';

// Node components
export {
  CustomNode,
  C4PersonNode,
  C4SoftwareSystemNode,
  C4ContainerNode,
  C4ComponentNode,
  C4DatabaseNode,
  C4QueueNode,
  DatabaseNode,
  ServiceNode,
} from './nodes';

// Edge components
export { CustomEdge } from './edges';

// Re-export C4SoftwareSystemNode as C4SystemNode for backward compatibility
export { C4SoftwareSystemNode as C4SystemNode } from './nodes';
