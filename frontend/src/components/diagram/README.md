# Diagram Canvas Components

This directory contains the diagram canvas components built with React Flow 11 for the Custom Architecture Platform.

## Components

### Canvas.tsx
Main diagram canvas component that provides:
- React Flow integration with ReactFlowProvider
- Pan and zoom controls
- Background grid pattern
- MiniMap for navigation
- Node selection (single and multi-select)
- Fit view button
- Zoom in/out buttons
- Drag-and-drop node support
- Custom CSS injection

**Props:**
```typescript
interface CanvasProps {
  diagram: Diagram;
  onNodeClick?: (node: Node) => void;
  onSelectionChange?: (nodes: Node[], edges: Edge[]) => void;
  editable?: boolean;
  customCSS?: string;
}
```

**Usage:**
```tsx
import { DiagramCanvas } from '@/components/diagram';

<DiagramCanvas
  diagram={myDiagram}
  onNodeClick={(node) => console.log('Clicked:', node)}
  onSelectionChange={(nodes, edges) => console.log('Selected:', nodes, edges)}
  editable={true}
  customCSS=".custom-node { background: #f0f0f0; }"
/>
```

### NodeToolbar.tsx
Draggable node palette with templates:
- C4 Model nodes (Person, System, Container)
- Common nodes (Service, Database, API)
- Infrastructure nodes (Load Balancer, Cache, Queue)
- Search/filter functionality
- Collapsible categories

**Features:**
- Drag nodes from toolbar to canvas
- Click to add nodes (with onNodeClick callback)
- Search by name or description
- Collapsible category groups

### CustomNode.tsx
Custom HTML node component with:
- Safe HTML rendering with DOMPurify
- Custom CSS classes
- Drag handle for moving
- Connection points (4 edges: top, bottom, left, right)
- Selection indicator
- Icon support
- Description support

### C4PersonNode.tsx, C4SystemNode.tsx, DatabaseNode.tsx, ServiceNode.tsx
Specialized node types for common architecture elements with pre-configured styling and icons.

### CustomEdge.tsx
Custom edge component with:
- Edge labels
- Custom styling (solid, dashed, dotted)
- Arrowheads
- Selection indicator
- Delete button on hover
- Animated flow support

## Node Types

The canvas supports the following node types:
- `custom` - Generic custom node with HTML content
- `c4Person` - C4 model person node
- `c4System` - C4 model system node
- `database` - Database/storage node
- `service` - Service/microservice node

## Edge Types

The canvas supports:
- `custom` - Custom edge with labels and styling
- Default React Flow edge types (bezier, straight, step, smoothstep)

## Features

### Drag and Drop
Nodes can be dragged from the NodeToolbar onto the canvas. The toolbar supports:
- Dragging with visual feedback
- Drop zone positioning
- Multiple node templates

### Pan and Zoom
- Mouse wheel to zoom
- Click and drag to pan
- Zoom controls (in/out/fit)
- MiniMap for navigation
- Keyboard shortcuts (Ctrl+scroll, etc.)

### Selection
- Click to select single nodes/edges
- Shift+click for multi-select
- Drag selection rectangle
- Visual selection indicators
- Selection info display

### Connections
- Drag from node handles to create edges
- 4 connection points per node (top, bottom, left, right)
- Bezier curve routing
- Edge labels
- Animated edges

### Custom Styling
- Per-node CSS classes
- Per-diagram custom CSS
- Inline styles support
- Theme support via CSS variables

## Integration with Zustand Store

The canvas integrates with the diagram store (`useDiagramStore`) for state management:
- Current diagram state
- Node and edge CRUD operations
- Selection management
- Persistent storage

## Security

All HTML content is sanitized using DOMPurify to prevent XSS attacks:
- Allowed tags: div, span, p, strong, em, u, br, hr, h1-h6, ul, ol, li, img, a, code, pre
- Allowed attributes: class, style, href, src, alt, title, id

## Demo

A demo page is available at `/demo` route when running the dev server:
```bash
npm run dev
# Navigate to http://localhost:5174/demo
```

The demo includes:
- Sample diagram with multiple nodes
- Connected edges with labels
- Interactive features enabled
- Drag-and-drop support

## Future Enhancements

Planned features:
- [ ] Layout algorithms (Dagre, ELK)
- [ ] Export to PNG/SVG
- [ ] Node resizing
- [ ] More edge routing options
- [ ] Templates library
- [ ] Drill-down navigation
- [ ] Undo/redo
- [ ] Copy/paste
- [ ] Keyboard shortcuts

## File Structure

```
diagram/
├── Canvas.tsx              # Main canvas component
├── NodeToolbar.tsx         # Node palette
├── index.ts                # Component exports
├── nodes/
│   ├── index.ts
│   ├── CustomNode.tsx      # Base custom node
│   ├── C4PersonNode.tsx    # C4 person
│   ├── C4SystemNode.tsx    # C4 system
│   ├── DatabaseNode.tsx    # Database
│   └── ServiceNode.tsx     # Service
└── edges/
    ├── index.ts
    └── CustomEdge.tsx      # Custom edge
```

## Dependencies

- `reactflow@^11.11.4` - Diagram rendering
- `dompurify@^3.3.1` - HTML sanitization
- `lucide-react@^0.563.0` - Icons
- `zustand@^5.0.10` - State management

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT
