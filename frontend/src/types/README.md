# Type Definitions

This directory contains comprehensive TypeScript type definitions for the Custom Architecture Platform.

## Overview

All types are fully documented with JSDoc comments and organized by domain:

- **diagram.ts** - Core diagram types (Diagram, DiagramType, LayoutConfig, etc.)
- **node.ts** - Node types (Node, NodeData, NodeStyle, Position, Size, etc.)
- **edge.ts** - Edge/connection types (Edge, EdgeStyle, EdgeRouting, Marker, etc.)
- **template.ts** - Template types (Template, TemplateLibrary, TemplateCategory, etc.)
- **workspace.ts** - Workspace types (Workspace, WorkspaceMember, WorkspaceSettings, etc.)
- **user.ts** - User and authentication types (User, UserSession, AzureADUserInfo, etc.)
- **common.ts** - Shared utility types (ApiResponse, ValidationError, ExportOptions, etc.)
- **index.ts** - Central export point for all types

## Usage

### Importing from Individual Files

```typescript
import { Diagram, DiagramType } from '@/types/diagram';
import { Node, NodeData } from '@/types/node';
import { Edge, EdgeStyle } from '@/types/edge';
```

### Importing from Index (Recommended)

```typescript
import { 
  Diagram, 
  DiagramType, 
  Node, 
  Edge, 
  Template,
  Workspace,
  User 
} from '@/types';
```

### Type Aliases

Convenient aliases are also exported:

```typescript
import { 
  DiagramType as C4Level,
  NodeStyle as CSSStyle,
  EdgeStyle as LineStyle 
} from '@/types';
```

## Type Categories

### 1. Diagram Types

- `Diagram` - Main diagram entity
- `DiagramType` - 'system-context' | 'container' | 'component' | 'code' | 'generic'
- `DiagramMetadata` - Versioning and authorship
- `DiagramStyles` - Visual styling
- `LayoutConfig` - Auto-layout configuration

### 2. Node Types

- `Node` - Visual element in diagram
- `NodeData` - User-defined content
- `NodeStyle` - CSS styling options
- `NodeConstraints` - Size constraints
- `Position` - X, Y coordinates
- `Size` - Width, height
- `Rect` - Position + size

### 3. Edge Types

- `Edge` - Connection between nodes
- `EdgeType` - 'default' | 'straight' | 'step' | 'smoothstep' | 'bezier'
- `EdgeStyle` - Line styling
- `EdgeRouting` - Routing configuration
- `Marker` - Arrowhead markers

### 4. Template Types

- `Template` - Reusable node configuration
- `TemplateLibrary` - Collection of templates
- `TemplateCategory` - 'infrastructure' | 'service' | 'database' | 'external' | 'custom'
- `TemplateData` - Template definition

### 5. Workspace Types

- `Workspace` - Multi-user workspace
- `WorkspaceMember` - Member with role
- `WorkspaceSettings` - Configuration
- `MemberRole` - 'owner' | 'admin' | 'editor' | 'viewer'
- `Permission` - Permission types

### 6. User Types

- `User` - User account
- `UserPreferences` - User settings
- `UserSession` - Authentication state
- `AzureADUserInfo` - Azure AD user info
- `UserRole` - 'admin' | 'user'

### 7. Common Types

- `ApiResponse<T>` - API response wrapper
- `PaginatedResponse<T>` - Paginated data
- `ValidationError` - Validation error
- `ValidationResult` - Validation result
- `ExportFormat` - 'png' | 'svg' | 'json' | 'yaml' | 'pdf'
- `ExportOptions` - Export configuration
- `ImportOptions` - Import configuration

## Compatibility

- **React Flow**: All Node and Edge types are compatible with React Flow
- **TypeScript**: Full TypeScript strict mode support
- **JSDoc**: Comprehensive JSDoc documentation for IDE autocomplete
- **Serialization**: All types are serializable to/from JSON

## Features

- Full type safety with TypeScript
- JSDoc documentation for all types
- Extensible with optional properties
- Compatible with React Flow types
- Proper import/export structure
- No circular dependencies
- Readonly properties where appropriate

## Statistics

- **Total Files**: 8
- **Total Lines**: 1,690
- **Total Types**: 100+
- **Documentation Coverage**: 100%

## Best Practices

1. **Import from index.ts**: Use `import { Type } from '@/types'` for cleaner imports
2. **Use type guards**: Validate data with `isDiagram()`, `isNode()`, etc.
3. **Leverage JSDoc**: Hover over types in IDE to see documentation
4. **Extend carefully**: Use `Partial<Type>` or `Omit<Type, 'prop'>` for extensions
5. **Type assertions**: Use `as Type` sparingly; prefer type guards

## Examples

### Creating a Diagram

```typescript
import { Diagram, DiagramType } from '@/types';

const diagram: Diagram = {
  id: 'diagram-1',
  name: 'System Context',
  type: 'system-context' as DiagramType,
  workspaceId: 'workspace-1',
  nodes: [],
  edges: [],
  metadata: {
    version: 1,
    author: 'user-1',
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString()
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
```

### Creating a Node

```typescript
import { Node, NodeData } from '@/types';

const node: Node = {
  id: 'node-1',
  diagramId: 'diagram-1',
  position: { x: 100, y: 100 },
  data: {
    label: 'Web Server',
    htmlContent: '<div>Web Server</div>',
    icon: 'server'
  },
  style: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    borderWidth: 2
  }
};
```

### API Response

```typescript
import { ApiResponse } from '@/types';
import { Diagram } from '@/types';

const response: ApiResponse<Diagram> = {
  data: diagram,
  status: 200,
  success: true,
  message: 'Diagram created successfully'
};
```

## Version History

- **v1.0** (2026-01-26): Initial type definitions
  - Core diagram types
  - Node and edge types
  - Template system
  - Workspace and user types
  - Common utility types
