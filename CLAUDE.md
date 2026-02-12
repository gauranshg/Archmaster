# Custom Architecture Platform

## Goal
Build a modern web-based platform for creating, visualizing, and managing software architecture diagrams with full CSS customization and hierarchical drill-down navigation.

## Tech Stack

### Frontend
- **Build Tool**: Vite
- **Framework**: React 18 + TypeScript 5.3
- **Diagram Library**: React Flow 11
- **State Management**: Zustand
- **Code Editor**: Monaco Editor
- **Styling**: Tailwind CSS + CSS Modules
- **Icons**: Lucide React
- **Layout**: Dagre/ELK
- **Storage**: IndexedDB (Dexie)

### Backend
- **Runtime**: Python 3.11+
- **Framework**: Azure Functions v2
- **Database**: Azure Cosmos DB (SQL API)
- **Storage**: Azure Blob Storage
- **Validation**: Pydantic

### Deployment
- **Hosting**: Azure Static Web Apps
- **Auth**: Azure AD (Entra ID)
- **Monitoring**: Azure Application Insights

## Project Structure

```
custom-platform/
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components (diagram/, editor/, sidebar/, common/)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── store/         # Zustand stores
│   │   ├── services/      # API clients
│   │   ├── types/         # TypeScript types
│   │   └── styles/        # Global styles
├── api/                    # Azure Functions (Python)
│   ├── model/             # Pydantic models
│   ├── functions/         # Azure Function endpoints
│   └── db/                # Cosmos DB & Blob operations
└── docs/                   # Documentation
```

## Key Differentiators

- **Full HTML/CSS Nodes**: Every node is a fully customizable `<div>` with HTML content
- **Custom CSS Styling**: Apply styles via `id` and `class` selectors
- **Hybrid Editing**: Visual drag-and-drop + code editor (JSON/YAML)
- **Bidirectional Sync**: Changes sync between editors automatically
- **Template System**: Reusable node templates
- **C4 Model Support**: Native C4 architecture diagrams
- **Hierarchical Navigation**: Drill-down from high-level to detailed views

## Core Data Model

```typescript
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
    htmlContent: string;
    cssClass?: string;
  };
}
```

## Development Phases

1. **Phase 1 (MVP)**: Basic diagram editor, manual positioning, JSON import/export
2. **Phase 2**: Monaco editor, bidirectional sync, templates, custom CSS
3. **Phase 3**: Auto-layout, sidebar navigation, drill-down
4. **Phase 4**: C4 presets, image export, version control
5. **Phase 5**: Azure AD, RBAC, deployment
6. **Phase 6**: Collaboration, shareable links, real-time sync

## Security Priorities

- XSS prevention with DOMPurify
- CSS injection filtering
- Azure AD OAuth 2.0
- Role-based access control (RBAC)
- HTTPS/TLS for all connections

## Documentation

- [Functional Requirements](docs/functional-requirements.md)
- [Technical Requirements](docs/technical-requirements.md)
- [Data Model Specification](docs/data-model-specification.md)
- [UI/UX Specification](docs/ui-ux-specification.md)
- [Implementation Roadmap](docs/implementation-roadmap.md)
- [LikeC4 Analysis](docs/likec4-analysis.md)

## Development Guidelines

- TypeScript strict mode enabled
- ESLint + Prettier for formatting
- Conventional Commits for commit messages
- Auto-save every 30 seconds
- All HTML content must be sanitized



# Memory

You have access to a starter kit in custom-platform\Starterkit-1\README.md