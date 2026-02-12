# Diagram Canvas - Quick Start Guide

## Files Created

All files are located in: `D:\likec4-customizaed\custom-platform\frontend\src\components\diagram\`

```
diagram/
├── Canvas.tsx                    # Main canvas component with React Flow
├── NodeToolbar.tsx               # Draggable node palette
├── index.ts                      # Public API exports
├── README.md                     # Component documentation
│
├── nodes/                        # Custom node components
│   ├── index.ts
│   ├── CustomNode.tsx           # Base node (HTML, drag, handles)
│   ├── C4PersonNode.tsx         # 👤 Person node
│   ├── C4SystemNode.tsx         # 🖥️ System node
│   ├── DatabaseNode.tsx         # 🗄️ Database node
│   └── ServiceNode.tsx          # ⚙️ Service node
│
└── edges/                        # Custom edge components
    ├── index.ts
    └── CustomEdge.tsx           # Labeled edge with delete button
```

## Quick Start

### 1. Import the Canvas

```tsx
import { DiagramCanvas } from '@/components/diagram';
import type { Diagram } from '@/types';
```

### 2. Create a Diagram

```tsx
const myDiagram: Diagram = {
  id: 'demo-1',
  name: 'My Architecture',
  type: 'generic',
  workspaceId: 'workspace-1',

  nodes: [
    {
      id: 'node-1',
      diagramId: 'demo-1',
      position: { x: 100, y: 100 },
      data: {
        label: 'Web Service',
        htmlContent: '<div style="font-weight: bold;">Web Service</div>',
        icon: '⚙️',
      },
      type: 'service',
    },
  ],

  edges: [],

  metadata: {
    version: 1,
    author: 'user',
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  },

  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
```

### 3. Render the Canvas

```tsx
function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <DiagramCanvas
        diagram={myDiagram}
        editable={true}
        onNodeClick={(node) => console.log('Clicked:', node)}
        onSelectionChange={(nodes, edges) => console.log('Selected:', nodes, edges)}
      />
    </div>
  );
}
```

## Node Types

### Custom Node (Generic)
```tsx
{
  id: 'node-1',
  type: 'custom',
  position: { x: 100, y: 100 },
  data: {
    label: 'My Node',
    htmlContent: '<div>Custom HTML</div>',
    icon: '📦',
  },
}
```

### C4 Person
```tsx
{
  id: 'user-1',
  type: 'c4Person',
  position: { x: 100, y: 100 },
  data: {
    label: 'User',
    description: 'End user',
  },
}
```

### C4 System
```tsx
{
  id: 'system-1',
  type: 'c4System',
  position: { x: 100, y: 100 },
  data: {
    label: 'Payment System',
    description: 'Processes payments',
  },
}
```

### Database
```tsx
{
  id: 'db-1',
  type: 'database',
  position: { x: 100, y: 100 },
  data: {
    label: 'PostgreSQL',
    description: 'Primary database',
  },
}
```

### Service
```tsx
{
  id: 'service-1',
  type: 'service',
  position: { x: 100, y: 100 },
  data: {
    label: 'API Gateway',
    description: 'REST API',
  },
}
```

## Edge Creation

### Basic Edge
```tsx
{
  id: 'edge-1',
  source: 'node-1',
  target: 'node-2',
}
```

### Labeled Edge
```tsx
{
  id: 'edge-1',
  source: 'node-1',
  target: 'node-2',
  label: 'HTTPS',
  data: {
    label: 'API Calls',
  },
}
```

### Animated Edge
```tsx
{
  id: 'edge-1',
  source: 'node-1',
  target: 'node-2',
  animated: true,
  style: {
    stroke: '#3b82f6',
    strokeWidth: 2,
  },
}
```

## Canvas Features

### Pan & Zoom
- **Mouse wheel**: Zoom in/out
- **Click + drag**: Pan canvas
- **Controls**: Use zoom buttons

### Selection
- **Click**: Select single node/edge
- **Shift + click**: Multi-select
- **Drag**: Select multiple nodes

### Connections
- Drag from node handles to create edges
- 4 connection points per node (top, bottom, left, right)
- Click edge label to delete

### Toolbar
- Drag nodes from toolbar to canvas
- Search templates by name
- Collapse/expand categories

## Custom Styling

### Per-Diagram CSS
```tsx
<DiagramCanvas
  diagram={diagram}
  customCSS={`
    .custom-node {
      background: #f0f9ff;
      border: 2px solid #3b82f6;
    }
    .custom-node.selected {
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
    }
  `}
/>
```

### Node Styles
```tsx
{
  id: 'node-1',
  style: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    borderWidth: 2,
    borderRadius: 8,
  },
}
```

## Security

All HTML content is automatically sanitized using DOMPurify:

**Allowed tags:**
div, span, p, strong, em, u, br, hr, h1-h6, ul, ol, li, img, a, code, pre

**Allowed attributes:**
class, style, href, src, alt, title, id

## Demo

Run the demo:
```bash
cd D:\likec4-customizaed\custom-platform\frontend
npm run dev
```

Navigate to: http://localhost:5174/demo

## API Reference

### DiagramCanvas Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| diagram | Diagram | *required* | Diagram to render |
| onNodeClick | (node) => void | undefined | Node click callback |
| onSelectionChange | (nodes, edges) => void | undefined | Selection change callback |
| editable | boolean | true | Enable editing |
| customCSS | string | undefined | Custom CSS styles |

### Node Data Structure

```typescript
interface NodeData {
  label: string;              // Display label
  htmlContent?: string;       // HTML content (sanitized)
  icon?: string;             // Icon/emoji
  description?: string;      // Description text
  properties?: Record<string, unknown>; // Custom data
}
```

### Edge Data Structure

```typescript
interface EdgeData {
  label?: string;            // Label text
  style?: string;           // Edge style class
  description?: string;     // Description
  properties?: Record<string, unknown>; // Custom data
}
```

## Build & Test

```bash
# Build for production
npm run build

# Start dev server
npm run dev

# Run linter
npm run lint
```

## Troubleshooting

### Canvas not rendering
- Check that diagram prop has valid nodes and edges arrays
- Verify parent container has height/width

### Nodes not selectable
- Set `editable={true}` on DiagramCanvas
- Check node `selectable` property

### Edges not visible
- Verify source and target node IDs exist
- Check edge `hidden` property

### HTML not rendering
- Ensure HTML is in `htmlContent` field
- Check console for DOMPurify warnings
- Verify allowed tags list

## Next Steps

1. Add layout algorithms (Dagre, ELK)
2. Implement PNG/SVG export
3. Add node resizing
4. Create templates library UI
5. Add undo/redo functionality

## Support

- Documentation: `src/components/diagram/README.md`
- Demo: `http://localhost:5174/demo`
- Issues: Check browser console for errors
