/**
 * C4 Preset Data
 *
 * Predefined C4 element presets that users can quickly add to their diagrams.
 * These presets follow C4 model conventions and include proper styling.
 */

import type { C4ElementType } from '@/types';
import type { NodeStyle, NodeData } from '@/types';

/**
 * C4 Preset definition
 */
export interface C4Preset {
  /** Unique preset ID */
  id: string;

  /** Preset name */
  name: string;

  /** Short description */
  description: string;

  /** C4 element type */
  elementType: C4ElementType;

  /** Icon/emoji for display */
  icon: string;

  /** Category for grouping */
  category: 'person' | 'system' | 'container' | 'component' | 'infrastructure';

  /** Default node data */
  data: NodeData;

  /** Default node styling */
  style: NodeStyle;

  /** Default CSS class */
  className?: string;

  /** Default dimensions */
  width?: number;
  height?: number;

  /** Example technology */
  exampleTechnology?: string;
}

/**
 * Common C4 preset styles
 */
const PRESET_STYLES = {
  person: {
    backgroundColor: '#ffffff',
    borderColor: '#91c4f2',
    borderWidth: 2,
    borderStyle: 'solid' as const,
    borderRadius: 8,
    color: '#1e3a5f',
    fontSize: 14,
    padding: 16,
    minWidth: 120,
    minHeight: 80,
  },

  softwareSystem: {
    backgroundColor: '#ffffff',
    borderColor: '#1f77b4',
    borderWidth: 2,
    borderStyle: 'solid' as const,
    borderRadius: 8,
    color: '#1e3a5f',
    fontSize: 14,
    padding: 16,
    minWidth: 150,
    minHeight: 80,
  },

  container: {
    backgroundColor: '#ffffff',
    borderColor: '#4a90d9',
    borderWidth: 2,
    borderStyle: 'solid' as const,
    borderRadius: 8,
    color: '#1e3a5f',
    fontSize: 14,
    padding: 16,
    minWidth: 140,
    minHeight: 80,
  },

  component: {
    backgroundColor: '#ffffff',
    borderColor: '#6ab0f3',
    borderWidth: 2,
    borderStyle: 'solid' as const,
    borderRadius: 8,
    color: '#1e3a5f',
    fontSize: 13,
    padding: 12,
    minWidth: 120,
    minHeight: 70,
  },

  database: {
    backgroundColor: '#ffffff',
    borderColor: '#4a90d9',
    borderWidth: 2,
    borderStyle: 'solid' as const,
    borderRadius: 8,
    color: '#1e3a5f',
    fontSize: 13,
    padding: 12,
    minWidth: 120,
    minHeight: 70,
  },

  queue: {
    backgroundColor: '#ffffff',
    borderColor: '#f5a623',
    borderWidth: 2,
    borderStyle: 'solid' as const,
    borderRadius: 8,
    color: '#1e3a5f',
    fontSize: 13,
    padding: 12,
    minWidth: 120,
    minHeight: 70,
  },

  externalSystem: {
    backgroundColor: '#f5f5f5',
    borderColor: '#999999',
    borderWidth: 2,
    borderStyle: 'dashed' as const,
    borderRadius: 8,
    color: '#333333',
    fontSize: 14,
    padding: 16,
    minWidth: 150,
    minHeight: 80,
  },
};

/**
 * C4 Presets Library
 */
