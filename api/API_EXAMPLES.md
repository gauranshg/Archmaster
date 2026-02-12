# API Usage Examples

Examples for testing the Custom Architecture Platform backend API.

## Base URL

Local Development:
```
http://localhost:7071/api
```

Production:
```
https://your-function-app.azurewebsites.net/api
```

## Authentication Headers

All endpoints (except health) require Azure AD authentication:

```http
x-ms-client-principal-id: 12345678-1234-1234-1234-123456789012
x-ms-client-principal-name: user@example.com
```

## Endpoints

### 1. Health Check

```bash
curl http://localhost:7071/api/health
```

Response (200):
```json
{
  "key_vault_status": "Healthy",
  "cosmos_db_status": "Healthy",
  "azure_storage_status": "Healthy"
}
```

### 2. Create Workspace

```bash
curl -X POST http://localhost:7071/api/workspaces \
  -H "Content-Type: application/json" \
  -H "x-ms-client-principal-id: 12345678-1234-1234-1234-123456789012" \
  -d '{
    "name": "My Architecture Workspace",
    "description": "Software architecture diagrams for my project"
  }'
```

Response (201):
```json
{
  "id": "workspace-abc123",
  "name": "My Architecture Workspace",
  "description": "Software architecture diagrams for my project",
  "ownerId": "12345678-1234-1234-1234-123456789012",
  "createdAt": "2024-01-26T10:30:00.000000",
  "updatedAt": "2024-01-26T10:30:00.000000",
  "settings": {}
}
```

### 3. List Workspaces

```bash
curl http://localhost:7071/api/workspaces \
  -H "x-ms-client-principal-id: 12345678-1234-1234-1234-123456789012"
```

Response (200):
```json
[
  {
    "id": "workspace-abc123",
    "name": "My Architecture Workspace",
    "description": "Software architecture diagrams for my project",
    "ownerId": "12345678-1234-1234-1234-123456789012",
    "createdAt": "2024-01-26T10:30:00.000000",
    "updatedAt": "2024-01-26T10:30:00.000000"
  }
]
```

### 4. Create Diagram (System Context)

```bash
curl -X POST http://localhost:7071/api/diagrams \
  -H "Content-Type: application/json" \
  -H "x-ms-client-principal-id: 12345678-1234-1234-1234-123456789012" \
  -d '{
    "name": "E-Commerce System Context",
    "type": "system-context",
    "workspaceId": "workspace-abc123",
    "description": "High-level system context diagram",
    "nodes": [
      {
        "id": "user",
        "position": {"x": 100, "y": 100},
        "data": {
          "label": "User",
          "htmlContent": "<div>User</div>",
          "cssClass": "person-node"
        }
      },
      {
        "id": "ecommerce-system",
        "position": {"x": 400, "y": 100},
        "data": {
          "label": "E-Commerce System",
          "htmlContent": "<div>E-Commerce System</div>",
          "cssClass": "system-node"
        }
      },
      {
        "id": "payment-gateway",
        "position": {"x": 400, "y": 300},
        "data": {
          "label": "Payment Gateway",
          "htmlContent": "<div>Payment Gateway</div>",
          "cssClass": "external-system-node"
        }
      }
    ],
    "edges": [
      {
        "id": "edge-1",
        "source": "user",
        "target": "ecommerce-system",
        "label": "Uses",
        "data": {
          "label": "Uses",
          "description": "Users browse and purchase products"
        }
      },
      {
        "id": "edge-2",
        "source": "ecommerce-system",
        "target": "payment-gateway",
        "label": "Processes Payments",
        "data": {
          "label": "Processes Payments"
        }
      }
    ],
    "customCSS": ".person-node { background: #e1f5fe; }"
  }'
```

Response (201):
```json
{
  "id": "diagram-xyz789",
  "name": "E-Commerce System Context",
  "type": "system-context",
  "workspaceId": "workspace-abc123",
  "nodes": [...],
  "edges": [...],
  "customCSS": ".person-node { background: #e1f5fe; }",
  "parentId": null,
  "description": "High-level system context diagram",
  "metadata": {
    "version": 1,
    "createdAt": "2024-01-26T10:35:00.000000",
    "updatedAt": "2024-01-26T10:35:00.000000"
  }
}
```

