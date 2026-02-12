# Custom Architecture Platform - Backend API

Azure Functions (Python) backend for the Custom Architecture Platform.

## Overview

This backend provides REST API endpoints for managing architecture diagrams, workspaces, templates, and users. It uses Azure Cosmos DB for data persistence and Azure Blob Storage for file exports.

## Tech Stack

- **Runtime**: Python 3.11+
- **Framework**: Azure Functions v2
- **Database**: Azure Cosmos DB (SQL API)
- **Storage**: Azure Blob Storage
- **Validation**: Pydantic 2.5.0
- **Authentication**: Azure AD (via Static Web Apps headers)

## Project Structure

```
api/
├── function_app.py          # Main Azure Functions app (from Starter Kit)
├── host.json                # Azure Functions host configuration
├── local.settings.json      # Local development settings
├── requirements.txt         # Python dependencies
│
├── model/                   # Pydantic data models
│   ├── __init__.py
│   ├── diagram.py          # Diagram, Node, Edge models
│   ├── workspace.py        # Workspace models
│   ├── template.py         # Template models
│   └── user.py             # User models
│
├── functions/              # Azure Function endpoints
│   ├── diagrams/
│   │   └── __init__.py     # Diagram CRUD endpoints
│   └── workspaces/
│       └── __init__.py     # Workspace CRUD endpoints
│
├── db/                     # Database operations
│   ├── __init__.py
│   └── cosmos.py           # Cosmos DB client wrapper
│
└── utils/                  # Utilities
    ├── __init__.py
    ├── config.py           # Configuration management
    ├── errors.py           # Custom exceptions
    ├── auth.py             # Authentication helpers
    └── sanitize.py         # Input sanitization
```

## Getting Started

### Prerequisites

1. **Azure Functions Core Tools** v4+
   ```bash
   npm install -g azure-functions-core-tools@4 --unsafe-perm
   ```

2. **Python 3.11+**
   ```bash
   python --version
   ```

3. **Azure Resources** (see Infrastructure section below)

### Local Development

1. **Install dependencies**:
   ```bash
   cd api
   pip install -r requirements.txt
   ```

2. **Configure local settings**:
   Edit `local.settings.json`:
   ```json
   {
     "IsEncrypted": false,
     "Values": {
       "AzureWebJobsStorage": "UseDevelopmentStorage=true",
       "FUNCTIONS_WORKER_RUNTIME": "python",
       "KEY_VAULT_NAME": "your-keyvault-name",
       "COSMOS_CONNECTION_STRING": "your-cosmos-connection-string",
       "DATABASE_NAME": "architecture-platform"
     }
   }
   ```

3. **Start Azure Functions**:
   ```bash
   func start
   ```

   The API will be available at `http://localhost:7071`

## API Endpoints

### Health Check

- **GET** `/api/health`
  - Checks health of all Azure services
  - Returns: Service status dictionary

- **GET** `/api/test_endpoint`
  - Test endpoint for connectivity
  - Returns: Current time

### Diagrams

- **POST** `/api/diagrams`
  - Create a new diagram
  - Body: `DiagramCreate` model
  - Returns: Created diagram (201)

- **GET** `/api/diagrams/{diagram_id}?workspaceId={workspace_id}`
  - Get a diagram by ID
  - Returns: Diagram data (200)

- **PUT** `/api/diagrams/{diagram_id}?workspaceId={workspace_id}`
  - Update a diagram
  - Body: `DiagramUpdate` model
  - Returns: Updated diagram (200)

- **DELETE** `/api/diagrams/{diagram_id}?workspaceId={workspace_id}`
  - Delete a diagram
  - Returns: 204 No Content

- **GET** `/api/workspaces/{workspace_id}/diagrams`
  - List all diagrams in a workspace
  - Returns: List of diagrams (200)

### Workspaces

- **POST** `/api/workspaces`
  - Create a new workspace
  - Body: `WorkspaceCreate` model
  - Returns: Created workspace (201)

- **GET** `/api/workspaces/{workspace_id}`
  - Get a workspace by ID
  - Returns: Workspace data (200)

- **PUT** `/api/workspaces/{workspace_id}`
  - Update a workspace
  - Body: `WorkspaceUpdate` model
  - Returns: Updated workspace (200)

- **DELETE** `/api/workspaces/{workspace_id}`
  - Delete a workspace
  - Returns: 204 No Content

- **GET** `/api/workspaces`
  - List all workspaces for current user
  - Returns: List of workspaces (200)

## Data Models

### Diagram

```python
{
  "id": "string",                    # Auto-generated UUID
  "name": "string",                  # 1-200 characters
  "type": "system-context" | "container" | "component" | "generic",
  "nodes": [
    {
      "id": "string",                # Unique within diagram
      "position": {"x": 0, "y": 0},
      "data": {
        "label": "string",
        "htmlContent": "string",     # Sanitized HTML
        "cssClass": "string",
        "icon": "string",
        "width": 200,
        "height": 100
      },
      "type": "string",
      "className": "string"
    }
  ],
  "edges": [
    {
      "id": "string",                # Unique within diagram
      "source": "node-id",
      "target": "node-id",
      "type": "string",
      "label": "string",
      "animated": false
    }
  ],
  "customCSS": "string",             # Sanitized CSS
  "workspaceId": "string",
  "parentId": "string",              # Parent diagram for drill-down
  "description": "string"
}
```

