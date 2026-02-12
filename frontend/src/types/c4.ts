/**
 * C4 Model Type Definitions
 *
 * Defines types specific to the C4 model for architecture diagrams.
 * The C4 model is a hierarchical approach to software architecture documentation.
 *
 * @see https://c4model.com/
 *
 * C4 Levels:
 * - Level 1: System Context - Big picture view showing system in context
 * - Level 2: Container - Single application boundary
 * - Level 3: Component - Internal structure of containers
 * - Level 4: Code (optional) - Class/file level details
 * - Level 5: Deployment (optional) - Infrastructure topology
 */

import type { DiagramType } from './diagram';

// Minimal Diagram interface for type guards (avoiding circular import)
interface Diagram {
  type: DiagramType;
  c4Metadata?: C4Metadata;
}

/**
 * C4 Model diagram levels
 *
 * Each level represents a different zoom level of the software architecture.
 */
export enum C4Level {
  /** Level 1: System Context - shows system in context of users/external systems */
  SystemContext = 1,

  /** Level 2: Container - shows applications and data stores within a system */
  Container = 2,

  /** Level 3: Component - shows components within containers */
  Component = 3,

  /** Level 4: Code - shows code structure (optional, rarely used) */
  Code = 4,

  /** Level 5: Deployment - shows deployment topology (optional) */
  Deployment = 5,
}

/**
 * C4 Model element types
 *
 * Represents the different types of elements that can appear in C4 diagrams.
 */
export enum C4ElementType {
  /** Person - user, actor, or persona */
  Person = 'person',

  /** Software System - a software system in its own right */
  SoftwareSystem = 'software-system',

  /** Container - application or data store */
  Container = 'container',

  /** Component - modular part of a container */
  Component = 'component',

  /** Deployment Node - infrastructure node (server, VM, container) */
  DeploymentNode = 'deployment-node',

  /** Infrastructure Node - physical infrastructure (device, network) */
  InfrastructureNode = 'infrastructure-node',

  /** Database - data store container/component */
  Database = 'database',

  /** Queue - message queue/event stream */
  Queue = 'queue',

  /** External System - external software system or service */
  ExternalSystem = 'external-system',

  /** Generic - any other element type */
  Generic = 'generic',
}

/**
 * C4 relationship types
 *
 * Represents the types of relationships between C4 elements.
 */
export enum C4RelationshipType {
  /** Synchronous - request/response interaction */
  Synchronous = 'synchronous',

  /** Asynchronous - event-driven or fire-and-forget */
  Asynchronous = 'asynchronous',

  /** Data flow - data streaming or bulk transfer */
  DataFlow = 'data-flow',

  /** Dependency - uses or depends on */
  Dependency = 'dependency',

  /** Generic - any other relationship type */
  Generic = 'generic',
}

/**
 * C4 Model scope options
 *
 * Defines the scope of a C4 diagram.
 */
export enum C4Scope {
  /** Enterprise scope - shows entire enterprise context */
  Enterprise = 'enterprise',

  /** System scope - shows single system context */
  System = 'system',

  /** Container scope - shows single container */
  Container = 'container',

  /** Component scope - shows single component */
  Component = 'component',
}

/**
 * C4-specific metadata for diagrams
 *
 * Extends diagram metadata with C4 model specific information.
 */
export interface C4Metadata {
  /** C4 level (1-5) */
  level: C4Level;

  /** Diagram scope */
  scope?: C4Scope;

  /** Enterprise name (for enterprise scope diagrams) */
  enterpriseName?: string;

  /** System name (for system scope diagrams) */
  systemName?: string;

  /** Container name (for container scope diagrams) */
  containerName?: string;

  /** Component name (for component scope diagrams) */
  componentName?: string;

  /** Whether this is an enterprise context diagram */
  isEnterpriseContext?: boolean;

  /** Description of the viewpoint for this diagram */
  viewpoint?: string;

  /** Key decisions or assumptions documented */
  assumptions?: string[];

  /** Related stakeholders */
  stakeholders?: string[];
}