### 5. Get Diagram

```bash
curl "http://localhost:7071/api/diagrams/diagram-xyz789?workspaceId=workspace-abc123" \
  -H "x-ms-client-principal-id: 12345678-1234-1234-1234-123456789012"
```

Response (200):
```json
{
  "id": "diagram-xyz789",
  "name": "E-Commerce System Context",
  "type": "system-context",
  "workspaceId": "workspace-abc123",
  "nodes": [...],
  "edges": [...],
  "customCSS": ".person-node { background: #e1f5fe; }",
  "metadata": {
    "version": 1,
    "createdAt": "2024-01-26T10:35:00.000000",
    "updatedAt": "2024-01-26T10:35:00.000000"
  }
}
```

### 6. Update Diagram

```bash
curl -X PUT "http://localhost:7071/api/diagrams/diagram-xyz789?workspaceId=workspace-abc123" \
  -H "Content-Type: application/json" \
  -H "x-ms-client-principal-id: 12345678-1234-1234-1234-123456789012" \
  -d '{
    "name": "E-Commerce System Context (Updated)",
    "nodes": [
      {
        "id": "user",
        "position": {"x": 100, "y": 100},
        "data": {
          "label": "Customer",
          "htmlContent": "<div>Customer</div>",
          "cssClass": "person-node"
        }
      }
    ],
    "edges": []
  }'
```

Response (200):
```json
{
  "id": "diagram-xyz789",
  "name": "E-Commerce System Context (Updated)",
  "type": "system-context",
  "nodes": [...],
  "edges": [],
  "metadata": {
    "version": 1,
    "updatedAt": "2024-01-26T10:40:00.000000"
  }
}
```

### 7. List Diagrams in Workspace

```bash
curl "http://localhost:7071/api/workspaces/workspace-abc123/diagrams" \
  -H "x-ms-client-principal-id: 12345678-1234-1234-1234-123456789012"
```

Response (200):
```json
[
  {
    "id": "diagram-xyz789",
    "name": "E-Commerce System Context (Updated)",
    "type": "system-context",
    "workspaceId": "workspace-abc123",
    "metadata": {...}
  }
]
```

### 8. Create Child Diagram (Drill-down)

```bash
curl -X POST http://localhost:7071/api/diagrams \
  -H "Content-Type: application/json" \
  -H "x-ms-client-principal-id: 12345678-1234-1234-1234-123456789012" \
  -d '{
    "name": "Web Application Container",
    "type": "container",
    "workspaceId": "workspace-abc123",
    "parentId": "diagram-xyz789",
    "nodes": [
      {
        "id": "spa",
        "position": {"x": 100, "y": 100},
        "data": {
          "label": "Single Page App",
          "htmlContent": "<div>SPA</div>",
          "technology": "React"
        }
      },
      {
        "id": "api",
        "position": {"x": 400, "y": 100},
        "data": {
          "label": "REST API",
          "htmlContent": "<div>API</div>",
          "technology": "Azure Functions"
        }
      }
    ],
    "edges": [
      {
        "id": "edge-1",
        "source": "spa",
        "target": "api",
        "label": "HTTPS"
      }
    ]
  }'
```

### 9. Delete Diagram

```bash
curl -X DELETE "http://localhost:7071/api/diagrams/diagram-xyz789?workspaceId=workspace-abc123" \
  -H "x-ms-client-principal-id: 12345678-1234-1234-1234-123456789012"
```

Response (204 No Content)

### 10. Delete Workspace

```bash
curl -X DELETE "http://localhost:7071/api/workspaces/workspace-abc123" \
  -H "x-ms-client-principal-id: 12345678-1234-1234-1234-123456789012"
```

Response (204 No Content)

## Error Responses

### 400 Bad Request (Validation Error)

