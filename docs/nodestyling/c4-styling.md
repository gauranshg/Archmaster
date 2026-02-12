# C4 Model Styling Guide

Complete guide to styling C4 model nodes according to the official C4 notation.

## Table of Contents

- [C4 Notation Basics](#c4-notation-basics)
- [Element Types](#element-types)
- [Styling Rules](#styling-rules)
- [Color Palette](#color-palette)
- [Best Practices](#best-practices)

---

## C4 Notation Basics

### What is C4?

C4 Model is a lightweight approach to creating software architecture diagrams that emphasizes:
- **Context**: System context, containers, components
- **Encapsulation**: Clear boundaries between elements
- **Communication**: How elements interact
- **Technology**: What technology is used

### C4 Diagram Hierarchy

```
System Context Diagram
├── Software Systems
│   ├── Container Diagram
│   │   ├── Components
│   │   └── Databases
│   └── Deployment Diagram
```

Each level uses specific notation and styling.

---

## Element Types

### 1. Person (Actor)

**Symbol**: Stick figure icon

**Styling**:
- **Border**: 2px solid #0891b2 (cyan)
- **Background**: White (#ffffff) or light gray (#f8fafc for external)
- **Shape**: Rounded rectangle (8px border-radius)
- **Icon**: Person icon (40px circle with user avatar)
- **External**: Dashed border, gray color scheme

**Usage**:

```typescript
const person: Node = {
  type: 'c4Person',
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

**Template Example**:

```jinja
<div class="c4-person" style="
  padding: 12px;
  text-align: center;
  border: 2px solid {% if isExternal %}#94a3b8{% else %}#0891b2{% endif %};
  border-style: {% if isExternal %}dashed{% else %}solid{% endif %};
  border-radius: 8px;
  background: {% if isExternal %}#f8fafc{% else %}#ffffff{% endif %};
">
  <!-- Icon -->
  <div style="
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: {% if isExternal %}#e2e8f0{% else %}#ecfeff{% endif %};
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 8px;
    color: {% if isExternal %}#64748b{% else %}#0891b2{% endif %};
  ">
    {{ icon or '👤' }}
  </div>

  <!-- Label -->
  <div style="
    font-weight: 600;
    font-size: 13px;
    color: #1e293b;
  ">
    {{ label }}
  </div>

  <!-- Technology -->
  {% if technology %}
  <div style="
    font-size: 11px;
    color: #64748b;
    font-style: italic;
    margin-top: 4px;
  ">
    [{{ technology }}]
  </div>
  {% endif %}
</div>
```

### 2. Software System

**Symbol**: Box/Server icon

**Styling**:
- **Border**: 2px solid #1d4ed8 (dark blue)
- **Background**: White (#ffffff)
- **Shape**: Rounded rectangle (8px border-radius)
- **Icon**: Server icon (44px rounded square)
- **External**: Dashed border, gray color scheme

**Usage**:

```typescript
const system: Node = {
  type: 'c4SoftwareSystem',
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

### 3. Container

**Symbol**: Box icon (or database icon for databases)

**Styling**:
- **Border**: 2px solid #059669 (green)
- **Background**: White (#ffffff)
- **Shape**: Rounded rectangle (8px border-radius)
- **Icon**: 28px box or database emoji
- **Database variant**: Yellow border (#ca8a04)

**Usage**:

```typescript
const container: Node = {
  type: 'c4Container',
  data: {
    label: 'Web Application',
    description: 'Single page application',
    c4Metadata: {
      isDatabase: false,
      technology: 'React'
    }
  }
};
```

### 4. Component

**Symbol**: Package icon

**Styling**:
- **Border**: 2px solid #7c3aed (purple)
- **Background**: White (#ffffff)
- **Shape**: Rounded rectangle (8px border-radius)
- **Icon**: Package icon (no background circle)

**Usage**:

```typescript
const component: Node = {
  type: 'c4Component',
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

### 5. Database

**Symbol**: Database emoji (🗄️)

**Styling**:
- **Border**: 2px solid #ca8a04 (yellow/gold)
- **Background**: White (#ffffff) or light yellow (#fefce8)
- **Shape**: Rounded rectangle (8px border-radius)
- **Icon**: 32px database emoji

**Usage**:

```typescript
const database: Node = {
  type: 'c4Database',
  data: {
    label: 'Users Database',
    description: 'PostgreSQL database',
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

### 6. Queue

**Symbol**: Message queue icon (📬)

**Styling**:
- **Border**: 2px solid #f5a623 (orange)
- **Background**: White (#ffffff)
- **Shape**: Rounded rectangle (8px border-radius)
- **Icon**: 28px queue emoji or MessageSquare icon

**Usage**:

```typescript
const queue: Node = {
  type: 'c4Queue',
  data: {
    label: 'Event Bus',
    description: 'Message queue for events',
    c4Metadata: {
      technology: 'Kafka'
    }
  }
};
```

---

## Styling Rules

### Rule 1: External vs Internal

**Internal Elements**:
- Solid border
- Full color
- White or light background

**External Elements**:
- **Dashed border** (key identifier!)
- Gray color scheme (#94a3b8)
- Light gray background (#f8fafc)
- External indicator badge (orange circle, top-left)

**Implementation**:

```typescript
interface C4Metadata {
  isExternal: boolean;  // Controls styling
}
```

```jinja
<!-- C4 Person template with external support -->
<div class="c4-person" style="
  border: 2px {% if isExternal %}dashed{% endif %} {{ borderColor }};
  background: {{ backgroundColor }};
  border-radius: 8px;
">
  {% if isExternal %}
  <div class="external-badge" style="
    position: absolute;
    top: -6px;
    left: -6px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #f59e0b;
    border: 2px solid #ffffff;
  "></div>
  {% endif %}
  <!-- Content -->
</div>
```

### Rule 2: Technology Display

Technology should be displayed:
- **Below label** (not above)
- **Italic font**
- **In brackets**: `[technology]`
- **Smaller font**: 10-11px
- **Gray color**: #64748b

**Example**:

```jinja
<div class="c4-element">
  <h3>{{ label }}</h3>
  {% if technology %}
  <div style="
    font-size: 11px;
    color: #64748b;
    font-style: italic;
    margin-top: 4px;
  ">
    [{{ technology }}]
  </div>
  {% endif %}
</div>
```

### Rule 3: Hierarchy Levels

Different diagram levels use different styling:

| Level | Diagram Type | Border Width | Icon Size |
|-------|-------------|--------------|-----------|
| Level 1 | System Context | 2px | 40-44px |
| Level 2 | Container | 2px | 28-32px |
| Level 3 | Component | 2px | 26px |

**Implementation**:

```typescript
// Adjust sizes based on diagram type
function getIconSize(diagramType: string): number {
  switch (diagramType) {
    case 'system-context': return 44;
    case 'container': return 32;
    case 'component': return 26;
    default: return 28;
  }
}
```

### Rule 4: Descriptions

- **Show on hover**: Use title attribute
- **Or display below label**: If important
- **Style**: Smaller, muted color
- **Maximum length**: ~100 characters (truncate with …)

**Example**:

```jinja
<div title="{{ description }}">
  <h3>{{ label }}</h3>
  {% if description %}
  <p style="
    font-size: 11px;
    color: #64748b;
    margin: 4px 0 0 0;
  ">
    {{ description | truncate(80) }}
  </p>
  {% endif %}
</div>
```

---

## Color Palette

### Official C4 Colors

| Element Type | Internal | External | Selected |
|-------------|----------|----------|----------|
| Person | `#0891b2` | `#94a3b8` | `#3b82f6` |
| Software System | `#1d4ed8` | `#94a3b8` | `#3b82f6` |
| Container | `#059669` | `#94a3b8` | `#3b82f6` |
| Component | ``#7c3aed` | N/A | `#3b82f6` |
| Database | `#ca8a04` | `#94a3b8` | `#3b82f6` |
| Queue | `#f5a623` | `#94a3b8` | `#3b82f6` |

### Semantic Colors

```css
/* C4-specific colors */
--c4-person: #0891b2;
--c4-software-system: #1d4ed8;
--c4-container: #059669;
--c4-component: #7c3aed;
--c4-database: #ca8a04;
--c4-queue: #f5a623;

/* States */
--c4-external: #94a3b8;
--c4-selected: #3b82f6;
--c4-external-badge: #f59e0b;
```

---

## Best Practices

### 1. Follow Official C4 Notation

```typescript
// GOOD - Follows C4 notation
const c4Node: Node = {
  type: 'c4Person',
  data: {
    label: 'User',
    c4Metadata: {
      isExternal: false,
      location: 'United States'
    }
  }
};

// BAD - Violates C4 notation
const nonC4Node: Node = {
  type: 'custom',
  data: {
    label: 'User',
    icon: '👤'
    // Missing c4Metadata
  }
};
```

### 2. Use Consistent Icon Sizing

```typescript
// Icon sizes by hierarchy level
const ICON_SIZES = {
  'system-context': 44,
  'container': 32,
  'component': 26
};

// Apply in template
const iconSize = ICON_SIZES[diagramType] || 28;
```

### 3. Maintain Visual Hierarchy

```jinja
<!-- Level 1: System Context (largest) -->
<div style="font-size: 14px;">
  {{ label }}
</div>

<!-- Level 2: Container -->
<div style="font-size: 13px;">
  {{ label }}
</div>

<!-- Level 3: Component (smallest) -->
<div style="font-size: 13px;">
  {{ label }}
</div>
```

### 4. Keep It Simple

```jinja
<!-- GOOD: Simple, clear -->
<div class="c4-person" style="
  border: 2px solid #0891b2;
  padding: 12px;
  text-align: center;
  border-radius: 8px;
">
  {{ label }}
</div>

<!-- BAD: Over-styled -->
<div class="c4-person" style="
  border: 2px solid #0891b2;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  background: linear-gradient(...);
  transform: perspective(500px) rotateX(5deg);
  ...
">
  {{ label }}
</div>
```

---

## C4 Diagram Type Examples

### System Context Diagram

```typescript
const systemContextDiagram: Diagram = {
  type: 'system-context',
  nodes: [
    {
      id: 'user',
      type: 'c4Person',
      position: { x: 100, y: 100 },
      data: {
        label: 'User',
        c4Metadata: { isExternal: true }
      }
    },
    {
      id: 'web-app',
      type: 'c4SoftwareSystem',
      position: { x: 300, y: 100 },
      data: {
        label: 'Web Application',
        description: 'React SPA',
        c4Metadata: { isExternal: false }
      }
    },
    {
      id: 'database',
      type: 'c4Database',
      position: { x: 500, y: 100 },
      data: {
        label: 'Database',
        c4Metadata: {
          isExternal: false,
          technology: 'PostgreSQL'
        }
      }
    }
  ],
  edges: [
    {
      id: 'e1',
      source: 'user',
      target: 'web-app',
      label: 'Uses'
    },
    {
      id: 'e2',
      source: 'web-app',
      target: 'database',
      label: 'Reads/Writes'
    }
  ]
};
```

### Container Diagram

```typescript
const containerDiagram: Diagram = {
  type: 'container',
  nodes: [
    {
      id: 'spa',
      type: 'c4Container',
      position: { x: 100, y: 100 },
      data: {
        label: 'Web Application',
        description: 'React SPA',
        c4Metadata: {
          isDatabase: false,
          technology: 'React'
        }
      }
    },
    {
      id: 'api',
      type: 'c4Container',
      position: { x: 350, y: 100 },
      data: {
        label: 'API Application',
        description: 'REST API',
        c4Metadata: {
          technology: 'Express.js'
        }
      }
    },
    {
      id: 'db',
      type: 'c4Database',
      position: { x: 600, y: 100 },
      data: {
        label: 'Database',
        c4Metadata: {
          technology: 'PostgreSQL'
        }
      }
    }
  ]
};
```

### Component Diagram

```typescript
const componentDiagram: Diagram = {
  type: 'component',
  nodes: [
    {
      id: 'controller',
      type: 'c4Component',
      position: { x: 100, y: 100 },
      data: {
        label: 'API Controller',
        c4Metadata: {
          technology: 'Express.js',
          responsibilities: [
            'Handle HTTP requests',
            'Route requests'
          ]
        }
      }
    },
    {
      id: 'service',
      type: 'c4Component',
      position: { x: 350, y: 100 },
      data: {
        label: 'Service',
        c4Metadata: {
          technology: 'TypeScript'
        }
      }
    },
    {
      id: 'repository',
      type: 'c4Component',
      position: { x: 600, y: 100 },
      data: {
        label: 'Repository',
        c4Metadata: {
          technology: 'TypeScript'
        }
      }
    }
  ]
};
```

---

## C4 Presets

The platform includes pre-built C4 presets:

**File**: `frontend/src/services/c4/presets.ts`

### Available Presets

```typescript
const C4_PRESETS = [
  {
    id: 'c4-person-internal',
    name: 'C4 Person (Internal)',
    type: 'c4Person',
    data: {
      label: 'Person',
      c4Metadata: { isExternal: false }
    },
    style: {
      borderColor: '#0891b2',
      backgroundColor: '#ffffff'
    }
  },
  {
    id: 'c4-person-external',
    name: 'C4 Person (External)',
    type: 'c4Person',
    data: {
      label: 'Person',
      c4Metadata: { isExternal: true }
    },
    style: {
      borderColor: '#94a3b8',
      borderStyle: 'dashed',
      backgroundColor: '#f8fafc'
    }
  },
  // ... 40+ more presets
];
```

### Using Presets

```typescript
// Import preset
import { getC4Preset } from '@/services/c4/presets';

// Get preset
const preset = getC4Preset('c4-person-internal');

// Create node from preset
const node: Node = {
  id: 'node-1',
  type: preset.type,
  data: preset.data,
  style: preset.style,
  position: { x: 100, y: 100 }
};
```

---

## Troubleshooting

### C4 Notation Violations

**Problem**: Elements don't look like official C4 notation

**Solutions**:
1. Check `c4Metadata.isExternal` is set correctly
2. Verify border style: dashed for external, solid for internal
3. Check colors match official palette
4. Ensure icon sizes are correct for diagram level

### Confusing Hierarchy

**Problem**: Can't tell which level is which

**Solutions**:
1. Use breadcrumbs to show current level
2. Maintain consistent sizing
3. Add diagram type labels
4. Use color coding sparingly

---

## See Also

- [Overview](./overview.md) - Styling system overview
- [Node Types](./node-types.md) - Detailed node type reference
- [Custom Styling](./custom-styling.md) - Advanced techniques
- [Official C4 Site](https://c4model.com/) - Official C4 documentation
