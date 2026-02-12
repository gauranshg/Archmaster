# Custom Architecture Platform

**Build • Visualize • Document Software Architectures**

A modern web-based platform for creating, visualizing, and managing software architecture diagrams with full CSS customization and hierarchical drill-down navigation.

---

## 🎯 Project Overview

The Custom Architecture Platform is a hybrid diagramming tool that combines:

- **Visual Drag-and-Drop Editor**: Intuitive canvas for creating diagrams
- **Code-Based Definitions**: Define diagrams in JSON/YAML with Monaco editor
- **Bidirectional Sync**: Changes sync automatically between visual and code editors
- **Full Customization**: Each node is a customizable HTML container with CSS support
- **Template System**: Create reusable node templates for consistent design
- **C4 Model Support**: Native support for C4 architecture diagrams
- **Hierarchical Navigation**: Drill-down from high-level to detailed views

### Key Differentiators

✨ **Full HTML/CSS Nodes**: Unlike other tools, every node is a fully customizable `<div>` that can contain any HTML content
🎨 **Custom CSS Styling**: Apply custom CSS via `id` and `class` selectors
📦 **Template Library**: Create and reuse node templates across diagrams
🔄 **Hybrid Editing**: Work visually or with code - your choice
🌳 **Hierarchical Views**: Navigate from system context down to component level
🚀 **React-Based**: Modern stack with excellent TypeScript support

---

## 📋 Documentation

Comprehensive documentation is available in the `/docs` directory:

### Core Documentation

| Document | Description |
|----------|-------------|
| [**Functional Requirements**](docs/functional-requirements.md) | User-facing features, use cases, business rules |
| [**Technical Requirements**](docs/technical-requirements.md) | Tech stack, Azure architecture, non-functional requirements |
| [**Data Model Specification**](docs/data-model-specification.md) | Data structures, TypeScript interfaces, Cosmos DB schema |
| [**UI/UX Specification**](docs/ui-ux-specification.md) | Interface design, layouts, interaction patterns |
| [**Implementation Roadmap**](docs/implementation-roadmap.md) | Development phases, deliverables, timelines |
| [**LikeC4 Analysis**](docs/likec4-analysis.md) | What we learn/adapt from LikeC4 reference project |
| [**Open Questions**](docs/questions.md) | Decisions made and architectural clarifications |

### Quick Reference