/**
 * C4 element metadata for nodes
 *
 * C4-specific properties for diagram nodes.
 */
export interface C4ElementMetadata {
  /** C4 element type */
  elementType: C4ElementType;

  /** Technology/stack information */
  technology?: string;

  /** Description of the element's purpose */
  description?: string;

  /** Responsibilities (for components) */
  responsibilities?: string[];

  /** Owner/team */
  owner?: string;

  /** Whether element is external to the system boundary */
  isExternal?: boolean;

  /** Whether element is a database/storage */
  isDatabase?: boolean;

  /** Whether element is a queue/messaging system */
  isQueue?: boolean;
}

/**
 * C4 relationship metadata for edges
 *
 * C4-specific properties for diagram edges/relationships.
 */
export interface C4RelationshipMetadata {
  /** Relationship type */
  relationshipType: C4RelationshipType;

  /** Technology/protocol (e.g., "HTTP", "gRPC", "Kafka") */
  protocol?: string;

  /** Description of the interaction */
  description?: string;

  /** API version (if applicable) */
  apiVersion?: string;

  /** Data format (e.g., "JSON", "XML", "Protobuf") */
  dataFormat?: string;

  /** Frequency of interaction */
  frequency?: 'continuous' | 'high' | 'medium' | 'low' | 'rare';

  /** Criticality */
  criticality?: 'critical' | 'high' | 'medium' | 'low';

  /** Whether relationship is synchronous */
  isSynchronous?: boolean;
}

/**
 * Mapping from DiagramType to C4Level
 *
 * Provides the C4 level for each diagram type.
 */
export const DIAGRAM_TYPE_TO_C4_LEVEL: Readonly<Record<DiagramType, C4Level | null>> = {
  'system-context': C4Level.SystemContext,
  'container': C4Level.Container,
  'component': C4Level.Component,
  'code': C4Level.Code,
  'deployment': C4Level.Deployment,
  'generic': null, // Generic diagrams don't have a C4 level
} as const;

/**
 * Mapping from C4Level to DiagramType
 *
 * Provides the diagram type for each C4 level.
 */
export const C4_LEVEL_TO_DIAGRAM_TYPE: Readonly<Record<C4Level, DiagramType>> = {
  [C4Level.SystemContext]: 'system-context',
  [C4Level.Container]: 'container',
  [C4Level.Component]: 'component',
  [C4Level.Code]: 'code',
  [C4Level.Deployment]: 'deployment',
} as const;

/**
 * C4 level display names
 *
 * Human-readable names for C4 levels.
 */
export const C4_LEVEL_NAMES: Readonly<Record<C4Level, string>> = {
  [C4Level.SystemContext]: 'System Context',
  [C4Level.Container]: 'Container',
  [C4Level.Component]: 'Component',
  [C4Level.Code]: 'Code',
  [C4Level.Deployment]: 'Deployment',
} as const;

/**
 * C4 level descriptions
 *
 * Detailed descriptions for each C4 level.
 */
export const C4_LEVEL_DESCRIPTIONS: Readonly<Record<C4Level, string>> = {
  [C4Level.SystemContext]:
    'A high-level diagram showing the software system in context of users and external systems.',
  [C4Level.Container]:
    'Shows the internal structure of a software system, including containers (applications, data stores).',
  [C4Level.Component]:
    'Shows the internal structure of a container, including its components and their relationships.',
  [C4Level.Code]:
    'Shows the code-level details of a component (optional, rarely used).',
  [C4Level.Deployment]:
    'Shows the deployment topology of the system across infrastructure nodes (optional).',
} as const;

/**
 * C4 element type display names
 *
 * Human-readable names for C4 element types.
 */
export const C4_ELEMENT_TYPE_NAMES: Readonly<Record<C4ElementType, string>> = {
  [C4ElementType.Person]: 'Person',
  [C4ElementType.SoftwareSystem]: 'Software System',
  [C4ElementType.Container]: 'Container',
  [C4ElementType.Component]: 'Component',
  [C4ElementType.DeploymentNode]: 'Deployment Node',
  [C4ElementType.InfrastructureNode]: 'Infrastructure Node',
  [C4ElementType.Database]: 'Database',
  [C4ElementType.Queue]: 'Queue',
  [C4ElementType.ExternalSystem]: 'External System',
  [C4ElementType.Generic]: 'Generic',
} as const;

