# C4 Node Components - Implementation Summary

## Overview

Created 6 new C4-specific node components that follow the official C4 notation for architecture diagrams. Each component is fully self-contained with proper styling, icons, and support for C4 metadata.

## Files Created/Modified

### New C4 Node Components

| File | Description |
|------|-------------|
| `frontend/src/components/diagram/nodes/C4PersonNode.tsx` | Person/actor node with User icon |
| `frontend/src/components/diagram/nodes/C4SoftwareSystemNode.tsx` | Software system node with Server icon |
| `frontend/src/components/diagram/nodes/C4ContainerNode.tsx` | Container node (apps/data stores) with Box/Database icon |
| `frontend/src/components/diagram/nodes/C4ComponentNode.tsx` | Component node with Package icon |
| `frontend/src/components/diagram/nodes/C4DatabaseNode.tsx` | Database node with cylinder SVG shape |
| `frontend/src/components/diagram/nodes/C4QueueNode.tsx` | Queue/messaging node with MessageSquare icon |

### Modified Files

| File | Changes |
|------|---------|
| `frontend/src/components/diagram/nodes/index.ts` | Added exports for all new C4 nodes |
| `frontend/src/components/diagram/Canvas.tsx` | Registered new node types in `nodeTypes` object |
| `frontend/src/components/diagram/index.ts` | Added re-exports for C4 nodes |

## Node Types Registered in Canvas

```typescript
const nodeTypes = {
  // Generic node types
  custom: CustomNode,
  database: DatabaseNode,
  service: ServiceNode,

  // C4 Model node types
  c4Person: C4PersonNode,
  c4System: C4SoftwareSystemNode,
  c4Container: C4ContainerNode,
  c4Component: C4ComponentNode,
  c4Database: C4DatabaseNode,
  c4Queue: C4QueueNode,

  // Legacy aliases (for backward compatibility)
  C4PersonNode: C4PersonNode,
  C4SystemNode: C4SoftwareSystemNode,
};
```

## C4 Notation Features

### Visual Rules Implemented

1. **Person Node** (`c4Person`)
   - User icon from Lucide React
   - Cyan color scheme (`#0891b2`)
   - Dashed border for external elements
   - Shows technology label if provided

2. **Software System Node** (`c4System`)
   - Server icon from Lucide React
   - Blue color scheme (`#1d4ed8`)
   - Dashed border for external systems
   - Shows technology label if provided

3. **Container Node** (`c4Container`)
   - Box icon (default) or Database icon (if `isDatabase: true`)
   - Green color scheme (`#059669`) or Yellow (`#ca8a04`) for databases
   - Supports external elements with dashed border
   - Prominently displays technology label

4. **Component Node** (`c4Component`)
   - Package icon from Lucide React
   - Purple color scheme (`#7c3aed`)
   - Simpler representation
   - Shows up to 2 responsibilities

5. **Database Node** (`c4Database`)
   - Custom SVG cylinder shape
   - Yellow/amber color scheme (`#ca8a04`)
   - Dashed border for external databases
   - Prominently displays technology label

6. **Queue Node** (`c4Queue`)
   - MessageSquare icon with queue indicator dots
   - Red color scheme (`#dc2626`)
   - Dashed border for external queues
   - Shows technology/protocol

### Common Features

All C4 nodes include:

- **C4 Metadata Support**: Accept `c4Metadata?: C4ElementMetadata` prop
- **External Element Indicator**: Orange badge in top-left corner when `isExternal: true`
- **Drill-down Indicator**: Purple badge in top-right corner when `childDiagramId` is present
- **HTML Sanitization**: Uses DOMPurify for safe HTML content rendering
- **Connection Handles**: Top, bottom, left, and right handles for edges
- **Selection Styling**: Blue border and glow when selected
- **Tooltips**: Shows description on hover
- **Technology Labels**: Displays technology info when provided
- **Responsive Design**: Proper min-width and min-height for layout

## Usage Examples

### Creating a C4 Person Node

```typescript
const personNode: Node = {
  id: 'user-1',
  type: 'c4Person',
  position: { x: 100, y: 100 },
  data: {
    label: 'User',
    description: 'Application user',
    c4Metadata: {
      elementType: C4ElementType.Person,
      description: 'Primary user of the system',
    },
  },
};
```

### Creating an External Software System

```typescript
const externalSystem: Node = {
  id: 'ext-system-1',
  type: 'c4System',
  position: { x: 300, y: 100 },
  data: {
    label: 'External Payment System',
    description: 'Third-party payment processing',
    c4Metadata: {
      elementType: C4ElementType.SoftwareSystem,
      isExternal: true,
      technology: 'REST API',
    },
  },
};
```

### Creating a Database Container

```typescript
const databaseContainer: Node = {
  id: 'db-1',
  type: 'c4Container',
  position: { x: 500, y: 100 },
  data: {
    label: 'Primary Database',
    description: 'Main application database',
    c4Metadata: {
      elementType: C4ElementType.Container,
      isDatabase: true,
      technology: 'PostgreSQL 15',
      description: 'Stores all application data',
    },
  },
};
```

### Creating a Component with Responsibilities

```typescript
const component: Node = {
  id: 'component-1',
  type: 'c4Component',
  position: { x: 100, y: 300 },
  data: {
    label: 'API Controller',
    c4Metadata: {
      elementType: C4ElementType.Component,
      technology: 'TypeScript',
      description: 'Handles HTTP requests',
      responsibilities: [
        'Validate incoming requests',
        'Route to appropriate service',
        'Return responses',
      ],
    },
  },
};
```

### Creating a Message Queue

```typescript
const queue: Node = {
  id: 'queue-1',
  type: 'c4Queue',
  position: { x: 300, y: 300 },
  data: {
    label: 'Event Bus',
    description: 'Async event processing',
    c4Metadata: {
      elementType: C4ElementType.Queue,
      isQueue: true,
      technology: 'Kafka',
      description: 'Handles asynchronous events',
    },
  },
};
```

## Color Scheme Reference

| Element Type | Primary Color | Background | Border |
|--------------|---------------|------------|--------|
| Person | `#0891b2` (cyan) | `#ecfeff` | `#0891b2` |
| Software System | `#1d4ed8` (blue) | `#dbeafe` | `#1d4ed8` |
| Container | `#059669` (green) | `#d1fae5` | `#059669` |
| Component | `#7c3aed` (purple) | `#ede9fe` | `#7c3aed` |
| Database | `#ca8a04` (amber) | `#fefce8` | `#ca8a04` |
| Queue | `#dc2626` (red) | `#fef2f2` | `#dc2626` |
| External (any) | Gray tones | `#f8fafc` | `#94a3b8` |

## Next Steps

1. **C4 Templates**: Create default templates using these new node types
2. **C4 Presets Gallery**: Build UI for selecting C4 diagram presets
3. **Edge Styling**: Implement C4 relationship-specific edge styles
4. **Export**: Ensure PNG/SVG export works with C4 nodes
5. **Testing**: Create visual tests for each node type

## Reference

- C4 Model: https://c4model.com/
- C4 Element Types: Defined in `frontend/src/types/c4.ts`
- Node Components: `frontend/src/components/diagram/nodes/`