- **Frontend**: Vite + React + TypeScript
- **Hosting**: Azure Static Web Apps
- **Backend**: Azure Functions (Python 3.11+)
- **Database**: Azure Cosmos DB (SQL API)
- **Storage**: Azure Blob Storage
- **Authentication**: Azure AD (Entra ID)
- **Diagram Library**: React Flow
- **State Management**: Zustand
- **Code Editor**: Monaco Editor
- **Styling**: Tailwind CSS + CSS Modules

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ and npm/yarn/pnpm
- Docker (for deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/custom-architecture-platform.git
cd custom-architecture-platform

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure

```
custom-platform/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── diagram/   # Diagram-specific components
│   │   │   ├── editor/    # Code editor components
│   │   │   ├── sidebar/   # Sidebar navigation
│   │   │   └── common/    # Shared components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── store/         # Zustand stores
│   │   ├── services/      # API clients, storage
│   │   ├── utils/         # Helper functions
│   │   ├── types/         # TypeScript types
│   │   └── styles/        # Global styles
│   ├── public/            # Static assets
│   ├── vite.config.ts     # Vite configuration
│   └── tsconfig.json      # TypeScript configuration
├── api/                    # Azure Functions (Python backend)
│   ├── model/             # Pydantic models
│   ├── functions/         # Azure Function endpoints
│   ├── db/                # Cosmos DB & Blob operations
│   ├── services/          # Business logic
│   ├── utils/             # Python utilities
│   ├── requirements.txt   # Python dependencies
│   └── function_app.py    # Functions configuration
├── docs/                   # Documentation (see above)
├── azure-static-web-apps.yml  # CI/CD configuration
└── README.md
```

---

## 🎨 Features

### Diagram Creation

- **Visual Editor**: Drag and drop nodes, connect elements, arrange layouts
- **Code Editor**: Define diagrams in JSON or YAML with syntax highlighting
- **Hybrid Mode**: Split-screen view with both editors
- **Auto-Save**: Never lose your work (30-second intervals)

### Node Customization

- **HTML Content**: Any valid HTML inside nodes (text, images, lists, tables)
- **Custom CSS**: Apply styles via `id` and `class` selectors
- **Templates**: Create reusable node templates
- **Resizing**: Drag handles to resize nodes
- **Icons**: Choose from Lucide icon library or use custom SVGs

### Layout & Navigation

- **Manual Layout**: Drag nodes anywhere on canvas
- **Auto Layout**: Apply hierarchical layout algorithms (Dagre/ELK)
- **Hierarchical Navigation**: Sidebar tree view of diagram hierarchy
- **Drill-Down**: Click nodes to navigate to child diagrams
- **Breadcrumbs**: Track navigation path, easily jump back

### Connections

- **Multiple Styles**: Solid, dashed, or dotted lines
- **Arrowheads**: Customize start and end markers
- **Labels**: Add text or HTML labels
- **Routing**: Orthogonal, curved, or straight edges
- **Animation**: Show flow direction with animated edges

### Export & Import

- **JSON/YAML**: Save and load diagram definitions
- **PNG**: Export diagrams as raster images
- **SVG**: Export diagrams as vector graphics
- **Copy/Paste**: Duplicate nodes and edges

### Theming

- **Light/Dark Themes**: Built-in theme switcher
- **Custom Themes**: Create your own color schemes
- **Per-Diagram CSS**: Apply custom CSS to individual diagrams
- **Theme Persistence**: Your theme choice is saved

---

## 🗺️ Development Roadmap

### Phase 1: Foundation (MVP) ✅ Planned
- Basic diagram editor with React Flow
- Manual positioning and resizing
- JSON import/export
- Simple properties panel

### Phase 2: Editor & Customization 📋 Planned
- Monaco code editor integration
- Bidirectional sync
- Template system
- Custom CSS support
- Theme system

### Phase 3: Layout & Navigation 📋 Planned
- Auto-layout algorithms (Dagre/ELK)
- Sidebar tree navigation
- Drill-down navigation
- Advanced connection styles

### Phase 4: C4 Model & Advanced Features 📋 Planned
- C4 diagram presets
- Architecture templates
- Image export (PNG/SVG)
- Version control

### Phase 5: Authentication & Deployment 📋 Planned
- Azure AD integration
- Role-based access control
- Docker deployment
- Production optimization

### Phase 6: Collaboration & Polish 📋 Planned
- Comments system
- Shareable links
- Real-time collaboration
- Performance optimization

See [Implementation Roadmap](docs/implementation-roadmap.md) for details.

---

## 🏗️ Architecture

### Tech Stack

```typescript
// Frontend
{
  "buildTool": "Vite",
  "framework": "React 18",
  "language": "TypeScript 5.3",
  "diagrams": "React Flow 11",
  "state": "Zustand",
  "editor": "Monaco Editor",
  "styling": "Tailwind CSS",
  "icons": "Lucide React",
  "layout": ["Dagre", "ELK"],
  "storage": "IndexedDB (Dexie)"
}

// Backend (Azure Functions)
{
  "runtime": "Python 3.11+",
  "framework": "Azure Functions v2",
  "database": "Azure Cosmos DB (SQL API)",
  "storage": "Azure Blob Storage",
  "validation": "Pydantic"
}

// Deployment
{
  "hosting": "Azure Static Web Apps",
  "functions": "Azure Functions (Python)",
  "authentication": "Azure AD (Entra ID)",
  "monitoring": "Azure Application Insights"
}
```

### Data Model

```typescript
// Core entities
interface Diagram {
  id: string;
  name: string;
  type: 'system-context' | 'container' | 'component' | 'generic';
  nodes: Node[];
  edges: Edge[];
  customCSS?: string;
  metadata: DiagramMetadata;
}

interface Node {
  id: string;
  position: { x: number; y: number };
  data: {
    label: string;
    htmlContent: string;  // Any HTML
    cssClass?: string;
  };
}

interface Edge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: 'solid' | 'dashed' | 'dotted';
}
```

See [Data Model Specification](docs/data-model-specification.md) for complete schema.

---

## 🎯 Use Cases

### 1. System Architecture Documentation

Document your software system at multiple levels:
- **System Context**: Show your system and external dependencies
- **Containers**: Break down into applications, databases, services
- **Components**: Show internal components and modules

### 2. Team Collaboration

Share architecture diagrams with your team:
- Export diagrams as PNG/SVG for documentation
- Share via link for quick review
- Add comments for feedback
- Version history for tracking changes

### 3. Architecture Reviews

Present architecture designs to stakeholders:
- Drill-down from high-level to detailed views
- Professional C4 notation
- Custom styling for branding
- Export slides for presentations

### 4. Design Exploration

Explore different architecture patterns:
- Use templates for microservices, monolith, event-driven
- Quick layout changes with auto-layout
- Duplicate and modify diagrams
- Compare different approaches

---

## 🔒 Security

- **XSS Prevention**: All HTML content sanitized with DOMPurify
- **CSS Injection**: Dangerous CSS properties filtered
- **Authentication**: Azure AD OAuth 2.0
- **Authorization**: Role-based access control (RBAC)
- **HTTPS**: TLS/SSL for all connections

---

## 📊 Performance

| Metric | Target | Status |
|--------|--------|--------|
| Initial Load | < 3 seconds | 📋 TBD |
| 100-Node Rendering | < 2 seconds | 📋 TBD |
| UI Response Time | < 100ms | 📋 TBD |
| Bundle Size (gzipped) | < 500KB | 📋 TBD |
| Memory Usage | < 500MB | 📋 TBD |

---

## 🤝 Contributing

Contributions are welcome! Please see our contributing guidelines (to be created).

### Development Setup

```bash
# Install dependencies
npm install

# Run linter
npm run lint

# Run tests
npm run test

# Type check
npm run type-check
```

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Follows recommended rules
- **Prettier**: Automatic formatting
- **Commit Convention**: Conventional Commits

---

## 📝 License

[To be determined - likely MIT]

---

## 🙏 Acknowledgments

- **LikeC4**: Inspiration for C4 model implementation and layout algorithms
- **React Flow**: Excellent diagram library for React
- **Monaco Editor**: VS Code's editor, now available on the web
- **Dagre & ELK**: Powerful layout algorithms
- **Lucide**: Beautiful icon library

---

## 📧 Contact

- **Project**: [Custom Architecture Platform](https://github.com/yourusername/custom-architecture-platform)
- **Issues**: [GitHub Issues](https://github.com/yourusername/custom-architecture-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/custom-architecture-platform/discussions)

---

## 🗺️ Roadmap Visualization

```
Phase 1 (MVP)
├─ Basic Diagram Editor
├─ Manual Positioning
└─ JSON Import/Export

Phase 2 (Editor & Customization)
├─ Monaco Code Editor
├─ Bidirectional Sync
├─ Template System
└─ Custom CSS Support

Phase 3 (Layout & Navigation)
├─ Auto-Layout Algorithms
├─ Sidebar Tree Navigation
└─ Drill-Down Navigation

Phase 4 (C4 & Advanced)
├─ C4 Diagram Presets
├─ Image Export
└─ Version Control

Phase 5 (Auth & Deployment)
├─ Azure AD Integration
├─ Role-Based Access Control
└─ Azure Deployment

Phase 6 (Collaboration & Polish)
├─ Comments System
├─ Shareable Links
└─ Real-Time Collaboration
```

---

**Status**: 📋 In Planning
**Version**: 1.0.0 (planned)
**Last Updated**: 2026-01-25

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/custom-architecture-platform&type=Date)](https://star-history.com/#yourusername/custom-architecture-platform&Date)

---

**Built with ❤️ using Vite + React + TypeScript**
