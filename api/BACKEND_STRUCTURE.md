# Backend Structure Quick Reference

## Folder Structure

```
api/
├── function_app.py              # Main Azure Functions entry point (from Starter Kit)
├── host.json                    # Azure Functions host configuration
├── local.settings.json          # Local development settings
├── requirements.txt             # Python dependencies
├── README.md                    # Detailed documentation
│
├── model/                       # Pydantic Data Models
│   ├── __init__.py             # Exports all models
│   ├── diagram.py              # Diagram, Node, Edge, DiagramCreate, DiagramUpdate
│   ├── workspace.py            # Workspace, WorkspaceCreate, WorkspaceUpdate
│   ├── template.py             # Template, TemplateCreate, TemplateUpdate
│   └── user.py                 # User, UserCreate, UserUpdate
│
├── db/                          # Database Layer
│   ├── __init__.py             # Exports CosmosDBClient
│   └── cosmos.py               # Cosmos DB client wrapper with CRUD operations
│
├── utils/                       # Utility Functions
│   ├── __init__.py             # Exports all utilities
│   ├── config.py               # Configuration management (Key Vault, env vars)
│   ├── errors.py               # Custom exceptions (APIError, NotFoundError, etc.)
│   ├── auth.py                 # Authentication helpers (get_user_id_from_headers)
│   └── sanitize.py             # Input sanitization (sanitize_html, sanitize_css)
│
└── functions/                   # Azure Function Endpoints
    ├── diagrams/
    │   └── __init__.py         # Diagram CRUD: create, get, update, delete, list
    └── workspaces/
        └── __init__.py         # Workspace CRUD: create, get, update, delete, list
```

## Key Components

### 1. Pydantic Models (`model/`)

**diagram.py**
- `DiagramType`: Enum for diagram types (system-context, container, component, code, generic)
- `Position`: Node position (x, y coordinates)
- `NodeData`: Node label, HTML content, CSS class, icon, dimensions
- `Node`: Complete node with position and data
- `EdgeData`: Edge label, technology, description
- `Edge`: Complete edge with source, target, type
- `DiagramMetadata`: Version, timestamps, created/modified by
- `Diagram`: Full diagram with nodes, edges, CSS
- `DiagramCreate`: Request model for creating diagrams
- `DiagramUpdate`: Request model for updating diagrams (partial)

**workspace.py**
- `Workspace`: Workspace with owner, timestamps
- `WorkspaceCreate`: Create request
- `WorkspaceUpdate`: Update request (partial)

**template.py**
- `Template`: Reusable node/diagram templates
- `TemplateCreate`: Create request
- `TemplateUpdate`: Update request (partial)

**user.py**
- `UserRole`: Enum (admin, editor, viewer)
- `User`: User account with role, preferences
- `UserCreate`: Create request
- `UserUpdate`: Update request (partial)

### 2. Database Layer (`db/cosmos.py`)

**CosmosDBClient Class**

**Properties:**
- `diagrams`: Diagrams container (partition key: /workspaceId)
- `workspaces`: Workspaces container (partition key: /ownerId)
- `templates`: Templates container (partition key: /ownerId)
- `users`: Users container (partition key: /id)

**Diagram Methods:**
- `get_diagram(diagram_id, workspace_id)`: Get single diagram
- `create_diagram(diagram, workspace_id)`: Create new diagram
- `update_diagram(diagram_id, workspace_id, updates)`: Partial update
- `delete_diagram(diagram_id, workspace_id)`: Delete diagram
- `list_diagrams(workspace_id)`: List all diagrams in workspace

**Workspace Methods:**
- `get_workspace(workspace_id, owner_id)`: Get single workspace
- `create_workspace(workspace, owner_id)`: Create new workspace
- `update_workspace(workspace_id, owner_id, updates)`: Partial update
- `delete_workspace(workspace_id, owner_id)`: Delete workspace
- `list_workspaces(owner_id)`: List all user's workspaces

**Template Methods:**
- `get_template(template_id, owner_id)`: Get single template
- `create_template(template, owner_id)`: Create new template
- `list_templates(owner_id, include_public)`: List templates

**User Methods:**
- `get_user(user_id)`: Get single user
- `create_user(user)`: Create new user
- `update_user(user_id, updates)`: Partial update

### 3. Utilities (`utils/`)

**config.py**
- `get_config()`: Load configuration from environment
- `get_secret(secret_name_kv, secret_name_env)`: Get secret from env or Key Vault
- `get_cosmos_client()`: Create Cosmos DB client
- `get_blob_client()`: Create Blob Storage client

