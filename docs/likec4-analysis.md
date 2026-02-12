# LikeC4 Analysis & Strategy

**Version**: 1.0
**Last Updated**: 2026-01-25
**Status**: Draft

---

## Table of Contents

1. [LikeC4 Overview](#likec4-overview)
2. [Strengths to Emulate](#strengths-to-emulate)
3. [Limitations to Improve Upon](#limitations-to-improve-upon)
4. [Concepts to Adopt](#concepts-to-adopt)
5. [Independent Implementation Decisions](#independent-implementation-decisions)
6. [Integration vs Replacement Strategy](#integration-vs-replacement-strategy)

---

## LikeC4 Overview

### What is LikeC4?

LikeC4 is an architecture-as-code tool for creating software architecture diagrams using the C4 model. It combines:

- **DSL-based definitions**: Diagrams defined in a domain-specific language
- **Static site generation**: Generates static HTML views
- **C4 model support**: Native support for C4 diagram types
- **Layout algorithms**: Automatic diagram layout
- **VS Code extension**: Editor integration

### Tech Stack

```typescript
// LikeC4 Technology Stack
Language: TypeScript
Framework: Svelte
Build Tool: Vite
Diagram Rendering: Custom SVG renderer
Layout: ELK (Eclipse Layout Kernel)
DSL: Custom DSL (parsed with Langium)
Deployment: Static site generation
```

### Key Features

1. **Architecture-as-Code**: Define diagrams in code
2. **C4 Model**: Built-in C4 model support (Context, Container, Component)
3. **Static Generation**: Fast, deployable static sites
4. **Automatic Layout**: ELK-based layout algorithms
5. **Interactive Views**: Clickable elements, drill-down navigation
6. **VS Code Integration**: Language server, syntax highlighting, preview

---

## Strengths to Emulate

### 1. C4 Model Implementation ✅

**What LikeC4 Does Well**:
- Clear separation of C4 levels (System Context, Container, Component)
- Consistent visual notation for each level
- Built-in relationships and rules between levels
- Navigation between levels (drill-down)

**Adoption Strategy**:
```typescript
// Implement similar C4 diagram types
type C4DiagramType =
  | 'system-context'    // Level 1
  | 'container'         // Level 2
  | 'component'         // Level 3
  | 'code';             // Level 4 (optional)

// C4-specific node types
interface C4Node extends Node {
  c4Type: 'person' | 'system' | 'container' | 'component';
  technology?: string;
  description?: string;
}
```

**Implementation Notes**:
- Use C4 icon set (or create similar)
- Apply C4 color scheme by default
- Enforce C4 rules (e.g., Container contains Components)
- Provide C4 templates and presets

---

### 2. Automatic Layout ✅

**What LikeC4 Does Well**:
- Uses ELK (Eclipse Layout Kernel) for advanced layouts
- Hierarchical layout (rank-based node positioning)
- Orthogonal routing (edges with right angles)
- Configurable layout parameters

**Adoption Strategy**:
```typescript
// Use ELK or Dagre for layout
import ELK from 'elkjs/lib/elk.bundled.js';

const elk = new ELK();

const layoutOptions = {
  'elk.direction': 'DOWN',  // Top to bottom
  'elk.spacing.nodeNode': '50',
  'elk.layered.spacing.edgeNodeBetweenLayers': '30'
};

async function applyLayout(nodes: Node[], edges: Edge[]) {
  const graph = {
    id: 'root',
    children: nodes.map(n => ({
      id: n.id,
      width: n.size?.width || 100,
      height: n.size?.height || 50
    })),
    edges: edges.map(e => ({
      id: e.id,
      sources: [e.source],
      targets: [e.target]
    }))
  };

  const layoutedGraph = await elk.layout(graph, { layoutOptions });
  return layoutedGraph;
}
```

**Alternative**: Use Dagre (simpler, lighter)
```typescript
import dagre from 'dagre';

function applyDagreLayout(nodes: Node[], edges: Edge[]) {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB' });  // Top to Bottom

  nodes.forEach(n => {
    g.setNode(n.id, { width: n.size?.width || 100, height: n.size?.height || 50 });
  });

  edges.forEach(e => {
    g.setEdge(e.source, e.target);
  });

  dagre.layout(g);
  // Apply positions to nodes
}
```

**Recommendation**: Start with Dagre (simpler), add ELK in Phase 3 if needed

---

### 3. DSL-Based Definitions ✅

**What LikeC4 Does Well**:
- Declarative DSL for diagram definitions
- Type safety and validation
- Autocomplete and IntelliSense
- Easy version control

**Example LikeC4 DSL**:
```likec4
// LikeC4 DSL Example
system {
  icon = "system"
}

container {
  icon = "container"
}

component {
  icon = "component"
}

"Web Application" -> "Database" : "reads from"
```

**Adoption Strategy**:
- **Phase 1-2**: Use JSON/YAML (no custom DSL)
- **Phase 3+**: Consider adding custom DSL using Langium or similar

**JSON/YAML Alternative** (Recommended for MVP):
```yaml
# diagram.yaml
name: "E-Commerce System"
type: "system-context"

nodes:
  - id: "web-app"
    label: "Web Application"
    type: "container"
    description: "React-based web application"

  - id: "api"
    label: "API Server"
    type: "container"
    technology: "Node.js"

edges:
  - source: "web-app"
    target: "api"
    label: "HTTPS"
```

**Rationale**: JSON/YAML is sufficient and doesn't require custom parser

---

### 4. Hierarchical Navigation ✅

**What LikeC4 Does Well**:
- Click elements to navigate to child diagrams
- Breadcrumb navigation for path tracking
- Visual indicators for drill-down capability
- Back button support

**Adoption Strategy**:
```typescript
// Implement similar navigation pattern
interface NavigationState {
  currentDiagram: Diagram;
  breadcrumb: Diagram[];  // Path from root to current
  history: Diagram[];     // For back/forward
}

function navigateToChild(childDiagramId: string) {
  const childDiagram = diagrams.get(childDiagramId);
  if (childDiagram) {
    navigationState.breadcrumb.push(childDiagram);
    navigationState.currentDiagram = childDiagram;
    renderBreadcrumb();
  }
}

function navigateToBreadcrumb(index: number) {
  const targetDiagram = navigationState.breadcrumb[index];
  navigationState.breadcrumb = navigationState.breadcrumb.slice(0, index + 1);
  navigationState.currentDiagram = targetDiagram;
}
```

**UI Implementation**:
- Sidebar tree navigation (LikeC4 uses this)
- Breadcrumb bar in header
- Browser back/forward button support
- Visual indicator: Small arrow/badge on nodes with children

---

### 5. Static Site Generation ✅

**What LikeC4 Does Well**:
- Generates static HTML (fast, deployable anywhere)
- No backend required
- Easy deployment to GitHub Pages, Netlify, etc.
- CDN-friendly

**Adoption Strategy**:
- **Our approach**: Vite production build creates static assets
- **Deployment**: Docker + Nginx to serve static files
- **Similar outcome**: Fast, no backend, CDN-friendly

**Key Difference**: Our app is interactive SPA, not static HTML export (though we support export)

---

## Limitations to Improve Upon

### 1. Limited Customization 🔧

**LikeC4 Limitation**:
- Nodes are predefined shapes
- Limited styling options
- No custom HTML content
- CSS customization limited to themes

**Our Improvement**:
```typescript
// Each node is a customizable HTML container
interface CustomNode {
  htmlContent: string;  // Any HTML
  customCSS: string;    // Any CSS scoped to node
  templateId?: string;  // Reusable templates
}

// Example: Node with custom HTML
const node: Node = {
  id: 'custom-db',
  data: {
    htmlContent: `
      <div class="database-node">
        <img src="/icons/database.svg" />
        <h3>PostgreSQL</h3>
        <ul>
          <li>Port: 5432</li>
          <li>Version: 14</li>
          <li>Region: us-east-1</li>
        </ul>
        <div class="status-indicator online"></div>
      </div>
    `,
    customCSS: `
      .database-node {
        border: 2px solid #336791;
        background: linear-gradient(180deg, #e6f0f9 0%, #c3d9ed 100%);
      }
      .status-indicator.online {
        background: #4caf50;
        box-shadow: 0 0 8px #4caf50;
      }
    `
  }
};
```

**Advantage**: Much more flexible than LikeC4's predefined nodes

---

### 2. No Visual Editor 🔧

**LikeC4 Limitation**:
- Code-only (DSL) editing
- No drag-and-drop interface
- Must learn DSL to use
- Steeper learning curve

**Our Improvement**:
- **Hybrid approach**: Both visual AND code editors
- **Bidirectional sync**: Changes in visual editor update code, and vice versa
- **Lower barrier**: Beginners can use visual editor, advanced users can use code

**Implementation**:
```typescript
// Visual Editor (React Flow)
<Canvas
  nodes={nodes}
  edges={edges}
  onNodesChange={handleVisualChange}
  onEdgesChange={handleVisualChange}
/>

// Code Editor (Monaco)
<MonacoEditor
  value={diagramJSON}
  onChange={handleCodeChange}
  language="json"
/>

// Sync Logic
function handleVisualChange(changes) {
  updateDiagram(changes);
  updateCodeEditor();
}

function handleCodeChange(newCode) {
  parseAndUpdateDiagram(newCode);
  updateCanvas();
}
```

---

### 3. No Template System 🔧

**LikeC4 Limitation**:
- No reusable node templates
- Must redefine node types for each diagram
- No template library

**Our Improvement**:
```typescript
// Template system
interface Template {
  id: string;
  name: string;
  category: string;
  htmlContent: string;
  customCSS: string;
}

// Example template
const databaseTemplate: Template = {
  id: 'template-db',
  name: 'Database Node',
  category: 'Infrastructure',
  htmlContent: `
    <div class="database-node">
      <img src="/icons/database.svg" />
      <h3>{{label}}</h3>
      <div class="tech">{{technology}}</div>
    </div>
  `,
  customCSS: `
    .database-node {
      border: 2px solid #336791;
      background: #e6f0f9;
      border-radius: 8px;
      padding: 16px;
    }
  `
};

// Apply template to node
function applyTemplate(node: Node, template: Template) {
  node.data.htmlContent = template.htmlContent;
  node.data.customCSS = template.customCSS;
}
```

**Advantage**: Consistent design across diagrams, faster creation

---

### 4. No Collaboration Features 🔧

**LikeC4 Limitation**:
- Single-user tool
- No comments or annotations
- No sharing mechanism
- Git-based collaboration only

**Our Improvement**:
- Comments system (Phase 6)
- Shareable links (Phase 6)
- Real-time collaboration (optional, Phase 6)
- Multi-user support with Azure AD

---

### 5. Svelte-Specific (Framework Lock-in) 🔧

**LikeC4 Limitation**:
- Built with Svelte
- Harder to find Svelte developers
- Smaller ecosystem than React

**Our Improvement**:
- **React-based**: Larger ecosystem, more developers
- **Better TypeScript support**: React has superior TS tooling
- **More libraries**: Wider selection of React components

---

## Concepts to Adopt

### 1. C4 Diagram Types ✅

Adopt LikeC4's C4 model implementation:

```typescript
// C4 diagram levels
enum C4Level {
  SYSTEM_CONTEXT = 'system-context',   // Level 1
  CONTAINER = 'container',              // Level 2
  COMPONENT = 'component',              // Level 3
  CODE = 'code'                         // Level 4 (optional)
}

// C4-specific node types
enum C4ElementType {
  PERSON = 'person',                    // External person
  SYSTEM = 'system',                    // Software system
  CONTAINER = 'container',              // Container (service, app, db)
  COMPONENT = 'component',              // Component (module, class)
  DATABASE = 'database'                 // Database (variant of container)
}

// C4 color scheme
const C4_COLORS = {
  person: '#087274',        // Teal
  system: '#2b60de',        // Blue
  container: '#6c757d',     // Gray
  component: '#0d6efd',     // Primary blue
  database: '#8b4513'       // Brown
};
```

---

### 2. Diagram Relationships ✅

LikeC4 enforces relationships between C4 levels:

```
System Context (Level 1)
  ├─ Container Diagram 1 (Level 2)
  │   ├─ Component Diagram 1.1 (Level 3)
  │   └─ Component Diagram 1.2 (Level 3)
  └─ Container Diagram 2 (Level 2)
      └─ Component Diagram 2.1 (Level 3)
```

**Implementation**:
```typescript
interface DiagramHierarchy {
  systemContext: Diagram;
  containers: Diagram[];
  components: Diagram[];
}

function validateC4Hierarchy(diagram: Diagram, children: Diagram[]) {
  if (diagram.type === 'system-context') {
    // Children must be container diagrams
    return children.every(c => c.type === 'container');
  }
  if (diagram.type === 'container') {
    // Children must be component diagrams
    return children.every(c => c.type === 'component');
  }
  return true;
}
```

---

### 3. Relationship Notation ✅

LikeC4 uses specific notation for relationships:

```typescript
// Edge types based on C4
enum C4RelationshipType {
  SYNCHRONOUS = 'solid',        // Solid line: Synchronous
  ASYNCHRONOUS = 'dashed',      // Dashed line: Asynchronous
  REQUEST_RESPONSE = 'solid',   // Solid with label
  PUBLISH_SUBSCRIBE = 'dashed'  // Dashed with label
}

// Relationship labels
interface C4Relationship {
  label: string;           // "uses", "reads from", "sends to"
  technology?: string;     // "HTTPS", "gRPC", "Kafka"
  description?: string;    // Additional details
}
```

---

### 4. Layout Algorithm (ELK) ✅

If Dagre is insufficient, integrate ELK:

```bash
npm install elkjs
```

```typescript
import ELK from 'elkjs/lib/elk.bundled.js';

const elk = new ELK();

async function layoutWithELK(nodes: Node[], edges: Edge[]) {
  // Convert to ELK graph format
  const elkGraph = {
    id: 'root',
    properties: {
      'elk.direction': 'DOWN',
      'elk.spacing.nodeNode': '75',
      'elk.layered.spacing.edgeNodeBetweenLayers': '50'
    },
    children: nodes.map(n => ({
      id: n.id,
      width: n.size?.width || 150,
      height: n.size?.height || 100,
      // C4-specific layout hints
      properties: {
        'org.eclipse.elk.nodeLabels.placement': 'INSIDE V_CENTER H_CENTER'
      }
    })),
    edges: edges.map(e => ({
      id: e.id,
      sources: [e.source],
      targets: [e.target],
      // Edge routing
      properties: {
        'elk.edge.routing': 'ORTHOGONAL'  // Right-angle routing
      }
    }))
  };

  const layoutedGraph = await elk.layout(elkGraph);

  // Apply positions to nodes
  return layoutedGraph.children.map(n => ({
    id: n.id,
    position: { x: n.x, y: n.y }
  }));
}
```

---

## Independent Implementation Decisions

### Areas Where We Differ from LikeC4

#### 1. Framework: React (not Svelte)

**Rationale**:
- Larger ecosystem
- Better TypeScript support
- More developers familiar with React
- React Flow (diagram library) is React-native

**Impact**: No impact on features, purely technical choice

---

#### 2. Rendering: React Flow (not Custom SVG)

**Rationale**:
- React Flow handles canvas interactions (pan, zoom, selection)
- Custom node components support HTML content
- Better performance for large diagrams
- Active maintenance

**Impact**: More flexible node rendering

---

#### 3. No Custom DSL (JSON/YAML instead)

**Rationale**:
- JSON/YAML sufficient for MVP
- No need to write custom parser
- Wider tool support
- Easier to validate

**Impact**: Simpler codebase, easier to maintain

**Future**: Consider DSL in Phase 3+ if user feedback indicates need

---

#### 4. Full HTML Content in Nodes

**Rationale**:
- Maximum flexibility for users
- No limitation on node content
- CSS-based styling

**Impact**: Much more customizable than LikeC4

**Trade-off**: More complexity in sanitization (security)

---

#### 5. Hybrid Editing (Visual + Code)

**Rationale**:
- Lower barrier to entry
- Best of both worlds
- Sync provides learning opportunity

**Impact**: More complex state management, but better UX

---

#### 6. Multi-User with Azure AD

**Rationale**:
- Enterprise requirement
- Team collaboration
- Role-based access control

**Impact**: LikeC4 is single-user; we support teams

---

## Integration vs Replacement Strategy

### Strategy: Independent Implementation Inspired by LikeC4

**Philosophy**:
- **Inspired by**, not **dependent on** LikeC4
- Learn from LikeC4's strengths
- Improve upon LikeC4's limitations
- No code lock-in to LikeC4 codebase

---

### What We Reuse (Conceptually)

✅ **C4 Model**:
- Adopt diagram types (Context, Container, Component)
- Use C4 visual notation (icons, colors)
- Implement hierarchy rules

✅ **Layout Algorithms**:
- Use similar algorithms (ELK/Dagre)
- Achieve similar automatic layout quality

✅ **Navigation Patterns**:
- Drill-down navigation
- Breadcrumb trails
- Sidebar tree view

---

### What We Build Independently

🆕 **Visual Editor**:
- LikeC4 doesn't have this
- React Flow-based drag-and-drop
- Lower learning curve

🆕 **Template System**:
- LikeC4 doesn't have this
- Reusable node templates
- Faster diagram creation

🆕 **Full HTML Nodes**:
- LikeC4 has predefined shapes
- Our nodes are fully customizable HTML containers

🆕 **Real-Time Collaboration**:
- LikeC4 is single-user
- We support multi-user editing (Phase 6)

🆕 **Azure AD Integration**:
- LikeC4 has no authentication
- Enterprise-ready authentication

---

### Code Reuse from LikeC4

**Decision**: **NO** direct code reuse from LikeC4

**Rationale**:
- Different frameworks (Svelte vs React)
- Different architecture (static site vs SPA)
- License considerations (LikeC4 is MIT, but still)
- Want independent maintenance

**Exception**: May reference LikeC4's:
- C4 icon set (if permissive license)
- Layout algorithm configuration (ELK settings)
- DSL syntax ideas (if we create DSL in Phase 3+)

---

### When to Consider LikeC4 Integration

**Scenario 1: DSL Compatibility**
**If** users want to use LikeC4 DSL
**Then**: Write a LikeC4 DSL parser that converts to our JSON format

**Scenario 2: Layout Engine**
**If** LikeC4's ELK configuration is superior
**Then**: Use same ELK settings and parameters

**Scenario 3: Icon Set**
**If** LikeC4's C4 icons are high quality and permissively licensed
**Then**: Use the same icon set

**Scenario 4: Import/Export**
**If** users want to migrate from LikeC4
**Then**: Build LikeC4 import/export functionality

---

## Implementation Recommendations

### Phase 1: Start Simple, No LikeC4 Integration

- Build basic diagram editor with React Flow
- Use JSON for diagram definitions
- Manual layout only
- No C4-specific features yet

### Phase 2: Add Customization

- Add HTML content support
- Add template system
- Add custom CSS support
- Still no C4-specific features

### Phase 3: Add C4 Support

- Implement C4 diagram types
- Add C4 icons and colors
- Implement C4 hierarchy rules
- Add C4 templates

### Phase 4: Evaluate LikeC4 Compatibility

- Assess if LikeC4 DSL import is needed
- Consider LikeC4 export functionality
- Evaluate if layout tuning is needed

---

## Summary

### Key Takeaways

1. **Inspired by, not dependent on** LikeC4
2. **Adopt**: C4 model concepts, layout algorithms, navigation patterns
3. **Improve upon**: Customization, visual editor, templates, collaboration
4. **Independent implementation**: React-based, not Svelte
5. **No code lock-in**: Build independently, reference concepts only

### Our Advantages Over LikeC4

✅ **Visual Editor**: Drag-and-drop, not just code
✅ **Full Customization**: HTML nodes with custom CSS
✅ **Template System**: Reusable node templates
✅ **Multi-User**: Azure AD authentication, role-based access
✅ **Hybrid Editing**: Both visual and code editors
✅ **Real-Time Collaboration**: Optional, in Phase 6

### LikeC4 Features We Adopt

✅ **C4 Model**: Diagram types and notation
✅ **Automatic Layout**: ELK/Dagre algorithms
✅ **Hierarchical Navigation**: Drill-down and breadcrumbs
✅ **Static-Friendly**: Fast, deployable anywhere

---

## Conclusion

LikeC4 serves as excellent inspiration for our Custom Architecture Platform. We adopt its core concepts (C4 model, automatic layout, hierarchical navigation) while building independently to avoid framework lock-in and add significant improvements (visual editor, full customization, templates, collaboration).

**Strategy Summary**:
- **Learn** from LikeC4's strengths
- **Improve** upon its limitations
- **Build** independently for flexibility
- **Integrate** concepts, not code

This approach gives us the best of both worlds: time-tested architecture concepts with modern, flexible implementation.

---

**End of LikeC4 Analysis & Strategy v1.0**