/**
 * Get C4 level from diagram type
 *
 * Returns the C4 level for a given diagram type, or null if not a C4 diagram.
 *
 * @param type - The diagram type
 * @returns The C4 level or null
 *
 * @example
 * ```ts
 * getC4LevelFromDiagramType('system-context'); // returns C4Level.SystemContext (1)
 * getC4LevelFromDiagramType('generic'); // returns null
 * ```
 */
export function getC4LevelFromDiagramType(type: DiagramType): C4Level | null {
  return DIAGRAM_TYPE_TO_C4_LEVEL[type];
}

/**
 * Check if a diagram type is a C4 diagram type
 *
 * Returns true if the diagram type is one of the C4 model types.
 *
 * @param type - The diagram type to check
 * @returns True if this is a C4 diagram type
 *
 * @example
 * ```ts
 * isC4DiagramType('system-context'); // returns true
 * isC4DiagramType('generic'); // returns false
 * ```
 */
export function isC4DiagramType(type: DiagramType): boolean {
  return type !== 'generic';
}

/**
 * Check if a diagram is a C4 diagram
 *
 * Type guard that checks if a diagram follows the C4 model.
 *
 * @param diagram - The diagram to check
 * @returns True if this is a C4 diagram
 *
 * @example
 * ```ts
 * if (isC4Diagram(myDiagram)) {
 *   // diagram is C4, can access C4-specific properties
 *   console.log(`C4 Level: ${myDiagram.c4Metadata?.level}`);
 * }
 * ```
 */
export function isC4Diagram(diagram: Diagram): diagram is Diagram & { c4Metadata: C4Metadata } {
  return isC4DiagramType(diagram.type) && !!diagram.c4Metadata;
}

/**
 * Get the C4 level of a diagram
 *
 * Returns the C4 level for a diagram, or null if not a C4 diagram.
 *
 * @param diagram - The diagram to get the level from
 * @returns The C4 level or null
 *
 * @example
 * ```ts
 * getC4Level(myDiagram); // returns C4Level.Container (2)
 * ```
 */
export function getC4Level(diagram: Diagram): C4Level | null {
  if (!isC4DiagramType(diagram.type)) {
    return null;
  }
  return getC4LevelFromDiagramType(diagram.type);
}

/**
 * Get the display name for a C4 level
 *
 * Returns a human-readable name for a C4 level.
 *
 * @param level - The C4 level
 * @returns The display name
 *
 * @example
 * ```ts
 * getC4LevelName(C4Level.SystemContext); // returns "System Context"
 * ```
 */
export function getC4LevelName(level: C4Level): string {
  return C4_LEVEL_NAMES[level];
}

/**
 * Get the description for a C4 level
 *
 * Returns a detailed description of what a C4 level represents.
 *
 * @param level - The C4 level
 * @returns The description
 */
export function getC4LevelDescription(level: C4Level): string {
  return C4_LEVEL_DESCRIPTIONS[level];
}

/**
 * Get all C4 diagram types
 *
 * Returns an array of all C4 diagram types.
 *
 * @returns Array of C4 diagram types
 */
export function getC4DiagramTypes(): DiagramType[] {
  return ['system-context', 'container', 'component', 'code', 'deployment'];
}

/**
 * Get valid child diagram types for a given C4 level
 *
 * Returns the C4 levels that can be drilled into from a given level.
 *
 * @param level - The current C4 level
 * @returns Array of valid child diagram types
 */
export function getValidChildTypes(level: C4Level): DiagramType[] {
  switch (level) {
    case C4Level.SystemContext:
      return ['container'];
    case C4Level.Container:
      return ['component'];
    case C4Level.Component:
      return ['code'];
    default:
      return [];
  }
}
