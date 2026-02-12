/**
 * Node Components Index
 *
 * Exports all custom node components for the diagram canvas.
 *
 * C4 Model Nodes:
 * - C4PersonNode: Person/actor nodes for C4 diagrams
 * - C4SoftwareSystemNode: Software system nodes
 * - C4ContainerNode: Container nodes (applications, data stores)
 * - C4ComponentNode: Component nodes
 * - C4DatabaseNode: Database nodes with cylinder shape
 * - C4QueueNode: Queue/messaging nodes
 *
 * Generic Nodes:
 * - CustomNode: Base custom node with HTML content support
 * - DatabaseNode: Generic database node
 * - ServiceNode: Service/microservice node
 *
 * Type Registries:
 * - nodeTypes: Registry of all node types (stable reference)
 * - edgeTypes: Registry of all edge types (stable reference)
 */

// C4 Model Nodes
export { default as C4PersonNode } from './C4PersonNode';
export { default as C4SoftwareSystemNode } from './C4SoftwareSystemNode';
export { default as C4ContainerNode } from './C4ContainerNode';
export { default as C4ComponentNode } from './C4ComponentNode';
export { default as C4DatabaseNode } from './C4DatabaseNode';
export { default as C4QueueNode } from './C4QueueNode';

// Generic Nodes
export { default as CustomNode } from './CustomNode';
export { default as CustomHTMLNode } from './CustomHTMLNode';
export { default as DatabaseNode } from './DatabaseNode';
export { default as ServiceNode } from './ServiceNode';

// Type Registries (exported from nodeTypes.ts for stable references)
export { nodeTypes, edgeTypes, NODE_TYPES, EDGE_TYPES } from './nodeTypes';
