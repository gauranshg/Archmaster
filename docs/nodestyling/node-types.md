# Node Types Reference

Complete reference documentation for all node types and their styling properties.

## Table of Contents

- [C4 Model Nodes](#c4-model-nodes)
  - [C4PersonNode](#c4personnode)
  - [C4SoftwareSystemNode](#c4softwaresystemnode)
  - [C4ContainerNode](#c4containernode)
  - [C4ComponentNode](#c4componentnode)
  - [C4DatabaseNode](#c4databasenode)
  - [C4QueueNode](#c4queuenode)
- [Generic Nodes](#generic-nodes)
  - [CustomNode](#customnode)
  - [DatabaseNode](#databasenode)
  - [ServiceNode](#servicenode)

---

## C4 Model Nodes

### C4PersonNode

**Purpose**: Represents a person (actor/role) in C4 model diagrams

**File**: `frontend/src/components/diagram/nodes/C4PersonNode.tsx`

**Styling Properties**:

```typescript
interface C4PersonNodeStyles {
  // Border
  borderWidth: 2px;
  borderStyle: 'solid' | 'dashed';  // dashed for external
  borderRadius: 8px;

  // Colors
  backgroundColor: '#ffffff' | '#f8fafc';  // white for internal, gray for external
  borderColor: '#0891b2' | '#94a3b8';     // cyan for internal, gray for external
  selectedColor: '#3b82f6';             // blue when selected

  // Icon
  iconSize: 24px;
  iconColor: '#0891b2' | '#64748b';
  iconBackground: '#ecfeff' | '#e2e8f0';
  iconShape: 'circle';
  iconSize: 40px;
}
```

**Visual States**:

| State | Background | Border | Icon Color |
|-------|-----------|--------|------------|
| Default | `#ffffff` | `#0891b2` | `#0891b2` |
| Selected | `#eff6ff` | `#3b82f6` | `#0891b2` |
| External | `#f8fafc` | `#94a3b8` (dashed) | `#64748b` |
| External + Selected | `#eff6ff` | `#3b82f6` (dashed) | `#64748b` |

**Features**:
- Person icon (user avatar from Lucide)
- External indicator (orange badge, top-left)
- Drill-down indicator (purple badge, top-right)
- Technology label support
- Full custom HTML via Jinja templates

**Usage Example**:

```typescript
const person: Node = {
  id: 'user-1',
  type: 'c4Person',
  position: { x: 100, y: 100 },
  data: {
    label: 'User',
    description: 'Application user',
    c4Metadata: {
      isExternal: false,
      technology: 'Web Browser'
    }
  }
};
```

---

### C4SoftwareSystemNode

**Purpose**: Represents a software system in C4 model diagrams

**File**: `frontend/src/components/diagram/nodes/C4SoftwareSystemNode.tsx`

**Styling Properties**:

```typescript
interface C4SoftwareSystemNodeStyles {
  // Border
  borderWidth: 2px;
  borderStyle: 'solid' | 'dashed';
  borderRadius: 8px;

  // Colors
  backgroundColor: '#ffffff' | '#f8fafc';
  borderColor: '#1d4ed8' | '#94a3b8';  // dark blue for internal
  selectedColor: '#3b82f6';

  // Icon
  iconSize: 26px;
  iconColor: '#1d4ed8' | '#64748b';
  iconBackground: '#dbeafe' | '#e2e8f0';
  iconShape: 'rounded-square';
  iconSize: 44px;
}
```

**Visual States**:

| State | Background | Border | Icon Color |
|-------|-----------|--------|------------|
| Default | `#ffffff` | `#1d4ed8` | `#1d4ed8` |
| Selected | `#eff6ff` | `#3b82f6` | `#1d4ed8` |
| External | `#f8fafc` | `#94a3b8` (dashed) | `#64748b` |

**Features**:
- Server icon (from Lucide)
- Technology label (italic, displayed below label)
- External indicator
- Drill-down indicator
- Full custom HTML support

**Usage Example**:

```typescript
const system: Node = {
  id: 'system-1',
  type: 'c4SoftwareSystem',
  position: { x: 100, y: 100 },
  data: {
    label: 'Web Application',
    description: 'Main web application',
    c4Metadata: {
      isExternal: false,
      technology: 'React'
    }
  }
};
```

---

### C4ContainerNode

**Purpose**: Represents a container (application, data store, microservice) in C4 model diagrams

**File**: `frontend/src/components/diagram/nodes/C4ContainerNode.tsx`

**Styling Properties**:

```typescript
interface C4ContainerNodeStyles {
  // Border
  borderWidth: 2px;
  borderStyle: 'solid' | 'dashed';
  borderRadius: 8px;

  // Colors
  backgroundColor: '#ffffff' | '#f8fafc';
  borderColor: '#059669' | '#94a3b8';  // green for internal
  selectedColor: '#3b82f6';

  // Icon
  icon: '📦' | '💾';  // Box or Database
  iconSize: 28px;
}
```

**Visual States**:

| State | Background | Border | Icon |
|-------|-----------|--------|------|
| Default (Container) | `#ffffff` | `#059669` | 📦 |
| Database Variant | `#ffffff` | `#ca8a04` | 💾 |
| External | `#f8fafc` | `#94a3b8` (dashed) | 📦 |

**Features**:
- Dual mode: Container (📦) or Database (💾)
- Technology badge display
- Prominent technology text
- External indicator
- Drill-down indicator

**Special Variants**:

```typescript
// Regular container
const container: Node = {
  type: 'c4Container',
  data: {
    label: 'Web Application',
    c4Metadata: {
      isDatabase: false,
      technology: 'React'
    }
  }
};

// Database container
const databaseContainer: Node = {
  type: 'c4Container',
  data: {
    label: 'Database',
    c4Metadata: {
      isDatabase: true,
      technology: 'PostgreSQL'
    }
  }
};
```

---

### C4ComponentNode

**Purpose**: Represents a component in C4 model diagrams

**File**: `frontend/src/components/diagram/nodes/C4ComponentNode.tsx`

**Styling Properties**:

```typescript
interface C4ComponentNodeStyles {
  // Border
  borderWidth: 2px;
  borderStyle: 'solid';
  borderRadius: 8px;  // Slightly smaller radius

  // Colors
  backgroundColor: '#ffffff';
  borderColor: '#7c3aed';  // purple
  selectedColor: '#3b82f6';

  // Icon
  iconSize: 26px;
  iconColor: '#7c3aed';
  iconBackground: 'transparent';  // No background circle
  iconShape: 'none';
}
```

**Visual States**:

| State | Background | Border | Icon Color |
|-------|-----------|--------|------------|
| Default | `#ffffff` | `#7c3aed` | `#7c3aed` |
| Selected | `#eff6ff` | `#3b82f6` | `#7c3aed` |

**Features**:
- Package icon (from Lucide)
- Technology label
- Responsibilities field support
- Simplified styling (no external state)
- Full custom HTML support

**Usage Example**:

```typescript
const component: Node = {
  id: 'component-1',
  type: 'c4Component',
  position: { x: 100, y: 100 },
  data: {
    label: 'API Controller',
    description: 'REST API endpoints',
    c4Metadata: {
      technology: 'Express.js',
      responsibilities: [
        'Handle HTTP requests',
        'Validate input',
        'Return responses'
      ]
    }
  }
};
```

---

### C4DatabaseNode

**Purpose**: Represents a database in C4 model diagrams

**File**: `frontend/src/components/diagram/nodes/C4DatabaseNode.tsx`

**Styling Properties**:

```typescript
interface C4DatabaseNodeStyles {
  // Border
  borderWidth: 2px;
  borderStyle: 'solid' | 'dashed';
  borderRadius: 8px;

  // Colors
  backgroundColor: '#ffffff' | '#fefce8';
  borderColor: '#ca8a04' | '#94a3b8';  // yellow/gold
  selectedColor: '#3b82f6';

  // Icon
  icon: '🗄️';
  iconSize: 32px;  // Larger icon
}
```

**Visual States**:

| State | Background | Border | Icon Size |
|-------|-----------|--------|-----------|
| Default | `#ffffff` | `#ca8a04` | 32px |
| Selected | `#eff6ff` | `#3b82f6` | 32px |
| External | `#fefce8` | `#94a3b8` (dashed) | 32px |

**Features**:
- Database emoji icon (🗄️)
- Database type display
- Technology label
- Properties display (databaseType, technology)
- External indicator
- Drill-down indicator

**Usage Example**:

```typescript
const database: Node = {
  id: 'db-1',
  type: 'c4Database',
  position: { x: 100, y: 100 },
  data: {
    label: 'Primary Database',
    description: 'Main application database',
    properties: {
      databaseType: 'PostgreSQL',
      version: '14.2'
    },
    c4Metadata: {
      technology: 'PostgreSQL 14.2'
    }
  }
};
```

---

### C4QueueNode

**Purpose**: Represents a message queue or event stream in C4 model diagrams

**File**: `frontend/src/components/diagram/nodes/C4QueueNode.tsx`

**Styling Properties**:

```typescript
interface C4QueueNodeStyles {
  // Border
  borderWidth: 2px;
  borderStyle: 'solid' | 'dashed';
  borderRadius: 8px;

  // Colors
  backgroundColor: '#ffffff';
  borderColor: '#f5a623';  // orange
  selectedColor: '#3b82f6';

  // Icon
  icon: '📬' | MessageSquare;
  iconSize: 28px;
  iconColor: '#f5a623';
}
```

**Visual States**:

| State | Background | Border | Icon Color |
|-------|-----------|--------|------------|
| Default | `#ffffff` | `#f5a623` | `#f5a623` |
| Selected | `#eff6ff` | `#3b82f6` | `#f5a623` |
| External | `#f8fafc` | `#94a3b8` (dashed) | `#64748b` |

**Features**:
- Message queue icon (📬 or MessageSquare)
- Technology/protocol display
- External indicator
- Drill-down indicator
- Full custom HTML support

**Usage Example**:

```typescript
const queue: Node = {
  id: 'queue-1',
  type: 'c4Queue',
  position: { x: 100, y: 100 },
  data: {
    label: 'Event Bus',
    description: 'Message queue for events',
    c4Metadata: {
      technology: 'Kafka',
      isExternal: false
    }
  }
};
```

---

## Generic Nodes

### CustomNode

**Purpose**: Generic custom node with full HTML/CSS support

**File**: `frontend/src/components/diagram/nodes/CustomNode.tsx`

**Styling Properties**:

```typescript
interface CustomNodeStyles {
  // Border
  borderWidth: 1px | 2px;  // 2px when selected
  borderStyle: 'solid';
  borderRadius: 12px;  // More rounded

  // Colors
  backgroundColor: '#ffffff';
  borderColor: '#e5e7eb' | '#3b82f6';  // gray by default, blue when selected
  selectedColor: '#3b82f6';

  // Spacing
  padding: 14px;
  minWidth: 140px;
  minHeight: 70px;
}
```

**Visual States**:

| State | Background | Border | Box Shadow |
|-------|-----------|--------|------------|
| Default | `#ffffff` | `#e5e7eb` (1px) | `0 2px 8px rgba(0,0,0,0.08)` |
| Selected | `#ffffff` | `#3b82f6` (2px) | `0 0 0 4px rgba(59,130,246,0.1)` |

**Features**:
- Fully customizable via Jinja templates
- CSS class and ID support
- Icon support (emoji)
- Image support
- Drill-down indicator (purple #8b5cf6)
- Maximum flexibility

**Usage Example**:

```typescript
const custom: Node = {
  id: 'custom-1',
  type: 'custom',
  position: { x: 100, y: 100 },
  data: {
    label: 'Custom Node',
    description: 'Fully customizable',
    icon: '⭐',
    cssClass: 'special-node highlighted',
    cssId: 'my-custom-node',
    jinjaTemplate: `
      <div class="custom-card">
        <div class="icon">{{ icon }}</div>
        <h3>{{ label }}</h3>
        <p>{{ description }}</p>
      </div>
    `
  },
  style: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    borderRadius: 16,
    padding: 20
  }
};
```

---

### DatabaseNode

**Purpose**: Generic database node (non-C4 specific)

**File**: `frontend/src/components/diagram/nodes/DatabaseNode.tsx`

**Styling Properties**:

```typescript
interface DatabaseNodeStyles {
  // Border
  borderWidth: 2px;
  borderStyle: 'solid';
  borderRadius: 12px;

  // Colors
  backgroundColor: '#ffffff' | '#eff6ff';
  borderColor: '#10b981';  // green
  selectedColor: '#3b82f6';

  // Icon
  icon: '🗄️';
  iconSize: 32px;
}
```

**Visual States**:

| State | Background | Border |
|-------|-----------|--------|
| Default | `#ffffff` | `#10b981` |
| Selected | `#eff6ff` | `#3b82f6` |

**Features**:
- Database emoji icon (🗄️)
- Service type badge (rest, graphql, grpc, websocket, microservice)
- Database type support (relational, document, key-value, graph, time-series)
- Description display
- Drill-down indicator

**Usage Example**:

```typescript
const database: Node = {
  id: 'db-1',
  type: 'database',
  position: { x: 100, y: 100 },
  data: {
    label: 'User Database',
    description: 'PostgreSQL database',
    databaseType: 'relational',
    properties: {
      host: 'localhost',
      port: 5432,
      database: 'users'
    }
  }
};
```

---

### ServiceNode

**Purpose**: Generic service/microservice node

**File**: `frontend/src/components/diagram/nodes/ServiceNode.tsx`

**Styling Properties**:

```typescript
interface ServiceNodeStyles {
  // Border
  borderWidth: 2px;
  borderStyle: 'solid';
  borderRadius: 12px;

  // Colors
  backgroundColor: '#ffffff';
  borderColor: '#10b981';  // green
  selectedColor: '#3b82f6';

  // Icon
  icon: '⚙️';
  iconSize: 32px;
}
```

**Visual States**:

| State | Background | Border |
|-------|-----------|--------|
| Default | `#ffffff` | `#10b981` |
| Selected | `#eff6ff` | `#3b82f6` |

**Features**:
- Gear icon (⚙️)
- Service type badge (uppercase, pill-shaped)
- Service types: rest, graphql, grpc, websocket, microservice
- Green color scheme
- Description support
- Drill-down indicator

**Usage Example**:

```typescript
const service: Node = {
  id: 'service-1',
  type: 'service',
  position: { x: 100, y: 100 },
  data: {
    label: 'Auth Service',
    description: 'Authentication and authorization',
    serviceType: 'rest',
    properties: {
      version: 'v2.0',
      port: 8080
    }
  }
};
```

---

## Common Features

### External Indicator

All C4 nodes support an external state indicator:

```typescript
data: {
  c4Metadata: {
    isExternal: true  // Shows orange badge in top-left
  }
}
```

**Styling**:
- Size: 16px × 16px
- Shape: Circle
- Background: `#f59e0b` (orange)
- Border: `2px solid #ffffff`
- Position: Top-left corner (-6px, -6px)

### Drill-Down Indicator

All nodes support child diagram navigation:

```typescript
data: {
  childDiagramId: 'diagram-abc123'  // Shows purple badge in top-right
}
```

**Styling**:
- Size: 24px × 24px
- Shape: Circle
- Background: `#8b5cf6` (purple)
- Border: `2px solid #ffffff`
- Icon: ArrowDownRight (14px)
- Position: Top-right corner (-8px, -8px)
- Action: Double-click to navigate

### Connection Handles

All nodes have 4 connection points:

```typescript
// Positions
- Top (target, input)
- Bottom (source, output)
- Left (target, id='left')
- Right (source, id='right')
```

**Handle Styling**:
- Size: 10-12px × 10-12px
- Shape: Circle
- Color: Varies by node type
- Border: 2-3px solid #ffffff
- Shadow: `0 2px 4px rgba(0,0,0,0.1)`
- Hover: Scale up to 125%

### Selection State

All nodes show selection state:

```typescript
// Visual changes when selected
- Border width: Increases to 2px
- Border color: Changes to #3b82f6 (blue)
- Box shadow: `0 0 0 4px rgba(59,130,246,0.1)`
- Background: May lighten (#eff6ff)
```

## Color Reference Chart

### C4 Node Colors

| Node Type | Primary | Hex | RGB |
|-----------|---------|-----|-----|
| Person | Cyan | `#0891b2` | rgb(8, 145, 178) |
| Software System | Blue | `#1d4ed8` | rgb(29, 237, 216) |
| Container | Green | `#059669` | rgb(5, 150, 105) |
| Component | Purple | `#7c3aed` | rgb(124, 58, 237) |
| Database | Yellow | `#ca8a04` | rgb(202, 138, 4) |
| Queue | Orange | `#f5a623` | rgb(245, 166, 35) |

### State Colors

| State | Hex | RGB | Usage |
|-------|-----|-----|------|
| Selected | `#3b82f6` | rgb(59, 130, 246) | All node types when selected |
| External | `#94a3b8` | rgb(148, 163, 184) | External elements |
| External Indicator | `#f59e0b` | rgb(245, 158, 11) | External badge |
| Drill-Down | `#8b5cf6` | rgb(139, 92, 246) | Child diagram indicator |

## Type Registration

All node types are registered in `nodeTypes.ts`:

```typescript
export const NODE_TYPES = {
  custom: CustomNode,
  c4Person: C4PersonNode,
  c4SoftwareSystem: C4SoftwareSystemNode,
  c4Container: C4ContainerNode,
  c4Component: C4ComponentNode,
  c4Database: C4DatabaseNode,
  c4Queue: C4QueueNode,
  database: DatabaseNode,
  service: ServiceNode,
} as const;
```

This provides:
- Stable references (prevents React Flow warnings)
- Type safety
- Easy extensibility for custom node types

## Creating Custom Node Types

To create a custom node type:

1. **Create the component**:

```typescript
// MyCustomNode.tsx
import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import type { NodeData } from '@/types';

interface MyCustomNodeData extends NodeData {
  customProp?: string;
}

const MyCustomNode = memo(({ id, data, selected }: NodeProps<MyCustomNodeData>) => {
  return (
    <div style={{
      border: '2px solid #ec4899',
      borderRadius: '12px',
      padding: '16px',
      background: selected ? '#fdf2f8' : '#ffffff'
    }}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <div>{data.label}</div>
    </div>
  );
});

export default MyCustomNode;
```

2. **Register in nodeTypes.ts**:

```typescript
import MyCustomNode from './MyCustomNode';

export const NODE_TYPES = {
  // ... existing types
  myCustom: MyCustomNode,
} as const;
```

3. **Use in diagrams**:

```typescript
const node: Node = {
  id: 'custom-1',
  type: 'myCustom',  // Matches registered type
  position: { x: 100, y: 100 },
  data: {
    label: 'My Custom Node',
    customProp: 'value'
  }
};
```

## Performance Notes

### Rendering Performance

Each node type is optimized with:

```typescript
const NodeComponent = memo(({ data, selected }) => {
  // useMemo for expensive computations
  const sanitizedHtml = useMemo(() => {
    return DOMPurify.sanitize(data.htmlContent);
  }, [data.htmlContent]);

  const nodeClasses = useMemo(() => {
    return ['node-class', selected && 'selected'].filter(Boolean).join(' ');
  }, [selected]);

  return <div>{/* rendering */}</div>;
});
```

### Best Practices

1. **Use memo**: Prevents unnecessary re-renders
2. ** useMemo for computed values**: Caches expensive operations
3. **Avoid inline functions**: Create stable references
4. **Batch style updates**: Use React Flow's built-in APIs
5. **Optimize template complexity**: Break large templates into smaller parts

## See Also

- [CSS System](./css-system.md) - CSS service and security
- [Themes](./themes.md) - Theme system
- [Custom Styling](./custom-styling.md) - Advanced techniques
