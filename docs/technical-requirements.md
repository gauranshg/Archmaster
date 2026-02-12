# Technical Requirements Specification

**Version**: 1.0
**Last Updated**: 2026-01-25
**Status**: Draft

---

## Table of Contents

1. [Technology Stack Decisions](#technology-stack-decisions)
2. [Architecture Overview](#architecture-overview)
3. [System Components](#system-components)
4. [Non-Functional Requirements](#non-functional-requirements)
5. [Integration Requirements](#integration-requirements)
6. [Deployment Architecture](#deployment-architecture)
7. [Development Standards](#development-standards)

---

## Technology Stack Decisions

### Frontend Framework & Hosting

**Decision**: Azure Static Web Apps + Vite + React + TypeScript

**Rationale**:
- **Azure Static Web Apps**:
  - Automatic SSL/TLS certificates
  - Global CDN distribution
  - Zero cold-start for static assets
  - Built-in CI/CD from GitHub
  - Free tier available
- **Vite**: Lightning-fast build tool with Hot Module Replacement (HMR)
- **React**: Component-based architecture, large ecosystem, excellent TypeScript support
- **TypeScript**: Type safety reduces bugs, better IDE support, self-documenting code

**Alternatives Considered**:
- Vue + TypeScript: Simpler learning curve but smaller ecosystem for diagram libraries
- Svelte + TypeScript: Lightweight but less mature ecosystem
- Vanilla JS: Maximum control but higher development cost

**Key Technologies**:
```json
{
  "vite": "^5.0.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.3.0",
  "@types/react": "^18.2.0"
}
```

**Azure Static Web Apps Configuration**:
```yaml
# azure-static-web-apps.yml
name: custom-architecture-platform
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "dist"
          api_location: "api"
          output_location: ""
```

---

### Diagram Rendering Library

**Decision**: React Flow (https://reactflow.dev/)

**Rationale**:
- Built specifically for node-based diagrams
- Native React integration with TypeScript support
- Custom node components (perfect for HTML container nodes)
- Built-in zoom, pan, minimap
- Excellent performance for 100+ nodes
- Active development and community
- MIT License

**Key Features**:
- Custom node components with full HTML rendering
- Drag-and-drop out of the box
- Multiple edge types (smooth, step, straight)
- Background patterns (grid, dots, lines)
- Minimap for navigation
- Fit view, zoom in/out controls

**Alternatives Considered**:
- **Cytoscape.js**: More powerful for complex graphs but heavier, steeper learning curve
- **D3.js**: Full control but requires more code, no built-in interactivity
- **JointJS**: Good but not React-native, less TypeScript support

**Dependencies**:
```json
{
  "reactflow": "^11.10.0"
}
```

---

### State Management

**Decision**: Zustand

**Rationale**:
- Lightweight (~1KB)
- Simple API, no boilerplate
- Excellent TypeScript support
- No providers needed
- Easy to persist state
- Great for medium-complexity apps

**Alternatives Considered**:
- **Redux**: Overkill for this app size, too much boilerplate
- **React Context**: Built-in but can get complex with many contexts
- **Jotai**: Good alternative but Zustand has simpler API for global state

**Dependencies**:
```json
{
  "zustand": "^4.4.0"
}
```

**Store Structure**:
- `diagramStore`: Diagram data, nodes, edges
- `uiStore`: UI state (sidebar, panels, theme)
- `editorStore`: Editor state (selected items, clipboard)

---

### Code Editor

**Decision**: Monaco Editor

**Rationale**:
- VS Code's editor, battle-tested
- Excellent TypeScript/JavaScript support
- Autocomplete, IntelliSense
- Minimap, multiple cursors
- Syntax highlighting for JSON, YAML
- Active development

**Alternatives Considered**:
- **CodeMirror**: Lighter but fewer features
- **Ace Editor**: Older, less active development

**Dependencies**:
```json
{
  "@monaco-editor/react": "^4.6.0"
}
```

---

### Styling Solution

**Decision**: Tailwind CSS + CSS Modules + Custom CSS Injection

**Rationale**:
- **Tailwind CSS**: Rapid UI development, consistent design system, no custom CSS needed for most UI
- **CSS Modules**: Scoped component styles, no conflicts
- **Custom CSS Injection**: User-defined styles for diagram elements

**Dependencies**:
```json
{
  "tailwindcss": "^3.4.0",
  "postcss": "^8.4.0",
  "autoprefixer": "^10.4.0"
}
```

---

### Layout Algorithms

**Decision**: Dagre + ELK

**Rationale**:
- **Dagre**: Simple hierarchical layout, easy integration
- **ELK**: More advanced layouts, multiple algorithms

**Dependencies**:
```json
{
  "dagre": "^0.8.5",
  "elkjs": "^0.9.0"
}
```

---

### Icons

**Decision**: Lucide React

**Rationale**:
- Tree-shakeable (only imports used icons)
- Consistent design
- Easy to customize via CSS
- Lightweight
- MIT License

**Dependencies**:
```json
{
  "lucide-react": "^0.300.0"
}
```

---

### Icons

**Decision**: Lucide React

**Rationale**:
- Tree-shakeable (only imports used icons)
- Consistent design
- Easy to customize via CSS
- Lightweight
- MIT License

**Dependencies**:
```json
{
  "lucide-react": "^0.300.0"
}
```

---

## Backend Architecture

### Azure Functions (Python)

**Decision**: Azure Functions v2 (Python) for serverless backend

**Rationale**:
- **Serverless**: Pay only for actual usage
- **Auto-scaling**: Handles traffic spikes automatically
- **Managed Service**: No server maintenance
- **Python Integration**: Easy integration with Azure SDK
- **Cold Start**: Fast cold starts with Premium plan
- **Built-in Authentication**: Easy integration with Azure AD

**Python Version**: 3.11+

**Key Libraries**:
```python
# requirements.txt
azure-functions==1.18.0
azure-functions-extension-worker==1.0.0
azure-cosmos==4.5.0
azure-storage-blob==12.19.0
azure-identity==1.15.0
azure-mgmt-web==7.0.0
pydantic==2.5.0           # Data validation
python-jose[cryptography]==3.3.0  # JWT handling
```

---

### Authentication & Authorization

**Decision**: Azure AD Integration via Azure Static Web Apps

**Architecture**:
- Azure Static Web Apps provides built-in authentication
- Uses Azure AD (Entra ID) for identity
- Role-based access control (RBAC) via custom claims
- JWT tokens validated by Azure Functions

**Flow**:
```
1. User clicks "Sign In" → Azure AD Login
2. Azure AD returns JWT token + user info
3. Static Web Apps injects user info into request headers
4. Azure Functions validates token from headers
5. Functions check user roles for authorization
```

**Roles**:
- **Anonymous**: Unauthenticated users
- **Authenticated**: Any signed-in user
- **Viewer**: Read-only access
- **Editor**: Can edit diagrams
- **Admin**: Full access + workspace management

---

### Databases & Storage

#### 1. Azure Cosmos DB (SQL API)

**Purpose**: Primary database for structured data

**Data Stored**:
- Workspaces
- Diagrams (metadata, nodes, edges)
- Templates
- Users
- Version history

**Cosmos DB Structure**:
```python
# Container: diagrams
{
  "id": "diagram-uuid",
  "workspaceId": "workspace-uuid",
  "name": "System Context",
  "type": "system-context",
  "nodes": [...],  # Embedded document
  "edges": [...],  # Embedded document
  "createdAt": "2026-01-25T10:00:00Z",
  "_ts": 1706162400  # Timestamp for TTL
}

# Container: workspaces
{
  "id": "workspace-uuid",
  "name": "My Project",
  "ownerId": "user-uuid",
  "members": [...],
  "settings": {...}
}

# Container: templates
{
  "id": "template-uuid",
  "name": "Database Node",
  "category": "Infrastructure",
  "data": {...},
  "isPublic": true
}
```

**Partitioning Strategy**:
- **Partition Key**: `/workspaceId` for diagrams
- **Partition Key**: `/ownerId` for workspaces
- **Partition Key**: `/category` for templates

**Indexing**:
- Automatic indexing for all properties
- Composite indexes for common queries (workspace + type, owner + date)

---

#### 2. Azure Blob Storage

**Purpose**: File storage for exports and large assets

**Containers**:
- `exports`: PNG/SVG exports
- `imports`: Uploaded JSON/YAML files
- `backups`: Scheduled backups
- `assets`: Custom icons, images

**Blob Structure**:
```
exports/
  └── {workspaceId}/
      └── {diagramId}/
          ├── diagram-2024-01-25.png
          └── diagram-2024-01-25.svg

imports/
  └── {userId}/
      └── {timestamp}-{filename}.json

backups/
  └── {workspaceId}/
      └── backup-{timestamp}.json
```

**SAS Tokens**:
- Time-limited access tokens for exports
- User-specific containers for imports

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│  Azure Static Web Apps (React SPA)                                  │
│                                                                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │
│  │  UI Layer  │  │  Editor    │  │  Canvas    │  │  State     │   │
│  │            │  │  Layer     │  │  Layer     │  │ (Zustand)  │   │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘   │
│         │                │                 │             │            │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │              Client Services (IndexedDB + API Calls)            │ │
│  │  - IndexedDB: Offline cache, draft storage                      │ │
│  │  - API Client: Azure Functions calls                            │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                   │ HTTPS
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     AZURE PLATFORM LAYER                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │          Azure Static Web Apps (Managed Functions)           │    │
│  │  - Built-in Authentication (Azure AD)                         │    │
│  │  - Reverse Proxy to Functions                                 │    │
│  │  - Routes: /api/* → Azure Functions                          │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                   │                                 │
│                                   ▼                                 │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              Azure Functions (Python Runtime)                │    │
│  │                                                               │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │    │
│  │  │   Auth      │  │   Diagram   │  │  Workspace  │         │    │
│  │  │ Functions   │  │ Functions   │  │ Functions   │         │    │
│  │  │             │  │             │  │             │         │    │
│  │  │ - login     │  │ - CRUD      │  │ - CRUD      │         │    │
│  │  │ - validate  │  │ - query     │  │ - share     │         │    │
│  │  │ - roles     │  │ - version   │  │ - members   │         │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │    │
│  │                                                               │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │    │
│  │  │  Template   │  │   Export    │  │   Import    │         │    │
│  │  │ Functions   │  │ Functions   │  │ Functions   │         │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                   │                                 │
│                                   ▼                                 │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    AZURE STORAGE                             │    │
│  │                                                               │    │
│  │  ┌──────────────────┐         ┌──────────────────┐          │    │
│  │  │   Azure Cosmos   │         │ Azure Blob       │          │    │
│  │  │       DB         │         │ Storage          │          │    │
│  │  │                  │         │                  │          │    │
│  │  │ - workspaces     │         │ - exports/       │          │    │
│  │  │ - diagrams       │         │ - imports/       │          │    │
│  │  │ - templates      │         │ - backups/       │          │    │
│  │  │ - users          │         │ - assets/        │          │    │
│  │  │ - versions       │         │                  │          │    │
│  │  └──────────────────┘         └──────────────────┘          │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              Azure AD (Entra ID)                             │    │
│  │  - Authentication & Authorization                            │    │
│  │  - Role-based access control                                 │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Data Flow

#### 1. User Login Flow
```
1. User clicks "Sign In" in React app
2. Static Web Apps redirects to Azure AD login
3. User authenticates with Azure AD
4. Azure AD redirects back with JWT token
5. Static Web Apps injects user info into request headers:
   - x-ms-client-principal: User info (JSON)
   - x-ms-client-principal-id: User ID
   - x-ms-client-principal-name: Username
6. React app reads user info from /__auth endpoint
7. All API calls include these headers automatically
8. Azure Functions validate headers on every request
```

#### 2. Diagram Save Flow
```
1. User edits diagram in React app
2. Changes saved to IndexedDB (immediate, offline backup)
3. Debounced API call to Azure Functions (2 seconds)
4. Azure Function validates token & roles
5. Function updates document in Cosmos DB
6. Function returns success + new version number
7. React app updates local IndexedDB
```

#### 3. Export Flow
```
1. User clicks "Export as PNG"
2. React app renders diagram to canvas
3. html-to-image library generates PNG blob
4. File uploaded to Azure Blob Storage (exports container)
5. Azure Function generates SAS token (1 hour expiry)
6. User downloads file via signed URL
```

---

### Application Layer Architecture

#### Frontend Structure (React)
```
src/
├── components/          # React components
│   ├── diagram/        # Diagram-specific components
│   │   ├── Canvas.tsx          # React Flow canvas
│   │   ├── CustomNode.tsx      # HTML container node
│   │   ├── CustomEdge.tsx      # Custom connections
│   │   └── MiniMap.tsx         # Navigation mini-map
│   ├── editor/          # Editor components
│   │   ├── MonacoEditor.tsx    # Code editor
│   │   ├── PropertiesPanel.tsx # Properties inspector
│   │   └── StyleEditor.tsx     # CSS editor
│   ├── sidebar/         # Sidebar components
│   │   ├── DiagramTree.tsx     # Hierarchy tree
│   │   └── TemplateLibrary.tsx # Template palette
│   └── common/          # Shared components
│       ├── Header.tsx
│       ├── ThemeToggle.tsx
│       └── UserProfile.tsx
├── hooks/              # Custom React hooks
│   ├── useDiagram.ts           # Diagram operations
│   ├── useEditorSync.ts        # Visual-code sync
│   ├── useTemplate.ts          # Template management
│   ├── useLayout.ts            # Layout algorithms
│   └── useAuth.ts              # Authentication state
├── store/              # Zustand stores
│   ├── diagramStore.ts         # Diagram state
│   ├── uiStore.ts              # UI state
│   ├── editorStore.ts          # Editor state
│   └── authStore.ts            # Auth state
├── services/           # Business logic
│   ├── layout.ts               # Layout algorithms
│   ├── export.ts               # Export functions
│   ├── import.ts               # Import functions
│   ├── validation.ts           # Validation logic
│   ├── api/                    # API client
│   │   ├── diagrams.ts         # Diagram API calls
│   │   ├── workspaces.ts        # Workspace API calls
│   │   ├── templates.ts        # Template API calls
│   │   └── auth.ts             # Auth API calls
│   └── storage/                # IndexedDB
│       ├── db.ts               # Dexie database setup
│       ├── diagrams.ts         # Diagram storage
│       └── sync.ts             # Offline sync
├── utils/              # Helper functions
│   ├── css.ts                  # CSS utilities
│   ├── dom.ts                  # DOM manipulation
│   └── file.ts                 # File operations
├── types/              # TypeScript types
│   ├── diagram.ts
│   ├── node.ts
│   ├── edge.ts
│   └── template.ts
├── styles/             # Global styles
│   ├── themes/
│   │   ├── light.css
│   │   └── dark.css
│   └── global.css
├── App.tsx
└── main.tsx
```

#### Backend Structure (Azure Functions - Python)
```
api/
├── function_app.py           # Azure Functions configuration
├── host.json                 # Azure Functions host settings
├── local.settings.json       # Local development settings
├── requirements.txt          # Python dependencies
├── model/                    # Pydantic models (data validation)
│   ├── __init__.py
│   ├── diagram.py            # Diagram models
│   ├── workspace.py          # Workspace models
│   ├── template.py           # Template models
│   └── user.py               # User models
├── functions/                # Azure Functions
│   ├── __init__.py
│   ├── auth_middleware.py    # JWT validation & role checking
│   ├── diagrams/             # Diagram endpoints
│   │   ├── __init__.py
│   │   ├── __init__.pyi      # Function blueprints
│   │   ├── crud.py           # Create, Read, Update, Delete
│   │   ├── query.py          # List, filter, search
│   │   └── version.py        # Version history
│   ├── workspaces/           # Workspace endpoints
│   │   ├── __init__.py
│   │   ├── crud.py
│   │   ├── members.py        # Member management
│   │   └── share.py          # Sharing links
│   ├── templates/            # Template endpoints
│   │   ├── __init__.py
│   │   ├── crud.py
│   │   └── library.py        # Public template library
│   ├── export/               # Export endpoints
│   │   ├── __init__.py
│   │   ├── png.py
│   │   ├── svg.py
│   │   └── json.py
│   ├── import/               # Import endpoints
│   │   ├── __init__.py
│   │   └── file.py
│   └── health/               # Health check
│       ├── __init__.py
│       └── status.py
├── db/                      # Database operations
│   ├── __init__.py
│   ├── cosmos.py             # Cosmos DB client
│   ├── blob.py               # Blob Storage client
│   ├── repositories/         # Repository pattern
│   │   ├── diagram_repository.py
│   │   ├── workspace_repository.py
│   │   └── template_repository.py
│   └── migrations/           # Database migrations (if needed)
├── services/                 # Business logic
│   ├── __init__.py
│   ├── auth_service.py       # Azure AD validation
│   ├── validation_service.py # Schema validation
│   ├── export_service.py     # Export logic
│   ├── import_service.py     # Import logic
│   └── version_service.py    # Version management
├── utils/                    # Utilities
│   ├── __init__.py
│   ├── config.py             # Configuration (env vars)
│   ├── decorators.py         # Function decorators
│   ├── errors.py             # Error handlers
│   └── logging.py            # Logging setup
└── tests/                    # Tests
    ├── unit/
    └── integration/
```

---

## System Components

### 1. Canvas Component

**Responsibility**: Render diagram using React Flow

**Key Features**:
- Zoom and pan
- Node selection
- Connection creation
- Background patterns
- Minimap

**Technical Details**:
```typescript
interface CanvasProps {
  diagram: Diagram;
  onNodeClick: (node: Node) => void;
  onSelectionChange: (nodes: Node[], edges: Edge[]) => void;
}
```

---

### 2. Custom Node Component

**Responsibility**: Render customizable HTML node

**Key Features**:
- Render HTML content safely
- Apply custom CSS via id/class
- Resize handles
- Connection points

**Technical Details**:
```typescript
interface CustomNodeProps {
  id: string;
  data: {
    label: string;
    htmlContent: string;
    cssClass?: string;
    style?: Record<string, any>;
  };
  selected: boolean;
}
```

**Security**: Sanitize HTML using DOMPurify

---

### 3. Code Editor Component

**Responsibility**: Provide code-based diagram editing

**Key Features**:
- Monaco editor integration
- Syntax highlighting
- Validation
- Autocomplete

**Technical Details**:
```typescript
interface CodeEditorProps {
  value: string;
  language: 'json' | 'yaml';
  onChange: (value: string) => void;
  errors: ValidationError[];
}
```

---

### 4. Layout Engine

**Responsibility**: Calculate node positions automatically

**Key Features**:
- Dagre hierarchical layout
- ELK layout algorithms
- Configurable parameters

**Technical Details**:
```typescript
interface LayoutEngine {
  applyLayout(
    nodes: Node[],
    edges: Edge[],
    options: LayoutOptions
  ): LayoutResult;
}
```

---

### 5. Export Service

**Responsibility**: Export diagrams to various formats and store in Azure Blob

**Key Features**:
- PNG export (html-to-image)
- SVG export (inline SVG)
- JSON/YAML export
- Upload to Azure Blob Storage
- Generate SAS tokens for download

**Technical Details**:
```typescript
interface ExportService {
  exportAsPNG(diagram: Diagram, options: ExportOptions): Promise<string>; // Returns SAS URL
  exportAsSVG(diagram: Diagram): Promise<string>; // Returns SAS URL
  exportAsJSON(diagram: Diagram): string;
  exportAsYAML(diagram: Diagram): string;
}
```

**Backend Integration**:
```python
# Azure Function: api/functions/export/png.py
from azure.functions import HttpRequest, HttpResponse
from azure.storage.blob import BlobServiceClient
import logging

async def main(req: HttpRequest) -> HttpResponse:
    """Generate PNG and upload to Blob Storage"""
    diagram_id = req.route_params.get('id')

    # Generate PNG from diagram data
    png_bytes = await generate_png(diagram_id)

    # Upload to Blob Storage
    blob_client = blob_service_client.get_blob_client(
        container="exports",
        blob=f"{workspace_id}/{diagram_id}/diagram-{timestamp}.png"
    )
    blob_client.upload_blob(png_bytes, overwrite=True)

    # Generate SAS token (1 hour expiry)
    sas_url = generate_sas_token(blob_client, expiry_hours=1)

    return HttpResponse({"downloadUrl": sas_url})
```

---

### 6. Import Service

**Responsibility**: Import diagrams from uploaded files

**Key Features**:
- JSON parsing and validation
- YAML parsing
- Schema validation
- Error handling

**Technical Details**:
```typescript
interface ImportService {
  importFromJSON(file: File): Promise<Diagram>;
  importFromYAML(file: File): Promise<Diagram>;
  importFromBlobStorage(sasUrl: string): Promise<Diagram>;
  validate(data: unknown): ValidationResult;
}
```

---

### 7. Azure Functions Components

#### Authentication Middleware

**File**: `api/functions/auth_middleware.py`

**Responsibility**: Validate Azure AD tokens and extract user info

```python
import azure.functions as func
from functools import wraps

def require_auth(role: str = None):
    """Decorator to require authentication and optionally check role"""
    def decorator(func):
        @wraps(func)
        async def wrapper(req: func.HttpRequest, *args, **kwargs):
            # Get user info from Static Web Apps headers
            client_principal = req.headers.get('x-ms-client-principal')

            if not client_principal:
                return func.HttpResponse(
                    json.dumps({"error": "Unauthorized"}),
                    status_code=401
                )

            user = json.loads(client_principal)

            # Check role if specified
            if role and role not in user.get('user_roles', []):
                return func.HttpResponse(
                    json.dumps({"error": "Forbidden: Insufficient permissions"}),
                    status_code=403
                )

            # Add user to request context
            req.user = user

            return await func(req, *args, **kwargs)
        return wrapper
    return decorator
```

---

#### Diagram Repository

**File**: `api/db/repositories/diagram_repository.py`

**Responsibility**: Database operations for diagrams

```python
from azure.cosmos import CosmosClient
from typing import List, Optional

class DiagramRepository:
    def __init__(self, cosmos_client: CosmosClient):
        self.client = cosmos_client
        self.database = client.get_database_client("architecture-platform")
        self.container = self.database.get_container_client("diagrams")

    async def get_by_id(self, diagram_id: str) -> Optional[dict]:
        """Get diagram by ID"""
        try:
            item = self.container.read_item(item=diagram_id, partition_key=diagram_id)
            return item
        except Exception:
            return None

    async def create(self, diagram: dict) -> dict:
        """Create new diagram"""
        self.container.create_item(body=diagram)
        return diagram

    async def update(self, diagram_id: str, updates: dict) -> dict:
        """Update diagram"""
        self.container.replace_item(item=diagram_id, body=updates)
        return updates

    async def delete(self, diagram_id: str) -> bool:
        """Delete diagram"""
        self.container.delete_item(item=diagram_id, partition_key=diagram_id)
        return True

    async def list_by_workspace(self, workspace_id: str) -> List[dict]:
        """List all diagrams in a workspace"""
        query = f"SELECT * FROM c WHERE c.workspaceId = '{workspace_id}'"
        items = self.container.query_items(query=query, partition_key=workspace_id)
        return list(items)

    async def create_version(self, diagram: dict) -> dict:
        """Create version snapshot"""
        version = {
            "id": f"version-{uuid4()}",
            "diagramId": diagram["id"],
            "version": diagram.get("version", 1) + 1,
            "data": diagram,
            "createdAt": datetime.utcnow().isoformat()
        }

        versions_container = self.database.get_container_client("versions")
        versions_container.create_item(body=version)
        return version
```

---

#### Workspace Repository

**File**: `api/db/repositories/workspace_repository.py`

**Responsibility**: Database operations for workspaces

```python
from azure.cosmos import CosmosClient
from typing import List, Optional

class WorkspaceRepository:
    def __init__(self, cosmos_client: CosmosClient):
        self.client = cosmos_client
        self.database = client.get_database_client("architecture-platform")
        self.container = self.database.get_container_client("workspaces")

    async def get_user_default_workspace(self, user_id: str) -> dict:
        """Get or create user's default workspace"""
        query = f"SELECT * FROM c WHERE c.ownerId = '{user_id}' AND c.isDefault = true"
        items = self.container.query_items(query=query, partition_key=user_id)
        workspaces = list(items)

        if workspaces:
            return workspaces[0]

        # Create default workspace
        workspace = {
            "id": str(uuid4()),
            "name": "My Workspace",
            "ownerId": user_id,
            "isDefault": True,
            "members": [{
                "userId": user_id,
                "role": "admin"
            }],
            "createdAt": datetime.utcnow().isoformat()
        }

        self.container.create_item(body=workspace)
        return workspace

    async def add_member(self, workspace_id: str, user_id: str, role: str) -> dict:
        """Add member to workspace"""
        workspace = await self.get_by_id(workspace_id)
        workspace["members"].append({
            "userId": user_id,
            "role": role
        })
        self.container.replace_item(item=workspace_id, body=workspace)
        return workspace
```

---

### 8. Import Service

**Responsibility**: Import diagrams from files

**Key Features**:
- JSON parsing and validation
- YAML parsing
- Schema validation
- Error handling

**Technical Details**:
```typescript
interface ImportService {
  importFromJSON(json: string): Diagram;
  importFromYAML(yaml: string): Diagram;
  validate(data: unknown): ValidationResult;
}
```

---

### 7. Validation Service

**Responsibility**: Validate diagram data

**Key Features**:
- Schema validation
- Reference integrity
- Business rule validation

**Technical Details**:
```typescript
interface ValidationService {
  validateDiagram(diagram: Diagram): ValidationResult;
  validateNode(node: Node): ValidationResult;
  validateEdge(edge: Edge, nodes: Node[]): ValidationResult;
}
```

---

## Non-Functional Requirements

### Performance

**Requirements**:

1. **Rendering Performance**
   - Diagram with 100 nodes must render within 2 seconds
   - UI actions must respond within 100ms
   - Frame rate: 60fps during interactions

2. **Memory Usage**
   - Maximum 500MB memory usage
   - No memory leaks during extended use
   - Efficient garbage collection

3. **Load Time**
   - Initial application load: < 3 seconds
   - Code splitting for lazy loading
   - Optimized bundle size: < 500KB (gzipped)

**Strategies**:
- React.memo for component optimization
- Virtualization for large node lists
- Web Workers for heavy computations (layout algorithms)
- Lazy loading for code editor and heavy components
- Bundle analysis and optimization

---

### Security

**Requirements**:

1. **XSS Prevention**
   - Sanitize all HTML content using DOMPurify
   - Content Security Policy (CSP) headers
   - No inline event handlers

2. **CSS Injection Prevention**
   - Filter dangerous CSS properties
   - Scope CSS to diagram canvas only
   - Prevent `position: fixed` and similar

3. **Authentication**
   - Azure AD OAuth 2.0 integration
   - JWT token validation
   - Secure token storage (httpOnly cookies)

4. **Authorization**
   - Role-based access control (RBAC)
   - Permission checks on all operations

**Dependencies**:
```json
{
  "dompurify": "^3.0.0",
  "@types/dompurify": "^3.0.0"
}
```

---

### Scalability

**Requirements**:

1. **Diagram Size**
   - Support up to 500 nodes per diagram
   - Support up to 100 diagrams per workspace
   - Efficient rendering for large diagrams

2. **Concurrent Users**
   - Support 100+ concurrent users
   - No performance degradation

3. **Storage**
   - File-based storage in MVP
   - Database backend in Phase 2+ (PostgreSQL)

**Strategies**:
- Pagination for large datasets
- Lazy loading of diagram content
- Efficient data structures (indexed lookups)
- Caching strategies

---

### Reliability

**Requirements**:

1. **Availability**
   - 99.5% uptime target
   - Graceful degradation on errors

2. **Data Integrity**
   - Auto-save every 30 seconds
   - Local storage backup
   - Recovery mechanisms

3. **Error Handling**
   - User-friendly error messages
   - Error logging and monitoring
   - Crash recovery

**Strategies**:
- Try-catch blocks for async operations
- Error boundaries for React components
- Service Worker for offline caching (future)
- Sentry for error tracking

---

### Maintainability

**Requirements**:

1. **Code Quality**
   - TypeScript strict mode
   - ESLint for linting
   - Prettier for formatting
   - Code reviews

2. **Testing**
   - Unit tests (Vitest)
   - Integration tests (Playwright)
   - 80%+ code coverage

3. **Documentation**
   - Code comments
   - API documentation
   - Component documentation (Storybook)

**Dependencies**:
```json
{
  "vitest": "^1.0.0",
  "@playwright/test": "^1.40.0",
  "eslint": "^8.55.0",
  "prettier": "^3.1.0",
  "@typescript-eslint/parser": "^6.15.0"
}
```

---

## Integration Requirements

### Azure AD Integration

**Requirements**:

1. **Authentication Flow**
   - OAuth 2.0 authorization code flow
   - Single Sign-On (SSO)
   - Token refresh

2. **User Information**
   - Name, email, groups
   - Role mapping

3. **Configuration**
   - Azure AD app registration
   - Redirect URI configuration
   - Tenant ID

**Implementation**:
```typescript
// Azure AD configuration
const azureConfig = {
  clientId: process.env.AZURE_CLIENT_ID,
  authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
  redirectUri: window.location.origin,
};
```

---

### Docker Integration

**Requirements**:

1. **Multi-stage Build**
   - Build stage: Vite production build
   - Runtime stage: Nginx to serve static files

2. **Configuration**
   - Environment variables
   - Volume mounts for data persistence
   - Network configuration

**Dockerfile**:
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

### Git Integration (Version Control)

**Requirements**:

1. **Git Operations**
   - Commit changes on diagram save
   - View git history
   - Compare versions

2. **Integration**
   - Isomorphic-git for browser-based git
   - Azure DevOps or GitHub integration

**Dependencies**:
```json
{
  "isomorphic-git": "^1.25.0"
}
```

---

## Deployment Architecture

### Azure Deployment (Serverless)

**Architecture**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    GITHUB REPOSITORY                             │
│  - Source code (React + Python)                                  │
│  - CI/CD via GitHub Actions                                      │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              AZURE STATIC WEB APPS                               │
│                                                                   │
│  Frontend (React SPA)                                            │
│  ├─ Automatic build from GitHub branch                           │
│  ├─ Oryx build system                                            │
│  ├─ Global CDN distribution                                      │
│  ├─ Automatic SSL/TLS certificates                               │
│  └─ Production + Preview environments                            │
│                                                                   │
│  Managed Functions (Python)                                      │
│  ├─ Built from /api folder                                       │
│  ├─ Auto-scales based on demand                                  │
│  ├─ Consumption or Premium plan                                 │
│  └─ Integrated authentication                                    │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ├──────────────────┐
                          ▼                  ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│   AZURE COSMOS DB        │    │   AZURE BLOB STORAGE     │
│                          │    │                          │
│  Containers:             │    │  Containers:             │
│  - workspaces            │    │  - exports/               │
│  - diagrams              │    │  - imports/               │
│  - templates             │    │  - backups/               │
│  - users                 │    │  - assets/                │
│  - versions              │    │                          │
└──────────────────────────┘    └──────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              AZURE AD (ENTRA ID)                                │
│  - Authentication provider                                       │
│  - Role-based access control                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

### Azure Static Web Apps Configuration

**File**: `azure-static-web-apps.yml`

```yaml
name: custom-architecture-platform
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true

      - name: Build And Deploy
        id: azuredeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"      # React app source
          api_location: "api"     # Azure Functions source
          output_location: "dist" # Vite build output
          config_file_location: "/" # Custom config if needed
```

---

### Local Development Setup

**Prerequisites**:
- Node.js 20+ (for frontend)
- Python 3.11+ (for backend)
- Azure Functions Core Tools v4
- Azure CLI (for local Azure emulation)

**Frontend Dev Server**:
```bash
cd custom-architecture-platform
npm install
npm run dev  # Runs on localhost:3000
```

**Backend Local Development**:
```bash
cd api
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
func start  # Starts Azure Functions runtime on localhost:7071
```

**Combined Local Development**:
```bash
# Terminal 1: Backend
cd api && func start

# Terminal 2: Frontend
cd frontend && npm run dev
```

---

### Production Build

**Frontend (Vite)**:

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,  # For debugging
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'diagram-vendor': ['reactflow'],
          'editor-vendor': ['@monaco-editor/react'],
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
```

**Backend (Azure Functions)**:

```python
# api/function_app.py
import azure.functions as func
from azure.functions.extension import integrate

app = func.FunctionApp()

# Auth configuration
@app.route(auth_level=func.AuthLevel.ANONYMOUS)
def get_user_info(req: func.HttpRequest) -> func.HttpResponse:
    """Get current user info from Static Web Apps headers"""
    client_principal = req.headers.get('x-ms-client-principal')
    if client_principal:
        user = json.loads(client_principal)
        return func.HttpResponse(
            json.dumps({"user": user}),
            mimetype="application/json"
        )
    return func.HttpResponse(
        json.dumps({"user": None}),
        mimetype="application/json"
    )
```

---

### Environment Variables

**Frontend** (.env.production):
```bash
VITE_API_BASE_URL=/api
VITE_AZURE_AD_CLIENT_ID=your-client-id
VITE_AZURE_AD_TENANT_ID=your-tenant-id
VITE_APP_INSIGHTS_KEY=your-appinsights-key
```

**Backend** (Azure Functions Configuration):

| Setting | Value | Description |
|---------|-------|-------------|
| AzureWebJobsStorage | <auto-generated> | Storage account for Functions |
| FUNCTIONS_EXTENSION_VERSION | ~4 | Azure Functions v4 |
| FUNCTIONS_WORKER_RUNTIME | python | Python runtime |
| CosmosDBConnection | <connection-string> | Cosmos DB connection |
| BlobStorageConnection | <connection-string> | Blob Storage connection |
| AzureWebJobsStorage | <connection-string> | Azure Storage account |

---

### Azure Resources Setup

**Terraform/Bicep Scripts** (for provisioning):

```bicep
// main.bicep
param location string = resourceGroup().location
param appName string = 'arch-platform-${uniqueString(resourceGroup().id)}'

// Cosmos DB
resource cosmosDb 'Microsoft.Document/dbAccounts@2023-04-15' = {
  name: '${appName}-db'
  location: location
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    locations: [
      {
        locationName: location
        failoverPriority: 0
      }
    ]
  }
}

// Blob Storage
resource storage 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: '${appName}storage'
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
}

// Static Web App
resource staticWebApp 'Microsoft.Web/staticSites@2022-03-01' = {
  name: appName
  location: location
  properties: {
    branch: 'main'
    repositoryUrl: 'https://github.com/yourusername/custom-architecture-platform'
    repositoryToken: repositoryToken
  }
}

output staticWebAppUrl string = staticWebApp.properties.defaultHostname
```

---

## Development Standards

### Code Style

**TypeScript Configuration**:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

### ESLint Configuration

```javascript
// .eslintrc.cjs
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': 'warn',
  },
};
```

---

### Git Workflow

**Branch Strategy**:
- `main`: Production-ready code
- `develop`: Development branch
- `feature/*`: Feature branches
- `bugfix/*`: Bug fix branches
- `hotfix/*`: Emergency fixes

**Commit Message Format**:
```
type(scope): subject

body

footer
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:
```
feat(diagram): add custom node template system

Implement template creation and application for nodes.
Templates include HTML content and CSS styling.

Closes #123
```

---

### Testing Strategy

**Unit Tests (Vitest)**:
- Test business logic
- Test utilities and services
- Test hooks
- Target: 80%+ coverage

**Integration Tests (Playwright)**:
- Test user flows
- Test component interactions
- Test import/export
- Cross-browser testing

**Example Test**:

```typescript
// Example: Layout Engine Test
import { describe, it, expect } from 'vitest';
import { applyLayout } from '../services/layout';

describe('Layout Engine', () => {
  it('should apply hierarchical layout', () => {
    const nodes = [
      { id: '1', position: { x: 0, y: 0 }, data: {} },
      { id: '2', position: { x: 0, y: 0 }, data: {} },
    ];
    const edges = [{ id: 'e1-2', source: '1', target: '2' }];

    const result = applyLayout(nodes, edges, { type: 'hierarchical' });

    expect(result.nodes[0].position.x).toBeLessThan(result.nodes[1].position.x);
  });
});
```

---

### Documentation Standards

**Code Comments**:
```typescript
/**
 * Applies automatic layout to a diagram
 *
 * @param nodes - Array of nodes to layout
 * @param edges - Array of edges connecting nodes
 * @param options - Layout configuration options
 * @returns Layout result with new node positions
 *
 * @example
 * ```ts
 * const result = applyLayout(nodes, edges, {
 *   type: 'hierarchical',
 *   direction: 'TB'
 * });
 * ```
 */
export function applyLayout(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions
): LayoutResult {
  // Implementation
}
```

---

## Monitoring & Logging

### Error Tracking

**Sentry Integration**:
```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

---

### Performance Monitoring

**Web Vitals**:
```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

---

## Summary

This technical specification provides a comprehensive foundation for building the Custom Architecture Platform. Key decisions:

- **Frontend**: Vite + React + TypeScript for type safety and developer experience
- **Diagram Rendering**: React Flow for custom node components and interactivity
- **State Management**: Zustand for simplicity and performance
- **Authentication**: Azure AD for enterprise integration
- **Deployment**: Docker for consistency and scalability

All technical decisions prioritize developer experience, performance, and maintainability.

---

**End of Technical Requirements Specification v1.0**
