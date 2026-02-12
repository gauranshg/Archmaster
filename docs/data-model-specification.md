# Data Model & API Specification

**Version**: 1.0
**Last Updated**: 2026-01-25
**Status**: Draft

---

## Table of Contents

1. [Data Model Overview](#data-model-overview)
2. [Core Data Entities](#core-data-entities)
3. [Data Relationships](#data-relationships)
4. [TypeScript Interfaces](#typescript-interfaces)
5. [JSON Schema Definitions](#json-schema-definitions)
6. [State Management Structure](#state-management-structure)
7. [API Contracts (Future)](#api-contracts-future)

---

## Data Model Overview

The Custom Architecture Platform uses a hierarchical data model centered around workspaces, diagrams, nodes, edges, and templates. The model is designed to be:

- **Serializable**: Can be converted to/from JSON for storage and transfer
- **Type-Safe**: Full TypeScript type definitions
- **Extensible**: Easy to add new properties and features
- **Validated**: Schema validation to ensure data integrity
- **Indexed**: Optimized for IndexedDB storage with proper indexes

### Storage Architecture

**Client Storage (Phase 1-4)**: IndexedDB via Dexie wrapper
- Capacity: 100MB+ (vs 5MB localStorage)
- Asynchronous, non-blocking operations
- Indexed queries for fast lookups
- Survives browser restarts

**Server Storage (Phase 5+)**: PostgreSQL database
- Persistent cloud storage
- Multi-user collaboration
- Backup and versioning

### Entity Relationship Diagram

```
┌─────────────┐
│  Workspace  │ (Phase 5+)
└──────┬──────┘
       │ 1
       │ has many
       │ *
┌──────▼──────┐
│  Diagram    │◄────────┐
└──────┬──────┘         │
       │ 1              │
       │ has many       │
       │ *              │
┌──────▼──────┐    ┌────┴─────┐
│   Node      │    │ Template │
└──────┬──────┘    └──────────┘
       │ *
       │ connected by
       │ *
┌──────▼──────┐
│   Edge      │
└─────────────┘
```

### MVP Simplification (Phase 1-3)
- Single default workspace per user (auto-created)
- No workspace management UI
- All diagrams belong to user's default workspace
- Workspace ID stored in user profile

---

## Core Data Entities

### Diagram

The top-level entity representing a complete architecture diagram.

**Properties**:
- Unique identifier
- Name and description
- Type (C4 level or generic)
- Parent/child relationships for hierarchy
- Collection of nodes and edges
- Custom CSS styles
- Metadata (created, modified, version)

---

### Node

A visual element in the diagram representing a component or entity.

**Properties**:
- Unique identifier
- Position (x, y coordinates)
- Size (width, height)
- HTML content
- CSS class/id for styling
- Template reference
- Data properties

---

### Edge

A connection between two nodes showing a relationship or flow.

**Properties**:
- Unique identifier
- Source node ID
- Target node ID
- Label
- Style (solid, dashed, dotted)
- Arrowheads
- Color and thickness

---

### Template

A reusable configuration for nodes that can be applied to multiple nodes.

**Properties**:
- Unique identifier
- Name and description
- HTML content
- CSS styling
- Thumbnail/preview
- Category

---

### User (Future)

User account information for authentication and authorization.

**Properties**:
- Azure AD object ID
- Name and email
- Role (Admin, Editor, Viewer)
- Permissions
- Preferences

---

## Data Relationships

### 1. Workspace → Diagram (1:N)

One workspace contains multiple diagrams.

**Rules**:
- Diagrams belong to exactly one workspace
- Workspace ID is required for all diagrams
- Cascading delete: Deleting workspace deletes all diagrams

### 2. Diagram → Node (1:N)

One diagram contains multiple nodes.

**Rules**:
- Nodes belong to exactly one diagram
- Node IDs must be unique within a diagram
- Cascading delete: Deleting diagram deletes all nodes

### 3. Diagram → Edge (1:N)

One diagram contains multiple edges.

**Rules**:
- Edges belong to exactly one diagram
- Edge IDs must be unique within a diagram
- Edges must reference valid node IDs in the same diagram
- Cascading delete: Deleting diagram deletes all edges

### 4. Node → Edge (N:M)

Edges connect nodes (many-to-many via edges).

**Rules**:
- An edge connects exactly two nodes (source and target)
- A node can have multiple incoming and outgoing edges
- Edges cannot connect a node to itself
- Multiple edges can exist between the same two nodes

### 5. Diagram → Template (N:1)

Many diagrams can use the same template.

**Rules**:
- Templates are shared across diagrams
- Templates are not deleted when a diagram is deleted
- Templates can be global (all users) or user-specific

### 6. Diagram → Diagram (Hierarchy)

Diagrams can have parent-child relationships for drill-down navigation.

**Rules**:
- A diagram can have at most one parent
- A diagram can have multiple children
- Maximum nesting depth: 5 levels
- Circular references are not allowed

---

## TypeScript Interfaces

### Base Types

```typescript
/**
 * Base entity interface
 */
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Position in 2D space
 */
interface Position {
  x: number;
  y: number;
}

/**
 * Size in 2D space
 */
interface Size {
  width: number;
  height: number;
}

/**
 * Rectangle area
 */
interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

---

### Diagram Types

```typescript
/**
 * Supported diagram types
 */
type DiagramType =
  | 'system-context'    // C4 Level 1
  | 'container'         // C4 Level 2
  | 'component'         // C4 Level 3
  | 'code'              // C4 Level 4 (optional)
  | 'generic';          // Custom/generic diagrams

/**
 * Diagram entity
 */
interface Diagram extends BaseEntity {
  id: string;
  name: string;
  description?: string;
  type: DiagramType;
  parentId?: string;              // Parent diagram for hierarchy
  workspaceId: string;            // Workspace this diagram belongs to

  // Content
  nodes: Node[];
  edges: Edge[];

  // Styling
  styles?: DiagramStyles;
  theme?: string;                 // Theme name
  customCSS?: string;             // Custom CSS for this diagram

  // Layout
  layout?: LayoutConfig;

  // Metadata
  metadata: DiagramMetadata;
  tags?: string[];                // For filtering and search
}

/**
 * Diagram-level styles
 */
interface DiagramStyles {
  background?: string;            // Background color
  grid?: {
    type: 'dots' | 'lines' | 'none';
    size?: number;
    color?: string;
  };
  padding?: number;               // Canvas padding
}

/**
 * Layout configuration
 */
interface LayoutConfig {
  type: 'manual' | 'hierarchical' | 'force-directed' | 'circular';
  direction?: 'TB' | 'BT' | 'LR' | 'RL';  // Top-Bottom, Bottom-Top, Left-Right, Right-Left
  spacing?: {
    node?: number;                // Spacing between nodes
    rank?: number;                // Spacing between ranks
  };
  algorithm?: 'dagre' | 'elk';
}

/**
 * Diagram metadata
 */
interface DiagramMetadata {
  version: number;                // Incremented on each save
  author: string;                 // User ID or name
  createdAt: Date;
  modifiedAt: Date;
  parentDiagramId?: string;       // For drill-down
  childDiagramIds?: string[];     // For drill-down
}
```

---

### Node Types

```typescript
/**
 * Node entity
 */
interface Node extends BaseEntity {
  id: string;
  diagramId: string;              // Parent diagram

  // Position and size
  position: Position;
  size?: Size;                    // Optional, auto-calculated if not specified

  // Content
  data: NodeData;

  // Styling
  style?: NodeStyle;
  className?: string;             // CSS class for custom styling
  templateId?: string;            // Reference to template

  // Hierarchy
  childDiagramId?: string;        // Links to child diagram for drill-down
}

/**
 * Node data (user-defined content)
 */
interface NodeData {
  label: string;
  htmlContent: string;            // HTML content (sanitized)
  icon?: string;                  // Icon name (if using icon library)
  image?: string;                 // Image URL
  properties?: Record<string, any>; // Custom properties
}

/**
 * Node styling
 */
interface NodeStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  color?: string;                 // Text color
  fontSize?: number;
  fontFamily?: string;
  padding?: number;
  borderRadius?: number;
  boxShadow?: string;
  opacity?: number;

  // Custom CSS properties
  customCSS?: Record<string, string>;
}

/**
 * Node size constraints
 */
interface NodeConstraints {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  resizable?: boolean;            // Can user resize?
}
```

---

### Edge Types

```typescript
/**
 * Edge entity
 */
interface Edge extends BaseEntity {
  id: string;
  diagramId: string;              // Parent diagram

  // Connection
  source: string;                 // Source node ID
  target: string;                 // Target node ID
  sourceHandle?: string;          // Connection point on source
  targetHandle?: string;          // Connection point on target

  // Content
  label?: string;
  labelHTML?: string;             // HTML label (sanitized)

  // Styling
  type?: 'default' | 'straight' | 'step' | 'smooth';
  style?: EdgeStyle;
  animated?: boolean;             // Animate flow direction

  // Routing
  routing?: {
    type?: 'simple' | 'orthogonal' | 'manhattan';
    curvature?: number;
  };
}

/**
 * Edge styling
 */
interface EdgeStyle {
  stroke?: string;                // Line color
  strokeWidth?: number;           // Line thickness
  strokeDasharray?: string;       // Dashed pattern: "5,5"
  strokeDashoffset?: number;
  opacity?: number;

  // Arrowheads
  markerEnd?: string;             // URL to arrowhead marker
  markerStart?: string;           // URL to arrowhead marker
}

/**
 * Edge label position
 */
interface EdgeLabelPosition {
  type: 'source' | 'center' | 'target';
  offset?: number;                // Distance from position
}
```

---

### Template Types

```typescript
/**
 * Template entity
 */
interface Template extends BaseEntity {
  id: string;
  name: string;
  description?: string;
  category?: string;              // For organization
  author: string;                 // User who created it
  isPublic: boolean;              // Shared with all users or private

  // Content
  data: NodeData;                 // Default node data
  style: NodeStyle;               // Default styling
  className?: string;             // CSS class

  // Preview
  thumbnail?: string;             // Base64 or URL to preview image
  tags?: string[];                // For search and filtering

  // Constraints (optional)
  constraints?: NodeConstraints;
}

/**
 * Template library (collection of templates)
 */
interface TemplateLibrary {
  categories: TemplateCategory[];
  templates: Template[];
}

/**
 * Template category
 */
interface TemplateCategory {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  order: number;                  // Display order
}
```

---

### Workspace Types (Future)

```typescript
/**
 * Workspace entity
 */
interface Workspace extends BaseEntity {
  id: string;
  name: string;
  description?: string;
  ownerId: string;                // User who owns it

  // Settings
  settings: WorkspaceSettings;

  // Members (for collaboration)
  members?: WorkspaceMember[];

  // Theme
  defaultTheme?: string;

  // Diagrams
  diagramIds: string[];           // IDs of diagrams in this workspace
}

/**
 * Workspace settings
 */
interface WorkspaceSettings {
  defaultDiagramType?: DiagramType;
  enableVersionControl?: boolean;
  enableComments?: boolean;
  defaultLayout?: LayoutConfig;
}

/**
 * Workspace member (for collaboration)
 */
interface WorkspaceMember {
  userId: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  permissions: Permission[];
}

/**
 * Permission
 */
type Permission =
  | 'view'
  | 'edit'
  | 'delete'
  | 'comment'
  | 'share'
  | 'manage_members';
```

---

### User Types (Future)

```typescript
/**
 * User entity
 */
interface User extends BaseEntity {
  id: string;
  azureObjectId: string;          // Azure AD object ID

  // Profile
  name: string;
  email: string;
  avatar?: string;                // Avatar URL

  // Roles
  globalRole: 'admin' | 'user';
  roles: string[];                // Azure AD groups/roles

  // Preferences
  preferences: UserPreferences;

  // Workspaces
  workspaceIds: string[];         // Workspaces this user belongs to
}

/**
 * User preferences
 */
interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  editorFontSize: number;
  editorTabSize: number;
  autoSave: boolean;
  autoSaveInterval: number;       // seconds
  defaultDiagramType: DiagramType;
  shortcuts: Record<string, string>; // Keyboard shortcuts
}
```

---

## JSON Schema Definitions

### Diagram JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Diagram",
  "type": "object",
  "required": ["id", "name", "type", "nodes", "edges"],
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid"
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "description": {
      "type": "string",
      "maxLength": 500
    },
    "type": {
      "type": "string",
      "enum": ["system-context", "container", "component", "code", "generic"]
    },
    "parentId": {
      "type": "string",
      "format": "uuid"
    },
    "workspaceId": {
      "type": "string",
      "format": "uuid"
    },
    "nodes": {
      "type": "array",
      "items": { "$ref": "#/definitions/node" }
    },
    "edges": {
      "type": "array",
      "items": { "$ref": "#/definitions/edge" }
    },
    "theme": {
      "type": "string"
    },
    "customCSS": {
      "type": "string",
      "maxLength": 65536
    },
    "layout": {
      "$ref": "#/definitions/layout"
    },
    "metadata": {
      "$ref": "#/definitions/diagramMetadata"
    },
    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "maxItems": 20
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    },
    "updatedAt": {
      "type": "string",
      "format": "date-time"
    }
  },
  "definitions": {
    "node": {
      "type": "object",
      "required": ["id", "position", "data"],
      "properties": {
        "id": { "type": "string" },
        "position": {
          "type": "object",
          "properties": {
            "x": { "type": "number" },
            "y": { "type": "number" }
          }
        },
        "size": {
          "type": "object",
          "properties": {
            "width": { "type": "number", "minimum": 50 },
            "height": { "type": "number", "minimum": 50 }
          }
        },
        "data": {
          "type": "object",
          "required": ["label", "htmlContent"],
          "properties": {
            "label": { "type": "string" },
            "htmlContent": { "type": "string" },
            "icon": { "type": "string" },
            "image": { "type": "string" }
          }
        },
        "style": {
          "type": "object",
          "properties": {
            "backgroundColor": { "type": "string" },
            "borderColor": { "type": "string" },
            "borderWidth": { "type": "number", "minimum": 0 },
            "color": { "type": "string" }
          }
        },
        "className": { "type": "string" },
        "templateId": { "type": "string" },
        "childDiagramId": { "type": "string" }
      }
    },
    "edge": {
      "type": "object",
      "required": ["id", "source", "target"],
      "properties": {
        "id": { "type": "string" },
        "source": { "type": "string" },
        "target": { "type": "string" },
        "label": { "type": "string" },
        "type": {
          "type": "string",
          "enum": ["default", "straight", "step", "smooth"]
        },
        "style": {
          "type": "object",
          "properties": {
            "stroke": { "type": "string" },
            "strokeWidth": { "type": "number", "minimum": 1, "maximum": 20 }
          }
        },
        "animated": { "type": "boolean" }
      }
    },
    "layout": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": ["manual", "hierarchical", "force-directed", "circular"]
        },
        "direction": {
          "type": "string",
          "enum": ["TB", "BT", "LR", "RL"]
        },
        "spacing": {
          "type": "object",
          "properties": {
            "node": { "type": "number", "minimum": 10 },
            "rank": { "type": "number", "minimum": 10 }
          }
        }
      }
    },
    "diagramMetadata": {
      "type": "object",
      "required": ["version", "author"],
      "properties": {
        "version": { "type": "number", "minimum": 1 },
        "author": { "type": "string" },
        "createdAt": { "type": "string", "format": "date-time" },
        "modifiedAt": { "type": "string", "format": "date-time" }
      }
    }
  }
}
```

---

### Example Diagram JSON

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "E-Commerce System Context",
  "description": "High-level view of the e-commerce system",
  "type": "system-context",
  "nodes": [
    {
      "id": "node-1",
      "position": { "x": 250, "y": 100 },
      "data": {
        "label": "E-Commerce System",
        "htmlContent": "<div class=\"system-node\"><h3>E-Commerce System</h3></div>",
        "icon": "server"
      },
      "style": {
        "backgroundColor": "#e3f2fd",
        "borderColor": "#2196f3",
        "borderWidth": 2
      },
      "className": "primary-system"
    },
    {
      "id": "node-2",
      "position": { "x": 100, "y": 300 },
      "data": {
        "label": "User",
        "htmlContent": "<div class=\"actor-node\"><h3>User</h3></div>",
        "icon": "user"
      },
      "style": {
        "backgroundColor": "#fff3e0",
        "borderColor": "#ff9800",
        "borderWidth": 2
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "node-2",
      "target": "node-1",
      "label": "Uses",
      "type": "smooth",
      "style": {
        "stroke": "#666",
        "strokeWidth": 2
      },
      "animated": true
    }
  ],
  "layout": {
    "type": "manual"
  },
  "metadata": {
    "version": 1,
    "author": "user-123",
    "createdAt": "2026-01-25T10:00:00Z",
    "modifiedAt": "2026-01-25T10:00:00Z"
  },
  "tags": ["ecommerce", "c4"],
  "createdAt": "2026-01-25T10:00:00Z",
  "updatedAt": "2026-01-25T10:00:00Z"
}
```

---

## State Management Structure

### Zustand Store Architecture

```typescript
// store/diagramStore.ts
interface DiagramStore {
  // State
  currentDiagram: Diagram | null;
  diagrams: Map<string, Diagram>;
  selectedNodes: string[];
  selectedEdges: string[];

  // Actions
  setCurrentDiagram: (diagram: Diagram) => void;
  addDiagram: (diagram: Diagram) => void;
  updateDiagram: (id: string, updates: Partial<Diagram>) => void;
  deleteDiagram: (id: string) => void;

  // Node actions
  addNode: (node: Node) => void;
  updateNode: (id: string, updates: Partial<Node>) => void;
  deleteNode: (id: string) => void;
  duplicateNode: (id: string) => void;

  // Edge actions
  addEdge: (edge: Edge) => void;
  updateEdge: (id: string, updates: Partial<Edge>) => void;
  deleteEdge: (id: string) => void;

  // Selection
  selectNodes: (nodeIds: string[]) => void;
  selectEdges: (edgeIds: string[]) => void;
  clearSelection: () => void;

  // Clipboard
  clipboard: { nodes: Node[]; edges: Edge[] } | null;
  copySelection: () => void;
  pasteClipboard: () => void;
}

// store/uiStore.ts
interface UIStore {
  // Panel state
  sidebarOpen: boolean;
  rightPanelOpen: boolean;
  rightPanelTab: 'properties' | 'styles' | 'layers' | null;

  // Theme
  theme: 'light' | 'dark';

  // Editor mode
  viewMode: 'visual' | 'code' | 'split';

  // Tree navigation
  expandedNodes: string[];
  selectedTreeNode: string | null;

  // Actions
  toggleSidebar: () => void;
  toggleRightPanel: () => void;
  setRightPanelTab: (tab: 'properties' | 'styles' | 'layers' | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setViewMode: (mode: 'visual' | 'code' | 'split') => void;
}

// store/templateStore.ts
interface TemplateStore {
  templates: Map<string, Template>;
  categories: TemplateCategory[];

  // Actions
  loadTemplates: () => Promise<void>;
  addTemplate: (template: Template) => void;
  updateTemplate: (id: string, updates: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  applyTemplate: (nodeId: string, templateId: string) => void;
}
```

---

### Store Usage Example

```typescript
// Using the diagram store
import { useDiagramStore } from './store/diagramStore';

function DiagramCanvas() {
  const { currentDiagram, addNode, updateNode } = useDiagramStore();

  const handleAddNode = () => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      diagramId: currentDiagram!.id,
      position: { x: 100, y: 100 },
      data: {
        label: 'New Node',
        htmlContent: '<div>New Node</div>',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addNode(newNode);
  };

  return (
    <button onClick={handleAddNode}>Add Node</button>
  );
}
```

---

## API Contracts (Future)

When backend is added in Phase 2+, these REST API endpoints will be available:

### Diagram APIs

```typescript
// GET /api/diagrams - List all diagrams
interface ListDiagramsResponse {
  diagrams: DiagramSummary[];
  total: number;
  page: number;
  pageSize: number;
}

// GET /api/diagrams/:id - Get diagram by ID
interface GetDiagramResponse {
  diagram: Diagram;
}

// POST /api/diagrams - Create new diagram
interface CreateDiagramRequest {
  name: string;
  type: DiagramType;
  description?: string;
}

interface CreateDiagramResponse {
  diagram: Diagram;
}

// PUT /api/diagrams/:id - Update diagram
interface UpdateDiagramRequest {
  name?: string;
  description?: string;
  nodes?: Node[];
  edges?: Edge[];
}

// DELETE /api/diagrams/:id - Delete diagram
interface DeleteDiagramResponse {
  success: boolean;
}

// GET /api/diagrams/:id/version/:version - Get specific version
interface GetVersionResponse {
  diagram: Diagram;
  version: number;
}
```

---

### Template APIs

```typescript
// GET /api/templates - List all templates
interface ListTemplatesResponse {
  templates: Template[];
}

// GET /api/templates/:id - Get template by ID
interface GetTemplateResponse {
  template: Template;
}

// POST /api/templates - Create new template
interface CreateTemplateRequest {
  name: string;
  description?: string;
  data: NodeData;
  style: NodeStyle;
}

interface CreateTemplateResponse {
  template: Template;
}

// PUT /api/templates/:id - Update template
interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  data?: NodeData;
  style?: NodeStyle;
}

// DELETE /api/templates/:id - Delete template
interface DeleteTemplateResponse {
  success: boolean;
}
```

---

### Export/Import APIs

```typescript
// POST /api/diagrams/:id/export/png - Export as PNG
interface ExportPNGRequest {
  options: {
    backgroundColor?: string;
    scale?: number;
    quality?: number;
  };
}

interface ExportPNGResponse {
  url: string;  // URL to download PNG
}

// POST /api/diagrams/:id/export/svg - Export as SVG
interface ExportSVGResponse {
  url: string;  // URL to download SVG
}

// POST /api/diagrams/import - Import from JSON/YAML
interface ImportRequest {
  format: 'json' | 'yaml';
  data: string;
}

interface ImportResponse {
  diagram: Diagram;
  warnings?: string[];
}
```

---

## Summary

This data model specification provides:

1. **Complete TypeScript type definitions** for all entities
2. **JSON schemas** for validation
3. **Clear relationships** between entities
4. **State management structure** using Zustand
5. **Future API contracts** for backend integration

The model is designed to be:
- **Type-safe**: Full TypeScript support
- **Validated**: JSON schemas for data integrity
- **Serializable**: Easy to save/load from JSON
- **Extensible**: Easy to add new properties and features

---

**End of Data Model & API Specification v1.0**