### Workspace

```python
{
  "id": "string",                    # Auto-generated UUID
  "name": "string",                  # 1-200 characters
  "description": "string",
  "ownerId": "string",               # User ID from Azure AD
  "createdAt": "ISO-8601 datetime",
  "updatedAt": "ISO-8601 datetime",
  "settings": {}
}
```

## Authentication

The API uses Azure AD authentication via Azure Static Web Apps headers:

- `x-ms-client-principal-id`: User's Azure AD object ID
- `x-ms-client-principal-name`: User's email/username

### Example Headers

```http
GET /api/diagrams
x-ms-client-principal-id: abc12345-6789-0abc-def1-234567890abc
x-ms-client-principal-name: user@example.com
```

All endpoints require authentication except `/api/health` and `/api/test_endpoint`.

## Security

### Input Sanitization

All user input is sanitized to prevent security vulnerabilities:

- **XSS Prevention**: HTML content is sanitized using `sanitize_html()`
- **CSS Injection**: CSS is validated for dangerous patterns
- **Input Validation**: Pydantic models enforce strict validation
- **SQL Injection**: Parameterized Cosmos DB queries

### Authorization

- **User Ownership**: All queries use partition keys (userId/workspaceId) to ensure users can only access their own data
- **Role-Based Access**: User roles (admin, editor, viewer) for future RBAC implementation

## Database Schema

### Cosmos DB Containers

1. **diagrams**
   - Partition Key: `/workspaceId`
   - Used for storing diagram data

2. **workspaces**
   - Partition Key: `/ownerId`
   - Used for storing workspace data

3. **templates**
   - Partition Key: `/ownerId`
   - Used for storing reusable templates

4. **users**
   - Partition Key: `/id`
   - Used for storing user preferences and roles

## Error Handling

All errors return JSON responses:

```json
{
  "error": "Human-readable error message",
  "details": {
    "field": "Specific error details"
  }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `KEY_VAULT_NAME` | Azure Key Vault name | Yes |
| `COSMOS_CONNECTION_STRING` | Cosmos DB connection string | Yes |
| `AzureWebJobsStorage` | Storage account connection string | Yes |
| `DATABASE_NAME` | Cosmos DB database name | No (default: architecture-platform) |

### Key Vault Secrets

The following secrets should be stored in Azure Key Vault:

- `COSMOS-CONNECTION-STRING`: Cosmos DB connection string
- `STORAGE-CONNECTION-STRING`: Blob Storage connection string

## Deployment

### Azure Functions Deployment

1. **Build the Functions**:
   ```bash
   func azure functionapp publish your-function-app-name
   ```

2. **Configure Application Settings**:
   - Set `COSMOS_CONNECTION_STRING`
   - Set `AzureWebJobsStorage`
   - Set `KEY_VAULT_NAME`

3. **Enable Managed Identity**:
   - System-assigned managed identity
   - Grant access to Key Vault (Get/List secrets)
   - Grant access to Cosmos DB (Contributor)
   - Grant access to Blob Storage (Blob Data Contributor)

## Testing

### Local Testing with curl

```bash
# Health check
curl http://localhost:7071/api/health

# Create workspace (with auth headers)
curl -X POST http://localhost:7071/api/workspaces \
  -H "Content-Type: application/json" \
  -H "x-ms-client-principal-id: test-user-id" \
  -d '{"name": "My Workspace", "description": "Test workspace"}'

# Create diagram
curl -X POST http://localhost:7071/api/diagrams \
  -H "Content-Type: application/json" \
  -H "x-ms-client-principal-id: test-user-id" \
  -d '{
    "name": "System Context",
    "type": "system-context",
    "workspaceId": "workspace-123",
    "nodes": [],
    "edges": []
  }'
```

## Dependencies

See `requirements.txt`:

```
azure-functions
azure-identity
azure-keyvault-secrets
azure-cosmos
azure-storage-blob
pydantic==2.5.0
python-multipart==0.0.6
requests
python-dotenv
```

## Troubleshooting

### Common Issues

1. **Import Error: No module named 'pydantic'**
   ```bash
   pip install -r requirements.txt
   ```

2. **Cosmos DB Connection Failed**
   - Check `COSMOS_CONNECTION_STRING` in local.settings.json
   - Verify Key Vault secret exists

3. **Authentication Headers Missing**
   - Ensure `x-ms-client-principal-id` header is sent
   - Check Azure Static Web Apps auth configuration

## Next Steps

1. **Add Template Endpoints**: Implement CRUD for templates
2. **Add Export Endpoints**: PNG/SVG export via Blob Storage
3. **Add Version History**: Track diagram changes
4. **Implement RBAC**: Enforce role-based permissions
5. **Add Rate Limiting**: Prevent API abuse

## Related Documentation

- [Azure Functions Python Documentation](https://docs.microsoft.com/azure/azure-functions/functions-reference-python)
- [Cosmos DB Python SDK](https://docs.microsoft.com/azure/cosmos-db/sql/sql-api-sdk-python)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [Project Documentation](../../docs/)