**errors.py**
- `APIError`: Base error with status code
- `NotFoundError`: 404
- `ValidationError`: 400
- `UnauthorizedError`: 401
- `ForbiddenError`: 403
- `ConflictError`: 409
- `RateLimitError`: 429

**auth.py**
- `get_user_id_from_headers(request)`: Extract user ID from Azure AD headers
- `get_user_email_from_headers(request)`: Extract user email
- `get_user_display_name(request)`: Extract display name
- `check_auth(request)`: Get user ID and email

**sanitize.py**
- `sanitize_html(html)`: Remove dangerous HTML tags/attributes
- `sanitize_css(css)`: Validate CSS for injection attacks
- `validate_node_id(node_id)`: Validate node ID format
- `validate_edge_references(source, target, valid_ids)`: Check edge references
- `sanitize_string(input_str, max_length)`: Sanitize string input

### 4. Function Endpoints (`functions/`)

**diagrams/__init__.py**

Routes:
- `POST /api/diagrams`: Create diagram
- `GET /api/diagrams/{diagram_id}?workspaceId={id}`: Get diagram
- `PUT /api/diagrams/{diagram_id}?workspaceId={id}`: Update diagram
- `DELETE /api/diagrams/{diagram_id}?workspaceId={id}`: Delete diagram
- `GET /api/workspaces/{workspace_id}/diagrams`: List diagrams

**workspaces/__init__.py**

Routes:
- `POST /api/workspaces`: Create workspace
- `GET /api/workspaces/{workspace_id}`: Get workspace
- `PUT /api/workspaces/{workspace_id}`: Update workspace
- `DELETE /api/workspaces/{workspace_id}`: Delete workspace
- `GET /api/workspaces`: List user's workspaces

## Data Flow

### Create Diagram Flow

1. Client sends POST request to `/api/diagrams`
2. Function extracts user ID from auth headers
3. Request body validated with `DiagramCreate` Pydantic model
4. Cosmos DB client creates diagram (auto-generates ID, timestamps)
5. Response with created diagram (201) and Location header

### Get Diagram Flow

1. Client sends GET request to `/api/diagrams/{id}?workspaceId={id}`
2. Function extracts user ID from auth headers
3. Cosmos DB client fetches diagram by ID with partition key
4. Response with diagram data (200) or 404 if not found

### Error Handling Flow

1. Any exception caught in endpoint
2. Specific error types return appropriate status codes:
   - `ValidationError` → 400
   - `NotFoundError` → 404
   - `APIError` → Custom status code
3. Generic exceptions → 500 Internal Server Error
4. All errors return JSON with error message

## Security Features

1. **Authentication**: Azure AD headers (`x-ms-client-principal-id`)
2. **Authorization**: Partition keys ensure user ownership
3. **Input Validation**: Pydantic models with strict validation
4. **XSS Prevention**: HTML sanitization in `sanitize_html()`
5. **CSS Injection**: CSS validation in `sanitize_css()`
6. **SQL Injection**: Parameterized Cosmos DB queries

## Dependencies

```
azure-functions           # Azure Functions framework
azure-identity            # Azure authentication
azure-keyvault-secrets    # Key Vault integration
azure-cosmos              # Cosmos DB SDK
azure-storage-blob        # Blob Storage SDK
pydantic==2.5.0           # Data validation
python-multipart==0.0.6   # Multipart form data
requests                  # HTTP requests
python-dotenv             # Environment variables
```

## Next Steps for Development

1. **Add Template Endpoints**: Implement template CRUD in `functions/templates/`
2. **Add Export Endpoints**: Implement PNG/SVG export to Blob Storage
3. **Add Validation Middleware**: Centralize validation logic
4. **Add Rate Limiting**: Implement rate limiting per user
5. **Add Logging**: Enhance logging with Application Insights
6. **Add Unit Tests**: Write tests for models, services, endpoints
7. **Add API Documentation**: Integrate Swagger/OpenAPI

## Testing Checklist

- [ ] Test health endpoint
- [ ] Test diagram CRUD operations
- [ ] Test workspace CRUD operations
- [ ] Test authentication/authorization
- [ ] Test input validation
- [ ] Test error handling
- [ ] Test sanitization functions
- [ ] Test Cosmos DB operations
- [ ] Load testing for performance
- [ ] Security testing (XSS, injection)
