/**
 * C4 Architecture Diagram Templates
 *
 * Complete pre-built architecture diagram templates that users can start from.
 * These templates follow C4 notation and represent common architectural patterns.
 *
 * Templates include:
 * 1. Microservices Architecture
 * 2. Monolithic Architecture
 * 3. Event-Driven Architecture
 * 4. Layered Architecture
 * 5. Serverless Architecture
 */

import type { Diagram, Node, Edge } from '@/types';
import { C4Level, C4ElementType } from '@/types';
import type { DiagramType } from '@/types';

/**
 * Architecture Template metadata
 */
export interface ArchitectureTemplate {
  /** Unique template ID */
  id: string;

  /** Template name */
  name: string;

  /** Short description */
  description: string;

  /** Template category */
  category: 'microservices' | 'monolithic' | 'event-driven' | 'layered' | 'serverless';

  /** Diagram type for this template */
  diagramType: DiagramType;

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

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a node for use in templates
 */
function createTemplateNode(
  id: string,
  label: string,
  type: string,
  position: { x: number; y: number },
  options: {
    description?: string;
    technology?: string;
    isExternal?: boolean;
    width?: number;
    height?: number;
  } = {}
): Node {
  return {
    id,
    diagramId: '', // Will be set when creating diagram
    position,
    data: {
      label,
      description: options.description,
      icon: getIconForType(type),
      cssClass: getClassForType(type),
      width: options.width,
      height: options.height,
    },
    type,
    className: getClassForType(type),
  };
}

/**
 * Create an edge for use in templates
 */
function createTemplateEdge(
  id: string,
  source: string,
  target: string,
  options: {
    label?: string;
    animated?: boolean;
    style?: 'solid' | 'dashed';
  } = {}
): Edge {
  return {
    id,
    diagramId: '', // Will be set when creating diagram
    source,
    target,
    label: options.label,
    animated: options.animated ?? false,
    style: options.style === 'dashed'
      ? { strokeDasharray: '5,5', strokeWidth: 2 }
      : { strokeWidth: 2 },
  };
}

/**
 * Get icon for node type
 */
function getIconForType(type: string): string {
  const icons: Record<string, string> = {
    c4Person: '👤',
    c4System: '🖥️',
    c4Container: '📦',
    c4Component: '🧩',
    c4Database: '🗄️',
    c4Queue: '📨',
    custom: '📄',
  };
  return icons[type] || '📄';
}

/**
 * Get CSS class for node type
 */
function getClassForType(type: string): string {
  return `c4-node c4-${type.replace('c4', '').toLowerCase()}`;
}

/**
 * Generate a unique ID
 */
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// Template 1: Microservices Architecture
// ============================================================================

const microservicesTemplate: ArchitectureTemplate = {
  id: 'arch-microservices',
  name: 'Microservices Architecture',
  description: 'Decomposed application with independent services, API gateway, and databases per service',
  category: 'microservices',
  diagramType: 'container',
  icon: '🔧',
  color: '#8b5cf6',
  nodeCount: 10,
  edgeCount: 12,
  tags: ['microservices', 'api-gateway', 'distributed', 'scalable'],

  createDiagram: (workspaceId: string) => {
    const nodes: Node[] = [
      // Users
      createTemplateNode('node-user', 'Web User', 'c4Person', { x: 250, y: 0 }, {
        description: 'End user accessing the application via web browser',
      }),
      createTemplateNode('node-admin', 'Admin User', 'c4Person', { x: 550, y: 0 }, {
        description: 'Administrator managing the system',
      }),

      // API Gateway
      createTemplateNode('node-gateway', 'API Gateway', 'c4Container', { x: 400, y: 120 }, {
        description: 'Single entry point for all client requests',
        technology: 'Kong / AWS API Gateway',
      }),

      // Services
      createTemplateNode('node-auth-service', 'Auth Service', 'c4Container', { x: 100, y: 280 }, {
        description: 'Handles authentication and authorization',
        technology: 'OAuth 2.0 / JWT',
      }),
      createTemplateNode('node-user-service', 'User Service', 'c4Container', { x: 300, y: 280 }, {
        description: 'Manages user profiles and preferences',
        technology: 'Node.js / Express',
      }),
      createTemplateNode('node-order-service', 'Order Service', 'c4Container', { x: 500, y: 280 }, {
        description: 'Processes orders and payments',
        technology: 'Java / Spring Boot',
      }),
      createTemplateNode('node-product-service', 'Product Service', 'c4Container', { x: 700, y: 280 }, {
        description: 'Manages product catalog and inventory',
        technology: 'Python / Django',
      }),

      // Message Queue
      createTemplateNode('node-queue', 'Message Queue', 'c4Queue', { x: 400, y: 400 }, {
        description: 'Async communication between services',
        technology: 'RabbitMQ / Kafka',
      }),

      // Databases
      createTemplateNode('node-auth-db', 'Auth DB', 'c4Database', { x: 100, y: 520 }, {
        description: 'Stores user credentials and sessions',
        technology: 'PostgreSQL',
      }),
      createTemplateNode('node-user-db', 'User DB', 'c4Database', { x: 300, y: 520 }, {
        description: 'Stores user profile data',
        technology: 'PostgreSQL',
      }),
      createTemplateNode('node-order-db', 'Order DB', 'c4Database', { x: 500, y: 520 }, {
        description: 'Stores orders and transactions',
        technology: 'MongoDB',
      }),
      createTemplateNode('node-product-db', 'Product DB', 'c4Database', { x: 700, y: 520 }, {
        description: 'Stores product catalog',
        technology: 'PostgreSQL',
      }),
    ];

    const edges: Edge[] = [
      // Users to Gateway
      createTemplateEdge('edge-user-gateway', 'node-user', 'node-gateway', { label: 'HTTPS' }),
      createTemplateEdge('edge-admin-gateway', 'node-admin', 'node-gateway', { label: 'HTTPS' }),

      // Gateway to Services
      createTemplateEdge('edge-gateway-auth', 'node-gateway', 'node-auth-service', { label: 'REST' }),
      createTemplateEdge('edge-gateway-user', 'node-gateway', 'node-user-service', { label: 'REST' }),
      createTemplateEdge('edge-gateway-order', 'node-gateway', 'node-order-service', { label: 'REST' }),
      createTemplateEdge('edge-gateway-product', 'node-gateway', 'node-product-service', { label: 'REST' }),

      // Service to Queue (async)
      createTemplateEdge('edge-order-queue', 'node-order-service', 'node-queue', { label: 'Publish', animated: true }),
      createTemplateEdge('edge-queue-user', 'node-queue', 'node-user-service', { label: 'Subscribe', animated: true }),

      // Services to Databases
      createTemplateEdge('edge-auth-db', 'node-auth-service', 'node-auth-db', { label: 'JDBC' }),
      createTemplateEdge('edge-user-db', 'node-user-service', 'node-user-db', { label: 'JDBC' }),
      createTemplateEdge('edge-order-db', 'node-order-service', 'node-order-db', { label: 'Mongo' }),
      createTemplateEdge('edge-product-db', 'node-product-service', 'node-product-db', { label: 'JDBC' }),
    ];

    return {
      name: 'Microservices Architecture',
      description: 'A microservices architecture with API Gateway, independent services, and dedicated databases per service',
      type: 'container',
      workspaceId,
      nodes,
      edges,
      layout: { type: 'manual', direction: 'TB' },
      metadata: {
        version: 1,
        author: 'System',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      },
      tags: ['microservices', 'distributed-systems', 'api-gateway'],
    };
  },
};

// ============================================================================
// Template 2: Monolithic Architecture
// ============================================================================

const monolithicTemplate: ArchitectureTemplate = {
  id: 'arch-monolithic',
  name: 'Monolithic Architecture',
  description: 'Single deployable application containing all functionality',
  category: 'monolithic',
  diagramType: 'container',
  icon: '🏛️',
  color: '#3b82f6',
  nodeCount: 6,
  edgeCount: 6,
  tags: ['monolithic', 'single-application', 'simple', 'traditional'],

  createDiagram: (workspaceId: string) => {
    const nodes: Node[] = [
      // Users
      createTemplateNode('node-web-user', 'Web User', 'c4Person', { x: 150, y: 0 }, {
        description: 'User accessing via web browser',
      }),
      createTemplateNode('node-mobile-user', 'Mobile User', 'c4Person', { x: 450, y: 0 }, {
        description: 'User accessing via mobile app',
      }),

      // Load Balancer
      createTemplateNode('node-lb', 'Load Balancer', 'c4Container', { x: 300, y: 120 }, {
        description: 'Distributes traffic across app instances',
        technology: 'NGINX / HAProxy',
      }),

      // Monolithic Application
      createTemplateNode('node-app', 'Monolithic Application', 'c4Container', { x: 200, y: 260 }, {
        description: 'Single application containing all business logic',
        technology: 'Java / Spring / React',
        width: 200,
        height: 100,
      }),

      // Cache Layer
      createTemplateNode('node-cache', 'Cache Layer', 'c4Database', { x: 500, y: 260 }, {
        description: 'In-memory cache for performance',
        technology: 'Redis',
      }),

      // Database
      createTemplateNode('node-db', 'Primary Database', 'c4Database', { x: 300, y: 420 }, {
        description: 'Centralized database for all data',
        technology: 'PostgreSQL / MySQL',
        width: 180,
        height: 80,
      }),
    ];

    const edges: Edge[] = [
      // Users to Load Balancer
      createTemplateEdge('edge-web-lb', 'node-web-user', 'node-lb', { label: 'HTTPS' }),
      createTemplateEdge('edge-mobile-lb', 'node-mobile-user', 'node-lb', { label: 'HTTPS' }),

      // Load Balancer to App
      createTemplateEdge('edge-lb-app', 'node-lb', 'node-app', { label: 'HTTP' }),

      // App to Cache
      createTemplateEdge('edge-app-cache', 'node-app', 'node-cache', { label: 'TCP', style: 'dashed' }),

      // App to Database
      createTemplateEdge('edge-app-db', 'node-app', 'node-db', { label: 'JDBC' }),
    ];

    return {
      name: 'Monolithic Architecture',
      description: 'A traditional monolithic architecture with a single application, cache layer, and centralized database',
      type: 'container',
      workspaceId,
      nodes,
      edges,
      layout: { type: 'manual', direction: 'TB' },
      metadata: {
        version: 1,
        author: 'System',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      },
      tags: ['monolithic', 'traditional', 'simple'],
    };
  },
};

// ============================================================================
// Template 3: Event-Driven Architecture
// ============================================================================

const eventDrivenTemplate: ArchitectureTemplate = {
  id: 'arch-event-driven',
  name: 'Event-Driven Architecture',
  description: 'Loosely coupled services communicating through events',
  category: 'event-driven',
  diagramType: 'container',
  icon: '⚡',
  color: '#f59e0b',
  nodeCount: 9,
  edgeCount: 11,
  tags: ['event-driven', 'async', 'message-broker', 'loose-coupling'],

  createDiagram: (workspaceId: string) => {
    const nodes: Node[] = [
      // Event Producers
      createTemplateNode('node-web-app', 'Web Application', 'c4Container', { x: 100, y: 0 }, {
        description: 'Frontend application that publishes events',
        technology: 'React / Vue',
      }),
      createTemplateNode('node-mobile-app', 'Mobile Application', 'c4Container', { x: 350, y: 0 }, {
        description: 'Mobile app that publishes events',
        technology: 'iOS / Android',
      }),
      createTemplateNode('node-external', 'External System', 'c4Container', { x: 600, y: 0 }, {
        description: 'Third-party system sending events',
        technology: 'External API',
        isExternal: true,
      }),

      // Event Bus/Message Broker
      createTemplateNode('node-event-bus', 'Event Bus', 'c4Queue', { x: 350, y: 140 }, {
        description: 'Central message broker for event routing',
        technology: 'Kafka / RabbitMQ',
        width: 200,
        height: 80,
      }),

      // Event Consumers
      createTemplateNode('node-analytics', 'Analytics Service', 'c4Container', { x: 50, y: 300 }, {
        description: 'Processes events for analytics and reporting',
        technology: 'Python / Spark',
      }),
      createTemplateNode('node-notification', 'Notification Service', 'c4Container', { x: 250, y: 300 }, {
        description: 'Sends notifications based on events',
        technology: 'Node.js',
      }),
      createTemplateNode('node-audit', 'Audit Logger', 'c4Container', { x: 450, y: 300 }, {
        description: 'Logs all events for compliance',
        technology: 'Go / Elastic',
      }),
      createTemplateNode('node-replication', 'Data Replication', 'c4Container', { x: 650, y: 300 }, {
        description: 'Replicates data to other systems',
        technology: 'Python',
      }),

      // Event Store
      createTemplateNode('node-event-store', 'Event Store', 'c4Database', { x: 350, y: 440 }, {
        description: 'Persistent storage for all events',
        technology: 'EventStoreDB / Kafka',
        width: 180,
        height: 80,
      }),
    ];

    const edges: Edge[] = [
      // Producers to Event Bus
      createTemplateEdge('edge-web-bus', 'node-web-app', 'node-event-bus', { label: 'Publish', animated: true }),
      createTemplateEdge('edge-mobile-bus', 'node-mobile-app', 'node-event-bus', { label: 'Publish', animated: true }),
      createTemplateEdge('edge-external-bus', 'node-external', 'node-event-bus', { label: 'Publish', animated: true }),

      // Event Bus to Consumers
      createTemplateEdge('edge-bus-analytics', 'node-event-bus', 'node-analytics', { label: 'Subscribe', animated: true }),
      createTemplateEdge('edge-bus-notification', 'node-event-bus', 'node-notification', { label: 'Subscribe', animated: true }),
      createTemplateEdge('edge-bus-audit', 'node-event-bus', 'node-audit', { label: 'Subscribe', animated: true }),
      createTemplateEdge('edge-bus-replication', 'node-event-bus', 'node-replication', { label: 'Subscribe', animated: true }),

      // Consumers to Event Store
      createTemplateEdge('edge-analytics-store', 'node-analytics', 'node-event-store', { label: 'Query', style: 'dashed' }),
      createTemplateEdge('edge-audit-store', 'node-audit', 'node-event-store', { label: 'Append', style: 'dashed' }),
    ];

    return {
      name: 'Event-Driven Architecture',
      description: 'An event-driven architecture with an event bus mediating communication between producers and consumers',
      type: 'container',
      workspaceId,
      nodes,
      edges,
      layout: { type: 'manual', direction: 'TB' },
      metadata: {
        version: 1,
        author: 'System',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      },
      tags: ['event-driven', 'async', 'message-broker', 'kafka'],
    };
  },
};

// ============================================================================
// Template 4: Layered Architecture
// ============================================================================

const layeredTemplate: ArchitectureTemplate = {
  id: 'arch-layered',
  name: 'Layered Architecture',
  description: 'Traditional n-tier architecture with clear separation of concerns',
  category: 'layered',
  diagramType: 'component',
  icon: '📚',
  color: '#10b981',
  nodeCount: 8,
  edgeCount: 7,
  tags: ['layered', 'n-tier', 'separation-of-concerns', 'traditional'],

  createDiagram: (workspaceId: string) => {
    const nodes: Node[] = [
      // User
      createTemplateNode('node-user', 'User', 'c4Person', { x: 300, y: 0 }, {
        description: 'End user of the application',
      }),

      // Presentation Layer
      createTemplateNode('node-presentation', 'Presentation Layer', 'c4Container', { x: 150, y: 120 }, {
        description: 'UI components and user interaction',
        technology: 'React / Angular / Blazor',
        width: 300,
        height: 70,
      }),

      // API Layer
      createTemplateNode('node-api', 'API Layer', 'c4Container', { x: 150, y: 240 }, {
        description: 'REST/GraphQL API endpoints',
        technology: 'ASP.NET Core / Express',
        width: 300,
        height: 70,
      }),

      // Business Logic Layer
      createTemplateNode('node-business', 'Business Logic Layer', 'c4Container', { x: 150, y: 360 }, {
        description: 'Domain logic and business rules',
        technology: 'C# / Java Services',
        width: 300,
        height: 70,
      }),

      // Data Access Layer
      createTemplateNode('node-data-access', 'Data Access Layer', 'c4Container', { x: 150, y: 480 }, {
        description: 'Repository pattern and ORM',
        technology: 'Entity Framework / Hibernate',
        width: 300,
        height: 70,
      }),

      // Database
      createTemplateNode('node-database', 'Database', 'c4Database', { x: 200, y: 600 }, {
        description: 'Relational database',
        technology: 'SQL Server / PostgreSQL',
        width: 200,
        height: 70,
      }),

      // External Service
      createTemplateNode('node-external', 'External API', 'c4Container', { x: 500, y: 480 }, {
        description: 'Third-party service integration',
        technology: 'External Service',
        isExternal: true,
      }),
    ];

    const edges: Edge[] = [
      // User to Presentation
      createTemplateEdge('edge-user-presentation', 'node-user', 'node-presentation', { label: 'Uses' }),

      // Presentation to API
      createTemplateEdge('edge-presentation-api', 'node-presentation', 'node-api', { label: 'HTTP/REST' }),

      // API to Business
      createTemplateEdge('edge-api-business', 'node-api', 'node-business', { label: 'Calls' }),

      // Business to Data Access
      createTemplateEdge('edge-business-data', 'node-business', 'node-data-access', { label: 'Uses' }),

      // Business to External
      createTemplateEdge('edge-business-external', 'node-business', 'node-external', { label: 'HTTP', style: 'dashed' }),

      // Data Access to Database
      createTemplateEdge('edge-data-db', 'node-data-access', 'node-database', { label: 'SQL' }),
    ];

    return {
      name: 'Layered Architecture',
      description: 'A traditional layered (n-tier) architecture with clear separation between presentation, API, business logic, and data access layers',
      type: 'component',
      workspaceId,
      nodes,
      edges,
      layout: { type: 'manual', direction: 'TB' },
      metadata: {
        version: 1,
        author: 'System',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      },
      tags: ['layered', 'n-tier', 'enterprise'],
    };
  },
};

// ============================================================================
// Template 5: Serverless Architecture
// ============================================================================

const serverlessTemplate: ArchitectureTemplate = {
  id: 'arch-serverless',
  name: 'Serverless Architecture',
  description: 'Cloud-native architecture using managed services and functions',
  category: 'serverless',
  diagramType: 'container',
  icon: '☁️',
  color: '#06b6d4',
  nodeCount: 10,
  edgeCount: 11,
  tags: ['serverless', 'cloud-native', 'aws-lambda', 'azure-functions'],

  createDiagram: (workspaceId: string) => {
    const nodes: Node[] = [
      // Users
      createTemplateNode('node-web-user', 'Web User', 'c4Person', { x: 150, y: 0 }, {
        description: 'User accessing via web browser',
      }),
      createTemplateNode('node-mobile-user', 'Mobile User', 'c4Person', { x: 450, y: 0 }, {
        description: 'User accessing via mobile app',
      }),

      // Static Hosting
      createTemplateNode('node-static-hosting', 'Static Hosting', 'c4Container', { x: 200, y: 100 }, {
        description: 'Hosts static frontend assets',
        technology: 'CloudFront / Azure CDN',
      }),

      // API Gateway
      createTemplateNode('node-api-gateway', 'API Gateway', 'c4Container', { x: 400, y: 220 }, {
        description: 'Serverless API endpoint',
        technology: 'API Gateway / API Management',
      }),

      // Functions
      createTemplateNode('node-auth-function', 'Auth Function', 'c4Container', { x: 150, y: 360 }, {
        description: 'Handles authentication',
        technology: 'Lambda / Azure Functions',
      }),
      createTemplateNode('node-api-function', 'API Function', 'c4Container', { x: 350, y: 360 }, {
        description: 'Main API business logic',
        technology: 'Lambda / Azure Functions',
      }),
      createTemplateNode('node-processor-function', 'Processor Function', 'c4Container', { x: 550, y: 360 }, {
        description: 'Background processing',
        technology: 'Lambda / Azure Functions',
      }),

      // Managed Services
      createTemplateNode('node-auth-service', 'Auth Service', 'c4Container', { x: 100, y: 500 }, {
        description: 'Managed authentication service',
        technology: 'Cognito / Auth0',
        isExternal: true,
      }),
      createTemplateNode('node-queue', 'Message Queue', 'c4Queue', { x: 350, y: 500 }, {
        description: 'Serverless message queue',
        technology: 'SQS / Service Bus',
      }),
      createTemplateNode('node-database', 'Managed Database', 'c4Database', { x: 550, y: 500 }, {
        description: 'Serverless database',
        technology: 'DynamoDB / Cosmos DB',
      }),
    ];

    const edges: Edge[] = [
      // Users to Static Hosting
      createTemplateEdge('edge-web-static', 'node-web-user', 'node-static-hosting', { label: 'HTTPS' }),

      // Static Hosting to API Gateway
      createTemplateEdge('edge-static-gateway', 'node-static-hosting', 'node-api-gateway', { label: 'HTTPS' }),

      // Mobile to API Gateway
      createTemplateEdge('edge-mobile-gateway', 'node-mobile-user', 'node-api-gateway', { label: 'HTTPS' }),

      // API Gateway to Functions
      createTemplateEdge('edge-gateway-auth', 'node-api-gateway', 'node-auth-function', { label: 'Route' }),
      createTemplateEdge('edge-gateway-api', 'node-api-gateway', 'node-api-function', { label: 'Route' }),

      // Auth Function to Auth Service
      createTemplateEdge('edge-function-auth', 'node-auth-function', 'node-auth-service', { label: 'OAuth' }),

      // API Function to Database
      createTemplateEdge('edge-api-db', 'node-api-function', 'node-database', { label: 'Query' }),

      // API Function to Queue
      createTemplateEdge('edge-api-queue', 'node-api-function', 'node-queue', { label: 'Enqueue', animated: true }),

      // Queue to Processor Function
      createTemplateEdge('edge-queue-processor', 'node-queue', 'node-processor-function', { label: 'Trigger', animated: true }),

      // Processor Function to Database
      createTemplateEdge('edge-processor-db', 'node-processor-function', 'node-database', { label: 'Write' }),
    ];

    return {
      name: 'Serverless Architecture',
      description: 'A cloud-native serverless architecture using managed services, API gateway, and serverless functions',
      type: 'container',
      workspaceId,
      nodes,
      edges,
      layout: { type: 'manual', direction: 'TB' },
      metadata: {
        version: 1,
        author: 'System',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      },
      tags: ['serverless', 'cloud-native', 'aws', 'azure'],
    };
  },
};

// ============================================================================
// Export All Templates
// ============================================================================

/**
 * All architecture templates
 */
export const ARCHITECTURE_TEMPLATES: readonly ArchitectureTemplate[] = [
  microservicesTemplate,
  monolithicTemplate,
  eventDrivenTemplate,
  layeredTemplate,
  serverlessTemplate,
] as const;

/**
 * Get template by ID
 */
export function getArchitectureTemplateById(id: string): ArchitectureTemplate | undefined {
  return ARCHITECTURE_TEMPLATES.find((template) => template.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: ArchitectureTemplate['category']): readonly ArchitectureTemplate[] {
  return ARCHITECTURE_TEMPLATES.filter((template) => template.category === category);
}

/**
 * Get all template categories
 */
export function getTemplateCategories(): ArchitectureTemplate['category'][] {
  return ['microservices', 'monolithic', 'event-driven', 'layered', 'serverless'];
}

/**
 * Template category display info
 */
export const TEMPLATE_CATEGORY_INFO = {
  microservices: {
    label: 'Microservices',
    description: 'Distributed services with independent deployment',
    icon: '🔧',
    color: '#8b5cf6',
  },
  monolithic: {
    label: 'Monolithic',
    description: 'Single unified application',
    icon: '🏛️',
    color: '#3b82f6',
  },
  'event-driven': {
    label: 'Event-Driven',
    description: 'Async communication via events',
    icon: '⚡',
    color: '#f59e0b',
  },
  layered: {
    label: 'Layered',
    description: 'Traditional n-tier architecture',
    icon: '📚',
    color: '#10b981',
  },
  serverless: {
    label: 'Serverless',
    description: 'Cloud-native managed services',
    icon: '☁️',
    color: '#06b6d4',
  },
} as const;

/**
 * Create a diagram from a template
 */
export function createDiagramFromTemplate(
  templateId: string,
  workspaceId: string,
  customName?: string
): Omit<Diagram, 'id' | 'createdAt' | 'updatedAt'> | null {
  const template = getArchitectureTemplateById(templateId);
  if (!template) {
    return null;
  }

  const diagram = template.createDiagram(workspaceId);

  // Apply custom name if provided
  if (customName) {
    diagram.name = customName;
  }

  return diagram;
}