```json
{
  "error": "Validation failed",
  "details": {
    "field": "name",
    "message": "Name is required"
  }
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found

```json
{
  "error": "Resource not found",
  "details": {
    "resource": "diagram-xyz789"
  }
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

## Python Examples

### Using requests library

```python
import requests

BASE_URL = "http://localhost:7071/api"
HEADERS = {
    "x-ms-client-principal-id": "12345678-1234-1234-1234-123456789012",
    "Content-Type": "application/json"
}

# Create workspace
workspace = {
    "name": "My Workspace",
    "description": "Test workspace"
}

response = requests.post(
    f"{BASE_URL}/workspaces",
    json=workspace,
    headers=HEADERS
)

workspace_data = response.json()
workspace_id = workspace_data["id"]
print(f"Created workspace: {workspace_id}")

# Create diagram
diagram = {
    "name": "System Context",
    "type": "system-context",
    "workspaceId": workspace_id,
    "nodes": [
        {
            "id": "node1",
            "position": {"x": 0, "y": 0},
            "data": {"label": "Node 1", "htmlContent": "<div>Node 1</div>"}
        }
    ],
    "edges": []
}

response = requests.post(
    f"{BASE_URL}/diagrams",
    json=diagram,
    headers=HEADERS
)

diagram_data = response.json()
print(f"Created diagram: {diagram_data['id']}")

# Get diagram
response = requests.get(
    f"{BASE_URL}/diagrams/{diagram_data['id']}?workspaceId={workspace_id}",
    headers=HEADERS
)

diagram = response.json()
print(f"Retrieved diagram: {diagram['name']}")
```

## JavaScript/TypeScript Examples

### Using fetch API

```typescript
const BASE_URL = 'http://localhost:7071/api';
const HEADERS = {
  'x-ms-client-principal-id': '12345678-1234-1234-1234-123456789012',
  'Content-Type': 'application/json'
};

// Create workspace
async function createWorkspace(name: string, description?: string) {
  const response = await fetch(`${BASE_URL}/workspaces`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ name, description })
  });

  if (!response.ok) {
    throw new Error(`Failed to create workspace: ${response.statusText}`);
  }

  return await response.json();
}

// Create diagram
async function createDiagram(diagram: DiagramCreate) {
  const response = await fetch(`${BASE_URL}/diagrams`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(diagram)
  });

  if (!response.ok) {
    throw new Error(`Failed to create diagram: ${response.statusText}`);
  }

  return await response.json();
}

// Usage
const workspace = await createWorkspace('My Workspace', 'Test workspace');
console.log('Created workspace:', workspace.id);

const diagram = await createDiagram({
  name: 'System Context',
  type: 'system-context',
  workspaceId: workspace.id,
  nodes: [],
  edges: []
});
console.log('Created diagram:', diagram.id);
```

## Testing with Postman

1. **Import Environment Variables**:
   - `base_url`: http://localhost:7071/api
   - `user_id`: 12345678-1234-1234-1234-123456789012

2. **Set Up Headers** (Auto-generated in Pre-request Script):
   ```javascript
   pm.request.headers.add({
     key: 'x-ms-client-principal-id',
     value: pm.environment.get('user_id')
   });
   ```

3. **Create Collections**:
   - Workspaces (CRUD operations)
   - Diagrams (CRUD operations)
   - Health checks

4. **Save Responses** for documentation

## Load Testing

### Using Apache Bench

```bash
# Health check (100 requests, 10 concurrent)
ab -n 100 -c 10 http://localhost:7071/api/health

# List workspaces (with auth)
ab -n 100 -c 10 \
  -H "x-ms-client-principal-id: 12345678-1234-1234-1234-123456789012" \
  http://localhost:7071/api/workspaces
```

### Using Locust

Create `locustfile.py`:
```python
from locust import HttpUser, task, between

class APIUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        # Set auth header
        self.client.headers.update({
            'x-ms-client-principal-id': '12345678-1234-1234-1234-123456789012'
        })

    @task
    def health_check(self):
        self.client.get("/api/health")

    @task(3)
    def list_workspaces(self):
        self.client.get("/api/workspaces")
```

Run:
```bash
locust -f locustfile.py --host=http://localhost:7071
```