export const C4_PRESETS: readonly C4Preset[] = [
  // PERSON PRESETS
  {
    id: 'c4-person-user',
    name: 'User',
    description: 'Primary user of the system',
    elementType: 'person' as C4ElementType,
    icon: '👤',
    category: 'person',
    data: {
      label: 'User',
      description: 'A primary user of the system',
      icon: '👤',
    },
    style: PRESET_STYLES.person,
    className: 'c4-node c4-person',
  },

  {
    id: 'c4-person-admin',
    name: 'Administrator',
    description: 'System administrator',
    elementType: 'person' as C4ElementType,
    icon: '👨‍💼',
    category: 'person',
    data: {
      label: 'Administrator',
      description: 'Manages system configuration and maintenance',
      icon: '👨‍💼',
    },
    style: PRESET_STYLES.person,
    className: 'c4-node c4-person',
  },

  {
    id: 'c4-person-external',
    name: 'External User',
    description: 'External system user',
    elementType: 'person' as C4ElementType,
    icon: '👥',
    category: 'person',
    data: {
      label: 'External User',
      description: 'User from external organization',
      icon: '👥',
    },
    style: PRESET_STYLES.person,
    className: 'c4-node c4-person',
  },

  // SOFTWARE SYSTEM PRESETS
  {
    id: 'c4-system-webapp',
    name: 'Web Application',
    description: 'Web-based application system',
    elementType: 'software-system' as C4ElementType,
    icon: '🌐',
    category: 'system',
    data: {
      label: 'Web Application',
      description: 'Web-based application system',
      icon: '🌐',
    },
    style: PRESET_STYLES.softwareSystem,
    className: 'c4-node c4-system',
    width: 180,
    height: 90,
  },

  {
    id: 'c4-system-api',
    name: 'API Gateway',
    description: 'API gateway service',
    elementType: 'software-system' as C4ElementType,
    icon: '🔌',
    category: 'system',
    data: {
      label: 'API Gateway',
      description: 'RESTful API gateway',
      icon: '🔌',
    },
    style: PRESET_STYLES.softwareSystem,
    className: 'c4-node c4-system',
    width: 180,
    height: 90,
  },

  {
    id: 'c4-system-legacy',
    name: 'Legacy System',
    description: 'External legacy system',
    elementType: 'external-system' as C4ElementType,
    icon: '🏛️',
    category: 'system',
    data: {
      label: 'Legacy System',
      description: 'External legacy system integration',
      icon: '🏛️',
    },
    style: PRESET_STYLES.externalSystem,
    className: 'c4-node c4-external',
    width: 180,
    height: 90,
  },

  // CONTAINER PRESETS
  {
    id: 'c4-container-spa',
    name: 'Single Page App',
    description: 'React/Vue/Angular SPA',
    elementType: 'container' as C4ElementType,
    icon: '⚛️',
    category: 'container',
    data: {
      label: 'Web App',
      description: 'Single Page Application',
      icon: '⚛️',
    },
    style: PRESET_STYLES.container,
    className: 'c4-node c4-container',
    width: 160,
    height: 85,
    exampleTechnology: 'React / Vue / Angular',
  },

  {
    id: 'c4-container-mobile',
    name: 'Mobile App',
    description: 'iOS/Android mobile application',
    elementType: 'container' as C4ElementType,
    icon: '📱',
    category: 'container',
    data: {
      label: 'Mobile App',
      description: 'Native mobile application',
      icon: '📱',
    },
    style: PRESET_STYLES.container,
    className: 'c4-node c4-container',
    width: 140,
    height: 85,
    exampleTechnology: 'iOS / Android',
  },

  {
    id: 'c4-container-backend',
    name: 'Backend API',
    description: 'RESTful API service',
    elementType: 'container' as C4ElementType,
    icon: '⚙️',
    category: 'container',
    data: {
      label: 'API Service',
      description: 'RESTful API backend',
      icon: '⚙️',
    },
    style: PRESET_STYLES.container,
    className: 'c4-node c4-container',
    width: 160,
    height: 85,
    exampleTechnology: 'Node.js / Python / Java',
  },

  {
    id: 'c4-container-worker',
    name: 'Background Worker',
    description: 'Async background job processor',
    elementType: 'container' as C4ElementType,
    icon: '🔄',
    category: 'container',
    data: {
      label: 'Worker',
      description: 'Background job processor',
      icon: '🔄',
    },
    style: PRESET_STYLES.container,
    className: 'c4-node c4-container',
    width: 150,
    height: 85,
    exampleTechnology: 'Celery / Bull / Sidekiq',
  },

  // COMPONENT PRESETS
  {
    id: 'c4-component-controller',
    name: 'Controller',
    description: 'API controller component',
    elementType: 'component' as C4ElementType,
    icon: '🎮',
    category: 'component',
    data: {
      label: 'Controller',
      description: 'Request handler',
      icon: '🎮',
    },
    style: PRESET_STYLES.component,
    className: 'c4-node c4-component',
    width: 140,
    height: 75,
  },

  {
    id: 'c4-component-service',
    name: 'Service',
    description: 'Business logic service',
    elementType: 'component' as C4ElementType,
    icon: '📦',
    category: 'component',
    data: {
      label: 'Service',
      description: 'Business logic layer',
      icon: '📦',
    },
    style: PRESET_STYLES.component,
    className: 'c4-node c4-component',
    width: 140,
    height: 75,
  },

  {
    id: 'c4-component-repository',
    name: 'Repository',
    description: 'Data access component',
    elementType: 'component' as C4ElementType,
    icon: '🗄️',
    category: 'component',
    data: {
      label: 'Repository',
      description: 'Data access layer',
      icon: '🗄️',
    },
    style: PRESET_STYLES.component,
    className: 'c4-node c4-component',
    width: 140,
    height: 75,
  },

  {
    id: 'c4-component-auth',
    name: 'Auth Module',
    description: 'Authentication/authorization',
    elementType: 'component' as C4ElementType,
    icon: '🔐',
    category: 'component',
    data: {
      label: 'Auth Module',
      description: 'Authentication service',
      icon: '🔐',
    },
    style: PRESET_STYLES.component,
    className: 'c4-node c4-component',
    width: 140,
    height: 75,
  },

  // INFRASTRUCTURE PRESETS
  {
    id: 'c4-infra-database',
    name: 'Database',
    description: 'SQL/NoSQL database',
    elementType: 'database' as C4ElementType,
    icon: '🗄️',
    category: 'infrastructure',
    data: {
      label: 'Database',
      description: 'Primary data store',
      icon: '🗄️',
    },
    style: PRESET_STYLES.database,
    className: 'c4-node c4-database',
    width: 140,
    height: 75,
    exampleTechnology: 'PostgreSQL / MongoDB',
  },

  {
    id: 'c4-infra-cache',
    name: 'Cache',
    description: 'In-memory cache store',
    elementType: 'database' as C4ElementType,
    icon: '⚡',
    category: 'infrastructure',
    data: {
      label: 'Cache',
      description: 'In-memory cache',
      icon: '⚡',
    },
    style: PRESET_STYLES.database,
    className: 'c4-node c4-database',
    width: 130,
    height: 75,
    exampleTechnology: 'Redis / Memcached',
  },

  {
    id: 'c4-infra-queue',
    name: 'Message Queue',
    description: 'Message broker/queue',
    elementType: 'queue' as C4ElementType,
    icon: '📨',
    category: 'infrastructure',
    data: {
      label: 'Message Queue',
      description: 'Async messaging',
      icon: '📨',
    },
    style: PRESET_STYLES.queue,
    className: 'c4-node c4-queue',
    width: 150,
    height: 75,
    exampleTechnology: 'RabbitMQ / Kafka / SQS',
  },

  {
    id: 'c4-infra-objectstore',
    name: 'Object Storage',
    description: 'Blob/file storage',
    elementType: 'database' as C4ElementType,
    icon: '📦',
    category: 'infrastructure',
    data: {
      label: 'Object Storage',
      description: 'Blob storage service',
      icon: '📦',
    },
    style: PRESET_STYLES.database,
    className: 'c4-node c4-database',
    width: 140,
    height: 75,
    exampleTechnology: 'S3 / Azure Blob',
  },
] as const;

/**
 * Get presets by category
 */
export function getPresetsByCategory(
  category: C4Preset['category'] | 'all'
): readonly C4Preset[] {
  if (category === 'all') {
    return C4_PRESETS;
  }
  return C4_PRESETS.filter((preset) => preset.category === category);
}

/**
 * Get preset by ID
 */
export function getPresetById(id: string): C4Preset | undefined {
  return C4_PRESETS.find((preset) => preset.id === id);
}

/**
 * Search presets by name or description
 */
export function searchPresets(query: string): readonly C4Preset[] {
  const term = query.toLowerCase().trim();
  if (!term) {
    return C4_PRESETS;
  }

  return C4_PRESETS.filter(
    (preset) =>
      preset.name.toLowerCase().includes(term) ||
      preset.description.toLowerCase().includes(term) ||
      preset.elementType.toLowerCase().includes(term)
  );
}

/**
 * Get presets for specific C4 level
 */
export function getPresetsForLevel(
  level: 'system-context' | 'container' | 'component'
): readonly C4Preset[] {
  switch (level) {
    case 'system-context':
      // System Context: Person, Software System, External System
      return C4_PRESETS.filter(
        (p) => p.category === 'person' || p.category === 'system'
      );
    case 'container':
      // Container: All except some component-specific ones
      return C4_PRESETS.filter((p) =>
        ['person', 'system', 'container', 'infrastructure'].includes(p.category)
      );
    case 'component':
      // Component: All presets
      return C4_PRESETS;
    default:
      return C4_PRESETS;
  }
}

/**
 * Category display configuration
 */
export const PRESET_CATEGORY_CONFIG = {
  all: { label: 'All', icon: '📦', color: '#8b5cf6', description: 'All C4 elements' },
  person: { label: 'People', icon: '👤', color: '#22c55e', description: 'Users and actors' },
  system: { label: 'Systems', icon: '🌐', color: '#3b82f6', description: 'Software systems' },
  container: { label: 'Containers', icon: '📦', color: '#0ea5e9', description: 'Applications and services' },
  component: { label: 'Components', icon: '🧩', color: '#ec4899', description: 'Internal modules' },
  infrastructure: { label: 'Infrastructure', icon: '🏗️', color: '#f97316', description: 'Databases and queues' },
} as const;
